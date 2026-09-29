# Штукатурка — production image re-audit checkpoint

**Checkpoint:** 2026-09-29
**Baseline:** `a62d5785df9956e19e55e91fdd2f5a0782662fd3`
**Branch:** `codex/plaster-image-reaudit-checkpoint`
**Evidence:** production rollout and final audit were verified by the project owner and supplied for this documentation-only checkpoint. Production, SSH and deploy were not accessed for this task.

## Final classification

Scope is all 28 products in `Смеси → Штукатурка`.

- **KEEP (2):** MAT-000008, MAT-000019
- **REFRAME (26):** MAT-000001–MAT-000007, MAT-000009–MAT-000018, MAT-000020–MAT-000028
- **CLEANUP:** 0
- **REBUILD:** 0
- **RESEARCH_REQUIRED:** 0
- **OWNER_REVIEW_REQUIRED:** 0

MAT-000008 and MAT-000019 remained KEEP and were not replaced. MAT-000028 retains its `DATA_IDENTITY_NOTE`: the current package is accepted as the Rusean 40 kg plaster product, while the current official manufacturer product name omits “M-150”. Product title and data were not changed; this is not a blocker.

## Production rollout evidence

Production results below are recorded from the owner-provided verification.

### Package A — normal reframe

The package contained exactly 24 non-protected REFRAME products:

`MAT-000001, MAT-000003, MAT-000004, MAT-000006, MAT-000007, MAT-000009, MAT-000010, MAT-000011, MAT-000012, MAT-000013, MAT-000014, MAT-000015, MAT-000016, MAT-000017, MAT-000018, MAT-000020, MAT-000021, MAT-000022, MAT-000023, MAT-000024, MAT-000025, MAT-000026, MAT-000027, MAT-000028`

- Archive SHA256: `146b9623e65c7d0667f2911c54b5e66a2bf6e9308160b3a625932003b92785c5`
- Pre-apply backup: `/var/lib/matmix/matmix.db.backup-2026-09-29T16-26-14-612Z-e476d878cad2`
- Backup SHA256: `4067ea6ef5198edc20ed14a99b72ab54147938138a3f7020088281e6f0a7e72c`; SQLite `user_version=11`.
- Verified: backup hash, product change scope, binding change scope, all 24 expected images, and protected/KEEP products untouched.
- Exactly 24 `products.image_url` values and the same 24 `product_images` bindings changed. MAT-000002, MAT-000005, MAT-000008 and MAT-000019 were verified unchanged during this package.

### Package B — protected reframe

Package B contained only MAT-000002 and MAT-000005. The exact override was used only for this scope:

```text
--only MAT-000002,MAT-000005
--allow-protected-overwrite
--allow-protected-mats MAT-000002,MAT-000005
--allow-real-overwrite
```

- Archive SHA256: `b99e67419c50708fb5436885d4cf5ff3383c302a5fbde1faa7ec4866e8c9ca92`
- Pre-apply backup: `/var/lib/matmix/matmix.db.backup-2026-09-29T16-36-52-848Z-4cc85170547f`
- Backup SHA256: `500963737a5fb82f223504db7e1cd84d0d05500bb57983dc7ff62eac414613ff`; SQLite `user_version=11`.
- Verified: backup hash, exact product and binding scope, both protected images, and all other image bindings unchanged. No out-of-scope mutation was detected.

## Final production image URLs

