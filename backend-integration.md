# Golden Interiors: connecting the site to your backend

All backend calls live in one object, `GI`, near the top of the cart section in `app.js`.
Set `API_BASE` to your server. While it is empty, the site uses the sample products.

```js
const GI = { API_BASE: 'https://api.goldeninteriors.pk/v1', ... }
```

## Endpoints the site calls

| Action | Request | Expected response |
|---|---|---|
| Load a product page | `GET {API_BASE}/products/{id}` | Product JSON (below) |
| Add to cart | `POST {API_BASE}/cart/items` | any 2xx |
| Checkout / Buy now | `POST {API_BASE}/checkout` | `{ "url": "https://..." }` (the site redirects to it) |
| Wishlist on / off | `POST` / `DELETE {API_BASE}/wishlist/{id}` | any 2xx |

If a call fails, the site falls back gracefully (sample data, demo checkout message).
Your server must allow the site's origin with CORS.

## Product JSON (what `GET /products/{id}` returns)

```json
{
  "id": "ivory-floor-vase",
  "name": "Ivory Sculpted Floor Vase",
  "category": "Vases",
  "price": 18500,
  "compareAt": null,
  "tag": "New",
  "description": "A tall matte vase with a narrow neck.",
  "images": ["https://cdn.../vase-1.jpg", "https://cdn.../vase-2.jpg"],
  "options": [
    { "name": "Finish", "type": "swatch",
      "values": [
        { "label": "Ivory", "swatch": "#E8E2D4", "image": 0 },
        { "label": "Sage",  "swatch": "#9FB3A4", "image": 1 }
      ] },
    { "name": "Size", "type": "button",
      "values": [ { "label": "Medium" }, { "label": "Large", "priceDelta": 4000 } ] }
  ],
  "dimensions": [["Height", "80 cm"], ["Diameter", "28 cm"]],
  "material": "Matte ceramic with a hand-finished glaze.",
  "care": "Wipe with a soft, damp cloth.",
  "stock": 24
}
```

- `options` is any number of option groups. `type` is `"swatch"` (colour circle) or `"button"` (text).
- `priceDelta` is added to `price` when that value is chosen.
- `image` (optional) is the index in `images` to show when that value is chosen. You can instead give a value its own `"images": ["url1", "url2"]` list of pictures uploaded for that variation (planned: not wired yet, `image` index works today).
- `compareAt` shows a crossed-out price when set.
- `stock` caps the quantity selector and shows "In stock" / "Out of stock".

## Cart / checkout line (what the site sends)

```json
{ "sku": "ivory-floor-vase-ivory-large", "id": "ivory-floor-vase",
  "name": "Ivory Sculpted Floor Vase",
  "sel": { "Finish": "Ivory", "Size": "Large" },
  "price": 22500, "q": 2 }
```

The `sku` is built as the product id plus the lower-cased chosen values. Re-check price and stock on your server.

## Still to do on your side
- The category pages and the home page still read the sample list in `app.js`. Point them at `GET /products?category=...` when your catalogue API is ready.
- The cart and wishlist are also saved in the browser (localStorage) so they persist between pages.

## Admin area (demo)

Pages: `login.html`, `dashboard.html`, `add-product.html`, `orders.html`, `finance.html`, `invoices.html` (code in `admin.js`).

- **Demo login:** `admin@gmail.com` / `admin1234`. These are written in `admin.js`, so anyone who views the page code can read them. Before going live, replace the check with a real server login (session cookie or token) and protect the admin APIs on the server.
- **Data:** products added, orders, the ledger and the login session are kept in the browser (localStorage) for the demo. Replace the `getOrders`, `getLedger`, `getCustom` and `saveOrders` / `saveLedger` helpers in `admin.js` with calls to your API (orders, ledger entries, products).
- **Add product:** the form builds the same product JSON described above (`images`, `options`, `dimensions`, `material`, `care`, `stock`). Send it to `POST /products`, and upload the photos to your storage instead of embedding them.
- **Invoices:** built from orders. Print uses the browser's print dialog, so "Save as PDF" works from there.

## Variants (size x colour, each with its own price, stock and SKU)

For products with sizes and/or colours, send a `variants` array instead of relying on `options`.
The product page builds the Size and Colour buttons from it. Colours shown depend on the chosen size.

```json
"variants": [
  { "sku": "GI-TBV-S-SAG", "size": "Small",  "colour": "Sage",  "swatch": "#9FB3A4",
    "price": 8000,  "compareAt": 10000, "stock": 3, "sizeImage": null, "colourImage": 0 },
  { "sku": "GI-TBV-M-IVO", "size": "Medium", "colour": "Ivory", "swatch": "#E8E2D4",
    "price": 12000, "compareAt": 15000, "stock": 4, "sizeImage": null, "colourImage": 1 }
]
```

- `size` is `"Small"`, `"Medium"`, `"Large"`, or `""` for a one-size product. `colour` is `""` if there is no colour choice.
- `price` and `compareAt` (crossed-out price) are per variant. `stock` is the quantity for that exact size and colour.
- `sku` must be unique per variant. It is the SKU sent to your cart and checkout calls.
- `stock` of 0 shows that choice as sold out. At 5 or fewer the page says "Only N left". The quantity box cannot go above stock.
- `sizeImage` / `colourImage` are optional indexes into `images`, used to show that photo when the size or colour is chosen.
- The product-level `price` / `compareAt` are used on listing cards (the lowest variant, shown as "From Rs. X").
- Re-check price and stock on your server at checkout.

## Update: care guides, Products admin page, search

