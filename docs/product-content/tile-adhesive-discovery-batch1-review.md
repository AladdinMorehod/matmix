# Клей для плитки — source completion и canonical template review

Дата: 2026-10-05. Exact scope: 19 MAT-000127…MAT-000145, «Смеси → Клей для Плитки». Discovery и guarded H1/H2 package; production не открывали и не меняли.

## Source completion

По 16 регулярным полям first-pass baseline: **132/304** READY; после refinement и подтверждения MAT-000133: **235/304** (**+103**). Production v11 подтверждает `pot_life` как `text`, `default_unit=NULL`; qualifiers и source units теперь сохраняются без нормализации.

| Code | Before READY | Final READY | NEEDS_SOURCE | NOT_AVAILABLE | NEEDS_MAPPING | SOURCE_CONFLICT |
|---|---:|---:|---:|---:|---:|---:|
| `base` | 6 | 15 | 4 | 0 | 0 | 0 |
| `purpose` | 13 | 19 | 0 | 0 | 0 | 0 |
| `application_area` | 9 | 17 | 2 | 0 | 0 | 0 |
| `substrates` | 3 | 11 | 8 | 0 | 0 | 0 |
| `color` | 7 | 9 | 9 | 1 | 0 | 0 |
| `adhesive_class` | 18 | 19 | 0 | 0 | 0 | 0 |
| `layer_thickness` | 12 | 19 | 0 | 0 | 0 | 0 |
| `consumption` | 8 | 16 | 3 | 0 | 0 | 0 |
| `water_requirement` | 10 | 15 | 4 | 0 | 0 | 0 |
| `pot_life` | 3 | 17 | 2 | 0 | 0 | 0 |
| `application_temperature` | 12 | 17 | 2 | 0 | 0 | 0 |
| `open_time` | 8 | 15 | 4 | 0 | 0 | 0 |
| `adjustment_time` | 8 | 15 | 4 | 0 | 0 | 0 |
| `walkability` | 4 | 6 | 12 | 1 | 0 | 0 |
| `heated_floor_compatibility` | 8 | 13 | 6 | 0 | 0 | 0 |
| `standard` | 3 | 12 | 7 | 0 | 0 | 0 |

## 19-product review

| MAT | Title | Identity | READY regular | Unresolved | Title decision |
|---|---|---|---:|---:|---|
| MAT-000127 | Клей для плитки Knauf Флизен, 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |
| MAT-000128 | Клей для плитки Knauf Флизен ПЛЮС, 25 кг | IDENTITY_CONFIRMED | 15/16 | 1 | NO_CHANGE |
| MAT-000129 | Клей для плитки Vetonit Изи Фикс серый С0 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |
| MAT-000130 | Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг | IDENTITY_CONFIRMED | 13/16 | 3 | NO_CHANGE |
| MAT-000131 | Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг | IDENTITY_CONFIRMED | 14/16 | 2 | NO_CHANGE |
| MAT-000132 | Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг | IDENTITY_CONFIRMED | 14/16 | 2 | NO_CHANGE |
| MAT-000133 | Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг | IDENTITY_CONFIRMED | 14/16 | 2 | NO_CHANGE |
| MAT-000134 | Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг | IDENTITY_CONFIRMED | 10/16 | 6 | DEFER_SOURCE_CONFLICT: LITOLIGHT K16, 15 кг |
| MAT-000135 | Клей для плитки Litokol К80, 25 кг | IDENTITY_CONFIRMED | 15/16 | 1 | NO_CHANGE |
| MAT-000136 | Клей для плитки Litokol К55, 25 кг | IDENTITY_CONFIRMED | 15/16 | 1 | NO_CHANGE |
| MAT-000137 | Клей для плитки Litokol К47, 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |
| MAT-000138 | Клей для плитки Unis Плюс 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |
| MAT-000139 | Клей для плитки Unis Гранит 25кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |
| MAT-000140 | Клей для плитки Unis XXI 25 кг | IDENTITY_CONFIRMED | 14/16 | 2 | NO_CHANGE |
| MAT-000141 | Клей для плитки и камня Unis Белфикс 25 кг | IDENTITY_CONFIRMED | 6/16 | 10 | NO_CHANGE |
| MAT-000142 | Клей для плитки, керамогранита и камня Unis 2000 25 кг | IDENTITY_CONFIRMED | 6/16 | 10 | NO_CHANGE |
| MAT-000143 | Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг | IDENTITY_CONFIRMED | 15/16 | 1 | NO_CHANGE |
| MAT-000144 | Клей для плитки Волма Интерьер серый 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | DEFER_OWNER_PACKAGE_CHECK: Клей плиточный ВОЛМА-Интерьер T10, 25 кг |
| MAT-000145 | Клей для плитки Волма Керамик Т14 25 кг | IDENTITY_CONFIRMED | 12/16 | 4 | NO_CHANGE |

## Template proposal

Main order: `brand → product_type → shelf_life → package_weight`. Regular order: `base → purpose → application_area → substrates → color → adhesive_class → layer_thickness → consumption → water_requirement → pot_life → application_temperature → open_time → adjustment_time → walkability → heated_floor_compatibility → standard`. Total = 20 memberships.

