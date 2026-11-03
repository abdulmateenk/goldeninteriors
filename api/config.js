// Golden Interiors shared site settings (header categories and their sub-headings).
//   GET /api/config            (public)  -> { cats, discounts, promo, rule, settings, overrides }   (admin GET also returns coupons; the public one never does)   (each null when never saved)
//   PUT /api/config            (admin)   any of { cats, discounts, promo, rule, settings, overrides }; cats:null = built-in categories
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
function cleanSettings(s) {
  if (!s || typeof s !== 'object') return null;
  const n = (v, d) => { const x = Number(v); return Number.isFinite(x) && x >= 0 && x <= 1000000 ? Math.round(x) : d; };
  const d = s.delivery || {}, b = s.bank || {};
  const email = str(s.notifyTo, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { delivery: { karachi: n(d.karachi, 400), other: n(d.other, 600) }, bank: { title: str(b.title, 80), bank: str(b.bank, 80), number: str(b.number, 60), iban: str(b.iban, 60), note: str(b.note, 300) }, advance: n(s.advance, 500), notifyTo: email };
}
function cleanOverrides(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const ids = Object.keys(o);
  if (ids.length > 600) return null;
  const out = {};
  for (const id of ids) {
    if (!/^[\w-]{1,80}$/.test(id) || !o[id] || typeof o[id] !== 'object') continue;
    const e = o[id], r = {};
    const nn = (v, max) => { const x = Number(v); return Number.isFinite(x) && x >= 0 && x <= max ? Math.round(x) : null; };
    if (e.stock != null) { const v = nn(e.stock, 100000); if (v !== null) r.stock = v; }
    if (e.price != null) { const v = nn(e.price, 100000000); if (v) r.price = v; }
    if ('compareAt' in e) { const v = nn(e.compareAt, 100000000); r.compareAt = v || null; }
    if (e.hidden) r.hidden = true;
    if (typeof e.name === 'string') r.name = str(e.name, 160);
    if (typeof e.tag === 'string') r.tag = str(e.tag, 30);
    if (typeof e.description === 'string') r.description = String(e.description).slice(0, 4000);
    if (typeof e.material === 'string') r.material = str(e.material, 200);
    if (typeof e.dimensions === 'string') r.dimensions = str(e.dimensions, 200);
    if (Array.isArray(e.showOn)) r.showOn = e.showOn.slice(0, 10).map(x => str(x, 30)).filter(Boolean);
    if (Array.isArray(e.also)) r.also = e.also.slice(0, 10).map(x => str(x, 80)).filter(Boolean);
    out[id] = r;
  }
  return out;
}
function cleanCoupons(a, cur) {
  if (!Array.isArray(a) || a.length > 300) return null;
  const old = Array.isArray(cur) ? cur : [], seen = new Set(), out = [];
  for (const d of a) {
    const code = String(d && d.code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24), value = Number(d && d.value);
    if (code.length < 3 || seen.has(code) || !(value > 0) || value > 10000000) return null;
    seen.add(code);
    const type = d.type === 'fixed' ? 'fixed' : 'percent';
    if (type === 'percent' && value >= 100) return null;
    const start = str(d.start, 10), end = str(d.end, 10);
    if (!DATE.test(start) || !DATE.test(end)) return null;
    const id = str(d.id, 40) || code, prev = old.find(x => x && (x.id === id || x.code === code));
    const min = Number(d.min), limit = Number(d.limit);
    out.push({ id, code, type, value, min: Number.isFinite(min) && min > 0 ? Math.round(min) : 0, limit: Number.isFinite(limit) && limit > 0 ? Math.round(limit) : 0, used: prev ? Number(prev.used) || 0 : 0, start, end, active: !!d.active, combine: !!d.combine, name: str(d.name, 60) });
  }
  return out;
}
function cleanPromo(p) {
  if (!p || typeof p !== 'object') return null;
  return { on: !!p.on, text: str(p.text, 160) };
}
module.exports = async (req, res) => {
  try {
    if (!configured()) return send(res, 200, { cats: null, discounts: null, promo: null, rule: null, settings: null, overrides: null });
    const load = async () => { try { const raw = await cmd(['GET', KEY]); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } };
    if (req.method === 'GET') {
      const b = await load();
      let settings = b.settings || null;
      if (settings && !isAdmin(req)) { settings = Object.assign({}, settings); delete settings.notifyTo; }   // the notification address stays private
      const coupons = isAdmin(req) && Array.isArray(b.coupons) ? b.coupons : undefined;
      return send(res, 200, { coupons, cats: b.cats || null, discounts: Array.isArray(b.discounts) ? b.discounts : null, promo: b.promo || null, rule: b.rule || null, settings, overrides: b.overrides && typeof b.overrides === 'object' ? b.overrides : null });
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
      if ('coupons' in b) {
        if (b.coupons === null) delete cur.coupons;
        else { const c = cleanCoupons(b.coupons, cur.coupons); if (!c) return send(res, 400, { error: 'invalid_coupons' }); cur.coupons = c; }
      }
      if ('promo' in b) {
        if (b.promo === null) delete cur.promo;
        else { const p = cleanPromo(b.promo); if (!p) return send(res, 400, { error: 'invalid_promo' }); cur.promo = p; }
      }
      if ('settings' in b) {
        if (b.settings === null) delete cur.settings;
        else { const t = cleanSettings(b.settings); if (!t) return send(res, 400, { error: 'invalid_settings' }); cur.settings = t; }
      }
      if ('overrides' in b) {
        if (b.overrides === null) delete cur.overrides;
        else { const v = cleanOverrides(b.overrides); if (!v) return send(res, 400, { error: 'invalid_overrides' }); cur.overrides = v; }
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
