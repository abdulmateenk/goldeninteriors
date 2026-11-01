// Golden Interiors shared orders.
//   POST /api/orders          (public)  customer places an order -> {id}
//   GET  /api/orders          (admin)   list all orders
//   PUT  /api/orders          (admin)   {order, create?} save changes to one order
// Admin calls need the header  x-admin-key  that matches the ADMIN_KEY environment variable.
const crypto = require('crypto');
const { cmd, configured } = require('./_kv');

const HASH = 'gi:orders', SEQ = 'gi:orderseq', FIRST_ID = 2000;   // first customer order becomes GI-2001
const STATUS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAY = ['Cash on delivery', 'Bank transfer'];

const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const pkDate = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return await new Promise(r => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 200000) req.destroy(); });
    req.on('end', () => { try { r(JSON.parse(d)); } catch (e) { r(null); } });
    req.on('error', () => r(null));
  });
}

function isAdmin(req) {
  const k = process.env.ADMIN_KEY || '', h = String(req.headers['x-admin-key'] || '');
  if (k.length < 8 || h.length !== k.length) return false;
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(k));
}

function cleanOrder(o) {
  if (!o || typeof o !== 'object') return null;
  const phone = str(o.phone, 20).replace(/[\s-]/g, '');
  const out = {
    customer: str(o.customer, 80), phone, email: str(o.email, 120), city: str(o.city, 60),
    address: str(o.address, 300), notes: str(o.notes, 500),
    payment: PAY.includes(o.payment) ? o.payment : null, delivery: num(o.delivery, 0, 5000)
  };
  if (out.customer.length < 2 || !/^\+?\d{10,13}$/.test(phone) || out.address.length < 6 || out.city.length < 2 || !out.payment || out.delivery === null) return null;
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) out.email = '';
  if (!Array.isArray(o.items) || o.items.length < 1 || o.items.length > 40) return null;
  out.items = [];
  for (const i of o.items) {
    const qty = num(i && i.qty, 1, 99), price = num(i && i.price, 0, 10000000);
    if (qty === null || price === null || !str(i.name, 160)) return null;
    out.items.push({ name: str(i.name, 160), qty: Math.round(qty), price, sku: str(i.sku, 60), id: str(i.id, 80) });
  }
  return out;
}

async function rateLimited(req) {
  try {
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'x').split(',')[0].trim();
    const key = 'gi:rl:' + ip + ':' + Math.floor(Date.now() / 60000);
    const n = await cmd(['INCR', key]);
    if (n === 1) await cmd(['EXPIRE', key, 120]);
    return n > 10;
  } catch (e) { return false; }
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET' && /(^|[?&])health=1/.test(req.url || '')) {
      const names = Object.keys(process.env).filter(n => /REST|KV_|UPSTASH|REDIS|ADMIN_KEY/.test(n)).sort();
      return send(res, 200, { storage: configured(), adminKey: (process.env.ADMIN_KEY || '').length >= 8, vercelEnv: process.env.VERCEL_ENV || '', host: req.headers.host || '', variableNamesSeen: names });
    }
    if (!configured()) return send(res, 503, { error: 'storage_not_configured' });

    if (req.method === 'POST') {
      if (await rateLimited(req)) return send(res, 429, { error: 'too_many_requests' });
      const b = await readBody(req);
      const o = cleanOrder(b);
      if (!o) return send(res, 400, { error: 'invalid_order' });
      const cid = str(b.cid, 64).replace(/[^\w-]/g, '');
      if (cid) { const ex = await cmd(['GET', 'gi:cid:' + cid]); if (ex) return send(res, 200, { id: ex, duplicate: true }); }
      const n = await cmd(['INCR', SEQ]);
      const id = 'GI-' + (FIRST_ID + Number(n));
      const now = new Date().toISOString();
      const order = Object.assign({ id, date: pkDate(), status: 'Pending', source: 'website', createdAt: now, updatedAt: now }, o);
      await cmd(['HSET', HASH, id, JSON.stringify(order)]);
      if (cid) await cmd(['SET', 'gi:cid:' + cid, id, 'EX', 604800]);
      return send(res, 200, { id });
    }

    if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });

    if (req.method === 'GET') {
      const flat = (await cmd(['HGETALL', HASH])) || [];
      const list = [];
      for (let i = 1; i < flat.length; i += 2) { try { list.push(JSON.parse(flat[i])); } catch (e) {} }
      list.sort((a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));
      return send(res, 200, { orders: list });
    }

    if (req.method === 'PUT') {
      const b = await readBody(req);
      const o = b && b.order;
      if (!o || !/^GI-\d{3,8}$/.test(String(o.id)) || !STATUS.includes(o.status) || !Array.isArray(o.items)) return send(res, 400, { error: 'invalid_order' });
      const rec = Object.assign({}, o, { tracking: str(o.tracking, 80), updatedAt: new Date().toISOString() });
      const json = JSON.stringify(rec);
      if (json.length > 20000) return send(res, 400, { error: 'too_large' });
      if (b.create) {
        const ok = await cmd(['HSETNX', HASH, rec.id, json]);
        if (!ok) return send(res, 409, { error: 'exists' });
      } else await cmd(['HSET', HASH, rec.id, json]);
      return send(res, 200, { ok: true, updatedAt: rec.updatedAt });
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (e) {
    return send(res, e && e.code === 503 ? 503 : 500, { error: 'server_error' });
  }
};