| Code | Definition | Type / unit | READY / brands | NEEDS_SOURCE | NOT_AVAILABLE | NEEDS_MAPPING | SOURCE_CONFLICT | Decision |
|---|---|---|---:|---:|---:|---:|---:|---|
| `brand` | existing | text | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — Established global main attribute; brand remains source-backed per exact product. |
| `product_type` | existing | text | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — Concise product-type distinction without marketing-only claims. |
| `shelf_life` | existing | number / месяцев | 11 / 4 | 5 | 0 | 2 | 1 | INCLUDE — Production v11 canonical unit is «месяцев»; source wording is preserved. Day-based values stay NEEDS_MAPPING. |
| `package_weight` | existing | number / кг | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — Manufacturer pack size is distinct from operational products.weight; source the exact package. |
| `base` | existing | text | 15 / 6 | 4 | 0 | 0 | 0 | INCLUDE — Cross-brand binder/base composition where explicitly stated. |
| `purpose` | existing | text | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — What tile/material the product is intended to bond, distinct from location. |
| `application_area` | existing | text | 17 / 6 | 2 | 0 | 0 | 0 | INCLUDE — Interior/exterior, wall/floor and exposure context. |
| `substrates` | existing | text | 11 / 5 | 8 | 0 | 0 | 0 | INCLUDE — Exact substrate compatibility; keep preparation/condition qualifiers. |
| `color` | existing | text | 9 / 5 | 9 | 1 | 0 | 0 | INCLUDE — Adhesive color affects stone, glass and translucent finish choices. |
| `adhesive_class` | new | text | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — Standardized C0/C1/C2 class plus T/E/F/S suffixes is cross-brand and directly comparable. |
| `layer_thickness` | existing | text | 19 / 6 | 0 | 0 | 0 | 0 | INCLUDE — Preserves ranges and recommended/local maximum distinction. |
| `consumption` | existing | text | 16 / 5 | 3 | 0 | 0 | 0 | INCLUDE — Values can depend on tile size/trowel; textual table preserves those dimensions. |
| `water_requirement` | existing | text | 15 / 6 | 4 | 0 | 0 | 0 | INCLUDE — Pack-based and per-kg mixing ranges can be represented without conversion. |
| `pot_life` | existing | text | 17 / 6 | 2 | 0 | 0 | 0 | INCLUDE — Production schema v11 defines pot_life as text with no unit; source qualifiers and original time units are retained verbatim. |
| `application_temperature` | existing | text | 17 / 6 | 2 | 0 | 0 | 0 | INCLUDE — Application temperature range is a stable cross-brand constraint. |
| `open_time` | new | text | 15 / 6 | 4 | 0 | 0 | 0 | INCLUDE — Standard open-time value with inequality/condition qualifier is comparable across brands; text retains threshold. |
| `adjustment_time` | new | text | 15 / 5 | 4 | 0 | 0 | 0 | INCLUDE — Tile correction window is distinct from open time and can preserve inequalities/ranges. |
| `walkability` | existing | text | 6 / 2 | 12 | 1 | 0 | 0 | INCLUDE — Time until floor is walkable, distinct from grout readiness. |
| `heated_floor_compatibility` | new | boolean | 13 / 5 | 6 | 0 | 0 | 0 | INCLUDE — Boolean expresses only explicit manufacturer suitability/incompatibility; application delay details remain in source notes, never inferred as false. |
| `standard` | existing | text | 12 / 5 | 7 | 0 | 0 | 0 | INCLUDE — Named technical standard, distinct from the adhesive performance class. |
| `grouting_time` | new | text | 0 / 0 | 12 | 0 | 7 | 0 | EXCLUDE — Source evidence branches by wall/floor and absorption/setting conditions. One unconditioned field loses distinctions; exclude until the value model can retain conditions. |
| `maximum_tile_size` | new | text | 0 / 0 | 10 | 0 | 9 | 0 | EXCLUDE — Limits depend on tile material/side, wall/floor, substrate and application method; one general maximum is misleading. |
| `adhesion` | existing | number / МПа | 0 / 0 | 7 | 0 | 12 | 0 | EXCLUDE — Existing scalar does not encode test exposure, conditioning, minimum threshold versus actual/maximum. |

### Four new definitions for H1

| Code | Label | Type | Unit | READY / brands | Rationale |
|---|---|---|---|---:|---|
| `adhesive_class` | Класс клея | text | — | 19 / 6 | Standardized C0/C1/C2 class plus T/E/F/S suffixes is cross-brand and directly comparable. |
| `open_time` | Открытое время | text | — | 15 / 6 | Standard open-time value with inequality/condition qualifier is comparable across brands; text retains threshold. |
| `adjustment_time` | Время корректировки | text | — | 15 / 5 | Tile correction window is distinct from open time and can preserve inequalities/ranges. |
| `heated_floor_compatibility` | Подходит для теплого пола | boolean | — | 13 / 5 | Cross-brand compatibility value; text preserves yes/no and any activation delay/constraints. |

Do not create `grouting_time`, `maximum_tile_size`, or `adhesion_text`. Grouting readiness and tile-size limits branch on application conditions; existing numeric adhesion loses test conditions/threshold semantics.

## Source/revision decisions

- MAT-000133 is now IDENTITY_CONFIRMED from owner-confirmed exact Russian CM 17 Super Flex packaging. The official Russian CM 17 TDS is the sole technical source; `adhesive_class` is READY as C2 TE S1. The former revision-mapping conflict is resolved.
- MAT-000133 has 18 READY facts (4 main, 14 regular); `color` and `walkability` remain NOT_AVAILABLE and are not written.
- MAT-000134 naming remains conflicted (K16/LITOLIGHT K16); no rename.
- MAT-000140 shelf life remains SOURCE_CONFLICT: official page 24 months vs official TDS 12 months.
- MAT-000143 U-100: manufacturer page explicitly connects current product to former U-100 UniFlex with unchanged formula; historic TDS supports old pack/revision facts. Use only facts marked READY.
- MAT-000144: T10 is current restyling context, exact row/package mapping unconfirmed; no rename. MAT-000131 current title also stays unchanged.
- Shelf-life day values are not converted to months. Package weight source evidence remains distinct from operational product weight.

## MAT-000127 — IDENTITY_CONFIRMED

- Title: Клей для плитки Knauf Флизен, 25 кг
- Identity: КНАУФ-Флизен, cementitious tile adhesive, 25 kg
- Expected brand: КНАУФ
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/)

| READY code | Value | Source |
|---|---|---|
| `brand` | КНАУФ | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `product_type` | Плиточный клей | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `package_weight` | 25 кг | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `base` | цементная клеевая смесь | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `purpose` | керамическая плитка на стены и полы | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `application_area` | внутренние помещения; без подогрева пола | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `adhesive_class` | C0 T | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `layer_thickness` | 2–6 мм | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `application_temperature` | +5…+25 °C | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `open_time` | не менее 15 мин | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `adjustment_time` | около 10 мин | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `heated_floor_compatibility` | false (manufacturer wording “нет”) | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `standard` | ГОСТ Р 56387-2018 | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `shelf_life` | 12 месяцев | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `walkability` | можно ходить через 24 ч | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| `pot_life` | около 3 ч | [knaufFlizen](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |

**Unresolved regular fields:**
- `substrates`: NEEDS_SOURCE
- `color`: NEEDS_SOURCE
- `consumption`: NEEDS_SOURCE
- `water_requirement`: NEEDS_SOURCE


## MAT-000128 — IDENTITY_CONFIRMED

- Title: Клей для плитки Knauf Флизен ПЛЮС, 25 кг
- Identity: КНАУФ-Флизен Плюс, reinforced cementitious tile adhesive, 25 kg
- Expected brand: КНАУФ
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/), [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/), [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf)

