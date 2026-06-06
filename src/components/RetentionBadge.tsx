import { getRetentionColor, getRetentionLabel } from '@/utils/memory';
import clsx from 'clsx';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RetentionBadge({ score, size = 'md', showLabel = true }: Props) {
  const color = getRetentionColor(score);
  const label = getRetentionLabel(score);

  const sizes = {
    sm: { ring: 40, stroke: 3, text: 'text-xs', badge: 'text-xs px-2 py-0.5' },
    md: { ring: 56, stroke: 4, text: 'text-sm', badge: 'text-xs px-2.5 py-1' },
    lg: { ring: 80, stroke: 5, text: 'text-base', badge: 'text-sm px-3 py-1.5' },
  };

  const s = sizes[size];
  const r = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg width={s.ring} height={s.ring} className="-rotate-90">
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={r}
            fill="none"
            stroke="#1a2035"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        </svg>
        <span
          className={clsx('absolute inset-0 flex items-center justify-center font-mono font-semibold', s.text)}
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className={clsx('rounded-full font-medium', s.badge)}
          style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
