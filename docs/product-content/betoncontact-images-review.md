# Бетонконтакт — image research and preparation review

Режим: read-only локальный аудит. Production, DB bindings и importer code не изменялись.

## Summary

- CONFIRMED_TARGETS=5
- IMAGE_CONFIRMED=4
- IMAGE_PARTIAL=1
- IMAGE_PARTIAL_MATS=MAT-000218
- IMPORT_READY_MATS=MAT-000217, MAT-000219, MAT-000220, MAT-000221
- IMAGE_BLOCKED=0
- PREPARED_READY=4
- IMPORT_READY=4
- IDENTITY_BLOCKED_MATS=MAT-000222, MAT-000223, MAT-000224
- IDENTITY_PARTIAL_MATS=MAT-000225

## Final production postcheck

- PRODUCTION_APPLIED=yes
- PRODUCTION_POSTCHECK=PASS
- PRODUCTION_IMAGE_READY=4
- PRODUCTION_IMAGE_EXCEPTION=1
- PRODUCTION_READY_MATS=MAT-000217, MAT-000219, MAT-000220, MAT-000221
- PRODUCTION_EXCEPTION_MATS=MAT-000218
- BETONCONTACT_IMAGES_POSTCHECK=PASS
- BETONCONTACT_RENDERED_FILES=PASS
- MAT218_UNCHANGED=PASS
- BETONCONTACT_NONIMAGE_UNCHANGED=PASS
- Post-import summary: total=4, ready=0, existingReal=4, protected=0, invalid=0, notFound=0, duplicates=0, errors=0
- Verified backup: /var/backups/matmix/matmix-backup-2026-09-19T11-36-12-142Z-00cac9dc
- Service: active; health=ok; ready=ok
- Server-rendered SHA256 values were not supplied in the operator output; HTTP=200 was reported for all four URLs.

| MAT | final production image_url | server format | dimensions | HTTP | server SHA256 |
|---|---|---|---:|---:|---|
| MAT-000217 | /uploads/products/MAT-000217-ae8c66e474e7f9ce.webp | WebP | 1200×1200 | 200 | not supplied |
| MAT-000219 | /uploads/products/MAT-000219-a46789d5b3f82351.webp | WebP | 1200×1200 | 200 | not supplied |
| MAT-000220 | /uploads/products/MAT-000220-82467bd3ee2c392f.webp | WebP | 1200×1200 | 200 | not supplied |
| MAT-000221 | /uploads/products/MAT-000221-bb24de51b94a37ab.webp | WebP | 1200×1200 | 200 | not supplied |
| MAT-000218 | unchanged; intentional exception | — | — | — | — |

## Current local image audit

All five target products currently point to `/uploads/products/MAT-000001-20260714153714969-3fb7fe.png`; no primary binding and no gallery rows were found. Local placeholder SHA256: `65729e6fd1cc852743ff99cbeb62ade8154f6a55389149a6875da6b7b70896ad`. All five require replacement.

## Candidates

| MAT | exact product / pack | source tier | original | watermark | identity / pack | decision | prepared |
|---|---|---|---|---|---|---|---|
| MAT-000217 | Бетонконтакт Knauf Бетогрунд 5 кг | official manufacturer CDN | webp 1000×1000 | none observed | MATCH; Official gallery offer id 18927 uses this exact 5 kg asset; 5 kg marking is visible on the back label. | IMAGE_CONFIRMED | product-images-batch/betoncontact/ready/MAT-000217.webp |
| MAT-000218 | Бетонконтакт Knauf Бетогрунд 15 кг | official manufacturer CDN | webp 653×420 | none observed | MATCH; Official gallery offer id 18928; filename identifies Betogrund 15 kg and source page lists 15 kg/5 kg packaging. | IMAGE_PARTIAL | — |
| MAT-000219 | Бетонконтакт Ceresit CT 19, 5 кг | authorized dealer; exact page linked by official Ceresit product page | jpeg 700×700 | none observed | MATCH; Dealer page title, manufacturer article 1505278, фасовка 5 кг, and image filename all identify CT 19 5 kg. | IMAGE_CONFIRMED | product-images-batch/betoncontact/ready/MAT-000219.webp |
| MAT-000220 | Бетонконтакт Ceresit CT 19, 15 кг | official manufacturer CDN | webp 900×900 | none observed | MATCH; Official product HTML embeds CT19_15kg_front_2000_2000.webp and lists 15 kg as an offered pack. | IMAGE_CONFIRMED | product-images-batch/betoncontact/ready/MAT-000220.webp |
| MAT-000221 | Бетонконтакт Cтаратели 20 кг | official manufacturer site asset | png 365×365 | none observed | MATCH; Official page lists ведро 20 кг and image filename/label show БЕТОН-КОНТАКТ 20 кг. | IMAGE_CONFIRMED | product-images-batch/betoncontact/ready/MAT-000221.webp |

