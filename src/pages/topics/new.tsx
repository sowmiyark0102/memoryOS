import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { Topic } from '@/utils/types';
import { generateTopicsFromSeeds, nextReviewDate } from '@/utils/memory';
import { Sparkles, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTopic() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    difficulty: string; suggestedTags: string[]; subject: string; studyTip: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function analyzeWithAI() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_content', topic: title, content }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis({
        difficulty: 'medium',
        suggestedTags: ['general'],
        subject: 'General',
        studyTip: 'Break this into smaller chunks and review daily.',
      });
    } finally {
      setLoading(false);
    }
  }

  function saveTopic() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const stored = localStorage.getItem('memoryos_topics');
    const topics: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();
    const now = new Date();
    const newTopic: Topic = {
      id: `topic_${Date.now()}`,
      title: title.trim(),
      subject: analysis?.subject || 'General',
      content: content.trim(),
      createdAt: now,
      lastReviewed: null,
      nextReview: nextReviewDate(now, 0),
      retentionScore: 100,
      reviewCount: 0,
      difficulty: (analysis?.difficulty as Topic['difficulty']) || 'medium',
      tags: analysis?.suggestedTags || [],
      forgettingCurve: [{ date: now, retention: 100 }],
    };
    topics.unshift(newTopic);
    localStorage.setItem('memoryos_topics', JSON.stringify(topics));
    setTimeout(() => router.push('/topics'), 500);
  }

  return (
    <>
      <Head><title>MemoryOS — Add Topic</title></Head>
      <div className="min-h-screen bg-void">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 pt-24 pb-16">
          <div className="mb-6 fade-in-up">
            <Link href="/topics" className="flex items-center gap-2 text-text-dim hover:text-text text-sm mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Topics
            </Link>
            <h1 className="font-display text-3xl font-bold text-text">Add New Topic</h1>
            <p className="text-text-dim mt-1">Paste your notes — AI will analyze and optimize your memory schedule</p>
          </div>

          <div className="space-y-4 fade-in-up delay-100">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-text-dim mb-2 block">Topic Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Binary Search Trees"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-dim focus:outline-none focus:border-accent/50 transition-colors font-display"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-text-dim mb-2 block">Notes / Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste your lecture notes, textbook content, or key concepts here..."
                rows={8}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-dim focus:outline-none focus:border-accent/50 transition-colors resize-none leading-relaxed text-sm"
              />
              <p className="text-xs text-text-dim mt-1.5">{content.length} characters</p>
            </div>

            {/* AI Analyze button */}
            <button
              onClick={analyzeWithAI}
              disabled={!content.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/30 bg-accent/5 text-accent font-medium hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Sparkles size={16} /> Analyze with AI</>
              )}
            </button>

            {/* AI Analysis Result */}
            {analysis && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-5 fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm font-semibold text-success">AI Analysis Complete</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-text-dim mb-1">Subject</p>
                    <p className="text-sm font-semibold text-text">{analysis.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-dim mb-1">Difficulty</p>
                    <p className="text-sm font-semibold text-text capitalize">{analysis.difficulty}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-text-dim mb-2">Suggested Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestedTags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-text-dim mb-1">💡 Study Tip</p>
                  <p className="text-sm text-text leading-relaxed">{analysis.studyTip}</p>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={saveTopic}
              disabled={!title.trim() || !content.trim() || saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-void font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <><Loader size={16} className="animate-spin" /> Saving...</>
              ) : (
                'Save Topic'
              )}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
