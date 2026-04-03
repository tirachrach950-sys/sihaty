export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body || {};
  const KEY = process.env.ANTHROPIC_API_KEY;

  if (!KEY) {
    return res.status(500).json({ error: 'NO_KEY', debug: 'ANTHROPIC_API_KEY not found in env' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt || 'قل مرحبا' }]
      })
    });

    const text = await r.text();

    if (!r.ok) {
      return res.status(500).json({ 
        error: 'API_ERROR',
        status: r.status,
        body: text
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: 'EXCEPTION', message: e.message });
  }
}
