import { Topic, UserStats, DailyStats, KnowledgeNode } from './types';

// Ebbinghaus forgetting curve: R = e^(-t/S)
// R = retention, t = time elapsed (days), S = stability (increases with reviews)
export function calculateRetention(daysSinceReview: number, reviewCount: number): number {
  const stability = 1 + reviewCount * 0.8;
  const retention = Math.exp(-daysSinceReview / stability) * 100;
  return Math.max(5, Math.min(100, Math.round(retention)));
}

// Calculate next optimal review date based on target retention (90%)
export function nextReviewDate(lastReview: Date, reviewCount: number): Date {
  const stability = 1 + reviewCount * 0.8;
  const daysToRetain = Math.round(-stability * Math.log(0.90));
  const next = new Date(lastReview);
  next.setDate(next.getDate() + Math.max(1, daysToRetain));
  return next;
}

export function getDaysAgo(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(date));
}

export function getRetentionColor(score: number): string {
  if (score >= 80) return '#3dd68c';
  if (score >= 60) return '#e8b84b';
  if (score >= 40) return '#f5a623';
  return '#ff5c5c';
}

export function getRetentionLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fading';
  return 'Critical';
}

// Demo seed topics
export const SEED_TOPICS: Omit<Topic, 'id'>[] = [
  {
    title: 'Binary Search Trees',
    subject: 'Data Structures',
    content: 'A BST is a binary tree where each node has at most two children. The left subtree contains nodes with keys less than the node\'s key. The right subtree contains nodes with keys greater. Used for efficient O(log n) search, insertion, and deletion.',
    createdAt: new Date(Date.now() - 15 * 86400000),
    lastReviewed: new Date(Date.now() - 3 * 86400000),
    nextReview: new Date(Date.now() + 1 * 86400000),
    retentionScore: 74,
    reviewCount: 4,
    difficulty: 'medium',
    tags: ['algorithms', 'trees', 'dsa'],
    forgettingCurve: generateCurve(3, 4),
  },
  {
    title: 'Dynamic Programming',
    subject: 'Algorithms',
    content: 'DP is an optimization technique that solves complex problems by breaking them into overlapping subproblems. Uses memoization or tabulation to store results. Key patterns: 0/1 Knapsack, LCS, LIS, Matrix Chain Multiplication.',
    createdAt: new Date(Date.now() - 20 * 86400000),
    lastReviewed: new Date(Date.now() - 8 * 86400000),
    nextReview: new Date(Date.now() - 1 * 86400000),
    retentionScore: 42,
    reviewCount: 2,
    difficulty: 'hard',
    tags: ['algorithms', 'optimization', 'faang'],
    forgettingCurve: generateCurve(8, 2),
  },
  {
    title: 'React Hooks',
    subject: 'Web Development',
    content: 'Hooks let you use state and other React features in functional components. Key hooks: useState, useEffect, useContext, useReducer, useMemo, useCallback. Rules: only call at top level, only call from React functions.',
    createdAt: new Date(Date.now() - 10 * 86400000),
    lastReviewed: new Date(Date.now() - 1 * 86400000),
    nextReview: new Date(Date.now() + 4 * 86400000),
    retentionScore: 89,
    reviewCount: 6,
    difficulty: 'medium',
    tags: ['react', 'frontend', 'javascript'],
    forgettingCurve: generateCurve(1, 6),
  },
  {
    title: 'System Design: Load Balancers',
    subject: 'System Design',
    content: 'Load balancers distribute network traffic across multiple servers. Types: Layer 4 (transport) and Layer 7 (application). Algorithms: Round Robin, Least Connections, IP Hash, Weighted. Key for horizontal scaling.',
    createdAt: new Date(Date.now() - 5 * 86400000),
    lastReviewed: new Date(Date.now() - 0.5 * 86400000),
    nextReview: new Date(Date.now() + 6 * 86400000),
    retentionScore: 95,
    reviewCount: 3,
    difficulty: 'hard',
    tags: ['system-design', 'distributed', 'faang'],
    forgettingCurve: generateCurve(0.5, 3),
  },
  {
    title: 'SQL Joins & Indexing',
    subject: 'Databases',
    content: 'JOIN types: INNER (matching rows), LEFT (all left + matching right), RIGHT, FULL OUTER. Indexing: B-tree for range queries, Hash for equality. Composite indexes, covering indexes, query execution plans.',
    createdAt: new Date(Date.now() - 12 * 86400000),
    lastReviewed: new Date(Date.now() - 5 * 86400000),
    nextReview: new Date(Date.now()),
    retentionScore: 58,
    reviewCount: 3,
    difficulty: 'medium',
    tags: ['sql', 'databases', 'backend'],
    forgettingCurve: generateCurve(5, 3),
  },
  {
    title: 'Graph Algorithms: BFS & DFS',
    subject: 'Algorithms',
    content: 'BFS uses a queue, explores level by level. Shortest path in unweighted graphs. DFS uses stack/recursion, explores depth-first. Used for topological sort, cycle detection, connected components. Time: O(V+E).',
    createdAt: new Date(Date.now() - 18 * 86400000),
    lastReviewed: new Date(Date.now() - 12 * 86400000),
    nextReview: new Date(Date.now() - 3 * 86400000),
    retentionScore: 28,
    reviewCount: 1,
    difficulty: 'hard',
    tags: ['graphs', 'algorithms', 'dsa'],
    forgettingCurve: generateCurve(12, 1),
  },
];

function generateCurve(daysSinceReview: number, reviewCount: number) {
  const points = [];
  for (let d = 0; d <= daysSinceReview; d += Math.max(1, Math.floor(daysSinceReview / 10))) {
    points.push({
      date: new Date(Date.now() - (daysSinceReview - d) * 86400000),
      retention: calculateRetention(daysSinceReview - d, reviewCount),
    });
  }
  return points;
}

export function generateTopicsFromSeeds(): Topic[] {
  return SEED_TOPICS.map((t, i) => ({ ...t, id: `topic_${i + 1}` }));
}

export function generateKnowledgeGraph(topics: Topic[]): KnowledgeNode[] {
  return topics.map(t => ({
    id: t.id,
    label: t.title,
    subject: t.subject,
    retentionScore: t.retentionScore,
    connections: topics
      .filter(other => other.id !== t.id && other.tags.some(tag => t.tags.includes(tag)))
      .map(other => other.id),
  }));
}

export function generateUserStats(topics: Topic[]): UserStats {
  const weeklyProgress: DailyStats[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    return {
      date: date.toISOString().split('T')[0],
      topicsReviewed: Math.floor(Math.random() * 5) + 1,
      avgRetention: Math.floor(Math.random() * 30) + 60,
      studyMinutes: Math.floor(Math.random() * 60) + 20,
      quizScore: Math.floor(Math.random() * 40) + 60,
    };
  });

  return {
    totalTopics: topics.length,
    avgRetention: Math.round(topics.reduce((s, t) => s + t.retentionScore, 0) / topics.length),
    streak: 7,
    topicsToReview: topics.filter(t => new Date(t.nextReview) <= new Date()).length,
    totalStudyHours: 24,
    weeklyProgress,
  };
}
