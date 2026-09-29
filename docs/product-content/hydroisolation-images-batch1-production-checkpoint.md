# Hydroisolation image batch 1 — production checkpoint

Date: 2026-09-29
Category: Смеси → Гидроизоляция
Scope: MAT-000100, MAT-000101, MAT-000102

This checkpoint records production evidence supplied by the MatMix owner. Codex did not access production, SSH, or the production database.

## Source images and production bindings

| MAT | Approved source PNG SHA256 | Production WebP URL | Verified render |
|---|---|---|---|
| MAT-000100 | `9c3c1c81b02bc5ca3020ee120c7f76083ea17613b1563cd168c693a7010b445a` | `/uploads/products/MAT-000100-9c3c1c81b02bc5ca.webp` | WebP, 1200×1200; one primary binding, no gallery; unique URL binding |
| MAT-000101 | `f1b3ca958ed72dade11372b963f313d8d4feb33775b8ec4236fecd77136eee85` | `/uploads/products/MAT-000101-f1b3ca958ed72dad.webp` | WebP, 1200×1200; one primary binding, no gallery; unique URL binding |
| MAT-000102 | `e5a5ab4919a03eecad6b578886812c60fac0a2eb6e1f6c31d952dc8a9dd236f7` | `/uploads/products/MAT-000102-e5a5ab4919a03eec.webp` | WebP, 1200×1200; one primary binding, no gallery; unique URL binding |

All three per-product post-apply checks reported `ok=true`.

### Later owner visual review — correction required

The owner subsequently inspected the product cards on the site and found that the products look too small, with too much empty space around the packages. The image apply, database binding checks, and physical WebP checks succeeded, and all three have technical image status `IMAGE_OK`; however, final visual framing is **not accepted**.

For MAT-000100, MAT-000101, and MAT-000102:

- `OWNER_VISUAL_CORRECTION_REQUIRED = true`
- Reason: product occupies insufficient useful area of the catalog image; framing must be tightened so the product appears larger.
- The current production images remain working images. This finding does not roll back the successful apply.
- These products are not finally visually closed; corrective versions are expected in a later image batch.

## Apply backup and database health

- Importer safety commit: `a7878e78a7c86b4321ad8ff7a3382f55b67b3479` (`fix(product-images): harden production image importer`).
- Verified SQLite online backup: `/var/lib/matmix/matmix.db.backup-2026-09-29T11-48-35-578Z-afb4ff0cf642`.
- Backup SHA256: `8f1c107cbdcc45dbd26a878843264db5ee31de0f0466e19a6cb9e925720d1fd2`.
- Backup `user_version`: 11.
- Post-apply database integrity: `ok`.
- Post-apply `user_version`: 11.
- Foreign-key violations: 0.

## Closed-subcategory audit supplied by owner

The audit reports `DATA_CLOSED` for Штукатурка, Шпаклевка, Кладочные Смеси, Наливной Пол, and Стяжки Пола.

Гидроизоляция remains `NOT_CLOSED`:

- products: 9
- attrOk: 0
- attrPartial: 9
- seoOk: 9
- seoIssues: 0
- imageOk: 3
- imageIssues: 6
- sourceBlocked: 0
- sourceAnomalies: 0
- blockers: 6

The six remaining image blockers are exactly MAT-000099, MAT-000103, MAT-000104, MAT-000105, MAT-000106, and MAT-000107.

The audit figures above are reproduced from the owner-provided audit output. The later visual-framing finding is recorded separately and does not imply a new audit run. No other production results are inferred by this checkpoint.
