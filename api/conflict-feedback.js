const crypto = require('crypto');

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const SESSION_SECRET = process.env.CONFLICT_SESSION_SECRET;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

async function kv(command) {
  if (!KV_URL || !KV_TOKEN) throw new Error('KV_NOT_CONFIGURED');
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`KV_HTTP_${r.status}`);
  return r.json();
}

function verifyToken(token) {
  if (!token || !SESSION_SECRET) return null;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return /^[a-z]+\d{3}$/.test(value.username) ? value : null;
  } catch (_) { return null; }
}

async function rateLimit(username) {
  const key = `conflict:rate:${username}`;
  const now = Date.now();
  const r = await kv(['INCR', key]);
  const count = Number(r.result || 0);
  if (count === 1) await kv(['PEXPIRE', key, WINDOW_MS]);
  const ttl = await kv(['PTTL', key]);
  return { allowed: count <= LIMIT, count, retryAfterMs: Math.max(0, Number(ttl.result || 0)) };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({ message: 'Method not allowed.' });
  try {
    if (req.method === 'GET') {
      const raw = await kv(['LRANGE', 'conflict:reviews', '0', '49']);
      const reviews = (raw.result || []).map(x => { try { return JSON.parse(x); } catch (_) { return null; } }).filter(Boolean);
      return res.status(200).json({ reviews });
    }

    const account = verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i, ''));
    if (!account) return res.status(401).json({ message: 'A valid anonymous EarthPulse account is required.' });

    const limit = await rateLimit(account.username);
    res.setHeader('X-RateLimit-Limit', String(LIMIT));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, LIMIT - limit.count)));
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)));
      return res.status(429).json({ message: 'Rate limit reached. Please try again later.', retryAfterMs: limit.retryAfterMs });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rating = Math.max(1, Math.min(5, Number(body.rating)));
    const review = String(body.review || '').trim().slice(0, 600);
    const conflict = String(body.conflict || '').trim().slice(0, 120);
    if (!Number.isFinite(rating) || !review || !conflict) return res.status(400).json({ message: 'Rating, review and conflict are required.' });

    const item = {
      id: crypto.randomUUID(),
      username: account.username,
      rating,
      review,
      conflict,
      createdAt: new Date().toISOString()
    };
    await kv(['LPUSH', 'conflict:reviews', JSON.stringify(item)]);
    await kv(['LTRIM', 'conflict:reviews', '0', '199']);
    return res.status(201).json({ review: item, remaining: LIMIT - limit.count });
  } catch (e) {
    console.error('conflict-feedback error:', e?.message || e);
    return res.status(503).json({ message: 'Feedback service is temporarily unavailable.' });
  }
};