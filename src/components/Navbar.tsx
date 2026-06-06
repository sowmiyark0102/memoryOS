import Link from 'next/link';
import { useRouter } from 'next/router';
import { Brain, LayoutDashboard, BookOpen, Network, Plus, Zap } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/topics', label: 'Topics', icon: BookOpen },
  { href: '/graph', label: 'Knowledge Graph', icon: Network },
  { href: '/review', label: 'Review Now', icon: Zap, accent: true },
];

export default function Navbar() {
  const { pathname } = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:border-accent/60 transition-colors">
            <Brain size={16} className="text-accent" />
          </div>
          <span className="font-display font-700 text-lg tracking-tight">
            Memory<span className="text-accent">OS</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon, accent }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  accent
                    ? 'bg-accent text-void hover:bg-accent/90 ml-2'
                    : active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-dim hover:text-text hover:bg-surface'
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Add Topic */}
        <Link
          href="/topics/new"
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-accent text-void rounded-lg text-sm font-medium"
        >
          <Plus size={14} />
          Add
        </Link>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-border/50 px-4 py-2 gap-1">
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all',
                accent
                  ? 'bg-accent/10 text-accent'
                  : active
                  ? 'text-accent'
                  : 'text-text-dim'
              )}
            >
              <Icon size={16} />
              {label.split(' ')[0]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
