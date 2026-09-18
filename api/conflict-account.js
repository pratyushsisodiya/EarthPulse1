const crypto = require('crypto');

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const SESSION_SECRET = process.env.CONFLICT_SESSION_SECRET;

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

function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  if (!SESSION_SECRET) return res.status(503).json({ message: 'Account service is not configured.' });
  try {
    const n = Number((await kv(['INCR', 'conflict:user:counter'])).result);
    const username = `user${String(n).padStart(3, '0')}`;
    const createdAt = new Date().toISOString();
    const payload = Buffer.from(JSON.stringify({ username, createdAt })).toString('base64url');
    const token = `${payload}.${sign(payload)}`;
    await kv(['SET', `conflict:user:${username}`, JSON.stringify({ username, createdAt }), 'EX', 31536000]);
    return res.status(200).json({ username, token });
  } catch (e) {
    console.error('conflict-account error:', e?.message || e);
    return res.status(503).json({ message: 'Account service temporarily unavailable.' });
  }
};