import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RetentionBadge from '@/components/RetentionBadge';
import { Topic } from '@/utils/types';
import { generateTopicsFromSeeds, formatDate, getRetentionColor, nextReviewDate } from '@/utils/memory';
import { ArrowLeft, Sparkles, Play, Clock, Tag, BarChart2, Loader, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function TopicDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem('memoryos_topics');
    const topics: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();
    const found = topics.find(t => t.id === id);
    if (found) setTopic(found);
  }, [id]);

  async function generateSummary() {
    if (!topic) return;
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_summary', topic: topic.title, content: topic.content }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setSummary('AI summary unavailable. Check your API key in .env.local');
    } finally {
      setLoadingSummary(false);
    }
  }

  function deleteTopic() {
    if (!confirm('Delete this topic?')) return;
    const stored = localStorage.getItem('memoryos_topics');
    const topics: Topic[] = stored ? JSON.parse(stored) : [];
    const updated = topics.filter(t => t.id !== id);
    localStorage.setItem('memoryos_topics', JSON.stringify(updated));
    router.push('/topics');
  }

  if (!topic) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const curveData = topic.forgettingCurve.map(p => ({
    date: new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    retention: p.retention,
  }));

  const color = getRetentionColor(topic.retentionScore);

  return (
    <>
      <Head><title>MemoryOS — {topic.title}</title></Head>
      <div className="min-h-screen bg-void">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
          {/* Back */}
          <Link href="/topics" className="flex items-center gap-2 text-text-dim hover:text-text text-sm mb-6 fade-in-up transition-colors">
            <ArrowLeft size={14} /> Back to Topics
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6 fade-in-up">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                  {topic.subject}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-text-dim border border-border capitalize">
                  {topic.difficulty}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-text">{topic.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <RetentionBadge score={topic.retentionScore} size="lg" />
              <button
                onClick={deleteTopic}
                className="p-2 rounded-lg hover:bg-danger/10 text-text-dim hover:text-danger transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: Content + Summary */}
            <div className="md:col-span-2 space-y-5">
              {/* Content */}
              <div className="fade-in-up delay-100 glass rounded-xl border border-border/50 p-6">
                <h2 className="font-display font-semibold text-text mb-4">Your Notes</h2>
                <p className="text-sm text-text-dim leading-relaxed">{topic.content}</p>
              </div>

              {/* AI Memory Summary */}
              <div className="fade-in-up delay-200 glass rounded-xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-text">AI Memory Summary</h2>
                  <button
                    onClick={generateSummary}
                    disabled={loadingSummary}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-50 transition-all"
                  >
                    {loadingSummary ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {summary ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                {summary ? (
                  <p className="text-sm text-text leading-relaxed bg-accent/5 rounded-lg p-4 border border-accent/10">
                    {summary}
                  </p>
                ) : (
                  <p className="text-sm text-text-dim">
                    Click Generate to get an AI-optimized memory summary of this topic.
                  </p>
                )}
              </div>

              {/* Start Quiz */}
              <div className="fade-in-up delay-300">
                <Link
                  href={`/review?topicId=${topic.id}`}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-accent text-void font-semibold hover:bg-accent/90 transition-colors"
                >
                  <Play size={18} fill="currentColor" />
                  Start AI Quiz for This Topic
                </Link>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="space-y-4">
              {/* Info */}
              <div className="fade-in-up delay-100 glass rounded-xl border border-border/50 p-5">
                <h3 className="font-semibold text-sm text-text mb-4">Memory Stats</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: Clock, label: 'Added', value: formatDate(new Date(topic.createdAt)) },
                    { icon: Clock, label: 'Last Reviewed', value: topic.lastReviewed ? formatDate(new Date(topic.lastReviewed)) : 'Never' },
                    { icon: Clock, label: 'Next Review', value: formatDate(new Date(topic.nextReview)) },
                    { icon: BarChart2, label: 'Review Count', value: `${topic.reviewCount}×` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-text-dim">
                        <Icon size={13} /> {label}
                      </span>
                      <span className="text-text font-medium text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="fade-in-up delay-200 glass rounded-xl border border-border/50 p-5">
                <h3 className="font-semibold text-sm text-text mb-3 flex items-center gap-2">
                  <Tag size={13} /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-surface text-text-dim border border-border">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Forgetting Curve */}
              <div className="fade-in-up delay-300 glass rounded-xl border border-border/50 p-5">
                <h3 className="font-semibold text-sm text-text mb-4">Forgetting Curve</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={curveData}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{ background: '#0f1320', border: '1px solid #1a2035', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => [`${v}%`, 'Retention']}
                    />
                    <Line type="monotone" dataKey="retention" stroke={color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-text-dim mt-2 text-center">
                  Current: <span style={{ color }} className="font-semibold">{topic.retentionScore}%</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
