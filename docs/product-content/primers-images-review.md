# Primer image review

Checked: 2026-09-18

## Current production state

- EXISTING_REAL: **10** — MAT-000228, MAT-000231, MAT-000232, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243, MAT-000244.
- READY_PREPARED: **5** — MAT-000227, MAT-000230, MAT-000234, MAT-000237, MAT-000240.
- IMAGE_BLOCKED_FINAL: **0**.
- Canonical 1200x1200 WebP coverage: **13** currently meet the standard; **2** normalization replacements are ready for a controlled future import: MAT-000228 and MAT-000232.

| MAT | title | status | source | source size | final | SHA-256 | QA |
|---|---|---|---|---:|---|---|---|
| MAT-000228 | Грунтовка Knauf Тифенгрунд 10 л | NORMALIZE_EXISTING | [official KNAUF source](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/29a/55x9do76h9yl4e2vsyr1q0uv4snnyxxe/Vedro-Tifengrund-10-kg-_40_Gbg.webp) | 653x420 WebP | 1200x1200 WebP | `03c7334c1ea72bc895539c36cd50a4907a56ed2688b416b669c18402896215e0` | PASS: exact KNAUF TIEFENGRUND bucket, full product, white outer background after deterministic border-connected background cleanup, safe margins, no watermark or label edit. Final is byte-for-byte `renderWebp(import-source)`. |
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 л | READY_PREPARED | [source](https://knauf-chelyabinsk.ru/upload/iblock/73e/vxka63vovo9twzla05hpzp43d4lsmlrn.png) | 500x500 | 1200x1200 WebP | 1ae23ff9611fb9eac54054e12198ff352478ec33091fd7e595a79b2b6e10c89a | PASS: full product, white outer background, safe margins, no watermark, no label modification. |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 л | READY_PREPARED | [source](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/f91/7uu2bpxjzhtb6jo6zdscd3813fpimlnn/Vedro_Multigrund_10_kg_16_03_2023_Oborot_1000x1000_v01.webp) | 1000x1000 | 1200x1200 WebP | 05f743dbf651217177b8c1f8f0fe030a07aabd417c7e871fd080abecabc10854 | PASS: full product, white outer background, safe margins, no watermark, no label modification. |
| MAT-000232 | Грунтовка Ceresit CT-17 PRO, 10л | NORMALIZE_EXISTING | [Ceresit Russia exact product page](https://ceresit-russia.com/gruntovka-glubokogo-proniknoveniya-ceresit-ct-17-pro-10-l-10/) / [linked image](https://ceresit-russia.com/image/cache/catalog/products/380082/gruntovka-glubokogo-proniknoveniya-ceresit-ct-17-pro-10-l-17_jpg-700x700.jpg) | 700x700 JPEG | 1200x1200 WebP | `418b11f1b065d9b029d50deb8311ae160f9c8b3e718c1338fdf23b6600414439` | PASS: exact CT 17 PRO 10 л canister, readable label, clean white background, full product, safe margins, no watermark. Final is byte-for-byte `renderWebp(import-source)`. |
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | READY_PREPARED | [source](https://litokol-market.ru/upload/resize_cache/iblock/7cc/2d8wdkmirsl45s8eta6jzgb972umbqfc/600_600_1/Primer-A-10L-_-2024_11_22.webp) | 600x600 | 1200x1200 WebP | d9caefbfa99af105e8ecf57b38f02c10d92a626c5e686d7d6f53b8c074a61fbe | PASS: full product, white outer background, safe margins, no watermark, no label modification. |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | READY_PREPARED | [source](https://cdn.vseinstrumenti.ru/images/goods/stroitelnye-materialy/otdelochnye-materialy/1202936/560x504/69951865.jpg) | 560x504 | 1200x1200 WebP | 03e1b5891bd9dbf04d47e3ad04ef4465cb3b573c8f715028e89fdf69a47feb08 | PASS: full product, white outer background, safe margins, no watermark, no label modification. |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | READY_PREPARED | [source](https://www.knauf.ru/upload/iv_resize/detail_page/original/iblock/7b0/29vjnk67n2b13i3k32kpvt81wa3epmoe/Vedro_Mittelgrund_10_kg_17_03_2023_Oborot_1000x1000_v01.webp) | 1000x1000 | 1200x1200 WebP | 71b4dc2905591f833c791f96a4ead0e8efa61352334fed2acbde3c786ec18d7d | PASS: full product, white outer background, safe margins, no watermark, no label modification. |

## Normalization replacements

The existing production bindings for MAT-000228 and MAT-000232 remain untouched. Their two local inputs are isolated under `product-images-batch/primers/import-source/` and are intended only for a future controlled importer run with `--only MAT-000228,MAT-000232 --allow-real-overwrite`.

MAT-000228 uses the official KNAUF asset as the identity source. Its uniform gray outer background was replaced deterministically with white in the local importer input; product artwork and label pixels were not redrawn or edited. MAT-000232 uses the clean exact 10 л asset linked by the current Ceresit Russia product page.

Both final previews are 1200x1200 WebP, have no alpha channel, have white corner samples, and match the exported `renderWebp()` output byte-for-byte. A local dry-run reported `total=2`, `ready=2`, `protected=0`, `existingReal=0`, `invalid=0`, `notFound=0`, `duplicates=0`, `errors=0`; the local audit DB hash was unchanged.

## MAT-000234 unit note

The current catalog representation remains 10 л and the accepted packshot visibly shows 10 л. Official technical/package metadata may separately use kg; no unit conversion is inferred by this image process.

## Import policy

Only the explicitly selected input folders are used for a future import. The five new-image files remain separate from this two-MAT normalization batch, and the ten existing production MATs are excluded. No production import was executed.
