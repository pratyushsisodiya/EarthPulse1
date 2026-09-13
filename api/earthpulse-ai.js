// EarthPulse AI — TaBiAI/OpenAI-compatible Vercel backend
const API_KEY = process.env.TABIAI_API_KEY || process.env.ANTHROPIC_API_KEY;
const BASE_URL = (process.env.TABIAI_BASE_URL || 'https://tabitoken.com/v1').replace(/\/$/, '');

// TaBiAI/New API requires an explicit model for /v1/chat/completions.
// Try several widely used model IDs instead of assuming a Claude-only route.
const REQUESTED_MODEL = process.env.TABIAI_MODEL || '';
const MODELS = REQUESTED_MODEL ? [REQUESTED_MODEL] : [
  'gpt-4o-mini',
  'gpt-5.5',
  'claude-opus-4-8',
  'gemini-3.1-pro',
  'deepseek-v4-pro',
  'llama-4-maverick'
];

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4000;
const MAX_CONTEXT_CHARS = 9000;
const MAX_BODY_BYTES = 120000;
const REQUEST_TIMEOUT_MS = 22000;

function jsonSize(v) {
  try { return Buffer.byteLength(JSON.stringify(v || {}), 'utf8'); }
  catch (_) { return Infinity; }
}

function safeJson(v, max) {
  try {
    const s = JSON.stringify(v ?? null);
    return s.length <= max ? s : s.slice(0, max) + '…(truncated)';
  } catch (_) { return 'null'; }
}

function normalizeMessages(messages) {
  return messages.slice(-MAX_MESSAGES).map((m) => ({
    role: m?.role === 'assistant' ? 'assistant' : 'user',
    content: String(m?.content ?? '').trim().slice(0, MAX_MESSAGE_CHARS)
  })).filter((m) => m.content);
}

function systemPrompt(context) {
  return `You are EarthPulse AI, the Earth Intelligence Assistant inside an environmental monitoring dashboard.
Explain EarthPulse data and Earth/environmental science accurately and clearly.

CURRENT APPLICATION STATE (JSON; may contain null/unavailable values)
${safeJson(context || {}, MAX_CONTEXT_CHARS)}

Rules:
1. Never invent measurements, events, sources, or current conditions not supplied above.
2. Separate observed data from scientific explanation, inference, and uncertainty.
3. Do not claim causation from correlation alone.
4. Do not make unsupported future predictions.
5. Mention the supplied source when relying on a specific figure.
6. Keep answers concise unless deeper detail is requested.
7. Never reveal API keys or internal configuration.`;
}

async function callModel(apiKey, model, messages, context) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt(context) },
          ...messages
        ],
        max_tokens: 700,
        temperature: 0.3
      }),
      signal: controller.signal
    });

    let data = null;
    try { data = await r.json(); } catch (_) {}
    const detail = data?.error?.message || data?.message || '';
    if (!r.ok) {
      const e = new Error(`Provider HTTP ${r.status}${detail ? `: ${detail}` : ''}`);
      e.status = r.status;
      e.providerMessage = detail;
      throw e;
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      const e = new Error('Provider returned no assistant text.');
      e.status = 502;
      throw e;
    }
    return String(text).trim();
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (jsonSize(body) > MAX_BODY_BYTES) return res.status(413).json({ message: 'Request is too large.' });

    const { messages, context } = body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: 'A non-empty messages array is required.' });
    }
    if (messages.length > 200) {
      return res.status(400).json({ message: 'Conversation too long for this session.' });
    }
    if (!API_KEY) return res.status(503).json({ message: 'TaBiAI API key is not configured.' });

    const normalized = normalizeMessages(messages);
    if (!normalized.length) return res.status(400).json({ message: 'No usable message content was supplied.' });

    let last = null;
    for (const model of MODELS) {
      try {
        const text = await callModel(API_KEY, model, normalized, context);
        return res.status(200).json({ text, model });
      } catch (e) {
        last = e;
        // Wrong/unavailable model: keep trying another model.
        if (![400, 403, 404].includes(e?.status)) break;
      }
    }

    throw last || new Error('No configured TaBiAI model succeeded.');
  } catch (e) {
    const status = Number.isInteger(e?.status) ? e.status : 502;
    console.error('earthpulse-ai error:', e?.message || e);
    if (status === 401) return res.status(502).json({ message: 'TaBiAI rejected the API key (HTTP 401).' });
    if (status === 403 || status === 404) return res.status(502).json({ message: 'TaBiAI denied all configured model IDs (HTTP 403/404). The key is accepted, but this TaBiAI account does not expose any of the tested model IDs.' });
    if (status === 429) return res.status(502).json({ message: 'TaBiAI rate limit or quota reached (HTTP 429).' });
    if (status === 504 || e?.name === 'AbortError') return res.status(504).json({ message: 'TaBiAI request timed out. Please try again.' });
    return res.status(502).json({ message: `TaBiAI service unavailable (HTTP ${status}).` });
  }
};
