# Грунтовки — final image resolution review

Проверка выполнена локально 2026-09-18. Production, DB, importer apply и deploy не выполнялись. Папка product-images-batch/primers/ остаётся untracked.

## Policy

Изображение допускается только при доказанной exact identity, exact фасовке/варианте, чистом source без watermark/overlay и достаточном исходном разрешении. Финальный файл создаётся только после проверки, что нормализация importer не требует разрушительного upscale. MAT-000228 и MAT-000232 — EXISTING_REAL и не заменяются.

## Summary

| Status | Count | MAT |
|---|---:|---|
| EXISTING_REAL | 2 | MAT-000228, MAT-000232 |
| READY_PREPARED | 0 | — |
| SOURCE_BLOCKED_FINAL | 8 | MAT-000231, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243, MAT-000244 |
| VARIANT_UNCLEAR_FINAL | 5 | MAT-000227, MAT-000230, MAT-000234, MAT-000237, MAT-000240 |

## Per-MAT evidence

| MAT | Exact local title | Status | Source page | Direct image | Source | Pack match | Dimensions | Watermark | Final | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/29a/55x9do76h9yl4e2vsyr1q0uv4snnyxxe/Vedro-Tifengrund-10-kg-_40_Gbg.webp) | official product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | No exact clean 5 l/5 kg image was retained. Do not convert kg to l or use another package. |
| MAT-000228 | Грунтовка Knauf Тифенгрунд 10 л | EXISTING_REAL | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/29a/55x9do76h9yl4e2vsyr1q0uv4snnyxxe/Vedro-Tifengrund-10-kg-_40_Gbg.webp) | existing production image (user-confirmed; production not accessed) | YES | — | not checked locally | — | Preserve existing production image |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/) | [image](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/f91/7uu2bpxjzhtb6jo6zdscd3813fpimlnn/Vedro_Multigrund_10_kg_16_03_2023_Oborot_1000x1000_v01.webp) | official manufacturer CDN + official product page | NO/UNRESOLVED | 1000x1000 | none observed | — | Official KNAUF page confirms Multigrund and packages 5/10 kg; the downloaded 1000x1000 image visibly says “Масса нетто: 10 кг”. Local title says 10 л, so the image is retained as research evidence only and no import file is produced. |
| MAT-000231 | Грунтовка Ceresit CT-17 PRO, 5л | SOURCE_BLOCKED_FINAL | [source](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct_17_pro) | — | official manufacturer product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Exact product page found; clean exact 5 l image was not retained. |
| MAT-000232 | Грунтовка Ceresit CT-17 PRO, 10л | EXISTING_REAL | [source](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct_17_pro) | — | existing production image (user-confirmed; production not accessed) | YES | — | not checked locally | — | Preserve existing production image |
| MAT-000233 | Грунтовка Ceresit CT16 под декоративную штукатурку 10 л | SOURCE_BLOCKED_FINAL | [source](https://dm.henkel-dam.com/is/content/henkel/tds-ru-ceresit-ct16pdf) | — | official TDS + official product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Exact TDS found; no clean exact 10 l packshot retained. |
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.litokol.ru/catalog/primer-a/) | — | official product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Identity is source-backed, but exact image/package unit match is unresolved; do not substitute another pack. |
| MAT-000235 | Грунтовка Старатели универсальная 10 л | SOURCE_BLOCKED_FINAL | [source](https://www.starateli.ru/gruntovka_universalnaya/) | [image](https://www.starateli.ru/images/images/%D0%93%D1%80%D1%83%D0%BD%D1%82%D0%BE%D0%B2%D0%BA%D0%B0_%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_10_%D0%BB_365x365.png) | official manufacturer product page + official media | YES | 365x365 | none observed | — | Official Старатели page confirms Universal primer, canisters 10/5/1 l and direct exact 10 l image. The only manufacturer asset is 365x365; upscaling to 1200 would materially reduce label fidelity, so no final is prepared. |
| MAT-000236 | Грунтовка UNIS глубокого проникновения укрепляющий 10 л | SOURCE_BLOCKED_FINAL | [source](https://unistrom.ru/catalog/grunty/up-18-grunt-glubokogo-proniknoveniya/) | [image](https://unistrom.ru/upload/iblock/69d/j7gbagq5zsdag0bnd28dksrst25vsbe4.png) | official manufacturer product page + official media | YES | 153x200 | none observed | — | Official UNIS page identifies P-18 (formerly UP-18) deep-penetration primer and 1/5/10 l packaging. The official OG image is only 153x200, below safe source quality for a 1200px product image; no final is prepared. |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | VARIANT_UNCLEAR_FINAL | [source](https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html) | — | brand support/catalog | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Do not use an image unless the 10 kg versus local 10 l identity is resolved. |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | VARIANT_UNCLEAR_FINAL | [source](https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/) | — | official product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Package unit conflict is unresolved; no substitute image. |
| MAT-000241 | Грунт Tikkurila Euro Primer концентрат 0,9 л | SOURCE_BLOCKED_FINAL | [source](https://tikkurila-russia.ru/tikkurila-euro-primer) | — | official/regional manufacturer product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Exact volume is known; clean exact image not retained. |
| MAT-000242 | Грунт Tikkurila Euro Primer концентрат 3 л | SOURCE_BLOCKED_FINAL | [source](https://tikkurila-russia.ru/tikkurila-euro-primer) | — | official/regional manufacturer product page | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Exact volume is known; clean exact image not retained. |
| MAT-000243 | Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг | SOURCE_BLOCKED_FINAL | [source](https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw) | [image](https://forbo.azureedge.net/forboimages/9e9160c3-dc2b-41ba-8609-62737a4b8f11/alt-ru_044-europrimer-multi.jpg) | official manufacturer product page + official CDN image URL | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Official Forbo page confirms Europrimer Multi 044, 10 kg net. The CDN image URL currently returns BlobNotFound/404, so no local source or final is retained. |
| MAT-000244 | Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг | SOURCE_BLOCKED_FINAL | [source](https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag) | [image](https://forbo.azureedge.net/forboimages/9fa7e7e5-ac81-4e47-ae3a-b352613f2976/alt-ru_041_europrimer-ec.jpg) | official manufacturer product page + official CDN image URL | NO/UNRESOLVED | — | not applicable; no local candidate accepted | — | Official Forbo page confirms Europrimer EC 041, 10 kg net. The CDN image URL currently returns BlobNotFound/404, so no local source or final is retained. |

## Resolved research notes

- MAT-000230 — KNAUF Multigrund: official page and official 1000×1000 CDN image were checked. The image is clean and visibly states “Масса нетто: 10 кг”; local title says “10 л”. Because kg↔l conversion is prohibited, this remains VARIANT_UNCLEAR_FINAL and no final file is produced.
- MAT-000235 — Старатели Universal: official manufacturer page confirms canisters 10/5/1 l and the direct 10 l asset. The retained original is only 365×365, so it is SOURCE_BLOCKED_FINAL for the 1200×1200 standard; no label-inventing upscale was made.
- MAT-000236 — UNIS P-18 / formerly UP-18: official manufacturer page confirms the exact deep-penetration primer and 1/5/10 l packaging. The official OG image is 153×200, below safe source quality; it remains SOURCE_BLOCKED_FINAL.
- MAT-000243 / MAT-000244 — Forbo: official pages confirm exact 044/041 products and 10 kg net packaging. The linked official CDN image objects currently return 404/BlobNotFound, so no local source or final is accepted.
- MAT-000227 / MAT-000234 / MAT-000237 / MAT-000240: package/unit evidence remains unresolved against local titles; no substitute image is permitted.
- MAT-000228 / MAT-000232: accepted production images remain untouched; no production read or replacement was performed.

## Future import

READY_PREPARED=0, therefore there is no safe importer dry-run command. Do not run a generic 15-item command and do not include MAT-000228 or MAT-000232.

## Local validation

- Downloaded source candidates were decoded with Sharp and hashed locally.
- Source candidates were visually inspected: MAT-000230 is a clean white-background 1000×1000 WebP; MAT-000235 and MAT-000236 are transparent-background official packshots without observed watermark, but are below final-source resolution.
- No final WebP and no importer input were created because no row passed all gates.
- Production and database were untouched.
