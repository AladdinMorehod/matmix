# Primer image review

Checked: 2026-09-18

## Summary

- Total tracked primer MAT: 15
- Existing production images retained: 2
- Ready prepared: 13
- Source blocked: 0
- Variant unresolved: 0

## Last-five resolved sources

| MAT | title | status | source | source size | final | final SHA-256 | visual QA |
|---|---|---|---|---:|---|---|---|
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 кг | READY_PREPARED | [source](https://knauf-chelyabinsk.ru/product/gruntovka_ukreplyayushchaya_glubokogo_proniknoveniya_knauf_tifengrund_5_kg/) | 500x500 | 1200x1200 WebP (39692 bytes) | 1ae23ff9611fb9eac54054e12198ff352478ec33091fd7e595a79b2b6e10c89a | PASS: clean product image, full bucket, white canvas after importer render; no watermark observed. |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 кг | READY_PREPARED | [source](https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/) | 653x420 | 1200x1200 WebP (26452 bytes) | 28b05db1b9bb865e02ff1a702732d35848b29cc8d3e5c9cecc9041cd5071909f | PASS framing and identity; official source has a light-gray studio background retained unchanged, with white outer canvas corners after render. |
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 кг | READY_PREPARED | [source](https://www.litokol.ru/catalog/primer-a/) | 600x600 | 1200x1200 WebP (31324 bytes) | d9caefbfa99af105e8ecf57b38f02c10d92a626c5e686d7d6f53b8c074a61fbe | PASS: full exact canister, transparent source composited by importer to white, no watermark observed. |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 кг | READY_PREPARED | [source](https://www.vseinstrumenti.ru/product/ukreplyayuschaya-gruntovka-glubokogo-proniknoveniya-oscar-vedro-10-kg-gv-os-10kg-1202936/) | 560x504 | 1200x1200 WebP (48594 bytes) | 03e1b5891bd9dbf04d47e3ad04ef4465cb3b573c8f715028e89fdf69a47feb08 | PASS: full bucket, white background in rendered output, no watermark observed. |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 кг | READY_PREPARED | [source](https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/) | 1000x1000 | 1200x1200 WebP (76668 bytes) | 71b4dc2905591f833c791f96a4ead0e8efa61352334fed2acbde3c786ec18d7d | PASS: full bucket, white background in rendered output, no watermark observed. |

## Existing production images

MAT-000228, MAT-000231, MAT-000232, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243 and MAT-000244 remain unchanged and are excluded from this recovery pass.

## Import policy

Originals are retained under `product-images-batch/primers/source/`; importer-compatible copies are under `product-images-batch/primers/import-source/`; canonical previews are under `product-images-batch/primers/import-ready/`. No image import apply was executed.
