import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
  delay?: number;
}

export default function StatsCard({ label, value, subtitle, icon: Icon, color = '#4f8ef7', trend, delay = 0 }: Props) {
  return (
    <div
      className="fade-in-up glass rounded-xl border border-border/50 p-5 card-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'text-xs font-mono px-2 py-0.5 rounded-full',
            trend >= 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-text mb-0.5" style={{ color }}>
          {value}
        </div>
        <div className="text-sm font-medium text-text-dim">{label}</div>
        {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
