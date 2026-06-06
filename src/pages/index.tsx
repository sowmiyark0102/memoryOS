import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import TopicCard from '@/components/TopicCard';
import RetentionBadge from '@/components/RetentionBadge';
import { Topic, UserStats } from '@/utils/types';
import { generateTopicsFromSeeds, generateUserStats } from '@/utils/memory';
import {
  Brain, Zap, TrendingUp, Clock, BookOpen,
  Flame, BarChart3, ArrowRight, Sparkles
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('memoryos_topics');
    const t: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();
    if (!stored) localStorage.setItem('memoryos_topics', JSON.stringify(t));
    setTopics(t);
    setStats(generateUserStats(t));
    setMounted(true);
  }, []);

  const overdue = topics.filter(t => new Date(t.nextReview) < new Date());
  const dueToday = topics.filter(t => {
    const d = new Date(t.nextReview);
    return d >= new Date() && d.toDateString() === new Date().toDateString();
  });
  const strongTopics = topics.filter(t => t.retentionScore >= 80);
  const criticalTopics = topics.filter(t => t.retentionScore < 40);

  if (!mounted || !stats) return null;

  return (
    <>
      <Head>
        <title>MemoryOS — Dashboard</title>
      </Head>

      <div className="min-h-screen bg-void">
        {/* Background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <Navbar />

        <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
          {/* Hero header */}
          <div className="mb-10 fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="pulse-dot" />
              <span className="text-xs text-text-dim font-mono">MEMORY ENGINE ACTIVE</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
              Good {getGreeting()},{' '}
              <span className="gradient-text">Learner</span>
            </h1>
            <p className="text-text-dim text-lg">
              Your brain has{' '}
              <span className="text-warning font-semibold">{overdue.length + dueToday.length} topics</span>{' '}
              ready for review. Don&apos;t let them fade.
            </p>
          </div>

          {/* Alert bar */}
          {(overdue.length > 0 || dueToday.length > 0) && (
            <div className="mb-8 fade-in-up delay-100">
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Zap size={16} className="text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-warning">Review Time!</p>
                    <p className="text-sm text-text-dim">
                      {overdue.length} overdue · {dueToday.length} due today — AI has your personalized quiz ready
                    </p>
                  </div>
                </div>
                <Link
                  href="/review"
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-warning text-void rounded-lg text-sm font-semibold hover:bg-warning/90 transition-colors"
                >
                  Start Review <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatsCard
              label="Avg Retention"
              value={`${stats.avgRetention}%`}
              icon={Brain}
              color="#4f8ef7"
              trend={8}
              delay={0}
            />
            <StatsCard
              label="Day Streak"
              value={`${stats.streak}🔥`}
              subtitle="Keep it going!"
              icon={Flame}
              color="#e8b84b"
              delay={100}
            />
            <StatsCard
              label="Topics"
              value={stats.totalTopics}
              subtitle={`${strongTopics.length} mastered`}
              icon={BookOpen}
              color="#3dd68c"
              delay={200}
            />
            <StatsCard
              label="Study Hours"
              value={`${stats.totalStudyHours}h`}
              subtitle="This month"
              icon={Clock}
              color="#a78bfa"
              delay={300}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Weekly Retention Chart */}
            <div className="md:col-span-2 fade-in-up delay-400 glass rounded-xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-semibold text-text">Retention Trend</h2>
                  <p className="text-xs text-text-dim mt-0.5">7-day average memory strength</p>
                </div>
                <BarChart3 size={16} className="text-text-dim" />
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={stats.weeklyProgress}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })}
                    tick={{ fill: '#4a5568', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0f1320', border: '1px solid #1a2035', borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'long' })}
                    formatter={(v: number) => [`${v}%`, 'Retention']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRetention"
                    stroke="#4f8ef7"
                    strokeWidth={2.5}
                    dot={{ fill: '#4f8ef7', r: 4 }}
                    activeDot={{ r: 6, fill: '#4f8ef7', stroke: '#0f1320', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Memory Health */}
            <div className="fade-in-up delay-500 glass rounded-xl border border-border/50 p-6">
              <h2 className="font-display font-semibold text-text mb-1">Memory Health</h2>
              <p className="text-xs text-text-dim mb-5">Overall brain score</p>

              <div className="flex justify-center mb-5">
                <RetentionBadge score={stats.avgRetention} size="lg" />
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Strong (80–100)', count: strongTopics.length, color: '#3dd68c' },
                  { label: 'Good (60–79)', count: topics.filter(t => t.retentionScore >= 60 && t.retentionScore < 80).length, color: '#e8b84b' },
                  { label: 'Fading (40–59)', count: topics.filter(t => t.retentionScore >= 40 && t.retentionScore < 60).length, color: '#f5a623' },
                  { label: 'Critical (<40)', count: criticalTopics.length, color: '#ff5c5c' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-text-dim">{label}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold" style={{ color }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Topics to Review */}
          <div className="mb-8 fade-in-up delay-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-text">
                Priority Reviews
                {overdue.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-danger">({overdue.length} overdue)</span>
                )}
              </h2>
              <Link href="/topics" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
                All Topics <ArrowRight size={12} />
              </Link>
            </div>
            {overdue.length + dueToday.length === 0 ? (
              <div className="glass rounded-xl border border-success/20 p-8 text-center">
                <Sparkles size={32} className="text-success mx-auto mb-3" />
                <p className="font-semibold text-success mb-1">You&apos;re all caught up!</p>
                <p className="text-sm text-text-dim">No reviews pending. Add new topics to keep growing.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...overdue, ...dueToday].slice(0, 6).map(topic => (
                  <TopicCard key={topic.id} topic={topic} compact />
                ))}
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="fade-in-up delay-700">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-accent text-sm mb-1">AI Memory Insight</p>
                  <p className="text-sm text-text-dim leading-relaxed">
                    Your strongest retention is in <span className="text-text">Web Development</span>.
                    <span className="text-warning"> Graph Algorithms</span> is decaying fast — reviewing it today
                    before it drops below 20% will save you 3x the effort next week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