### MAT-000217

- Local title: Бетонконтакт Knauf Бетогрунд 5 кг
- Source page: [https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/)
- Direct image: [asset](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/eb4/xkij8atadmim3fzs1osprpgd7ejb5guv/Vedro_Betogrund_5_kg_17_03_2023_Oborot_1000x1000_v01.webp)
- Source owner/tier: KNAUF Russia; official manufacturer CDN
- Exact pack evidence: Official gallery offer id 18927 uses this exact 5 kg asset; 5 kg marking is visible on the back label.
- Original: webp, 1000×1000, 273168 bytes
- Original SHA256: `ab3eb8ef6952fbbbbb97a5e6226de3f086a88c6e348095d50eafd9aaad9fd5cb`
- Watermark: none observed
- Background: white/transparent source; importer flatten produces white
- Decision: **IMAGE_CONFIRMED**; prep **READY**
- Prepared: product-images-batch/betoncontact/ready/MAT-000217.webp, 1200×1200 webp, 74378 bytes
- Prepared SHA256: `ae8c66e474e7f9cea6965ee4c007f72b6747d4616fec0770cff72cd67a793a69`
- Visual QA: full product, proportions preserved, safe framing; no visible watermark

### MAT-000218

- PACKAGE_GENERATION=OVAL_CURRENT
- EXACT_PACK_MATCH=yes
- REASON=no safe clean white-background source without edge/product alteration

