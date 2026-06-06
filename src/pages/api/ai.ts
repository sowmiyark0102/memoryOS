import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, topic, content, difficulty } = req.body;

  try {
    if (action === 'generate_quiz') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Generate 3 multiple choice quiz questions for this topic.

Topic: ${topic}
Content: ${content}
Difficulty: ${difficulty}

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "..."
  }
]`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const clean = text.replace(/```json|```/g, '').trim();
      const questions = JSON.parse(clean);
      return res.status(200).json({ questions });
    }

    if (action === 'analyze_content') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `Analyze this learning content and return JSON only, no markdown:

Content: ${content}

Return:
{
  "difficulty": "easy|medium|hard",
  "keyConceptsCount": number,
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "subject": "subject name",
  "studyTip": "one specific study tip for this content"
}`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const clean = text.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(clean);
      return res.status(200).json({ analysis });
    }

    if (action === 'generate_summary') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `Create a concise memory-optimized summary of this content. Focus on key facts, patterns, and mnemonics. Keep it under 100 words.

Topic: ${topic}
Content: ${content}

Return plain text only, no JSON.`,
          },
        ],
      });

      const summary = message.content[0].type === 'text' ? message.content[0].text : '';
      return res.status(200).json({ summary });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: 'AI service error. Check your API key.' });
  }
}
