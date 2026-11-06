// Golden Interiors product photos edited from the admin (for products that are built into the site).
//   GET /api/pimg?id=<product id>   (public)  -> { v, images: [dataURI,...] }
//   PUT /api/pimg                   (admin)   { id, v, images: [dataURI,...] }   images [] removes the custom photos
// Admin calls need the header  x-admin-key  that matches the ADMIN_KEY environment variable.
const crypto = require('crypto');
const { cmd, configured } = require('./_kv');
const send = (res, code, obj, cache) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', cache || 'no-store'); res.end(JSON.stringify(obj)); };
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
const OK_ID = /^[\w-]{1,80}$/, OK_IMG = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;
module.exports = async (req, res) => {
  try {
    if (!configured()) return send(res, 503, { error: 'storage_not_configured' });
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '');
      if (!OK_ID.test(id)) return send(res, 400, { error: 'bad_id' });
      const raw = await cmd(['GET', 'gi:pimg:' + id]);
      if (!raw) return send(res, 200, { v: 0, images: [] }, 'public, max-age=0, s-maxage=30');
      let d = null; try { d = JSON.parse(raw); } catch (e) {}
      const qi = (req.query && req.query.i != null) ? req.query.i : new URL(req.url, 'http://x').searchParams.get('i');
      if (qi != null && qi !== '') {
        const one = d && Array.isArray(d.images) ? d.images[parseInt(qi, 10)] : '';
        const m = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(one || '');
        if (!m) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain'); return res.end('not found'); }
        res.statusCode = 200; res.setHeader('Content-Type', m[1]); res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable'); return res.end(Buffer.from(m[2], 'base64'));
      }
      return send(res, 200, { v: d && d.v || 0, images: d && Array.isArray(d.images) ? d.images : [] }, 'public, max-age=0, s-maxage=30');
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
      const b = await readBody(req);
      if (!b || !OK_ID.test(String(b.id || '')) || !Array.isArray(b.images) || b.images.length > 12) return send(res, 400, { error: 'invalid' });
      const imgs = b.images.filter(s => typeof s === 'string' && OK_IMG.test(s));
      if (imgs.length !== b.images.length) return send(res, 400, { error: 'invalid_image' });
      if (imgs.reduce((n, s) => n + s.length, 0) > 900000) return send(res, 413, { error: 'too_large' });
      const key = 'gi:pimg:' + b.id;
      if (!imgs.length) await cmd(['DEL', key]);
      else await cmd(['SET', key, JSON.stringify({ v: Number(b.v) || Date.now(), images: imgs })]);
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PUT'); return send(res, 405, { error: 'method' });
  } catch (e) { return send(res, e.code || 500, { error: e.message || 'error' }); }
};
