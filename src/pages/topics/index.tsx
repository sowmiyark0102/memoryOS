import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopicCard from '@/components/TopicCard';
import { Topic } from '@/utils/types';
import { generateTopicsFromSeeds } from '@/utils/memory';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

const SUBJECTS = ['All', 'Data Structures', 'Algorithms', 'Web Development', 'System Design', 'Databases'];
const SORT_OPTIONS = [
  { value: 'retention_asc', label: 'Lowest Retention' },
  { value: 'retention_desc', label: 'Highest Retention' },
  { value: 'review_date', label: 'Review Due' },
  { value: 'recent', label: 'Recently Added' },
];

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [sort, setSort] = useState('retention_asc');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('memoryos_topics');
    const t: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();
    setTopics(t);
    setMounted(true);
  }, []);

  const filtered = topics
    .filter(t => {
      if (subject !== 'All' && t.subject !== subject) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.tags.some(tag => tag.includes(search.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'retention_asc') return a.retentionScore - b.retentionScore;
      if (sort === 'retention_desc') return b.retentionScore - a.retentionScore;
      if (sort === 'review_date') return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (!mounted) return null;

  return (
    <>
      <Head><title>MemoryOS — Topics</title></Head>
      <div className="min-h-screen bg-void">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gold/4 rounded-full blur-3xl" />
        </div>
        <Navbar />
        <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 fade-in-up">
            <div>
              <h1 className="font-display text-3xl font-bold text-text mb-1">Your Topics</h1>
              <p className="text-text-dim">{topics.length} topics tracked · sorted by priority</p>
            </div>
            <Link
              href="/topics/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-void rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              <Plus size={16} />
              Add Topic
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3 fade-in-up delay-100">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search topics or tags..."
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* Subject tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {SUBJECTS.map(s => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={clsx(
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    subject === s
                      ? 'bg-accent text-void'
                      : 'bg-surface text-text-dim hover:text-text border border-border hover:border-accent/30'
                  )}
                >
                  {s}
                </button>
              ))}

              <div className="ml-auto shrink-0">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-surface text-text-dim border border-border focus:outline-none appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Topic Grid */}
          {filtered.length === 0 ? (
            <div className="glass rounded-xl border border-border/50 p-12 text-center fade-in-up">
              <Filter size={32} className="text-text-dim mx-auto mb-3" />
              <p className="font-semibold text-text mb-1">No topics found</p>
              <p className="text-sm text-text-dim">Try a different filter or add a new topic</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((topic, i) => (
                <div
                  key={topic.id}
                  className="fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <TopicCard topic={topic} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
