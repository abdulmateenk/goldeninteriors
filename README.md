# Golden Interiors

Home décor store demo: a multi-page storefront and an admin area. It is plain HTML, CSS and JavaScript, with no build step needed to run it. Open `index.html` in a browser, or host the folder on any static host.

- **Storefront:** `index.html`, category pages, `product.html`, `search.html`, `checkout.html`
- **Admin:** `login.html`, then Dashboard, Products, Discount, Slider, Settings, Add Product, Orders, Financial Record, Invoices
- **Data:** this is a demo, so products, orders, discounts and settings are saved in the browser (localStorage). The admin login is checked in the browser only.
- **Connecting a backend:** see [backend-integration.md](backend-integration.md). Before going live, replace the browser-only login and storage with a real server, and calculate prices, discounts, delivery and stock on the server.
