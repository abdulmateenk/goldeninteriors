// Golden Interiors banner / tile / collection photos uploaded from the admin.
//   GET /api/bimg?id=<id>   (public)  -> the image itself (cached for a year, the id never changes)
//   PUT /api/bimg           (admin)   { data: "data:image/webp;base64,..." }  -> { ok, id, url }
//                                     { del: [id, ...] }                        -> removes old photos
// Admin calls need the header  x-admin-key  that matches the ADMIN_KEY environment variable.
const crypto = require('crypto');
const { cmd, configured } = require('./_kv');
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
function isAdmin(req) {
  const k = process.env.ADMIN_KEY || '', h = String(req.headers['x-admin-key'] || '');
  if (k.length < 8 || h.length !== k.length) return false;
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(k));
}
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return await new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1000000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d)); } catch (e) { r(null); } }); req.on('error', () => r(null)); });
}
const OK_ID = /^[\w-]{1,60}$/, OK_IMG = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;
module.exports = async (req, res) => {
  try {
    if (!configured()) return send(res, 503, { error: 'storage_not_configured' });
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '');
      if (!OK_ID.test(id)) return send(res, 400, { error: 'bad_id' });
      const raw = await cmd(['GET', 'gi:bimg:' + id]);
      const m = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(raw || '');
      if (!m) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain'); return res.end('not found'); }
      res.statusCode = 200; res.setHeader('Content-Type', m[1]); res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable'); return res.end(Buffer.from(m[2], 'base64'));
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
      const b = await readBody(req);
      if (!b || typeof b !== 'object') return send(res, 400, { error: 'invalid' });
      if (Array.isArray(b.del)) {
        for (const id of b.del.slice(0, 40)) if (typeof id === 'string' && OK_ID.test(id)) await cmd(['DEL', 'gi:bimg:' + id]);
        return send(res, 200, { ok: true });
      }
      if (typeof b.data !== 'string' || !OK_IMG.test(b.data)) return send(res, 400, { error: 'invalid_image' });
      if (b.data.length > 900000) return send(res, 413, { error: 'too_large' });
      const id = 'b' + Date.now().toString(36) + crypto.randomBytes(5).toString('hex');
      await cmd(['SET', 'gi:bimg:' + id, b.data]);
      return send(res, 200, { ok: true, id, url: '/api/bimg?id=' + id });
    }
    res.setHeader('Allow', 'GET, PUT'); return send(res, 405, { error: 'method' });
  } catch (e) { return send(res, e.code || 500, { error: e.message || 'error' }); }
};
