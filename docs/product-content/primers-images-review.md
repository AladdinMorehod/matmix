# Primer image production audit

Checked: 2026-09-18

## Final production state

- Confirmed primer products: **15**.
- `EXISTING_REAL` / production-real: **15**.
- `READY_PREPARED`: **0**.
- `NORMALIZE_EXISTING`: **0**.
- `IMAGE_BLOCKED_FINAL` within the confirmed set: **0**.
- Canonical 1200x1200 WebP coverage: **15/15**.

| MAT | title | status | source | source size | final | SHA-256 | QA |
|---|---|---|---|---:|---|---|---|
| MAT-000228 | Грунтовка Knauf Тифенгрунд 10 л | EXISTING_REAL | `/uploads/products/MAT-000228-6269dee9658dc6ec.webp` | 1200x1200 WebP | `03c7334c1ea72bc895539c36cd50a4907a56ed2688b416b669c18402896215e0` | Production image applied and fully verified. |
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 л | EXISTING_REAL | production-real | 1200x1200 WebP | `1ae23ff9611fb9eac54054e12198ff352478ec33091fd7e595a79b2b6e10c89a` | Production image fully verified. |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 л | EXISTING_REAL | production-real | 1200x1200 WebP | `05f743dbf651217177b8c1f8f0fe030a07aabd417c7e871fd080abecabc10854` | Production image fully verified. |
| MAT-000232 | Грунтовка Ceresit CT-17 PRO, 10л | EXISTING_REAL | `/uploads/products/MAT-000232-9647cc3d65597636.webp` | 1200x1200 WebP | `418b11f1b065d9b029d50deb8311ae160f9c8b3e718c1338fdf23b6600414439` | Production image applied and fully verified. |
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | EXISTING_REAL | production-real | 1200x1200 WebP | `d9caefbfa99af105e8ecf57b38f02c10d92a626c5e686d7d6f53b8c074a61fbe` | Production image fully verified. |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | EXISTING_REAL | production-real | 1200x1200 WebP | `03e1b5891bd9dbf04d47e3ad04ef4465cb3b573c8f715028e89fdf69a47feb08` | Production image fully verified. |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | EXISTING_REAL | production-real | 1200x1200 WebP | `71b4dc2905591f833c791f96a4ead0e8efa61352334fed2acbde3c786ec18d7d` | Production image fully verified. |

## Final production audit

```text
CONFIRMED_PRIMER_IMAGES=15
FULLY_VERIFIED=15
PRIMER_15_CANONICAL_AUDIT=PASS
service active
health ok
ready ok
```

MAT-000228 is now production-real at `/uploads/products/MAT-000228-6269dee9658dc6ec.webp` with SHA-256 `03c7334c1ea72bc895539c36cd50a4907a56ed2688b416b669c18402896215e0`.

MAT-000232 is now production-real at `/uploads/products/MAT-000232-9647cc3d65597636.webp` with SHA-256 `418b11f1b065d9b029d50deb8311ae160f9c8b3e718c1338fdf23b6600414439`.

The previously prepared MAT-000227, MAT-000230, MAT-000234, MAT-000237 and MAT-000240 are now also production-real. MAT-000231, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243 and MAT-000244 remain production-real.

## Out-of-scope identity exceptions

These catalog items remain outside the confirmed 15-product image set because their product identity is unresolved. They are not photo failures:

`MAT-000229`, `MAT-000238`, `MAT-000239`, `MAT-000259`, `MAT-000260`.

The fresh verified backup used before the production apply was `/var/backups/matmix/matmix-backup-2026-09-18T19-38-17-806Z-b21d64f6`.

## MAT-000234 unit note

The current catalog representation remains 10 л and the accepted packshot visibly shows 10 л. Official technical/package metadata may separately use kg; no unit conversion is inferred by this image process.

## Import policy

This commit closes documentation only. No production access, apply, deploy, or changes to `product-images-batch/` were performed during closure.
