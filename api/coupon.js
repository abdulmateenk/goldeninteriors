// Checks a coupon code for the checkout page.   POST /api/coupon  {code, subtotal}  (public)
//   -> { ok:true, coupon:{code,type,value,min,combine} }   or   { ok:false, error:'not_found'|'expired'|'not_started'|'used_up'|'min_order', min? }
// The list of codes is never sent to the browser: a customer can only test one code at a time.
const { cmd, configured } = require('./_kv');
const { check } = require('./_coupon');
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return await new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 5000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d)); } catch (e) { r(null); } }); req.on('error', () => r(null)); });
}
async function rateLimited(req) {
  try {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
    const key = 'gi:rlc:' + ip + ':' + Math.floor(Date.now() / 60000);
    const n = await cmd(['INCR', key]);
    if (n === 1) await cmd(['EXPIRE', key, 120]);
    return n > 15;
  } catch (e) { return false; }
}
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'method_not_allowed' }); }
    if (!configured()) return send(res, 503, { error: 'storage_not_configured' });
    if (await rateLimited(req)) return send(res, 429, { error: 'too_many_requests' });
    const b = await readBody(req);
    if (!b || typeof b !== 'object') return send(res, 400, { error: 'invalid' });
    let cfg = {};
    try { const raw = await cmd(['GET', 'gi:config']); cfg = raw ? JSON.parse(raw) || {} : {}; } catch (e) { cfg = {}; }
    const sub = Number(b.subtotal);
    return send(res, 200, check(cfg, b.code, Number.isFinite(sub) && sub >= 0 ? sub : 0));
  } catch (e) { return send(res, 500, { error: 'server_error' }); }
};
