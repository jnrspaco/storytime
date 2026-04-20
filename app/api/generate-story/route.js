import { buildStoryPrompt } from '@/src/lib/promptBuilder';
import { THEMES } from '@/src/lib/themes';

const VALID_THEMES = new Set(THEMES.map((t) => t.id));

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, theme } = body ?? {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return Response.json(
      { error: "Please enter your child's name to begin the story." },
      { status: 400 }
    );
  }

  if (!theme || !VALID_THEMES.has(theme)) {
    return Response.json(
      { error: `Invalid theme. Must be one of: ${[...VALID_THEMES].join(', ')}.` },
      { status: 400 }
    );
  }

  const safeName = name.trim().slice(0, 50);
  const prompt = buildStoryPrompt(safeName, theme);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return Response.json(
        { error: "We couldn't generate the story right now. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const story = data.choices[0].message.content;
    return Response.json({ story });
  } catch (err) {
    console.error('Groq API error:', err);
    return Response.json(
      { error: "We couldn't generate the story right now. Please try again." },
      { status: 500 }
    );
  }
}