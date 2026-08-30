# Spicy Lip Plumper — one-product store

Static, single-product landing + product page for a tingling / "spicy" lip plumper.
Section structure mirrors a typical one-product Shopify store. **No brand name is used** —
replace copy, prices, photos and reviews with your own before selling.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page. Every CTA links to `product.html`. |
| `product.html` | Product page: gallery, bundle selector, quantity, add-to-cart, accordions, sticky mobile buy bar. |
| `assets/product.avif` | Source product image (currently the supplier photo — **replace it**; it still shows the supplier's name). |

Both HTML files are fully self-contained (CSS inline, images embedded as data URIs), so they
work opened directly from disk with no server.

## Host it on GitHub Pages

1. Push this folder to a **public** GitHub repo (private repos need a paid plan for Pages).
2. Repo → **Settings → Pages** → *Source: Deploy from a branch* → Branch `main` / folder `/ (root)` → **Save**.
3. Live in ~1 min at `https://<your-username>.github.io/<repo-name>/`.

Edits pushed to `main` redeploy automatically.

## Before taking payments — must do

- **Wire the buy buttons.** In `product.html`, the `<script>` block has a `checkout()`
  placeholder that currently just shows an alert. Point it at your real cart / checkout, e.g.
  `window.location.href = 'https://your-store.myshopify.com/cart/VARIANT_ID:' + qty;`
- **Replace the product photo** in `assets/product.avif` and the embedded `data:image/avif` in both HTML files.
- **Replace all reviews** and the "12,000+", "4.9", "92%" figures — they are placeholder text.
- **Fill the footer links** (shipping, returns, contact, terms, privacy) — payment processors require them.
- Check cosmetic wording against your supplier's approved claims.

## Using this with a Shopify theme

These are plain HTML pages, not a Shopify theme (Shopify uses Liquid + a `layout/ templates/
sections/ snippets/ assets/ config/` structure). Two paths:

- **Fastest:** keep this as the GitHub Pages landing page and send every "Buy" to a Shopify
  product/checkout permalink. No theme changes needed.
- **Port into the theme:** move the CSS into `assets/`, split each block (hero, problem,
  solution, reviews, FAQ) into `sections/*.liquid` with schema settings, and add it as a
  custom landing template. This is a separate build — open an issue / ask and it can be scaffolded.
