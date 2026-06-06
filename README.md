# 🧠 MemoryOS — AI-Powered Learning Memory Engine

> A personalized memory system that predicts when you'll forget something — and stops it before it happens.

![MemoryOS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Anthropic](https://img.shields.io/badge/Claude-AI-orange?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 🎯 Problem Statement

Humans forget **70% of what they learn within 24 hours** (Ebbinghaus Forgetting Curve). Existing tools like Anki are manual, boring, and don't adapt to *how you actually learn*. MemoryOS solves this with:

- **Predictive forgetting detection** — knows before you do when a concept is slipping
- **AI-generated adaptive quizzes** — not generic flashcards, but questions tailored to your weak spots
- **Personal knowledge graph** — visualize your learning ecosystem and concept connections
- **Spaced repetition engine** — mathematically optimal review scheduling

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Retention Dashboard** | Real-time memory health scores with forgetting curve graphs |
| 🤖 **AI Quiz Engine** | Claude generates personalized multiple-choice questions from your notes |
| 🧬 **Content Analysis** | AI auto-detects subject, difficulty, and tags from your notes |
| 🗺️ **Knowledge Graph** | D3.js interactive visualization of connected concepts |
| 📈 **Forgetting Curve** | Individual Ebbinghaus curve tracked per topic |
| ⚡ **Smart Scheduling** | Optimal review dates calculated using spaced repetition math |
| 💡 **AI Memory Summaries** | Claude generates compact, memory-optimized notes |

---

## 🏗️ Tech Stack

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS
AI:        Anthropic Claude (claude-sonnet-4-20250514)
Viz:       Recharts + Custom D3 Force Graph
State:     localStorage (no backend required for demo)
Fonts:     Syne + DM Sans + JetBrains Mono
Deploy:    Vercel (one-click)
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/memoryos.git
cd memoryos
npm install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
memoryos/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Dashboard
│   │   ├── topics/
│   │   │   ├── index.tsx      # All topics
│   │   │   ├── new.tsx        # Add topic + AI analysis
│   │   │   └── [id].tsx       # Topic detail + AI summary
│   │   ├── review.tsx         # AI quiz engine
│   │   ├── graph.tsx          # Knowledge graph (D3)
│   │   └── api/
│   │       └── ai.ts          # Anthropic API routes
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── TopicCard.tsx
│   │   ├── RetentionBadge.tsx
│   │   └── StatsCard.tsx
│   └── utils/
│       ├── types.ts           # TypeScript interfaces
│       └── memory.ts          # Ebbinghaus math + seed data
├── tailwind.config.js
└── README.md
```

---

## 🧮 The Science Behind It

MemoryOS uses the **Ebbinghaus Forgetting Curve**:

```
R = e^(-t/S)
```

Where:
- `R` = Retention (0–1)
- `t` = Time elapsed since last review (days)
- `S` = Memory stability (increases with each successful review)

The system predicts the optimal next review date to maintain ≥90% retention, minimizing total study time while maximizing long-term retention.

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in Vercel environment variables.

---

## 🎓 Why This Stands Out (for FAANG)

- **Real ML problem** — not just an LLM API wrapper
- **Measurable impact** — retention % is a trackable, improvable metric
- **System design thinking** — feedback loops, data pipelines, scalable architecture
- **Beautiful UI** — Stripe/Vercel-level design quality
- **Knowledge graphs** — used heavily at Google, Amazon, LinkedIn

---

## 📄 License

MIT License — use freely for learning and portfolio purposes.

---

Built with 🧠 by a CS Engineering student targeting FAANG
