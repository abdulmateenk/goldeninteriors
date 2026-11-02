// Golden Interiors shared site settings (header categories and their sub-headings).
//   GET /api/config            (public)  -> { cats, discounts, promo, rule }   (each null when never saved)
//   PUT /api/config            (admin)   any of { cats, discounts, promo, rule }; cats:null = built-in categories
const crypto = require('crypto');
const { cmd, configured } = require('./_kv');
const KEY = 'gi:config';
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
function isAdmin(req) {
  const k = process.env.ADMIN_KEY || '', h = String(req.headers['x-admin-key'] || '');
  if (k.length < 8 || h.length !== k.length) return false;
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(k));
}
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return await new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 200000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d)); } catch (e) { r(null); } }); req.on('error', () => r(null)); });
}
function cleanCats(a) {
  if (!Array.isArray(a) || a.length > 40) return null;
  const seen = new Set(), out = [];
  for (const c of a) {
    const key = str(c && c.key, 40).toLowerCase();
    const name = str(c && c.name, 60);
    if (!/^[a-z0-9-]{1,40}$/.test(key) || key === 'home' || key === 'category' || !name || seen.has(key)) return null;
    seen.add(key);
    const sub = [];
    for (const s of (Array.isArray(c.sub) ? c.sub : []).slice(0, 15)) {
      const n = str(s && s.name, 60), u = str(s && s.url, 300);
      if (n && /^(\/|https?:\/\/)/.test(u)) sub.push({ name: n, url: u });
    }
    out.push({ key, name, value: str(c.value, 80), sub });
  }
  return out;
}
const DATE = /^(\d{4}-\d{2}-\d{2})?$/;
function cleanDiscounts(a) {
  if (!Array.isArray(a) || a.length > 200) return null;
  const out = [];
  for (const d of a) {
    const id = str(d && d.id, 40), value = Number(d && d.value);
    if (!id || !(value > 0) || value > 10000000) return null;
    const type = d.type === 'fixed' ? 'fixed' : 'percent';
    if (type === 'percent' && value >= 100) return null;
    const scope = d.scope === 'products' ? 'products' : 'categories';
    const list = (v, n) => (Array.isArray(v) ? v : []).slice(0, n).map(x => str(x, 80)).filter(Boolean);
    const start = str(d.start, 10), end = str(d.end, 10);
    if (!DATE.test(start) || !DATE.test(end)) return null;
    out.push({ id, name: str(d.name, 60), type, value, scope, categories: list(d.categories, 60), products: list(d.products, 2000), start, end, active: !!d.active, msg: str(d.msg, 140) });
  }
  return out;
}
function cleanRule(r) {
  if (!r || typeof r !== 'object') return null;
  const min = Number(r.min), pct = Number(r.pct);
  if (!(min > 0) || min > 100000000 || !(pct > 0) || pct >= 100) return null;
  return { on: !!r.on, min: Math.round(min), pct: Math.round(pct * 100) / 100 };
}
function cleanPromo(p) {
  if (!p || typeof p !== 'object') return null;
  return { on: !!p.on, text: str(p.text, 160) };
}
module.exports = async (req, res) => {
  try {
    if (!configured()) return send(res, 200, { cats: null, discounts: null, promo: null, rule: null });
    const load = async () => { try { const raw = await cmd(['GET', KEY]); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } };
    if (req.method === 'GET') {
      const b = await load();
      return send(res, 200, { cats: b.cats || null, discounts: Array.isArray(b.discounts) ? b.discounts : null, promo: b.promo || null, rule: b.rule || null });
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
      const b = await readBody(req);
      if (!b || typeof b !== 'object') return send(res, 400, { error: 'invalid' });
      const cur = await load();
      if ('cats' in b) {
        if (b.cats === null) delete cur.cats;
        else { const c = cleanCats(b.cats); if (!c) return send(res, 400, { error: 'invalid_categories' }); cur.cats = c; }
      }
      if ('discounts' in b) {
        if (b.discounts === null) delete cur.discounts;
        else { const d = cleanDiscounts(b.discounts); if (!d) return send(res, 400, { error: 'invalid_discounts' }); cur.discounts = d; }
      }
      if ('promo' in b) {
        if (b.promo === null) delete cur.promo;
        else { const p = cleanPromo(b.promo); if (!p) return send(res, 400, { error: 'invalid_promo' }); cur.promo = p; }
      }
      if ('rule' in b) {
        if (b.rule === null) delete cur.rule;
        else { const q = cleanRule(b.rule); if (!q) return send(res, 400, { error: 'invalid_rule' }); cur.rule = q; }
      }
      cur.updatedAt = new Date().toISOString();
      await cmd(['SET', KEY, JSON.stringify(cur)]);
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (e) { return send(res, e && e.code === 503 ? 503 : 500, { error: 'server_error' }); }
};
