import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { Topic } from '@/utils/types';
import { generateTopicsFromSeeds, calculateRetention, nextReviewDate } from '@/utils/memory';
import { Brain, CheckCircle, XCircle, Loader, Sparkles, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type Phase = 'loading' | 'quiz' | 'result' | 'error';

export default function Review() {
  const router = useRouter();
  const { topicId } = router.query;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState(0);

  const loadQuiz = useCallback(async (t: Topic) => {
    setPhase('loading');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quiz',
          topic: t.title,
          content: t.content,
          difficulty: t.difficulty,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setPhase('quiz');
      setStartTime(Date.now());
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('memoryos_topics');
    const topics: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();

    let t: Topic | undefined;
    if (topicId) {
      t = topics.find(tp => tp.id === topicId);
    } else {
      // Pick the topic with lowest retention that's due
      const due = topics.filter(tp => new Date(tp.nextReview) <= new Date());
      t = due.sort((a, b) => a.retentionScore - b.retentionScore)[0] || topics[0];
    }

    if (t) {
      setTopic(t);
      loadQuiz(t);
    }
  }, [topicId, loadQuiz]);

  function selectAnswer(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function reveal() {
    if (selected === null) return;
    setRevealed(true);
  }

  function next() {
    const isCorrect = selected === questions[current].correctIndex;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      // Update topic retention
      const score = newAnswers.filter(Boolean).length / newAnswers.length;
      updateTopicAfterReview(score);
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function updateTopicAfterReview(score: number) {
    if (!topic) return;
    const stored = localStorage.getItem('memoryos_topics');
    const topics: Topic[] = stored ? JSON.parse(stored) : [];
    const updated = topics.map(t => {
      if (t.id !== topic.id) return t;
      const newReviewCount = t.reviewCount + 1;
      const now = new Date();
      // Retention: weighted by quiz score (good score = higher retention boost)
      const newRetention = Math.min(100, Math.round(calculateRetention(0, newReviewCount) * (0.5 + score * 0.5)));
      return {
        ...t,
        reviewCount: newReviewCount,
        lastReviewed: now,
        nextReview: nextReviewDate(now, newReviewCount),
        retentionScore: newRetention,
        forgettingCurve: [...t.forgettingCurve, { date: now, retention: newRetention }],
      };
    });
    localStorage.setItem('memoryos_topics', JSON.stringify(updated));
  }

  const score = answers.filter(Boolean).length;
  const q = questions[current];

  return (
    <>
      <Head><title>MemoryOS — Review</title></Head>
      <div className="min-h-screen bg-void">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
        </div>
        <Navbar />
        <main className="relative max-w-2xl mx-auto px-6 pt-24 pb-16">
          {/* Loading */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Brain size={32} className="text-accent animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-xl text-text mb-2">Generating Your Quiz</p>
                <p className="text-text-dim text-sm">AI is creating personalized questions based on your retention score...</p>
              </div>
              <Loader size={20} className="text-accent animate-spin" />
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center fade-in-up">
              <div className="text-4xl">⚠️</div>
              <p className="font-display font-semibold text-xl text-text">AI Unavailable</p>
              <p className="text-text-dim text-sm max-w-sm">
                Add your Anthropic API key to <code className="text-accent bg-surface px-1 rounded">.env.local</code> to enable AI quizzes.
              </p>
              <button onClick={() => router.push('/')} className="px-4 py-2 bg-accent text-void rounded-lg font-medium text-sm">
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Quiz */}
          {phase === 'quiz' && q && (
            <div className="fade-in-up">
              {/* Topic + Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-dim font-mono">REVIEWING: {topic?.title?.toUpperCase()}</span>
                  <span className="text-xs font-mono text-text-dim">{current + 1} / {questions.length}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${((current) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="glass rounded-2xl border border-border/50 p-6 mb-5">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={13} className="text-accent" />
                  </div>
                  <p className="text-lg font-display font-semibold text-text leading-snug">{q.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    const isCorrect = idx === q.correctIndex;
                    let style = 'border-border/50 bg-surface/50 text-text-dim hover:border-accent/30 hover:text-text';
                    if (revealed) {
                      if (isCorrect) style = 'border-success/50 bg-success/10 text-success';
                      else if (isSelected && !isCorrect) style = 'border-danger/50 bg-danger/10 text-danger';
                      else style = 'border-border/30 bg-surface/30 text-muted';
                    } else if (isSelected) {
                      style = 'border-accent/50 bg-accent/10 text-accent';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(idx)}
                        className={clsx('w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium flex items-center gap-3', style)}
                      >
                        <span className="w-6 h-6 rounded-lg border border-current/30 flex items-center justify-center text-xs font-mono shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                        {revealed && isCorrect && <CheckCircle size={15} className="ml-auto text-success shrink-0" />}
                        {revealed && isSelected && !isCorrect && <XCircle size={15} className="ml-auto text-danger shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              {revealed && (
                <div className="glass rounded-xl border border-border/50 p-4 mb-5 fade-in-up">
                  <p className="text-xs text-accent font-semibold mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={11} /> Explanation
                  </p>
                  <p className="text-sm text-text-dim leading-relaxed">{q.explanation}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {!revealed ? (
                  <button
                    onClick={reveal}
                    disabled={selected === null}
                    className="flex-1 py-3.5 rounded-xl bg-accent text-void font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-all"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-void font-semibold hover:bg-accent/90 transition-all"
                  >
                    {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {phase === 'result' && (
            <div className="flex flex-col items-center text-center fade-in-up">
              <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                <Trophy size={36} className="text-gold" />
              </div>
              <h2 className="font-display text-3xl font-bold text-text mb-2">Quiz Complete!</h2>
              <p className="text-text-dim mb-8">
                You scored <span className="text-accent font-semibold">{score}/{questions.length}</span> on{' '}
                <span className="text-text">{topic?.title}</span>
              </p>

              {/* Score breakdown */}
              <div className="w-full glass rounded-2xl border border-border/50 p-6 mb-6">
                <div className="text-5xl font-display font-bold gradient-text mb-2">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <p className="text-text-dim text-sm mb-6">
                  {score === questions.length ? '🎉 Perfect score! Mastery level.' :
                   score >= questions.length * 0.7 ? '💪 Good job! Keep reviewing.' :
                   '📚 Keep studying — review again tomorrow.'}
                </p>

                <div className="flex gap-2 justify-center">
                  {answers.map((correct, i) => (
                    <div
                      key={i}
                      className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}
                    >
                      {correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setCurrent(0); setSelected(null); setRevealed(false);
                    setAnswers([]); if (topic) loadQuiz(topic);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-text-dim hover:border-accent/30 hover:text-text transition-all text-sm font-medium"
                >
                  <RotateCcw size={14} /> Retry
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 rounded-xl bg-accent text-void font-semibold hover:bg-accent/90 transition-all text-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
