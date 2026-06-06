import { Topic } from '@/utils/types';
import { formatDate, getRetentionColor } from '@/utils/memory';
import RetentionBadge from './RetentionBadge';
import Link from 'next/link';
import { Clock, Tag, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  topic: Topic;
  compact?: boolean;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Data Structures': '#4f8ef7',
  'Algorithms': '#e8b84b',
  'Web Development': '#3dd68c',
  'System Design': '#f5a623',
  'Databases': '#a78bfa',
  'Machine Learning': '#06b6d4',
};

export default function TopicCard({ topic, compact = false }: Props) {
  const color = SUBJECT_COLORS[topic.subject] || '#4f8ef7';
  const isOverdue = new Date(topic.nextReview) < new Date();
  const isDueToday = !isOverdue && new Date(topic.nextReview).toDateString() === new Date().toDateString();

  return (
    <Link href={`/topics/${topic.id}`}>
      <div className={clsx(
        'group glass rounded-xl border border-border/50 hover:border-accent/30 transition-all duration-300 cursor-pointer card-hover',
        compact ? 'p-4' : 'p-5'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
              >
                {topic.subject}
              </span>
              {isOverdue && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-danger bg-danger/10 border border-danger/20 animate-pulse">
                  Overdue
                </span>
              )}
              {isDueToday && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-warning bg-warning/10 border border-warning/20">
                  Due Today
                </span>
              )}
            </div>
            <h3 className="font-display font-semibold text-text group-hover:text-accent transition-colors truncate">
              {topic.title}
            </h3>
          </div>
          <RetentionBadge score={topic.retentionScore} size="sm" showLabel={false} />
        </div>

        {!compact && (
          <p className="text-sm text-text-dim line-clamp-2 mb-4 leading-relaxed">
            {topic.content}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              Next: {formatDate(new Date(topic.nextReview))}
            </span>
            {!compact && (
              <span className="flex items-center gap-1.5">
                <Tag size={11} />
                {topic.tags.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
          <ChevronRight size={14} className="text-text-dim group-hover:text-accent transition-colors" />
        </div>

        {/* Retention bar */}
        <div className="mt-3 h-1 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${topic.retentionScore}%`,
              background: `linear-gradient(90deg, ${getRetentionColor(topic.retentionScore)}, ${getRetentionColor(topic.retentionScore)}88)`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
