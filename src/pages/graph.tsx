import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { Topic } from '@/utils/types';
import { generateTopicsFromSeeds, generateKnowledgeGraph, getRetentionColor } from '@/utils/memory';
import { Network, Info } from 'lucide-react';
import Link from 'next/link';

interface Node {
  id: string;
  label: string;
  subject: string;
  retentionScore: number;
  connections: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selected, setSelected] = useState<Node | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('memoryos_topics');
    const t: Topic[] = stored ? JSON.parse(stored) : generateTopicsFromSeeds();
    setTopics(t);

    const graph = generateKnowledgeGraph(t);
    const W = 700, H = 480;

    // Simple force layout
    const n: Node[] = graph.map((g, i) => ({
      ...g,
      x: W / 2 + (Math.cos((i / graph.length) * 2 * Math.PI) * 180),
      y: H / 2 + (Math.sin((i / graph.length) * 2 * Math.PI) * 180),
      vx: 0, vy: 0,
    }));

    // Run simple force simulation
    for (let iter = 0; iter < 100; iter++) {
      // Repulsion
      for (let a = 0; a < n.length; a++) {
        for (let b = a + 1; b < n.length; b++) {
          const dx = n[b].x - n[a].x;
          const dy = n[b].y - n[a].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 4000 / (dist * dist);
          n[a].vx -= (dx / dist) * force;
          n[a].vy -= (dy / dist) * force;
          n[b].vx += (dx / dist) * force;
          n[b].vy += (dy / dist) * force;
        }
      }
      // Attraction for connected nodes
      for (const node of n) {
        for (const connId of node.connections) {
          const conn = n.find(x => x.id === connId);
          if (!conn) continue;
          const dx = conn.x - node.x;
          const dy = conn.y - node.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = dist / 400;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }
      // Center pull
      for (const node of n) {
        node.vx += (W / 2 - node.x) * 0.01;
        node.vy += (H / 2 - node.y) * 0.01;
      }
      // Apply velocity + damping
      for (const node of n) {
        node.x += node.vx * 0.3;
        node.y += node.vy * 0.3;
        node.vx *= 0.7;
        node.vy *= 0.7;
        // Clamp
        node.x = Math.max(60, Math.min(W - 60, node.x));
        node.y = Math.max(40, Math.min(H - 40, node.y));
      }
    }

    setNodes(n);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const W = 700, H = 480;
  const selectedTopic = topics.find(t => t.id === selected?.id);

  return (
    <>
      <Head><title>MemoryOS — Knowledge Graph</title></Head>
      <div className="min-h-screen bg-void">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        </div>
        <Navbar />
        <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="mb-6 fade-in-up">
            <h1 className="font-display text-3xl font-bold text-text mb-1">Knowledge Graph</h1>
            <p className="text-text-dim">Visual map of your learning — connected by shared concepts</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Graph */}
            <div className="md:col-span-2 fade-in-up delay-100 glass rounded-2xl border border-border/50 p-4 overflow-hidden">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ maxHeight: 480 }}
              >
                {/* Edges */}
                {nodes.map(node =>
                  node.connections.map(connId => {
                    const conn = nodes.find(n => n.id === connId);
                    if (!conn) return null;
                    return (
                      <line
                        key={`${node.id}-${connId}`}
                        x1={node.x} y1={node.y}
                        x2={conn.x} y2={conn.y}
                        stroke="#1a2035"
                        strokeWidth={1.5}
                        opacity={0.6}
                      />
                    );
                  })
                )}

                {/* Nodes */}
                {nodes.map(node => {
                  const color = getRetentionColor(node.retentionScore);
                  const r = 10 + (node.retentionScore / 100) * 14;
                  const isSelected = selected?.id === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelected(isSelected ? null : node)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Glow ring */}
                      {isSelected && (
                        <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                      )}
                      {/* Node circle */}
                      <circle
                        cx={node.x} cy={node.y} r={r}
                        fill={`${color}20`}
                        stroke={color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        style={{ filter: `drop-shadow(0 0 ${isSelected ? 12 : 4}px ${color}66)` }}
                      />
                      {/* Score text */}
                      <text
                        x={node.x} y={node.y + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={color} fontSize={9} fontFamily="JetBrains Mono" fontWeight="500"
                      >
                        {node.retentionScore}
                      </text>
                      {/* Label */}
                      <text
                        x={node.x} y={node.y + r + 12}
                        textAnchor="middle"
                        fill="#8899aa" fontSize={10} fontFamily="Syne"
                      >
                        {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-2 px-2 justify-center">
                {[['Strong', '#3dd68c'], ['Good', '#e8b84b'], ['Fading', '#f5a623'], ['Critical', '#ff5c5c']].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-text-dim">{label}</span>
                  </div>
                ))}
                <span className="text-xs text-text-dim">· Node size = retention %</span>
              </div>
            </div>

            {/* Detail panel */}
            <div className="space-y-4">
              {selected && selectedTopic ? (
                <div className="fade-in-up glass rounded-2xl border border-accent/20 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-accent font-semibold">SELECTED NODE</span>
                      <h3 className="font-display font-semibold text-text mt-1">{selected.label}</h3>
                      <p className="text-xs text-text-dim">{selected.subject}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold"
                      style={{ background: `${getRetentionColor(selected.retentionScore)}20`, color: getRetentionColor(selected.retentionScore) }}
                    >
                      {selected.retentionScore}
                    </div>
                  </div>
                  <p className="text-xs text-text-dim leading-relaxed mb-4 line-clamp-3">{selectedTopic.content}</p>
                  <div className="mb-4">
                    <p className="text-xs text-text-dim mb-2">Connected to:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.connections.length > 0 ? selected.connections.map(cid => {
                        const cn = nodes.find(n => n.id === cid);
                        return cn ? (
                          <span key={cid} className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-dim">
                            {cn.label.slice(0, 14)}
                          </span>
                        ) : null;
                      }) : <span className="text-xs text-muted">No connections</span>}
                    </div>
                  </div>
                  <Link
                    href={`/topics/${selected.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-void text-sm font-semibold hover:bg-accent/90 transition-all"
                  >
                    View Topic
                  </Link>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-border/50 p-5 text-center">
                  <Network size={28} className="text-text-dim mx-auto mb-3" />
                  <p className="font-semibold text-text text-sm mb-1">Click a Node</p>
                  <p className="text-xs text-text-dim leading-relaxed">
                    Select any topic node to see details, connections, and retention score.
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="glass rounded-2xl border border-border/50 p-5">
                <h3 className="font-semibold text-sm text-text mb-4 flex items-center gap-2">
                  <Info size={13} /> Graph Stats
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-dim">
                    <span>Total nodes</span>
                    <span className="text-text font-mono">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between text-text-dim">
                    <span>Connections</span>
                    <span className="text-text font-mono">
                      {nodes.reduce((s, n) => s + n.connections.length, 0) / 2}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-dim">
                    <span>Subjects</span>
                    <span className="text-text font-mono">{new Set(nodes.map(n => n.subject)).size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
