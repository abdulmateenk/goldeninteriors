// Coupon rules shared by api/coupon.js (checking a code) and api/orders.js (applying it to an order).
const pkToday = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
const norm = c => String(c == null ? '' : c).toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);

// Looks the code up in the saved coupons and checks it is usable for this order subtotal.
function check(cfg, code, subtotal) {
  const c = norm(code);
  if (!c) return { ok: false, error: 'not_found' };
  const l = cfg && Array.isArray(cfg.coupons) ? cfg.coupons : [];
  const k = l.find(x => x && x.code === c);
  if (!k || !k.active) return { ok: false, error: 'not_found' };
  const t = pkToday();
  if (k.start && t < k.start) return { ok: false, error: 'not_started' };
  if (k.end && t > k.end) return { ok: false, error: 'expired' };
  if (k.limit > 0 && (k.used || 0) >= k.limit) return { ok: false, error: 'used_up' };
  if (k.min > 0 && subtotal < k.min) return { ok: false, error: 'min_order', min: k.min };
  return { ok: true, coupon: { id: k.id, code: k.code, type: k.type, value: k.value, min: k.min || 0, combine: !!k.combine } };
}
// How much the coupon takes off, on top of the automatic order discount `ruleOff`.
function amount(coupon, subtotal, ruleOff) {
  const raw = coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : Math.min(coupon.value, subtotal);
  const add = coupon.combine ? raw : Math.max(0, raw - ruleOff);
  return Math.max(0, Math.min(add, subtotal - ruleOff));
}
module.exports = { check, amount, norm, pkToday };