| READY code | Value | Source |
|---|---|---|
| `brand` | КНАУФ | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `product_type` | Усиленный плиточный клей | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `package_weight` | 25 кг | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `adhesive_class` | C1 TE | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `application_area` | внутренние и наружные работы; стены и полы | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `purpose` | керамическая/керамогранитная плитка и камень до 60×60 см | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `heated_floor_compatibility` | true (manufacturer wording “да”) | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `shelf_life` | 12 месяцев | [knaufFlizenPlus](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| `base` | цементная клеевая смесь | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `substrates` | цементные и гипсовые штукатурки и стяжки, ГКЛ и ГВЛ; сильно впитывающие газобетонные и газосиликатные основания — с рекомендованной КНАУФ грунтовкой; в зонах прямого контакта с водой неводостойкие ГКЛ/ГВЛ и ПГП требуют гидроизоляции | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `layer_thickness` | 2–6 мм | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `consumption` | 1,7 кг/м² для плитки до 10 см; 2,2 для 10–20 см; 2,9 для 20–30 см; 3,7 для 30–60 см; 4,7 для 60 см и более (без потерь) | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `open_time` | не менее 30 мин | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `adjustment_time` | около 10 мин | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `walkability` | не ранее 24 ч | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `standard` | C1 TE по ГОСТ Р 56387-2018 | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `water_requirement` | 7 л на 25 кг | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `application_temperature` | +5…+25 °C | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| `pot_life` | около 3 ч | [knaufFlizenPlusTds](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |

**Unresolved regular fields:**
- `color`: NEEDS_SOURCE


## MAT-000129 — IDENTITY_CONFIRMED

- Title: Клей для плитки Vetonit Изи Фикс серый С0 25 кг
- Identity: Vetonit Easy Fix, gray, C0 T, 25 kg
- Expected brand: Vetonit
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907)

| READY code | Value | Source |
|---|---|---|
| `brand` | Vetonit | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `product_type` | Клей для плитки | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `package_weight` | 25 кг | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `color` | серый | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `adhesive_class` | C0 T | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `purpose` | керамическая плитка и камень, кроме мрамора; до 60×60 см; до 45 кг/м² | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `substrates` | бетон, ячеистый бетон, ГВЛ, гипсокартон, кирпич, цементная стяжка и цементная штукатурка | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `layer_thickness` | 1–15 мм | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `consumption` | 1,29 кг/м² на 1 мм слоя | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `water_requirement` | 0,21–0,24 л/кг | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `pot_life` | 3 ч | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `application_temperature` | +5…+30 °C | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `open_time` | 15 мин | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `base` | цементное связующее | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |
| `application_area` | внутри здания; любые уровни влажности; стены и полы | [vetonitEasyFix](https://hub.vetonit.ru/products/sku-1024907) |

**Unresolved regular fields:**
- `adjustment_time`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000130 — IDENTITY_CONFIRMED

- Title: Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг
- Identity: Ceresit CM 11 PRO New Formula, C1 T, 25 kg
- Expected brand: Ceresit
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives), [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives), [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro)

| READY code | Value | Source |
|---|---|---|
| `brand` | Ceresit | [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives) |
| `product_type` | Клей для керамической плитки и керамогранита для пола и стен | [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives) |
| `adhesive_class` | C1 T | [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives) |
| `base` | цемент, минеральные заполнители, модифицирующие добавки | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `package_weight` | 25 кг | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `purpose` | керамическая плитка, керамогранит и камень (кроме мрамора), до 60×60 см, пол/стена | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `application_area` | внутри и снаружи зданий | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `substrates` | бетон, цементные стяжки, цементная и цементно-известковая штукатурка; покрытие CR 65 | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `layer_thickness` | не более 10 мм | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `water_requirement` | около 5,75 л на 25 кг | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `open_time` | 20 мин | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `adjustment_time` | 20 мин | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `application_temperature` | +5…+30 °C | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `shelf_life` | 12 месяцев | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `standard` | C1 T, ГОСТ Р 56387-2018 | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `consumption` | Ориентировочно: плитка до 5 см — 1,7 кг/м² (зуб 3 мм); до 10 см — 2,0 (4 мм); до 15 см — 2,7 (6 мм); до 25 см — 3,6 (8 мм); до 30 см — 4,2 (10 мм); до 60 см — 5,5 (12 мм); либо около 1,2 кг/м² на 1 мм при 100% заполнении | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| `pot_life` | около 2 ч | [ceresitCm11Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |

**Unresolved regular fields:**
- `color`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE


## MAT-000131 — IDENTITY_CONFIRMED

- Title: Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг
- Identity: Ceresit CM 14, C2 T, 25 кг; matching official current manufacturer TDS/package variant
- Expected brand: Ceresit
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives), [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14)
- Title decision: NO_CHANGE; Текущий официальный CM 14 TDS подтверждает применение для природного камня кроме мрамора; title не меняется. Суффикс «сер.» оставлен как локальный title-текст, не использован как доказательство цвета.
- Source keys: [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives), [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14)

| READY code | Value | Source |
|---|---|---|
| `brand` | Ceresit | [ceresitCatalog](https://ceresit.ru/ru/products/tiling/tile-adhesives) |
| `product_type` | Клей повышенной надежности для керамогранита и керамической плитки | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `adhesive_class` | C2 T, ГОСТ Р 56387-2018 | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `base` | цемент, минеральные заполнители, модифицирующие добавки и армирующие микроволокна | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `package_weight` | 25 кг | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `application_area` | Стены и полы внутри и снаружи зданий, включая цоколи, входные группы, балконы и террасы | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `water_requirement` | около 5,5 л на 25 кг | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `open_time` | 20 мин | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `application_temperature` | +5…+30 °C | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `consumption` | Ориентировочно: до 5 см — 1,7 кг/м² (зуб 3 мм); до 10 см — 2,0 (4 мм); до 15 см — 2,7 (6 мм); до 25 см — 3,6 (8 мм); до 30 см — 4,2 (10 мм); до 90 см — 6,0 (12 мм); либо около 1,3 кг/м² на 1 мм при 100% заполнении | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `purpose` | Керамическая плитка, керамогранит, искусственный камень на цементной основе и природный камень кроме мрамора; формат до 90×90 см | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `substrates` | Бетон, цементные штукатурки и стяжки; гидроизоляционные покрытия Ceresit CR 65, CR 166 и CL 51; внутри также ГКЛ и ГВЛ при подготовке по TDS | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `layer_thickness` | не более 10 мм | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `adjustment_time` | 20 мин | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `heated_floor_compatibility` | true (manufacturer wording “да; допускается применение на стяжках с подогревом”) | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `shelf_life` | 12 месяцев | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `standard` | C2 T, ГОСТ Р 56387-2018 | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| `pot_life` | около 2 ч | [ceresitCm14Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |

**Unresolved regular fields:**
- `color`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE


## MAT-000132 — IDENTITY_CONFIRMED

- Title: Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг
- Identity: Ceresit CM 16 Hit, C2 TE, 25 kg (local pack/title identity)
- Expected brand: Ceresit
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16), [ceresitCm16Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16), [ceresitCm16Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16), [ceresitSto2022](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-sto-walls-89589540-002-2022)

| READY code | Value | Source |
|---|---|---|
| `brand` | Ceresit | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `product_type` | Пластичный клей повышенной надежности | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `base` | цемент, минеральные заполнители, модифицирующие добавки и армирующие микроволокна | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `purpose` | керамика, керамогранит, клинкер и природный камень кроме мрамора | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `application_area` | внутри и снаружи; стены и полы | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `substrates` | бетон, цементная/цементно-известковая штукатурка, цементная стяжка, легкий/ячеистый бетон, specified Ceresit waterproofing; indoor additionally heated screeds, gypsum/anhydrite, old tile, DSP/OSB, drywall/GVL | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `adhesive_class` | C2 TE | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `layer_thickness` | до 10 мм maximum | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `consumption` | примерно 2,0–4,2 кг/м² по размеру плитки и зубу шпателя | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `application_temperature` | +5…+30 °C | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `open_time` | 30 мин | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `adjustment_time` | 25 мин | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `heated_floor_compatibility` | true (manufacturer wording “да; для стяжек с подогревом”) | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| `package_weight` | 25 кг | [ceresitCm16Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16) |
| `shelf_life` | 12 месяцев | [ceresitCm16Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16) |
| `standard` | C2 TE по ГОСТ Р 56387-2018 | [ceresitCm16Tds](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16) |
| `color` | серый | [ceresitSto2022](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-sto-walls-89589540-002-2022) |
| `pot_life` | около 2 ч | [ceresitCm16](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |

**Unresolved regular fields:**
- `water_requirement`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE


## MAT-000133 — IDENTITY_CONFIRMED

- Title: Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг
- Identity: Ceresit CM 17 Super Flex, точная российская упаковка подтверждена владельцем, 25 кг
- Expected brand: Ceresit
- Operational weight: 25 кг; исходная товарная запись сохранена без изменений
- Manufacturer package: CONFIRMED; бумажный мешок 25 кг; владелец подтвердил точную редакцию упаковки, официальный TDS указывает фасовку 25 кг
- Title decision: NO_CHANGE; наименование товара не меняется.
- Technical source: [официальная русская техническая документация Ceresit CM 17](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM17). Она является единственным источником технических характеристик в этой записи.

| Section | Характеристика | Значение | Источник |
|---|---|---|---|
| Основная | Бренд | Ceresit | официальный TDS CM 17 |
| Основная | Тип продукта | Клей для плитки | официальный TDS CM 17 |
| Основная | Срок хранения | 12 месяцев | официальный TDS CM 17; бумажный мешок |
| Основная | Вес упаковки | 25 кг | официальный TDS CM 17 |
| Дополнительная | Основа | Цементная | официальный TDS CM 17 |
| Дополнительная | Назначение | Для керамической плитки, керамогранита, клинкерной и каменной плитки, кроме мрамора, включая крупноформатные плиты | официальный TDS CM 17 |
| Дополнительная | Область применения | Внутренние и наружные работы; стены и полы; балконы, террасы, бассейны, стяжки с подогревом, печи, камины, бани и хаммамы | официальный TDS CM 17 |
| Дополнительная | Основания | Бетон; цементные и цементно-известковые штукатурки; цементные стяжки; гипсовые и ангидритные основания; гипсокартон; ГВЛ; ДСП; OSB; лёгкий и ячеистый бетон; гидроизоляционные покрытия; существующая плиточная облицовка; прочные малярные покрытия | официальный TDS CM 17 |
| Дополнительная | Класс клея | C2 TE S1 | официальный TDS CM 17 |
| Дополнительная | Толщина слоя | До 10 мм | официальный TDS CM 17 |
| Дополнительная | Расход | Около 1,1 кг/м² на 1 мм слоя | официальный TDS CM 17 |
| Дополнительная | Расход воды | Около 6,75 л на 25 кг | официальный TDS CM 17 |
| Дополнительная | Жизнеспособность раствора | Около 2 часов | официальный TDS CM 17 |
| Дополнительная | Температура основания и воздуха | От +5 до +30 °C | официальный TDS CM 17 |
| Дополнительная | Открытое время | 30 минут | официальный TDS CM 17 |
| Дополнительная | Время корректировки | 30 минут | официальный TDS CM 17 |
| Дополнительная | Подходит для тёплого пола | Да | официальный TDS CM 17 |
| Дополнительная | Стандарт | ГОСТ Р 56387-2018 | официальный TDS CM 17 |

**Не записываются:** `color` — серый цвет не подтверждён выбранной технической документацией; `walkability` — срок до затирки не приравнивается ко времени возможности хождения. Также остаются исключёнными `grouting_time`, `maximum_tile_size` и `adhesion`.


## MAT-000134 — IDENTITY_CONFIRMED

- Title: Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг
- Identity: LITOLIGHT K16, fiber-reinforced lightweight flexible tile adhesive, C2 TE S1, 15 kg
- Expected brand: LITOKOL
- Operational weight: 15 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 15 кг; sources [litokolK16](https://www.litokol.ru/catalog/litolight-k16/), [litokolK16News](https://www.litokol.ru/press-center/news/novinka-v-assortimente-tsementnykh-kleevykh-sostavov/), [litokolRegulatory](https://www.litokol.ru/documents/regulatory-framework/)
- Title decision: DEFER_SOURCE_CONFLICT; Коммерческая карточка и официальные нормативные/launch naming surfaces расходятся; review-only, title не меняется.
- Source keys: [litokolK16](https://www.litokol.ru/catalog/litolight-k16/), [litokolK16News](https://www.litokol.ru/press-center/news/novinka-v-assortimente-tsementnykh-kleevykh-sostavov/), [litokolRegulatory](https://www.litokol.ru/documents/regulatory-framework/)

| READY code | Value | Source |
|---|---|---|
| `brand` | LITOKOL | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `product_type` | Легкий эластичный плиточный клей | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `package_weight` | 15 кг | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `base` | цементный состав с армирующими волокнами | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `purpose` | керамика, керамогранит и камень | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `color` | серый | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `adhesive_class` | C2 TE S1 | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `layer_thickness` | 2–5 мм; локально до 10 мм | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `consumption` | 0,7 кг/м² на 1 мм | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `water_requirement` | 0,44–0,47 л/кг | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `application_temperature` | +5…+30 °C | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `open_time` | 35 мин | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |
| `pot_life` | до 4 ч | [litokolK16](https://www.litokol.ru/catalog/litolight-k16/) |

**Unresolved regular fields:**
- `application_area`: NEEDS_SOURCE
- `substrates`: NEEDS_SOURCE
- `adjustment_time`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000135 — IDENTITY_CONFIRMED

- Title: Клей для плитки Litokol К80, 25 кг
- Identity: LITOKOL K80, 25 kg (current manufacturer family page)
- Expected brand: LITOKOL
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/)

| READY code | Value | Source |
|---|---|---|
| `brand` | LITOKOL | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `product_type` | Клей плиточный | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `package_weight` | 25 кг | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `purpose` | керамическая плитка, керамогранит и камень | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `color` | серый | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `adhesive_class` | C2 E | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `water_requirement` | 0,24–0,26 л/кг | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `application_temperature` | +5…+30 °C | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `open_time` | не менее 30 мин | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `adjustment_time` | не более 70 мин | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `base` | цементная смесь на портландцементе | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `application_area` | внутри и снаружи; сухие/влажные и отапливаемые/неотапливаемые помещения; стены и полы | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `substrates` | бетон, цементные стяжки/штукатурки, цементные и полимерные гидроизоляции; внутри также гипсовые штукатурки, ГКЛ, газобетон и существующая плитка | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `layer_thickness` | рекомендуемый слой до 5 мм; локально до 15 мм | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `consumption` | 1,16 кг/м² на 1 мм | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `heated_floor_compatibility` | true (manufacturer wording “да; производитель указывает применение в системе «тёплый пол»”) | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `shelf_life` | 12 месяцев | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `standard` | C2 E по ГОСТ Р 56387-2018 | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |
| `pot_life` | до 9 часов | [litokolK80](https://www.litokol.ru/catalog/litoflex-k802/) |

**Unresolved regular fields:**
- `walkability`: NEEDS_SOURCE


## MAT-000136 — IDENTITY_CONFIRMED

- Title: Клей для плитки Litokol К55, 25 кг
- Identity: LITOPLUS K55, white fiber-reinforced adhesive, 25 kg
- Expected brand: LITOKOL
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/)

| READY code | Value | Source |
|---|---|---|
| `brand` | LITOKOL | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `product_type` | Клей для стеклянной мозаики и плитки | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `package_weight` | 25 кг | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `purpose` | glass mosaic, marble, stone, ceramic and porcelain | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `color` | белый | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `adhesive_class` | C2 TE | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `water_requirement` | 0,26–0,28 л/кг for water-only mixing; additive mode is separate | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `application_temperature` | +5…+30 °C | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `open_time` | не менее 30 мин | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `adjustment_time` | не более 40 мин | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `base` | белый цементный клеевой состав с фиброармированием | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `application_area` | внутри и снаружи; стены/полы; влажные помещения, балконы, террасы и другие зоны из перечня изготовителя | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `substrates` | бетон, цементные стяжки/штукатурки, цементные/полимерные гидроизоляции; внутри — гипсовые основания, ГКЛ, газобетон и существующая плитка | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `layer_thickness` | рекомендуемый слой 2–5 мм; локально до 15 мм | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `consumption` | 1,12 кг/м² на 1 мм | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `heated_floor_compatibility` | true (manufacturer wording “да, для системы «тёплый пол»”) | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `shelf_life` | 12 месяцев | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `standard` | C2 TE по ГОСТ Р 56387-2018 | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |
| `pot_life` | до 6 часов | [litokolK55](https://www.litokol.ru/catalog/litoplus-k55/) |

**Unresolved regular fields:**
- `walkability`: NEEDS_SOURCE


## MAT-000137 — IDENTITY_CONFIRMED

- Title: Клей для плитки Litokol К47, 25 кг
- Identity: LITOKOL K47, C0, 25 kg
- Expected brand: LITOKOL
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [litokolK47](https://www.litokol.ru/catalog/litokol-k47/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [litokolK47](https://www.litokol.ru/catalog/litokol-k47/)

| READY code | Value | Source |
|---|---|---|
| `brand` | LITOKOL | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `product_type` | Клей плиточный | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `package_weight` | 25 кг | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `adhesive_class` | C0 | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `consumption` | 1,14 кг/м² на 1 мм | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `water_requirement` | 5,0–5,5 л на 25 кг | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `application_temperature` | +5…+30 °C | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `base` | цементная клеевая смесь на портландцементе | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `purpose` | керамическая плитка; изготовитель указывает формат до 60×60 см | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `application_area` | внутренние работы, включая помещения повышенной влажности; стены и полы | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `color` | серый | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `layer_thickness` | рекомендуемый слой 2–5 мм; максимальная локальная толщина до 15 мм | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `open_time` | 20 мин | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `adjustment_time` | до 20 мин | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `shelf_life` | 12 месяцев | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |
| `pot_life` | до 8 часов | [litokolK47](https://www.litokol.ru/catalog/litokol-k47/) |

**Unresolved regular fields:**
- `substrates`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000138 — IDENTITY_CONFIRMED

- Title: Клей для плитки Unis Плюс 25 кг
- Identity: ЮНИС Плюс, C1 TE, 25 kg
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/), [unisDocs](https://unistrom.ru/docs/), [unisPlusTds](https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/), [unisDocs](https://unistrom.ru/docs/), [unisPlusTds](https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `product_type` | Усиленный армированный плиточный клей | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `package_weight` | 25 кг | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `purpose` | Керамическая плитка, клинкер, натуральный/искусственный камень и керамогранит размером до 90×90 см | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/), [unisPlusTds](https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf) |
| `application_area` | внутри и снаружи, включая влажные/сухие помещения; стены/полы | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `adhesive_class` | C1 TE | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `layer_thickness` | 2–15 мм | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `consumption` | 1,3 кг/м² на 1 мм | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `water_requirement` | 5–7,5 л на 25 кг | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `application_temperature` | +5…+30 °C | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `open_time` | 30 мин | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `adjustment_time` | 20 мин | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `heated_floor_compatibility` | true (manufacturer wording “да”) | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `shelf_life` | 12 месяцев | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `walkability` | не ранее 24 ч | [unisPlus](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| `pot_life` | не менее 240 минут | [unisPlusTds](https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf) |

**Unresolved regular fields:**
- `base`: NEEDS_SOURCE
- `substrates`: NEEDS_SOURCE
- `color`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000139 — IDENTITY_CONFIRMED

- Title: Клей для плитки Unis Гранит 25кг
- Identity: ЮНИС Гранит, C2 T, 25 kg
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/), [unisDocs](https://unistrom.ru/docs/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/), [unisDocs](https://unistrom.ru/docs/), [unisGranitTds](https://unistrom.ru/upload/iblock/491/zcg6bmk3revykeic6lv2l3goctx1fb2q.pdf)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `product_type` | Усиленный клей для плитки и керамогранита большого формата | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `package_weight` | 25 кг | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `adhesive_class` | C2 T | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `layer_thickness` | 2–15 мм | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `consumption` | 1,3 кг/м² на 1 мм | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `water_requirement` | 6–7,5 л на 25 кг | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `application_temperature` | +5…+30 °C | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `heated_floor_compatibility` | true (manufacturer wording “да”) | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `purpose` | Наружная/внутренняя облицовка оснований с повышенной эксплуатационной нагрузкой; крупноформатная/тяжелая плитка | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/), [unisGranitTds](https://unistrom.ru/upload/iblock/491/zcg6bmk3revykeic6lv2l3goctx1fb2q.pdf) |
| `application_area` | внутренние и наружные работы | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `substrates` | Бетонные (включая ячеистый бетон и шлакобетон), цементные и полимерные основания (в том числе цементная штукатурка), кирпичные, гипсовые (ГКЛ, ГВЛ, ПГП), старые плиточные покрытия и нагреваемые поверхности (в том числе система «Тёплый пол»). | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/), [unisGranitTds](https://unistrom.ru/upload/iblock/491/zcg6bmk3revykeic6lv2l3goctx1fb2q.pdf) |
| `adjustment_time` | 30 мин | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `walkability` | не менее 24 ч | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| `pot_life` | не менее 4 часов | [unisGranit](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |

**Unresolved regular fields:**
- `base`: NEEDS_SOURCE
- `color`: NEEDS_SOURCE
- `open_time`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE

**Production value correction:** the current `substrates` row contains the unsupported phrase «цементно-известковые штукатурки». The source-backed READY value above omits that phrase. A dedicated guarded correction script is required for the exact existing MAT-000139 row; the general H2 runner must keep its VALUE_CONFLICT no-overwrite behavior.


## MAT-000140 — IDENTITY_CONFIRMED

- Title: Клей для плитки Unis XXI 25 кг
- Identity: ЮНИС XXI, C0 TE, 25 kg
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/), [unisDocs](https://unistrom.ru/docs/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/), [unisDocs](https://unistrom.ru/docs/), [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `product_type` | Плиточный клей для внутренних работ | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `package_weight` | 25 кг | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `adhesive_class` | C0 TE | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `layer_thickness` | 2–15 мм | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `water_requirement` | 5–7,5 л на 25 кг | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `application_temperature` | +5…+30 °C | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| `walkability` | 24 ч для пола при толщине слоя до 6 мм | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `base` | цемент, минеральный наполнитель, модифицирующие добавки | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `purpose` | Керамическая плитка с водопоглощением более 5%; также кладочный раствор для блоков из ячеистого бетона (пено- и газобетон, газосиликат) | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `application_area` | Стены и полы внутри сухих и влажных помещений | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `substrates` | Недеформирующиеся основания: бетон (включая ячеистый бетон, шлакобетон и газобетон), цементные основания и штукатурка, кирпич, гипсовые основания ГКЛ/ГВЛ/ПГП | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `consumption` | 1,25–1,35 кг/м² на слой 1 мм | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `open_time` | 30 мин | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `adjustment_time` | 10 мин | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `standard` | C0 TE, ГОСТ Р 56387-2018 | [unisXxiTds](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| `pot_life` | не менее 3 часов | [unisXxi](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |

**Unresolved regular fields:**
- `color`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE


## MAT-000141 — IDENTITY_CONFIRMED

- Title: Клей для плитки и камня Unis Белфикс 25 кг
- Identity: ЮНИС Белфикс, white C1 T, 25 kg
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/), [unisDocs](https://unistrom.ru/docs/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/), [unisDocs](https://unistrom.ru/docs/)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `product_type` | Белый клей для стеклянной и мозаичной плитки и мрамора | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `package_weight` | 25 кг | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `purpose` | стеклянная/мозаичная плитка и мрамор | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `color` | белый | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `adhesive_class` | C1 T | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `layer_thickness` | 2–10 мм | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `consumption` | 1,3 кг/м² на 1 мм | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| `heated_floor_compatibility` | true (manufacturer wording “да, manufacturer page indicates heated floor use”) | [unisBelFix](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |

**Unresolved regular fields:**
- `base`: NEEDS_SOURCE
- `application_area`: NEEDS_SOURCE
- `substrates`: NEEDS_SOURCE
- `water_requirement`: NEEDS_SOURCE
- `pot_life`: NEEDS_SOURCE
- `application_temperature`: NEEDS_SOURCE
- `open_time`: NEEDS_SOURCE
- `adjustment_time`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000142 — IDENTITY_CONFIRMED

- Title: Клей для плитки, керамогранита и камня Unis 2000 25 кг
- Identity: ЮНИС 2000, C1 T, 25 kg
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/), [unisDocs](https://unistrom.ru/docs/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/), [unisDocs](https://unistrom.ru/docs/)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `product_type` | Универсальный плиточный клей | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `package_weight` | 25 кг | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `purpose` | керамическая/клинкерная плитка, природный/искусственный камень и керамогранит до 60×60 см | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `application_area` | внутри и снаружи; подходит для теплого пола | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `adhesive_class` | C1 T | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `layer_thickness` | 2–15 мм | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `consumption` | 1,3 кг/м² на 1 мм | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `heated_floor_compatibility` | true (manufacturer wording “да”) | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| `shelf_life` | 12 месяцев | [unis2000](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |

**Unresolved regular fields:**
- `base`: NEEDS_SOURCE
- `substrates`: NEEDS_SOURCE
- `color`: NEEDS_SOURCE
- `water_requirement`: NEEDS_SOURCE
- `pot_life`: NEEDS_SOURCE
- `application_temperature`: NEEDS_SOURCE
- `open_time`: NEEDS_SOURCE
- `adjustment_time`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `standard`: NEEDS_SOURCE


## MAT-000143 — IDENTITY_CONFIRMED

- Title: Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг
- Identity: ЮНИС U-100 UniFlex, 25 кг, historical name/pack; current manufacturer page explicitly maps former name and unchanged formula
- Expected brand: ЮНИС
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf), [unisU100Current](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/)
- Title decision: NO_CHANGE; Официальный текущий источник производителя прямо связывает прежнее название U-100 UniFlex с текущим U-100 и подтверждает неизменность формулы; исторический TDS совпадает с title/class/25 кг. Title не меняется.
- Source keys: [unisU100Tds](https://unistrom.ru/docs/), [unisDocs](https://unistrom.ru/docs/), [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf), [unisU100Current](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/)

| READY code | Value | Source |
|---|---|---|
| `brand` | ЮНИС | [unisU100Tds](https://unistrom.ru/docs/) |
| `product_type` | Высокопластичный армированный клей для плитки | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `package_weight` | 25 кг | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `base` | цемент, минеральный наполнитель, фракционированный песок, модифицирующие добавки | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `purpose` | Керамогранит, керамическая плитка, натуральный и искусственный камень, клинкерная плитка | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `application_area` | Внутренние и наружные работы: стены и полы, фасады, балконы, террасы, цоколи и бассейны; нагреваемые поверхности, включая теплые полы | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `substrates` | Жесткие основания: цементно-песчаные и гипсовые штукатурки и стяжки, сборный и монолитный бетон возрастом не менее 2 месяцев, ячеистый бетон, газосиликат, ПГП, ГКЛ/ГВЛ, OSB, ЦСП, старые прочные облицовки и окрашенные поверхности; подготовка мембраной требуется для деформирующихся оснований по текущей инструкции производителя | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `adhesive_class` | C2 TE, ГОСТ Р 56387-2018 | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `layer_thickness` | 2–15 мм | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `consumption` | 1,1–1,25 кг/м² на слой 1 мм | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `water_requirement` | 5–7,5 л на 25 кг | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `application_temperature` | −15…+30 °C; во время работы и твердения температура основания и окружающей среды не ниже −15 °C; при прогнозе ниже — работы выполнять в тепловом контуре | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `walkability` | 24 ч для полов при использовании шпателя 6×6 мм | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `heated_floor_compatibility` | true (manufacturer wording “да; эксплуатацию теплого пола начинать не ранее 28 суток после облицовки”) | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `standard` | C2 TE, ГОСТ Р 56387-2018 | [unisU100TdsPdf](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| `open_time` | 30 мин | [unisU100Current](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/) |
| `adjustment_time` | 30 мин | [unisU100Current](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/) |
| `pot_life` | не менее 4 ч | [unisU100Current](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/) |

**Unresolved regular fields:**
- `color`: NEEDS_SOURCE


## MAT-000144 — IDENTITY_CONFIRMED

- Title: Клей для плитки Волма Интерьер серый 25 кг
- Identity: ВОЛМА-Интерьер, C0, 25 kg; restyled line marked T10
- Expected brand: ВОЛМА
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/), [volmaRestyling](https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/)
- Title decision: DEFER_OWNER_PACKAGE_CHECK; Производитель сообщает о рестайлинге T10, но в обороте остаются старые упаковки; нужен осмотр точного stock package.
- Source keys: [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/), [volmaRestyling](https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/)

| READY code | Value | Source |
|---|---|---|
| `brand` | ВОЛМА | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `product_type` | Экономичный клей для керамической и клинкерной плитки | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `package_weight` | 25 кг | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `base` | портландцементная сухая смесь | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `purpose` | керамическая плитка внутри помещений | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `adhesive_class` | C0 | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `application_area` | внутренние работы | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `color` | серый | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `layer_thickness` | 2–5 мм | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `water_requirement` | 0,18–0,22 л/кг (4,5–5,5 л на 25 кг) | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `pot_life` | 3 ч | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `application_temperature` | +5…+30 °C | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `open_time` | 10 мин | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `adjustment_time` | 10 мин | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| `standard` | ГОСТ Р 56387-2018 | [volmaInterior](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |

**Unresolved regular fields:**
- `substrates`: NEEDS_SOURCE
- `consumption`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE
- `heated_floor_compatibility`: NEEDS_SOURCE


## MAT-000145 — IDENTITY_CONFIRMED

- Title: Клей для плитки Волма Керамик Т14 25 кг
- Identity: ВОЛМА-Керамик, 25 kg; restyled line marked T14
- Expected brand: ВОЛМА
- Operational weight: 25 кг; local product record/title; operational weight only, not proof of manufacturer package variant
- Manufacturer package: CONFIRMED; 25 кг; sources [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/), [volmaRestyling](https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/)
- Title decision: NO_CHANGE; Нет отдельного source-backed title change в рамках этого discovery; title не меняется.
- Source keys: [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/), [volmaRestyling](https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/)

| READY code | Value | Source |
|---|---|---|
| `brand` | ВОЛМА | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `product_type` | Цементный клей для керамической/клинкерной плитки | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `package_weight` | 25 кг | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `base` | портландцементная сухая смесь | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `adhesive_class` | C1 | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `application_area` | внутренние и наружные работы | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `purpose` | керамическая и клинкерная плитка | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `color` | серый | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `layer_thickness` | 2–5 мм | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `water_requirement` | 0,18–0,22 л/кг (4,5–5,5 л на 25 кг) | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `pot_life` | 3 ч | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `application_temperature` | +5…+30 °C | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `heated_floor_compatibility` | true (manufacturer wording “manufacturer source indicates suitability for warm-floor applications”) | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `standard` | ГОСТ Р 56387-2018 | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| `adjustment_time` | 10–15 мин | [volmaCeramic](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |

**Unresolved regular fields:**
- `substrates`: NEEDS_SOURCE
- `consumption`: NEEDS_SOURCE
- `open_time`: NEEDS_SOURCE
- `walkability`: NEEDS_SOURCE

## Sources

| ID | Owner | Source type | URL |
|---|---|---|---|
| knaufFlizen | КНАУФ | manufacturer product page and linked product information sheet | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/) |
| knaufFlizenPlus | КНАУФ | manufacturer product page | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/) |
| knaufCatalog | КНАУФ | manufacturer catalog | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/) |
| vetonitEasyFix | ВЕТОНИТ | manufacturer product card | [source](https://hub.vetonit.ru/products/sku-1024907) |
| ceresitCatalog | Ceresit / Henkel | manufacturer product catalog | [source](https://ceresit.ru/ru/products/tiling/tile-adhesives) |
| ceresitCm16 | Ceresit / Henkel | manufacturer product page | [source](https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16) |
| ceresitCm17OldTds | Ceresit / Henkel (document); hosted by distributor | exact-product technical-sheet mirror | [source](https://ceresit-spb.ru/sites/default/files/prodfiles/ru-ceresit-tds-cm17.pdf) |
| litokolK16 | LITOKOL | manufacturer product page | [source](https://www.litokol.ru/catalog/litolight-k16/) |
| litokolK80 | LITOKOL | manufacturer product page | [source](https://www.litokol.ru/catalog/litoflex-k802/) |
| litokolK55 | LITOKOL | manufacturer product page | [source](https://www.litokol.ru/catalog/litoplus-k55/) |
| litokolK47 | LITOKOL | manufacturer product page | [source](https://www.litokol.ru/catalog/litokol-k47/) |
| litokolCatalog | LITOKOL | manufacturer catalog | [source](https://www.litokol.ru/catalog/kleevye-sostavy/) |
| unisDocs | ГК UNIS | manufacturer document catalog | [source](https://unistrom.ru/docs/) |
| unisPlus | ГК UNIS | manufacturer product page | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/) |
| unisGranit | ГК UNIS | manufacturer product page | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/) |
| unisXxi | ГК UNIS | manufacturer product page and linked technical sheet | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/) |
| unisBelFix | ГК UNIS | manufacturer product page | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/) |
| unis2000 | ГК UNIS | manufacturer product page | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/) |
| unisU100Tds | ГК UNIS | manufacturer document catalog with exact U-100 UniFlex technical-description entry | [source](https://unistrom.ru/docs/) |
| unisCatalog | ГК UNIS | manufacturer catalog | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/) |
| volmaInterior | ВОЛМА | manufacturer product page | [source](https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/) |
| volmaCeramic | ВОЛМА | manufacturer product page | [source](https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/) |
| volmaRestyling | ВОЛМА | manufacturer news | [source](https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/) |
| unisPlusTds | ГК UNIS | manufacturer technical sheet PDF | [source](https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf) |
| knaufFlizenPlusTds | КНАУФ | manufacturer information sheet PDF, 04/2025 | [source](https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf) |
| ceresitCm11Tds | Ceresit / Henkel | manufacturer technical description (CM 11 PRO) | [source](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro) |
| ceresitCm14Tds | Ceresit / Henkel | manufacturer technical description (CM 14) | [source](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14) |
| ceresitCm16Tds | Ceresit / Henkel | manufacturer technical description (CM 16) | [source](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16) |
| ceresitCm17Tds | Ceresit / Henkel | manufacturer technical description (CM 17) | [source](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM17) |
| unisU100TdsPdf | ГК UNIS | manufacturer technical description PDF, U-100 UniFlex | [source](https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf) |
| litokolK16News | LITOKOL | manufacturer product launch notice | [source](https://www.litokol.ru/press-center/news/novinka-v-assortimente-tsementnykh-kleevykh-sostavov/) |
| litokolRegulatory | LITOKOL | manufacturer normative classification page | [source](https://www.litokol.ru/documents/regulatory-framework/) |
| ceresitSto2022 | ООО «Хенкель Рус» / Ceresit | manufacturer organization standard (СТО 89589540-002-2022) | [source](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-sto-walls-89589540-002-2022) |
| unisXxiTds | ГК UNIS | manufacturer technical description PDF (ЮНИС XXI) | [source](https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf) |
| unisU100Current | ГК UNIS | current manufacturer product page with explicit former-name/formula continuity statement | [source](https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/) |

## H1/H2 safety boundary

- Owner-provided production read-only audit reports schema v11, structure 16 (`SUB-000015`) under active category `Смеси`, zero existing memberships, and four missing definitions. This task did not access production.
- H1 exact baseline plan: 4 definition inserts + 20 membership inserts; allowed definitions/types: adhesive_class text/null, open_time text/null, adjustment_time text/null, heated_floor_compatibility boolean/null. Existing `pot_life` is text/null.
- H2 exact ordered MAT scope is MAT-000127…MAT-000145. Writes READY facts only; empty brand column only; MAT-000133 is now identity-confirmed and has 18 planned attribute inserts (4 main, 14 regular). Titles and other product fields are immutable.
- Local schema-v4 is not used to infer production v11 template integrity. Shared canonical template registration remains deferred until H1 production verification.
- No product title, image, description, SEO, production DB, shared template dataset or release was changed.