| MAT | Classification | Final production image |
|---|---|---|
| MAT-000001 | REFRAME | `/uploads/products/MAT-000001-3786d1e3c0037725.webp` |
| MAT-000002 | REFRAME | `/uploads/products/MAT-000002-69e4c1b8ba3c2a54.webp` |
| MAT-000003 | REFRAME | `/uploads/products/MAT-000003-3d37b272aa6bc353.webp` |
| MAT-000004 | REFRAME | `/uploads/products/MAT-000004-b77e46123b43fce1.webp` |
| MAT-000005 | REFRAME | `/uploads/products/MAT-000005-7523c6ac8d0c088d.webp` |
| MAT-000006 | REFRAME | `/uploads/products/MAT-000006-005347c5f0aac89e.webp` |
| MAT-000007 | REFRAME | `/uploads/products/MAT-000007-b244aa6219697589.webp` |
| MAT-000008 | KEEP | `/uploads/products/MAT-000008-2da3047ac5f7454a.webp` (not replaced) |
| MAT-000009 | REFRAME | `/uploads/products/MAT-000009-8938b1737eba6c1a.webp` |
| MAT-000010 | REFRAME | `/uploads/products/MAT-000010-3bded5a566d7b233.webp` |
| MAT-000011 | REFRAME | `/uploads/products/MAT-000011-c0529592f8d7f274.webp` |
| MAT-000012 | REFRAME | `/uploads/products/MAT-000012-a2d06341e7b3ec98.webp` |
| MAT-000013 | REFRAME | `/uploads/products/MAT-000013-fffb98f9f01e9bb2.webp` |
| MAT-000014 | REFRAME | `/uploads/products/MAT-000014-211625d90a177c40.webp` |
| MAT-000015 | REFRAME | `/uploads/products/MAT-000015-67aa7284586eea5a.webp` |
| MAT-000016 | REFRAME | `/uploads/products/MAT-000016-7fa2d42ff7655ca5.webp` |
| MAT-000017 | REFRAME | `/uploads/products/MAT-000017-0761e05f64ba4edd.webp` |
| MAT-000018 | REFRAME | `/uploads/products/MAT-000018-e1f2756d703b3fd1.webp` |
| MAT-000019 | KEEP | `/uploads/products/MAT-000019-1b1f9d35d0e25256.webp` (not replaced) |
| MAT-000020 | REFRAME | `/uploads/products/MAT-000020-d95309b89c077753.webp` |
| MAT-000021 | REFRAME | `/uploads/products/MAT-000021-f34e492fbcd6415d.webp` |
| MAT-000022 | REFRAME | `/uploads/products/MAT-000022-d0675ec8bf8819ea.webp` |
| MAT-000023 | REFRAME | `/uploads/products/MAT-000023-2439d3892d0b2f77.webp` |
| MAT-000024 | REFRAME | `/uploads/products/MAT-000024-d5c2587cd94385cd.webp` |
| MAT-000025 | REFRAME | `/uploads/products/MAT-000025-44734a76e537b9a5.webp` |
| MAT-000026 | REFRAME | `/uploads/products/MAT-000026-526b6d417539ed19.webp` |
| MAT-000027 | REFRAME | `/uploads/products/MAT-000027-c3f86be386757733.webp` |
| MAT-000028 | REFRAME | `/uploads/products/MAT-000028-3d3f19de9794d1f5.webp` |

## Image standard and final audit

Use the existing production image as the primary working reference when identity is reliable. Keep compliant images; reframe with existing pixels when only composition needs correction. Preserve package, branding, text and colors; do not redraw. Source target: 1200×1200 PNG, white background, full product, no clipping, generally 94–97% bbox fill. Importer preview target: approximately 84–88%. Research or rebuild only for genuine identity or quality exceptions. The owner reviews the full subcategory via contact sheet.

Final owner-provided audit:

```text
products=28
attrOk=1
attrPartial=27
seoOk=28
seoIssues=0
imageOk=28
imageIssues=0
sourceOk=2
sourceOptionalGaps=26
sourceBlocked=0
sourceAnomalies=0
blockers=0
blockingMats=[]
status=DATA_CLOSED
subcategory=Штукатурка
status=CLOSED
```

Production DB integrity was `ok`, `user_version=11`, with zero foreign-key violations. Шпаклевка, Кладочные Смеси, Наливной Пол, Стяжки Пола and Гидроизоляция remained CLOSED.

This is a documentation checkpoint only. It includes no image binaries, archives, contact sheets, production reads or writes, importer changes, or product-data changes.
