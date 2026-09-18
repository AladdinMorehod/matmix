# Primer operational weight correction

Scope: `MAT-000243` and `MAT-000244` only.

## Decision

`products.weight` participates in order `totalWeight` and in the product-page price-per-kg calculation. Both records contain the legacy Excel value `3`, while the exact titles and official Forbo sources confirm a 10 kg package.

The guarded correction `3 → 10` for `products.weight` was applied and verified in production. `products.unit` remains `шт`.

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

| MAT | old operational weight | new production operational weight | package weight | unit | status | source |
|---|---:|---:|---:|---|---|
| MAT-000243 | 3 | 10 | 10 кг | шт | `PRODUCTION_APPLIED_VERIFIED` | [Forbo Eurocol 044](https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw) |
| MAT-000244 | 3 | 10 | 10 кг | шт | `PRODUCTION_APPLIED_VERIFIED` | [Forbo Eurocol 041](https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag) |

Titles, slugs, prices, units, images, descriptions, SEO, attributes, `package_weight`, categories, subcategories and all other products fields are outside the write surface.

## Final production audit

```text
PRODUCTION_WRITES=2
POSTCHECK_WILL_FIX=0
POSTCHECK_EXISTING_OK=2
POSTCHECK_BLOCKERS=0
PRIMER_WEIGHT_POSTCHECK=PASS
PRIMER_WEIGHT_ATTRIBUTE_AUDIT=PASS
service active
health ok
ready ok
backup=/var/backups/matmix/matmix-backup-2026-09-18T20-04-48-364Z-24376d78
```

Production state for both products is `products.weight=10`, `products.unit=шт`, `package_weight=10 кг`.