- **Care guide**: the standard guide per category (Vases & Decor = Vases & Sculptures, Lighting = Lamps & Lighting, Wall Clocks / Wall Art = Wall Art, Decorative Books) lives in `catalog.js` (`GUIDE`, `GROUP`). Products return `careGuide: [[label, text], ...]`; the backend can store it per category and send it with the product. `care` is now an optional "extra notes" field.
- **Pricing display**: if a product's variants have different prices, the product page shows "Starts from <lowest price>" until a size is selected. Single price: `Rs.24,500` with the compare price crossed out.
- **Admin > Products** (`products.html`): lists every product with Review (opens the store page), Edit and Delete, plus an "+ Add Product" button. Custom products edit through `add-product.html?edit=<id>` (variant matrix is prefilled). Sample products edit in a dialog and are stored as `gi-overrides` (name, price, compareAt, stock, tag, description, material, dimensions, hidden). Deleting a sample product hides it and can be restored. Replace these with `PUT /admin/products/{id}` and `DELETE /admin/products/{id}`.
- **Search**: `searchP(q)` in `app.js` matches names, categories (with synonyms), descriptions and SKUs, handles plurals, and powers the dropdown (keyboard accessible combobox) and `search.html?q=`. For production, back it with `GET /search?q=` (same result shape) and add server-side rendering of `search.html` and category pages for SEO. Product pages already inject a meta description and JSON-LD `Product` data.
- Admin font is Poppins. New categories: Wall Art, Decorative Books.

## Landing page placement and dimensions

- Each product carries `showOn: ["new","sale","featured","explore","clocks"]` (any subset). The home page builds its New Arrival, Featured, Sale, Explore by Collection and Wall Clocks sections from it. Empty Featured and Sale sections are hidden.
- `sizeDims: {"Small":{"height":"24 in","width":"16 in"}, ...}` holds manual per-size dimensions in inches; a size with no values is not shown on the product page.

## Discounts

Admin > Discount stores rules as `{id,name,type:"percent"|"fixed",value,scope:"categories"|"products",categories:[],products:[],start,end,active}` (demo key `gi-discounts`). The storefront applies the biggest valid saving per product, shows the lower price with the original crossed out and a "-20%" badge, and lists discounted products in the home page Sale section. In production, apply the same rule on the server when pricing the cart and at checkout (`POST /checkout`) so the browser price is never trusted; expose rules via `GET/POST/PUT/DELETE /admin/discounts`.

## Landing page slider

Admin > Slider manages the home page slides: `{id, layout:"image"|"text"|"clocks", image, title, subtitle, button, link, active}` in display order (demo key `gi-slides`). Recommended banner size 1755 × 544 px. Backend: `GET /slides` (public, active only, ordered) and `POST/PUT/DELETE /admin/slides`, plus a reorder endpoint; store images in file storage and return URLs.

## Checkout

`checkout.html` collects name, address, city, phone (required), email (optional), payment (Cash on delivery / Bank transfer) and order notes (optional). Delivery is Rs. 400 for Karachi and Rs. 600 for any other city (editable in Admin > Settings, which also holds the bank transfer details shown when Bank transfer is selected).

The page builds this order object and passes it to `GI.placeOrder(order)`, which POSTs it to `{API_BASE}/orders` when a backend is connected:

```json
{ "id": "GI-1015", "date": "2026-10-31", "customer": "Name", "phone": "0331…", "email": "", "city": "Karachi",
  "address": "Flat/House, Street No., Landmark", "notes": "", "payment": "Cash on delivery | Bank transfer",
  "delivery": 400, "status": "Pending",
  "items": [{ "name": "Product (Size · Colour)", "qty": 1, "price": 24500, "sku": "GI-TTV-S-IVO", "id": "product-id" }] }
```

In the demo the order is saved in the browser and appears in Admin > Orders; stock of products added in the admin is reduced by the ordered quantities. In production the server must recalculate prices, discounts and delivery from its own data and generate the order number, never trust the browser's totals, and reduce stock.

## Added in the latest round

**Order tracking IDs.** Admin > Orders has a "Tracking ID" box per order. It is stored as `order.tracking` (string). When you move orders to a server, add a `tracking` field to the order record and let `PATCH /orders/:id` update it.

**Quick Links (footer).** Admin > Quick Links manages the footer links and the page each one opens (`policies.html?id=<id>`). Stored in `localStorage['gi-links']` as `[{id, title, content, active}]`; the defaults are `LINKS_DEF` in `catalog.js`. Server version: `GET /links` for the storefront, `POST/PUT/DELETE /links` for the admin.

**Newsletter.** The footer sign-up was removed; the old handler is harmless.

**Order confirmation email (not enabled).** `GI.emailOrder(order)` in `app.js` posts the order to `/api/order` when `GI.EMAIL_ON` is `true`. A ready-made Vercel function is not included in this repo yet; it needs a Gmail app password in the Vercel environment variables.

**Orders and settings are still per browser.** Order numbers, Settings (delivery charges and bank details), products, discounts, slider and quick links all live in each browser's `localStorage`, so they are not shared between visitors. A database behind the `GI` hooks fixes this.

**Header.** The header is fixed to the top on all pages except the product page, where it scrolls away (`body.pg-product`).

## SEO and images (latest)
- `sitemap.xml`, `robots.txt`, `og-image.jpg` and `vercel.json` (cache + security headers) are in the repo root. Canonical URLs use https://goldeninteriors.pk.
- Search and checkout pages are `noindex`; admin pages are blocked in robots.txt.
- Images are WebP. Photos added in Admin are resized to 1200 px and converted to WebP automatically.