- Local title: Бетонконтакт Knauf Бетогрунд 15 кг
- Source page: [https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/)
- Direct image: [asset](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/754/a4tgzmld2um0kzlot9x8dm0a2hcq4zv0/Vedro-Betogrund-15-kg-_03_02_2026_-Ovalnoe-Hi_Res-v02_Gbg.webp)
- Source owner/tier: KNAUF Russia; official manufacturer CDN
- Exact pack evidence: Official gallery offer id 18928; filename identifies Betogrund 15 kg and source page lists 15 kg/5 kg packaging.
- Original: webp, 653×420, 72722 bytes
- Original SHA256: `c1d4286580f464415d23b620a0e4a8ac2e2ad4f99dde2b6e4610e4e4030e856e`
- Watermark: none observed
- Background: opaque light gray with shadow; fails pure-white requirement
- Decision: **IMAGE_PARTIAL**; prep **PREP_BLOCKED_GRAY_BACKGROUND**
- No final file created because the gray opaque background cannot be removed without risking package edge pixels.
- Alternate exact candidate review: [Petrovich product page](https://petrovich.ru/product/952904/) main image is exact 15 kg transitional round packaging but includes the large non-product overlay «РОЗОВЫЙ» and pink background; rejected. Its alternate asset is a different NEOMID product. [Official KNAUF news](https://www.knauf.ru/company/news/knauf-betogrund-15-kg-nachnet-vypuskatsya-v-novom-formate-upakovki-/) confirms the current oval package and article 00965803, but its image is an editorial banner with two buckets, headline text and a gray scene; rejected as an import source.

### MAT-000219

- Local title: Бетонконтакт Ceresit CT 19, 5 кг
- Source page: [https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact/](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact/)
- Direct image: [asset](https://msk.ceresit-russia.com/image/cache/catalog/products/210168/gruntovka-ceresit-ct-19-betonkontakt-5-kg-30_jpg-700x700.jpg)
- Source owner/tier: Ceresit Russia authorized dealer (msk.ceresit-russia.com); authorized dealer; exact page linked by official Ceresit product page
- Exact pack evidence: Dealer page title, manufacturer article 1505278, фасовка 5 кг, and image filename all identify CT 19 5 kg.
- Original: jpeg, 700×700, 84517 bytes
- Original SHA256: `8004d27104910da545c65ff1412bdd174dc56f6dd618537724aeeab81aed0ed3`
- Watermark: none observed
- Background: white/transparent source; importer flatten produces white
- Decision: **IMAGE_CONFIRMED**; prep **READY**
- Prepared: product-images-batch/betoncontact/ready/MAT-000219.webp, 1200×1200 webp, 57582 bytes
- Prepared SHA256: `a46789d5b3f823517ef9cc1fe3570eb6f69057758e16c1a520c8ddb4fdb7ba9a`
- Visual QA: full product, proportions preserved, safe framing; no visible watermark

### MAT-000220

- Local title: Бетонконтакт Ceresit CT 19, 15 кг
- Source page: [https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact/](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact/)
- Direct image: [asset](https://www.ceresit.ru/upload/resize_cache/iblock/ca1/iardks7evls64dsbk6nnufq0le96900c/900_900_1/CT19_15kg_front_2000_2000.webp)
- Source owner/tier: Ceresit Russia; official manufacturer CDN
- Exact pack evidence: Official product HTML embeds CT19_15kg_front_2000_2000.webp and lists 15 kg as an offered pack.
- Original: webp, 900×900, 63132 bytes
- Original SHA256: `c692ee65efdc42229e413f4443cd1842dddc80439353c5b0b933329b07dd833f`
- Watermark: none observed
- Background: white/transparent source; importer flatten produces white
- Decision: **IMAGE_CONFIRMED**; prep **READY**
- Prepared: product-images-batch/betoncontact/ready/MAT-000220.webp, 1200×1200 webp, 38920 bytes
- Prepared SHA256: `82467bd3ee2c392feeba8f83e8daa3bfb2798225818c2f38c472b6ab88654610`
- Visual QA: full product, proportions preserved, safe framing; no visible watermark

### MAT-000221

- Local title: Бетонконтакт Cтаратели 20 кг
- Source page: [https://www.starateli.ru/po-betonu/](https://www.starateli.ru/po-betonu/)
- Direct image: [asset](https://www.starateli.ru/images/images/%D0%93%D1%80%D1%83%D0%BD%D1%82%D0%BE%D0%B2%D0%BA%D0%B0_%D0%91%D0%95%D0%A2%D0%9E%D0%9D-%D0%9A%D0%9E%D0%9D%D0%A2%D0%90%D0%9A%D0%A2_20_%D0%BA%D0%B3_365x365.png)
- Source owner/tier: Старатели; official manufacturer site asset
- Exact pack evidence: Official page lists ведро 20 кг and image filename/label show БЕТОН-КОНТАКТ 20 кг.
- Original: png, 365×365, 76765 bytes
- Original SHA256: `cd72402d2010d23a9c9641ee85593735bead1c9fe350b62bcf5d8b3950d17842`
- Watermark: none observed
- Background: white/transparent source; importer flatten produces white
- Decision: **IMAGE_CONFIRMED**; prep **READY**
- Prepared: product-images-batch/betoncontact/ready/MAT-000221.webp, 1200×1200 webp, 40440 bytes
- Prepared SHA256: `bb24de51b94a37ab19ebb78163436cf0adb067055845387a602d20016717f950`
- Visual QA: full product, proportions preserved, safe framing; no visible watermark

## Importer compatibility

`backend/scripts/import-product-images.js` accepts the four canonical prepared files. Existing bindings are classified as `placeholder`, so a future local dry-run does not require `--allow-real-overwrite`; apply remains out of scope. The importer will render each source again to 1200×1200 WebP using contain 1080×1080, 60 px white extension and quality 82.

Suggested local-only dry-run:

```text
node backend/scripts/import-product-images.js --input product-images-batch/betoncontact/ready --db backend/database/matmix.db --only MAT-000217,MAT-000219,MAT-000220,MAT-000221 --dry-run
```

## MAT-000225

Status remains **IDENTITY_PARTIAL**. Secondary MixTools evidence reports REAL BETON-KONTAKT BS-725-20 / 20 kg and СТК Профи, but no primary manufacturer page, TDS or official image asset was found. It is excluded from candidates.

## Safety

- Production access: no
- Production writes/apply/deploy: no
- Existing product image bindings: unchanged
- Raw source and prepared binaries remain untracked under `product-images-batch/`; none are staged by this task.
