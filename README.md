# Spicy Lip Plumper

One-product store for a tingling / "spicy" lip plumper. **No brand name is used** —
replace copy, prices, photos and reviews with your own before selling.

This repo is **two things at once**:

| | What | Served by |
|---|---|---|
| **Static pages** | `index.html`, `product.html` (self-contained, open from disk or host anywhere) | GitHub Pages |
| **Shopify theme** | `layout/ templates/ sections/ config/ assets/ locales/` (real Liquid theme) | Shopify → Online Store → Themes → *Connect from GitHub* |

## Connect as a Shopify theme

1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**
2. Account `diegocarlos1208-spec` → repo `shopify-stores-` → branch `main` → **Connect**
3. It appears in your theme library (unpublished). **Customize** to preview.
4. In the editor, open each section and set the **product** on Hero / Final CTA (and assign a
   product to the **Product** template). Then **Publish**.

Pushes to `main` sync into Shopify automatically; edits in the Shopify theme editor push back
to `main` as commits.

## Theme structure

```
layout/theme.liquid          global HTML shell, loads assets/base.css + assets/theme.js
layout/password.liquid       storefront password page

templates/index.json         home: orders the landing sections
templates/product.json       product: main-product + specs + reviews + faq
templates/*.liquid           collection / cart / search / page / blog / 404 / customers …

sections/header.liquid        announcement bar + logo + nav + Shop Now
sections/footer.liquid        footer columns + legal disclaimer
sections/hero.liquid          headline, price, CTAs, product image
sections/feature-tiles.liquid 3 tiles + quote + 3 stats
sections/problem.liquid       "Thin Lips Aren't Your Fault" + 3 pain cards (blocks)
sections/solution.liquid      "Meet the …" + 4 benefit cards (blocks) + proof bar
sections/reviews.liquid       heading + review cards (blocks) — SAMPLE text, replace
sections/specs.liquid         "Formulated Around Your Lips" + 4 cards (blocks)
sections/faq.liquid           accordion (blocks)
sections/final-cta.liquid     zero-risk band + CTA
sections/main-product.liquid  gallery + real {% form 'product' %} + variant/bundle picker
                              + quantity stepper + accordions

assets/base.css              all styles (colour tokens also come from theme settings)
assets/theme.js              bundle/variant selector + quantity stepper
assets/product.avif          placeholder image — replace (still shows supplier name)
config/settings_schema.json  4 colour settings + favicon
locales/en.default.json      strings
```

Every section has default copy baked in, so the theme looks right the moment it's connected —
no block setup required. All text is editable in the theme customizer.

## Before taking payments

- **Create the product** in Shopify admin with price + variants (e.g. 1 / 3 / 5 tubes). The
  `main-product` section turns each variant into a selectable bundle and checks out for real.
- Set the product on the **Hero** and **Final CTA** sections, and assign it to the **Product** template.
- **Replace all reviews** and the "12,000+", "4.9", "92%" figures — placeholder text.
- **Replace `assets/product.avif`** and the image on the real product.
- Add your shop policies (Settings → Policies) — the footer links to them.
- Check cosmetic claims against your supplier's approved wording.

## Local static pages

`index.html` / `product.html` are unchanged self-contained files for quick preview or hosting
on GitHub Pages (`.nojekyll` keeps Pages from trying to build the Liquid files).
