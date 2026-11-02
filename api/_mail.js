// Order emails: a notification to the store and a confirmation to the customer.
// Needs these environment variables on Vercel (nothing is sent until they are set):
//   MAIL_USER  the Gmail address that sends the emails      MAIL_PASS  its Google "app password" (16 letters)
//   MAIL_TO    (optional) where new-order notifications go; otherwise the address saved in Admin > Settings, otherwise MAIL_USER
let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (e) {}

const R = n => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function totals(o) {
  const sub = o.items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub - (o.discount || 0) + (o.delivery || 0);
  return { sub, total, balance: total - (o.advance || 0) };
}

function itemsTable(o) {
  const t = totals(o);
  const rows = o.items.map(i => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(i.name)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${R(i.price * i.qty)}</td></tr>`).join('');
  const line = (l, v, b) => `<tr><td colspan="2" style="padding:5px 8px;text-align:right${b ? ';font-weight:700' : ''}">${l}</td><td style="padding:5px 8px;text-align:right${b ? ';font-weight:700' : ''}">${v}</td></tr>`;
  return `<table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr style="background:#f5f3ef"><th style="padding:6px 8px;text-align:left">Item</th><th style="padding:6px 8px">Qty</th><th style="padding:6px 8px;text-align:right">Amount</th></tr></thead><tbody>${rows}
  ${line('Subtotal', R(t.sub))}${o.discount > 0 ? line('Discount', '− ' + R(o.discount)) : ''}${line('Delivery', R(o.delivery))}${line('Total', R(t.total), true)}
  ${o.advance > 0 ? line('Advance to pay now', R(o.advance)) + line('Balance on delivery (COD)', R(t.balance), true) : ''}</tbody></table>`;
}

const wrap = (title, body) => `<div style="font-family:Arial,Helvetica,sans-serif;color:#1b1b1a;max-width:620px;margin:0 auto"><div style="background:#000;padding:16px 20px"><span style="color:#f6cc66;font-size:20px;letter-spacing:.12em">GOLDEN INTERIORS</span></div><div style="padding:20px;border:1px solid #eee;border-top:0"><h2 style="margin:0 0 14px;font-size:20px">${title}</h2>${body}</div></div>`;

function storeMail(o, hasShot, bankNote) {
  const t = totals(o);
  const html = wrap(`New order ${esc(o.id)} · ${R(t.total)}`, `
   <p style="margin:0 0 12px"><b>${esc(o.customer)}</b><br>${esc(o.phone)}${o.email ? '<br>' + esc(o.email) : ''}<br>${esc(o.address)}, ${esc(o.city)}</p>
   <p style="margin:0 0 12px">Payment: <b>${esc(o.payment)}</b>${o.advance > 0 ? ` &nbsp;·&nbsp; <b>${R(o.advance)} advance</b> to be paid now, balance ${R(t.balance)} on delivery` : ''}</p>
   ${itemsTable(o)}
   ${o.notes ? `<p style="margin:14px 0 0"><b>Customer notes:</b> ${esc(o.notes)}</p>` : ''}
   <p style="margin:14px 0 0;padding:10px;background:${hasShot ? '#e8f4ea' : '#fff6e0'}">${hasShot ? 'The customer\'s payment screenshot is attached to this email. Please verify it before shipping.' : (o.payment === 'Bank transfer' || o.advance > 0 ? 'No payment screenshot was uploaded yet. The customer may send it on WhatsApp.' : 'No advance payment needed for this order.')}</p>`);
  return { subject: `New order ${o.id} – ${R(t.total)} (${o.city})`, html };
}

function customerMail(o, bank, hasShot) {
  const t = totals(o);
  const pay = o.payment === 'Bank transfer'
    ? `<p style="margin:14px 0 0">Please transfer <b>${R(t.total)}</b> to the account below and keep your payment screenshot.</p>`
    : o.advance > 0 ? `<p style="margin:14px 0 0"><b>Important:</b> for cash on delivery outside Karachi, please pay <b>${R(o.advance)}</b> in advance before the product is shipped. The remaining <b>${R(t.balance)}</b> is collected on delivery.</p>` : '';
  const b = bank || {};
  const acct = (o.payment === 'Bank transfer' || o.advance > 0) && (b.title || b.bank || b.number || b.iban)
    ? `<table style="margin-top:8px;font-size:14px">${[['Account title', b.title], ['Bank', b.bank], ['Account number', b.number], ['IBAN', b.iban]].filter(r => r[1]).map(r => `<tr><td style="padding:2px 12px 2px 0;color:#6b6b67">${r[0]}</td><td><b>${esc(r[1])}</b></td></tr>`).join('')}</table>${b.note ? `<p style="font-size:13px;color:#6b6b67">${esc(b.note)}</p>` : ''}` : '';
  const html = wrap(`Thank you, ${esc(String(o.customer).split(' ')[0])}!`, `
   <p style="margin:0 0 12px">Your order <b>${esc(o.id)}</b> has been received. It will be processed and delivered within 3 to 5 days, and we will call you on ${esc(o.phone)} to confirm.</p>
   ${itemsTable(o)}${pay}${acct}
   ${hasShot ? '<p style="margin:14px 0 0">We have received your payment screenshot and will verify it shortly.</p>' : (o.payment === 'Bank transfer' || o.advance > 0 ? '<p style="margin:14px 0 0">After you pay, please send the screenshot on WhatsApp (03312523286) with your order number.</p>' : '')}
   <p style="margin:18px 0 0;font-size:13px;color:#6b6b67">Golden Interiors · Gul Plaza, Karachi · 03312523286</p>`);
  return { subject: `Your Golden Interiors order ${o.id}`, html };
}

// returns { store: bool, customer: bool }
async function sendOrderEmails(o, shot, settings, transportOverride) {
  const out = { store: false, customer: false };
  const user = process.env.MAIL_USER, pass = process.env.MAIL_PASS;
  const transport = transportOverride || (nodemailer && user && pass ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass }, connectionTimeout: 6000, greetingTimeout: 6000, socketTimeout: 8000 }) : null);
  if (!transport) return out;
  const from = `"Golden Interiors" <${user || 'orders@goldeninteriors.pk'}>`;
  const to = (settings && settings.notifyTo) || process.env.MAIL_TO || user;
  const hasShot = !!shot;
  const att = [];
  if (hasShot) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(shot);
    if (m) att.push({ filename: `payment-${o.id}.${m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg'}`, content: Buffer.from(m[2], 'base64'), contentType: m[1] });
  }
  const jobs = [];
  if (to) { const m = storeMail(o, hasShot); jobs.push(transport.sendMail({ from, to, subject: m.subject, html: m.html, attachments: att, replyTo: o.email || undefined }).then(() => { out.store = true; }).catch(e => console.error('store mail failed', e && e.message))); }
  if (o.email) { const m = customerMail(o, settings && settings.bank, hasShot); jobs.push(transport.sendMail({ from, to: o.email, subject: m.subject, html: m.html, replyTo: to || undefined }).then(() => { out.customer = true; }).catch(e => console.error('customer mail failed', e && e.message))); }
  await Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, 9000))]);
  return out;
}
module.exports = { sendOrderEmails, storeMail, customerMail };
