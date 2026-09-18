# Primer operational weight correction

Scope: `MAT-000243` and `MAT-000244` only.

## Decision

`products.weight` participates in order `totalWeight` and in the product-page price-per-kg calculation. Both records contain the legacy Excel value `3`, while the exact titles and official Forbo sources confirm a 10 kg package.

The guarded correction is `3 → 10` for `products.weight`. `products.unit` remains `шт`.

This review does not claim that gross or shipping weight is exactly 10 kg. The 10 kg value is the authoritative package net weight and the available operational unit-weight basis. No separate gross-weight source was found.

## Guards and writable surface

- Exact allowlist: `MAT-000243`, `MAT-000244`.
- Exact current title guard for each MAT.
- Current `products.weight` must be exactly `3` or already be exactly `10`.
- `products.unit` must remain exactly `шт`.
- Apply requires `--apply --confirm BACKFILL_PRIMER_PRODUCT_WEIGHTS`.
- Dry-run is read-only; apply is transactional and idempotent.
- The only writable column is `products.weight`.

## Products

| MAT | current operational weight | package weight | target operational weight | unit | source |
|---|---:|---:|---:|---|---|
| MAT-000243 | 3 | 10 кг | 10 | шт | [Forbo Eurocol 044](https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw) |
| MAT-000244 | 3 | 10 кг | 10 | шт | [Forbo Eurocol 041](https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag) |

Titles, slugs, prices, units, images, descriptions, SEO, attributes, `package_weight`, categories, subcategories and all other products fields are outside the write surface.

Production apply was not executed.
