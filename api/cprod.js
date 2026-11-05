// Golden Interiors products added from the admin "Add product" form (so every visitor sees them, not just the admin's browser).
//   GET    /api/cprod                 (public) -> { list: [{id, v}] }
//   GET    /api/cprod?id=<id>         (public) -> { v, p, n }     p = product without photos, n = number of photos
//   GET    /api/cprod?id=<id>&i=<n>   (public) -> { img }         one photo (data URI)
//   PUT    /api/cprod                 (admin)  { id, v, p }       saves the product (p.images is stripped and replaced by the photos stored below)
//   PUT    /api/cprod                 (admin)  { id, i, img }     saves photo number i of that product
//   PUT    /api/cprod                 (admin)  { id, v, done: n } finishes an upload: n photos, makes the product visible
//   DELETE /api/cprod?id=<id>         (admin)  removes the product and its photos
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
  return await new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1200000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d)); } catch (e) { r(null); } }); req.on('error', () => r(null)); });
}
const OK_ID = /^[\w-]{1,100}$/, OK_IMG = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;
const IDX = 'gi:cpidx', MAXIMG = 20;
async function getIdx() { try { const raw = await cmd(['GET', IDX]); const a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a : []; } catch (e) { return []; } }
module.exports = async (req, res) => {
  try {
    if (!configured()) return send(res, 503, { error: 'storage_not_configured' });
    const u = new URL(req.url, 'http://x'), q = req.query || {};
    const id = String(q.id || u.searchParams.get('id') || '');
    if (req.method === 'GET') {
      const cache = 'public, max-age=0, s-maxage=20';
      if (!id) return send(res, 200, { list: await getIdx() }, cache);
      if (!OK_ID.test(id)) return send(res, 400, { error: 'bad_id' });
      const i = q.i != null ? q.i : u.searchParams.get('i');
      if (i != null && i !== '') {
        const n = Number(i);
        if (!(n >= 0 && n < MAXIMG)) return send(res, 400, { error: 'bad_index' });
        const raw = await cmd(['GET', 'gi:cpi:' + id + ':' + n]);
        return send(res, 200, { img: raw || '' }, 'public, max-age=0, s-maxage=300');
      }
      const raw = await cmd(['GET', 'gi:cp:' + id]);
      if (!raw) return send(res, 404, { error: 'not_found' });
      let d = null; try { d = JSON.parse(raw); } catch (e) {}
      return send(res, 200, d || { error: 'bad' }, cache);
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
      const b = await readBody(req);
      if (!b || !OK_ID.test(String(b.id || ''))) return send(res, 400, { error: 'invalid' });
      if (b.img != null) {
        const n = Number(b.i);
        if (!(n >= 0 && n < MAXIMG) || typeof b.img !== 'string' || !OK_IMG.test(b.img)) return send(res, 400, { error: 'invalid_image' });
        if (b.img.length > 950000) return send(res, 413, { error: 'too_large' });
        await cmd(['SET', 'gi:cpi:' + b.id + ':' + n, b.img]);
        return send(res, 200, { ok: true });
      }
      if (b.done != null) {
        const n = Number(b.done), v = Number(b.v) || Date.now();
        const raw = await cmd(['GET', 'gi:cpd:' + b.id]);
        let p = null; try { p = raw ? JSON.parse(raw) : null; } catch (e) {}
        if (!p || !(n >= 0 && n <= MAXIMG)) return send(res, 400, { error: 'no_draft' });
        await cmd(['SET', 'gi:cp:' + b.id, JSON.stringify({ v, p, n })]);
        await cmd(['DEL', 'gi:cpd:' + b.id]);
        const idx = (await getIdx()).filter(x => x && x.id !== b.id); idx.push({ id: b.id, v });
        await cmd(['SET', IDX, JSON.stringify(idx)]);
        return send(res, 200, { ok: true });
      }
      const p = b.p;
      if (!p || typeof p !== 'object' || p.id !== b.id || typeof p.name !== 'string') return send(res, 400, { error: 'invalid' });
      const body = Object.assign({}, p); delete body.images;
      const s = JSON.stringify(body);
      if (s.length > 200000) return send(res, 413, { error: 'too_large' });
      await cmd(['SET', 'gi:cpd:' + b.id, s]);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
      if (!OK_ID.test(id)) return send(res, 400, { error: 'bad_id' });
      for (let n = 0; n < MAXIMG; n++) await cmd(['DEL', 'gi:cpi:' + id + ':' + n]);
      await cmd(['DEL', 'gi:cp:' + id]); await cmd(['DEL', 'gi:cpd:' + id]);
      await cmd(['SET', IDX, JSON.stringify((await getIdx()).filter(x => x && x.id !== id))]);
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PUT, DELETE'); return send(res, 405, { error: 'method' });
  } catch (e) { return send(res, e.code || 500, { error: e.message || 'error' }); }
};
