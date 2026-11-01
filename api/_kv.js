// Tiny Upstash/Vercel KV (Redis) REST client. No packages needed.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(args) {
  if (!URL_ || !TOK) { const e = new Error('storage_not_configured'); e.code = 503; throw e; }
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) { const e = new Error(j.error || ('kv_' + r.status)); e.code = 502; throw e; }
  return j.result;
}
module.exports = { cmd, configured: () => !!(URL_ && TOK) };
