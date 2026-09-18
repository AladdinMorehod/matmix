# Грунтовки — targeted image source recovery review

Проверка выполнена локально 2026-09-18. Production, DB, image import, deploy и apply не выполнялись. Папка `product-images-batch/primers/` остаётся untracked.

## Policy

Только exact identity и exact фасовка/вариант; source без watermark/overlay; допускается обычный resampling без дорисовки. MAT-000228 и MAT-000232 — EXISTING_REAL: production images не заменяются. MAT-000227, MAT-000230, MAT-000234, MAT-000237 и MAT-000240 остаются VARIANT_UNCLEAR_FINAL из-за нерешённого kg↔l/вариантного конфликта.

## Summary

| Status | Count | MAT |
|---|---:|---|
| EXISTING_REAL | 2 | MAT-000228, MAT-000232 |
| READY_PREPARED | 8 | MAT-000231, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243, MAT-000244 |
| SOURCE_BLOCKED_FINAL | 0 | — |
| VARIANT_UNCLEAR_FINAL | 5 | MAT-000227, MAT-000230, MAT-000234, MAT-000237, MAT-000240 |

## Per-MAT evidence

| MAT | Local title | Status | Source page | Direct asset | Dimensions/format | Pack match | Watermark | Final | Decision |
|---|---|---|---|---|---|---|---|---|---|
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/29a/55x9do76h9yl4e2vsyr1q0uv4snnyxxe/Vedro-Tifengrund-10-kg-_40_Gbg.webp) | — / — | NO/UNRESOLVED | not applicable; no local candidate accepted | — | No exact clean 5 l/5 kg image was retained. Do not convert kg to l or use another package. |
| MAT-000228 | Грунтовка Knauf Тифенгрунд 10 л | EXISTING_REAL | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/29a/55x9do76h9yl4e2vsyr1q0uv4snnyxxe/Vedro-Tifengrund-10-kg-_40_Gbg.webp) | — / — | YES | not checked locally | — | Preserve the existing production image; production was not accessed or replaced. |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/f91/7uu2bpxjzhtb6jo6zdscd3813fpimlnn/Vedro_Multigrund_10_kg_16_03_2023_Oborot_1000x1000_v01.webp) | 1000x1000 / webp | NO/UNRESOLVED | none observed | — | Official KNAUF page confirms Multigrund and packages 5/10 kg; the downloaded 1000x1000 image visibly says “Масса нетто: 10 кг”. Local title says 10 л, so the image is retained as research evidence only and no import file is produced. |
| MAT-000231 | Грунтовка Ceresit CT-17 PRO, 5л | READY_PREPARED | [source](https://www.albia.ru/laki-kraski-morilki-emali-grunty/gruntovki/gruntovka-ceresit-ct-17-pro-glubokogo-proniknoveniya-5-l/) | [image](https://www.albia.ru/wa-data/public/shop/products/30/56/535630/images/144591/144591.970.jpg) | 970x970 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000231.webp` | Clean 970x970 gallery JPEG; no watermark or promo overlay; accepted as exact 5 l pack. |
| MAT-000232 | Грунтовка Ceresit CT-17 PRO, 10л | EXISTING_REAL | [source](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct_17_pro) | — | — / — | YES | not checked locally | — | Preserve the existing production image; production was not accessed or replaced. |
| MAT-000233 | Грунтовка Ceresit CT16 под декоративную штукатурку 10 л | READY_PREPARED | [source](https://www.albia.ru/laki-kraski-morilki-emali-grunty/gruntovki/gruntovka-ceresit-ct-16-pod-dekorativnuyu-shtukaturku-belaya-10-kg/) | [image](https://www.albia.ru/wa-data/public/shop/products/65/31/3165/images/142447/142447.970.jpg) | 970x970 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000233.webp` | Clean 970x970 gallery JPEG; no watermark or promo overlay; accepted as exact white 10 l pack. |
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.litokol.ru/catalog/primer-a/) | — | — / — | NO/UNRESOLVED | not applicable; no local candidate accepted | — | Identity is source-backed, but exact image/package unit match is unresolved; do not substitute another pack. |
| MAT-000235 | Грунтовка Старатели универсальная 10 л | READY_PREPARED | [source](https://www.vsesmesi.ru/product/6229/) | [image](https://arhitektor.ru/upload/iblock/119/6hxyf0224sl4zxxc417uwgk62gty5pnv.webp) | 2000x2000 / webp | YES | none observed | `product-images-batch/primers/import-ready/MAT-000235.webp` | 2000x2000 transparent WebP; clean exact 10 l packshot, no watermark or overlay. Manufacturer 365x365 candidate retained separately as prior research only. |
| MAT-000236 | Грунтовка UNIS глубокого проникновения укрепляющий 10 л | READY_PREPARED | [source](https://unistrom.ru/catalog/grunty/up-18-grunt-glubokogo-proniknoveniya/) | [image](https://unistrom.ru/upload/iblock/6c2/hlw7ybf8p9qkcdapneihcc6ondinwgdv.png) | 767x1000 / png | YES | none observed | `product-images-batch/primers/import-ready/MAT-000236.webp` | Official 767x1000 transparent PNG; exact current P-18 10 l canister; no watermark or overlay. |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | VARIANT_UNCLEAR_FINAL | [source](https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html) | — | — / — | NO/UNRESOLVED | not applicable; no local candidate accepted | — | Do not use an image unless the 10 kg versus local 10 l identity is resolved. |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/) | — | — / — | NO/UNRESOLVED | not applicable; no local candidate accepted | — | Package unit conflict is unresolved; no substitute image. |
| MAT-000241 | Грунт Tikkurila Euro Primer концентрат 0,9 л | READY_PREPARED | [source](https://tikkurila-russia.ru/tikkurila-euro-primer) | [image](https://tikkurila-russia.ru/assets/images/products/1038/1decd98cb62eb2ea66ed328fa9cf05c0eb77e194.jpg) | 1000x1000 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000241.webp` | Original 1000x1000 JPG; clean exact 0.9 l bottle; no watermark or promo overlay. |
| MAT-000242 | Грунт Tikkurila Euro Primer концентрат 3 л | READY_PREPARED | [source](https://tikkurila-russia.ru/tikkurila-euro-primer) | [image](https://tikkurila-russia.ru/assets/images/products/1038/ae7c500cf5922be47f21e2aa165d5ba04d693f3b.jpg) | 1000x1000 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000242.webp` | Original 1000x1000 JPG; clean exact 3 l canister; no watermark or promo overlay. |
| MAT-000243 | Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг | READY_PREPARED | [source](https://www.forbo.com/eurocol/en/044-europrimer-multi/edbfxr) | [image](https://forbo.azureedge.net/forboimages/7af3aa07-f8ee-4147-94f8-330846b4f825/044-europrimer-multi.jpg) | 539x404 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000243.webp` | Official live CDN JPEG 539x404; clean exact 044 10 kg jerry can; no watermark or overlay. |
| MAT-000244 | Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг | READY_PREPARED | [source](https://flooring-systems.ru/gruntovka-forbo-eurocol-041-ec-el-europrimer) | [image](https://flooring-systems.ru/thumb/2/Z9bQNIZCgdhbRbSQfS91eg/750r750/d/041.jpg) | 500x500 / jpeg | YES | none observed | `product-images-batch/primers/import-ready/MAT-000244.webp` | Accepted exact 10 kg dealer packshot because the official current image has a visible 11 kg conflict. 500x500 JPEG is clean and usable but lower resolution than the other recovered sources; no watermark or overlay. |

## Recovered READY_PREPARED evidence

### MAT-000231

- Source owner/type: exact retailer page (article 00-00012081) + gallery asset
- Source page: https://www.albia.ru/laki-kraski-morilki-emali-grunty/gruntovki/gruntovka-ceresit-ct-17-pro-glubokogo-proniknoveniya-5-l/
- Direct asset: https://www.albia.ru/wa-data/public/shop/products/30/56/535630/images/144591/144591.970.jpg
- Source: 970x970 jpeg, 99626 bytes, SHA256 `5ed98ff527f944c22db87938b2810154a5b5ce9aae35b496335eeb325ca5f63d`
- Exact identity/pack: confirmed; Albia exact title confirms Ceresit CT 17 PRO, 5 l; article 00-00012081; gallery asset visibly shows CT 17 PRO and 5 l.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000231-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000231.webp`, 1200x1200 webp, 28712 bytes, SHA256 `4c303643329a1f4f0a1f336f74f7d6f78d4864751cc3496d8b4264caf8f637b2`
- Visual QA: PASS
- Note: Clean 970x970 gallery JPEG; no watermark or promo overlay; accepted as exact 5 l pack.

### MAT-000233

- Source owner/type: exact retailer page (article 792200, barcode 4607053920192) + gallery asset
- Source page: https://www.albia.ru/laki-kraski-morilki-emali-grunty/gruntovki/gruntovka-ceresit-ct-16-pod-dekorativnuyu-shtukaturku-belaya-10-kg/
- Direct asset: https://www.albia.ru/wa-data/public/shop/products/65/31/3165/images/142447/142447.970.jpg
- Source: 970x970 jpeg, 109846 bytes, SHA256 `4d2358ae20759b1503d18ca9c0f788545c4a47a0d2683a932eccfb7f2c971d9f`
- Exact identity/pack: confirmed; Albia exact title confirms Ceresit CT 16, white, 10 l; article 792200 and barcode 4607053920192; gallery asset visibly shows CT 16 and 10 l.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000233-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000233.webp`, 1200x1200 webp, 39836 bytes, SHA256 `3246e2f88b6cf432e40ba99936461c008ac98950a025df5ddbf837a8932712c4`
- Visual QA: PASS
- Note: Clean 970x970 gallery JPEG; no watermark or promo overlay; accepted as exact white 10 l pack.

### MAT-000235

- Source owner/type: retailer identity page + clean packshot from major retailer
- Source page: https://www.vsesmesi.ru/product/6229/
- Direct asset: https://arhitektor.ru/upload/iblock/119/6hxyf0224sl4zxxc417uwgk62gty5pnv.webp
- Source: 2000x2000 webp, 162186 bytes, SHA256 `c2cd2977536d58f9353d36a2d6b767831c96d08a14cc344cf72fe0d5d2de91d8`
- Exact identity/pack: confirmed; Vsesmesi exact product page confirms Старатели Universal primer 10 l. The accepted Arhitektor packshot visibly shows Старатели, universal acrylic primer, barcode 4601745000544 and 10 л.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000235-official.webp`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000235.webp`, 1200x1200 webp, 52740 bytes, SHA256 `8d111b755b01a7618c1eaa3c2bf66cbbbcd58cef049582f1aed47449ac6f4583`
- Visual QA: PASS
- Note: 2000x2000 transparent WebP; clean exact 10 l packshot, no watermark or overlay. Manufacturer 365x365 candidate retained separately as prior research only.

### MAT-000236

- Source owner/type: official UNIS product page + current page media asset
- Source page: https://unistrom.ru/catalog/grunty/up-18-grunt-glubokogo-proniknoveniya/
- Direct asset: https://unistrom.ru/upload/iblock/6c2/hlw7ybf8p9qkcdapneihcc6ondinwgdv.png
- Source: 767x1000 png, 930021 bytes, SHA256 `574a95a17dbdb94a1d94e446a3931debadf53d64a2a55805c1e2c11a60422060`
- Exact identity/pack: confirmed; Current official UNIS page identifies P-18, formerly UP-18, with 10/5/1 l packages; selected page asset is the exact P-18 10 l canister and visibly reads 10 л.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000236-official.png`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000236.webp`, 1200x1200 webp, 60584 bytes, SHA256 `bd6f6a54bf1a6a2d4cb025708810e8d199933b408b60b4e1f6d67998ea1f4360`
- Visual QA: PASS
- Note: Official 767x1000 transparent PNG; exact current P-18 10 l canister; no watermark or overlay.

### MAT-000241

- Source owner/type: current regional manufacturer product page + original JPG asset
- Source page: https://tikkurila-russia.ru/tikkurila-euro-primer
- Direct asset: https://tikkurila-russia.ru/assets/images/products/1038/1decd98cb62eb2ea66ed328fa9cf05c0eb77e194.jpg
- Source: 1000x1000 jpeg, 47711 bytes, SHA256 `79e994b1721b43b5bb630968390447dc8524eb4e33685a6c92ff7bfe02bcb5e0`
- Exact identity/pack: confirmed; Current Tikkurila Euro Primer page confirms 0.9/3/10 l options; asset label visibly reads 0,9 л and Euro Primer concentrate 1:3.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000241-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000241.webp`, 1200x1200 webp, 19190 bytes, SHA256 `948978e6bb9fa517a148f3d402371da2fe868f8e7659ad4e68bb1c763c87e967`
- Visual QA: PASS
- Note: Original 1000x1000 JPG; clean exact 0.9 l bottle; no watermark or promo overlay.

### MAT-000242

- Source owner/type: current regional manufacturer product page + original JPG asset
- Source page: https://tikkurila-russia.ru/tikkurila-euro-primer
- Direct asset: https://tikkurila-russia.ru/assets/images/products/1038/ae7c500cf5922be47f21e2aa165d5ba04d693f3b.jpg
- Source: 1000x1000 jpeg, 77704 bytes, SHA256 `e8106895300be53ccad1e225b7b7572a719a4e909bede35e51967378f63a004a`
- Exact identity/pack: confirmed; Current Tikkurila Euro Primer page confirms 0.9/3/10 l options; asset label visibly reads 3 л and Euro Primer concentrate 1:3.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000242-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000242.webp`, 1200x1200 webp, 38808 bytes, SHA256 `442c68b3d6ac229bce4afc1a6e8c99f16a251e78f3bc35e115b216bc7471a721`
- Visual QA: PASS
- Note: Original 1000x1000 JPG; clean exact 3 l canister; no watermark or promo overlay.

### MAT-000243

- Source owner/type: official Forbo Eurocol English product page + live CDN asset
- Source page: https://www.forbo.com/eurocol/en/044-europrimer-multi/edbfxr
- Direct asset: https://forbo.azureedge.net/forboimages/7af3aa07-f8ee-4147-94f8-330846b4f825/044-europrimer-multi.jpg
- Source: 539x404 jpeg, 16893 bytes, SHA256 `1cd2e3205aad5afa3799a5b35173d57ce614f8010cec74744b8d28946981910b`
- Exact identity/pack: confirmed; Current official Forbo page identifies article 044 Europrimer Multi and 10 kg jerry can; live image is linked from that page and visibly shows Eurocol 044 and 10 kg.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000243-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000243.webp`, 1200x1200 webp, 10548 bytes, SHA256 `b17f4ca9d5dd000fc0b5394b3dbc4c2b3b5e3ade567f4ca3f465eb7eb48f52bc`
- Visual QA: PASS
- Note: Official live CDN JPEG 539x404; clean exact 044 10 kg jerry can; no watermark or overlay.

### MAT-000244

- Source owner/type: official Forbo distributor page + direct dealer image
- Source page: https://flooring-systems.ru/gruntovka-forbo-eurocol-041-ec-el-europrimer
- Direct asset: https://flooring-systems.ru/thumb/2/Z9bQNIZCgdhbRbSQfS91eg/750r750/d/041.jpg
- Source: 500x500 jpeg, 15266 bytes, SHA256 `c5c76658e211bfc46f1c9ea9936a72aeb64408c7af9f96eba59777bb560345ce`
- Exact identity/pack: confirmed; Official Forbo page confirms article 041 Europrimer EC and 10 kg jerry can. The current official image visibly shows 11 kg and was rejected for this SKU; the official distributor page identifies article 041, weight 10 kg, and its image label visibly shows 10 kg.
- Watermark/overlay: none observed
- Source file: `product-images-batch/primers/source/MAT-000244-official.jpg`
- Import-ready: `product-images-batch/primers/import-ready/MAT-000244.webp`, 1200x1200 webp, 17714 bytes, SHA256 `2754f7bcf8dca0c14fb85b13e4673443a2dc677fe3ac75003554734d4d38b411`
- Visual QA: PASS
- Note: Accepted exact 10 kg dealer packshot because the official current image has a visible 11 kg conflict. 500x500 JPEG is clean and usable but lower resolution than the other recovered sources; no watermark or overlay.

## Production-existing rows

- MAT-000228 image URL: `/uploads/products/MAT-000228-cbeaa18a38dca9ea.webp` — EXISTING_REAL, untouched.
- MAT-000232 image URL: `/uploads/products/MAT-000232-348c850095e70af9.webp` — EXISTING_REAL, untouched.

## Importer dry-run

Command:

```text
node backend/scripts/import-product-images.js --input product-images-batch/primers/import-ready --db backend/database/matmix.db --only MAT-000231,MAT-000233,MAT-000235,MAT-000236,MAT-000241,MAT-000242,MAT-000243,MAT-000244 --dry-run
```

The command is limited to the eight READY_PREPARED MAT and is dry-run only.
