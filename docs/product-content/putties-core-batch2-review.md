# Шпаклевка — CORE corrective review (batch 2)

Проверено: 2026-09-17. Локальный dry-run; production не используется. Scope: MAT-000047…MAT-000060.

## Архитектура

- Scope: только core attributes и синхронизация `products.brand` с атрибутом `brand`.
- `TITLE_WRITES=0`: `products.title` используется только как identity guard; `canonicalIdentity` и `titleNormalization` — review metadata, не операции записи.
- Запись только targeted upsert; wholesale delete не используется.
- `consumption_10mm`, `coverage_30kg_10mm`, `wall_layer_thickness`, `ceiling_layer_thickness` не используются.
- `ABSENT_BY_DESIGN` и `NEEDS_SOURCE` не создают значения; numeric-only `shelf_life` без числа получает `SCHEMA_BLOCKED`.
- Templates: аудит без создания.

## Dry-run

| MAT | Current title | Brand | Core status | Source keys |
|---|---|---|---|---|
| MAT-000047 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг | Danogips (product: WILL_FIX; attribute: WILL_ADD) | READY | danogips, localTitle |
| MAT-000048 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг | Danogips (product: WILL_FIX; attribute: WILL_ADD) | READY | danogips, localTitle |
| MAT-000049 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг | KNAUF (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | knaufRotband, localTitle |
| MAT-000050 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг | KNAUF (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | knaufRotband, localTitle |
| MAT-000051 | Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг | SEMIN (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | semin, localTitle |
| MAT-000052 | Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг | VGT (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | vgt, localTitle |
| MAT-000053 | Шпаклевка Vetonit LR+ 5 кг | Vetonit (product: WILL_FIX; attribute: WILL_ADD) | READY | vetonitLR, localTitle |
| MAT-000054 | Шпаклевка Vetonit LR+ 20 кг | Vetonit (product: WILL_FIX; attribute: WILL_ADD) | READY | vetonitLR, localTitle |
| MAT-000055 | Шпаклевка Vetonit KR финиш белая 20 кг | Vetonit (product: WILL_FIX; attribute: WILL_ADD) | READY | vetonitKR, localTitle |
| MAT-000056 | Шпаклевка полимерная финишная Vetonit JS Plus 20 кг | Vetonit (product: WILL_FIX; attribute: WILL_ADD) | READY | vetonitJS, localTitle |
| MAT-000057 | Шпаклевка полимерная финишная Knauf Polymer finish 20 кг | KNAUF (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | knaufPolymer, localTitle |
| MAT-000058 | Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг | ОСНОВИТ (product: WILL_FIX; attribute: WILL_ADD) | READY | osnovit, localTitle |
| MAT-000059 | Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг | Danogips (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | danoJet, localTitle |
| MAT-000060 | Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг | ВОЛМА (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | volma, localTitle |

## Per-MAT details

### MAT-000047

- Current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Danogips; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Danogips / Готовая финишная полимерная шпатлевка / 5 kg.
- Official identity name: Danogips SuperFinish.
- Title issues (review only; no title write): SUBSTANTIVE: Локальное «(Шитрок)» не подтверждает официальное название Danogips SuperFinish; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая финишная полимерная шпатлевка | — | WILL_ADD | 2 (text) | danogips |
| base | Сополимер этилена и винилацетата | — | WILL_ADD | 3 (text) | danogips |
| purpose | Финишное выравнивание поверхностей внутри сухих помещений | — | WILL_ADD | 4 (text) | danogips |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | Не менее +13 °C | — | WILL_ADD | 10 (text) | danogips |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | danogips |
| color | Белый; возможен серый или кремовый оттенок | — | WILL_ADD | to create (text) | danogips |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | danogips |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | danogips |
| substrates | листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ | — | WILL_ADD | to create (text) | danogips |
| layer_thickness | до 2 мм | — | WILL_ADD | to create (text) | danogips |
| consumption | 1 л/м²/мм | — | WILL_ADD | to create (text) | danogips |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | danogips |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | danogips |
| drying_time | около 24 часов в зависимости от температуры, влажности и толщины слоя | — | WILL_ADD | to create (text) | danogips |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000048

- Current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Danogips; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Danogips / Готовая финишная полимерная шпатлевка / 28 kg.
- Official identity name: Danogips SuperFinish.
- Title issues (review only; no title write): SUBSTANTIVE: Локальное «(Шитрок)» не подтверждает официальное название Danogips SuperFinish; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая финишная полимерная шпатлевка | — | WILL_ADD | 2 (text) | danogips |
| base | Сополимер этилена и винилацетата | — | WILL_ADD | 3 (text) | danogips |
| purpose | Финишное выравнивание поверхностей внутри сухих помещений | — | WILL_ADD | 4 (text) | danogips |
| package_weight | 28 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | Не менее +13 °C | — | WILL_ADD | 10 (text) | danogips |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | danogips |
| color | Белый; возможен серый или кремовый оттенок | — | WILL_ADD | to create (text) | danogips |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | danogips |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | danogips |
| substrates | листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ | — | WILL_ADD | to create (text) | danogips |
| layer_thickness | до 2 мм | — | WILL_ADD | to create (text) | danogips |
| consumption | 1 л/м²/мм | — | WILL_ADD | to create (text) | danogips |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | danogips |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | danogips |
| drying_time | около 24 часов в зависимости от температуры, влажности и толщины слоя | — | WILL_ADD | to create (text) | danogips |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000049

- Current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: KNAUF / Готовая финишная шпаклевка / 5 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая финишная шпаклевка | — | WILL_ADD | 2 (text) | knaufRotband |
| base | Виниловая основа | — | WILL_ADD | 3 (text) | knaufRotband |
| purpose | Финишное выравнивание внутри помещений | — | WILL_ADD | 4 (text) | knaufRotband |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +25 °C | — | WILL_ADD | 10 (text) | knaufRotband |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | knaufRotband |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufRotband |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений, сухой и нормальный влажностный режим | — | WILL_ADD | to create (text) | knaufRotband |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | knaufRotband |
| substrates | ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст | — | WILL_ADD | to create (text) | knaufRotband |
| layer_thickness | 0,2–2 мм | — | WILL_ADD | to create (text) | knaufRotband |
| consumption | 0,48 кг/м² | — | WILL_ADD | to create (text) | knaufRotband |
| consumption_basis | при слое 0,3 мм | — | WILL_ADD | to create (text) | knaufRotband |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | knaufRotband |
| drying_time | около 24 часов при слое 1 мм | — | WILL_ADD | to create (text) | knaufRotband |

- NEEDS_SOURCE: color - Цвет exact SKU не подтверждён.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000050

- Current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: KNAUF / Готовая финишная шпаклевка / 18 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая финишная шпаклевка | — | WILL_ADD | 2 (text) | knaufRotband |
| base | Виниловая основа | — | WILL_ADD | 3 (text) | knaufRotband |
| purpose | Финишное выравнивание внутри помещений | — | WILL_ADD | 4 (text) | knaufRotband |
| package_weight | 18 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +25 °C | — | WILL_ADD | 10 (text) | knaufRotband |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | knaufRotband |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufRotband |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений, сухой и нормальный влажностный режим | — | WILL_ADD | to create (text) | knaufRotband |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | knaufRotband |
| substrates | ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст | — | WILL_ADD | to create (text) | knaufRotband |
| layer_thickness | 0,2–2 мм | — | WILL_ADD | to create (text) | knaufRotband |
| consumption | 0,48 кг/м² | — | WILL_ADD | to create (text) | knaufRotband |
| consumption_basis | при слое 0,3 мм | — | WILL_ADD | to create (text) | knaufRotband |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | knaufRotband |
| drying_time | около 24 часов при слое 1 мм | — | WILL_ADD | to create (text) | knaufRotband |

- NEEDS_SOURCE: color - Цвет exact SKU не подтверждён.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000051

- Current title: Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: SEMIN; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: SEMIN / Готовая полимерная шпаклевка для швов и финиша / 20 kg.
- Official identity name: SEMIN CE 78.
- Title issues (review only; no title write): PACKAGING_NOTE: «Белая крышка» — признак упаковки, не подтверждение цвета состава.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая полимерная шпаклевка для швов и финиша | — | WILL_ADD | 2 (text) | semin |
| base | Акриловая дисперсия | — | WILL_ADD | 3 (text) | semin |
| purpose | Заделка швов ГКЛ и финишное выравнивание | — | WILL_ADD | 4 (text) | semin |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +8 до +35 °C | — | WILL_ADD | 10 (text) | semin |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | semin |
| color | — | — | NEEDS_SOURCE | to create (text) | semin |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений: стены и потолки | — | WILL_ADD | to create (text) | semin |
| application_method | Ручное, airless, bazooka, banjo и валик | — | WILL_ADD | to create (text) | semin |
| substrates | ГКЛ, гипсовые блоки, окрашенные поверхности, силикат кальция | — | WILL_ADD | to create (text) | semin |
| layer_thickness | 1–5 мм | — | WILL_ADD | to create (text) | semin |
| consumption | 500 г/м²/мм для швов; 1 кг/м² при сплошном нанесении | — | WILL_ADD | to create (text) | semin |
| consumption_basis | для швов / сплошного слоя 1–4 мм | — | WILL_ADD | to create (text) | semin |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | semin |
| drying_time | 12–24 часа до следующего слоя | — | WILL_ADD | to create (text) | semin |

- NEEDS_SOURCE: color - Цвет exact SKU не подтверждён.
- shelf_life note: numeric months 18 is source-supported.

### MAT-000052

- Current title: Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: VGT; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: VGT / Готовая акриловая универсальная шпаклевка / 18 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая акриловая универсальная шпаклевка | — | WILL_ADD | 2 (text) | vgt |
| base | Акриловая | — | WILL_ADD | 3 (text) | vgt |
| purpose | Выравнивание и заполнение трещин до 7 мм | — | WILL_ADD | 4 (text) | vgt |
| package_weight | 18 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +7 до +30 °C | — | WILL_ADD | 10 (text) | vgt |
| shelf_life | 24 | — | WILL_ADD | 11 (number) | vgt |
| color | — | — | NEEDS_SOURCE | to create (text) | vgt |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри и снаружи под защитным покрытием | — | WILL_ADD | to create (text) | vgt |
| application_method | Шпателем | — | WILL_ADD | to create (text) | vgt |
| substrates | бетон, кирпич, штукатурка, минеральные основания | — | WILL_ADD | to create (text) | vgt |
| layer_thickness | около 1 мм (оптимальная толщина) | — | WILL_ADD | to create (text) | vgt |
| consumption | 0,5–1,4 кг/м² | — | WILL_ADD | to create (text) | vgt |
| consumption_basis | по данным производителя, без фиксированного слоя | — | WILL_ADD | to create (text) | vgt |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | vgt |
| drying_time | до отлипа 2 ч; полное 24 ч при 20±2 °C, RH 65±5%, слой ≤3 мм | — | WILL_ADD | to create (text) | vgt |

- NEEDS_SOURCE: color - Цвет exact SKU не подтверждён.
- shelf_life note: numeric months 24 is source-supported.

### MAT-000053

- Current title: Шпаклевка Vetonit LR+ 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Vetonit; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Vetonit / Сухая полимерная финишная шпаклевка / 5 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая полимерная финишная шпаклевка | — | WILL_ADD | 2 (text) | vetonitLR |
| base | Сополимер ПВА ≤2,5% | — | WILL_ADD | 3 (text) | vetonitLR |
| purpose | Финиш стен и потолков под обои, окраску и декор | — | WILL_ADD | 4 (text) | vetonitLR |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | vetonitLR |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | vetonitLR |
| color | Белый | — | WILL_ADD | to create (text) | vetonitLR |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | vetonitLR |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | vetonitLR |
| substrates | цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания | — | WILL_ADD | to create (text) | vetonitLR |
| layer_thickness | 1–5 мм | — | WILL_ADD | to create (text) | vetonitLR |
| consumption | 1,2 кг/м²/мм | — | WILL_ADD | to create (text) | vetonitLR |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | vetonitLR |
| pot_life | до 72 часов после затворения | — | WILL_ADD | to create (text) | vetonitLR |
| drying_time | 24 часа | — | WILL_ADD | to create (text) | vetonitLR |
- shelf_life note: numeric months 18 is source-supported.

### MAT-000054

- Current title: Шпаклевка Vetonit LR+ 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Vetonit; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Vetonit / Сухая полимерная финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая полимерная финишная шпаклевка | — | WILL_ADD | 2 (text) | vetonitLR |
| base | Сополимер ПВА ≤2,5% | — | WILL_ADD | 3 (text) | vetonitLR |
| purpose | Финиш стен и потолков под обои, окраску и декор | — | WILL_ADD | 4 (text) | vetonitLR |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | vetonitLR |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | vetonitLR |
| color | Белый | — | WILL_ADD | to create (text) | vetonitLR |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | vetonitLR |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | vetonitLR |
| substrates | цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания | — | WILL_ADD | to create (text) | vetonitLR |
| layer_thickness | 1–5 мм | — | WILL_ADD | to create (text) | vetonitLR |
| consumption | 1,2 кг/м²/мм | — | WILL_ADD | to create (text) | vetonitLR |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | vetonitLR |
| pot_life | до 72 часов после затворения | — | WILL_ADD | to create (text) | vetonitLR |
| drying_time | 24 часа | — | WILL_ADD | to create (text) | vetonitLR |
- shelf_life note: numeric months 18 is source-supported.

### MAT-000055

- Current title: Шпаклевка Vetonit KR финиш белая 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Vetonit; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Vetonit / Сухая финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая финишная шпаклевка | — | WILL_ADD | 2 (text) | vetonitKR |
| base | Органический клей | — | WILL_ADD | 3 (text) | vetonitKR |
| purpose | Финиш стен и потолков в сухих помещениях | — | WILL_ADD | 4 (text) | vetonitKR |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | vetonitKR |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | vetonitKR |
| color | Белый | — | WILL_ADD | to create (text) | vetonitKR |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | vetonitKR |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | vetonitKR |
| substrates | бетон, гипс, оштукатуренные поверхности, ГКЛ, ГВЛ, ЦСП | — | WILL_ADD | to create (text) | vetonitKR |
| layer_thickness | 1–3 мм; локально до 4 мм | — | WILL_ADD | to create (text) | vetonitKR |
| consumption | 1,2 кг/м²/мм | — | WILL_ADD | to create (text) | vetonitKR |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | vetonitKR |
| pot_life | 30 часов; до 60 часов в закрытой таре | — | WILL_ADD | to create (text) | vetonitKR |
| drying_time | 1 сутки при 20 °C | — | WILL_ADD | to create (text) | vetonitKR |
- shelf_life note: numeric months 18 is source-supported.

### MAT-000056

- Current title: Шпаклевка полимерная финишная Vetonit JS Plus 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Vetonit; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Vetonit / Сухая полимерная финишная шпаклевка / 20 kg.
- Official identity name: Vetonit JS.
- Title issues (review only; no title write): LEGACY: Текущий title содержит JS Plus; актуальная официальная карточка — Vetonit JS. Title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая полимерная финишная шпаклевка | — | WILL_ADD | 2 (text) | vetonitJS |
| base | Сополимер ПВА ≤4% | — | WILL_ADD | 3 (text) | vetonitJS |
| purpose | Заделка швов ГКЛ и финишное выравнивание | — | WILL_ADD | 4 (text) | vetonitJS |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | vetonitJS |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | vetonitJS |
| color | Белый | — | WILL_ADD | to create (text) | vetonitJS |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих помещений | — | WILL_ADD | to create (text) | vetonitJS |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | vetonitJS |
| substrates | ГКЛ, ГВЛ, старая краска, гипсовая, цементная и известково-цементная штукатурка | — | WILL_ADD | to create (text) | vetonitJS |
| layer_thickness | 1–2 мм | — | WILL_ADD | to create (text) | vetonitJS |
| consumption | 0,1–0,2 кг/м²/мм для швов; 1,2 кг/м²/мм для сплошного шпаклевания | — | WILL_ADD | to create (text) | vetonitJS |
| consumption_basis | для швов / для сплошного слоя | — | WILL_ADD | to create (text) | vetonitJS |
| pot_life | 1–2 суток | — | WILL_ADD | to create (text) | vetonitJS |
| drying_time | 3–24 часа | — | WILL_ADD | to create (text) | vetonitJS |
- shelf_life note: numeric months 18 is source-supported.

### MAT-000057

- Current title: Шпаклевка полимерная финишная Knauf Polymer finish 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: KNAUF / Сухая полимерная финишная шпаклевка / 20 kg.
- Official identity name: КНАУФ-Полимер Финиш.
- Title issues (review only; no title write): TYPOGRAPHY: Локальная латиница Polymer finish отличается от официального написания КНАУФ-Полимер Финиш; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая полимерная финишная шпаклевка | — | WILL_ADD | 2 (text) | knaufPolymer |
| base | Полимерное вяжущее с микроволокнами | — | WILL_ADD | 3 (text) | knaufPolymer |
| purpose | Финишное выравнивание внутри помещений | — | WILL_ADD | 4 (text) | knaufPolymer |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufPolymer |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | knaufPolymer |
| color | Белый | — | WILL_ADD | to create (text) | knaufPolymer |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | knaufPolymer |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | knaufPolymer |
| substrates | бетон, ГКЛ, ГВЛ, гипсовая и цементная штукатурка | — | WILL_ADD | to create (text) | knaufPolymer |
| layer_thickness | 0,2–4 мм | — | WILL_ADD | to create (text) | knaufPolymer |
| consumption | 1,2 кг/м² при слое 1 мм | — | WILL_ADD | to create (text) | knaufPolymer |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | knaufPolymer |
| pot_life | до 24 часов; до 72 часов в закрытой емкости при t≥+10 °C | — | WILL_ADD | to create (text) | knaufPolymer |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufPolymer |

- NEEDS_SOURCE: application_temperature - Точная температура для exact SKU не подтверждена.; drying_time - Числовое время высыхания exact SKU не подтверждено.
- shelf_life note: numeric months 18 is source-supported.

### MAT-000058

- Current title: Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: ОСНОВИТ; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: ОСНОВИТ / Готовая суперфинишная полимерная шпаклевка / 28 kg.
- Official identity name: ОСНОВИТ Элисилк PA39 W.
- Title issues (review only; no title write): TYPOGRAPHY: Локальное РА39 W отличается от официального написания PA39 W; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая суперфинишная полимерная шпаклевка | — | WILL_ADD | 2 (text) | osnovit |
| base | Полимерное вяжущее, наполнитель и модифицирующие добавки | — | WILL_ADD | 3 (text) | osnovit |
| purpose | Суперфинишное выравнивание стен и потолков | — | WILL_ADD | 4 (text) | osnovit |
| package_weight | 28 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +5 до +30 °C | — | WILL_ADD | 10 (text) | osnovit |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | osnovit |
| color | Сверхбелый | — | WILL_ADD | to create (text) | osnovit |
| form | Готовая паста | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри сухих отапливаемых помещений, включая влажные зоны | — | WILL_ADD | to create (text) | osnovit |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | osnovit |
| substrates | бетон, гипсовая и цементная штукатурка, выравнивающая шпаклевка, ГКЛ, ГВЛ, ПГП, СМЛ и минеральные основания | — | WILL_ADD | to create (text) | osnovit |
| layer_thickness | 0–2 мм | — | WILL_ADD | to create (text) | osnovit |
| consumption | 1,6 кг/м² при слое 1 мм | — | WILL_ADD | to create (text) | osnovit |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | osnovit |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | osnovit |
| drying_time | 24 часа | — | WILL_ADD | to create (text) | osnovit |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000059

- Current title: Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Danogips; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Danogips / Сухая полимерная выравнивающая шпаклевка / 25 kg.
- Official identity name: Danogips Dano JET5.
- Title issues (review only; no title write): TYPOGRAPHY: Локальное Dano Jet 5 отличается от официального Dano JET5; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Сухая полимерная выравнивающая шпаклевка | — | WILL_ADD | 2 (text) | danoJet |
| base | Сополимер винилацетата | — | WILL_ADD | 3 (text) | danoJet |
| purpose | Выравнивание плоскости перед финишной отделкой или обоями | — | WILL_ADD | 4 (text) | danoJet |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | Не менее +13 °C | — | WILL_ADD | 10 (text) | danoJet |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | danoJet |
| color | — | — | NEEDS_SOURCE | to create (text) | danoJet |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | danoJet |
| application_method | Ручное и механизированное, включая безвоздушное нанесение | — | WILL_ADD | to create (text) | danoJet |
| substrates | минеральные основания | — | WILL_ADD | to create (text) | danoJet |
| layer_thickness | до 6 мм | — | WILL_ADD | to create (text) | danoJet |
| consumption | 1,2 кг/м²/мм | — | WILL_ADD | to create (text) | danoJet |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | danoJet |
| pot_life | не менее 72 часов | — | WILL_ADD | to create (text) | danoJet |
| drying_time | около 24 часов | — | WILL_ADD | to create (text) | danoJet |

- NEEDS_SOURCE: color - Цвет exact SKU не подтверждён.
- shelf_life note: numeric months 18 is source-supported.

### MAT-000060

- Current title: Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: ВОЛМА; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: ВОЛМА / Финишная шпаклевка / 19 kg.
- Official identity name: ВОЛМА-Искрит.
- Title issues (review only; no title write): SUBSTANTIVE/QUALIFIER: «мех.» не доказывает отдельный SKU: официальный продукт допускает ручное и машинное нанесение.; CLASSIFICATION_NOTE: «полимерная» в title не является установленным официальным классом: источник указывает смешанные вяжущие и полимерную составляющую до 5%.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Финишная шпаклевка | — | WILL_ADD | 2 (text) | volma |
| base | Смешанные вяжущие; полимерная составляющая до 5% массы смеси | — | WILL_ADD | 3 (text) | volma |
| purpose | Финишное выравнивание стен и потолков внутри помещений | — | WILL_ADD | 4 (text) | volma |
| package_weight | 19 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +5 до +30 °C | — | WILL_ADD | 10 (text) | volma |
| shelf_life | 18 | — | WILL_ADD | 11 (number) | volma |
| color | Белоснежный | — | WILL_ADD | to create (text) | volma |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений с нормальной относительной влажностью | — | WILL_ADD | to create (text) | volma |
| application_method | Ручное и машинное | — | WILL_ADD | to create (text) | volma |
| substrates | стены, потолки и прочие недеформирующиеся основания | — | WILL_ADD | to create (text) | volma |
| layer_thickness | 0,2–3 мм | — | WILL_ADD | to create (text) | volma |
| consumption | 1,0–1,1 кг/м² при слое 1 мм | — | WILL_ADD | to create (text) | volma |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | volma |
| pot_life | 72 часа | — | WILL_ADD | to create (text) | volma |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | volma |

- NEEDS_SOURCE: drying_time - Числовое время высыхания exact SKU не подтверждено.
- shelf_life note: numeric months 18 is source-supported.

## Definitions and templates

- Reused canonical definitions: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life.
- New TEXT definitions (default unit null): color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Definitions planned to create: color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Template audit: {"globalCount":0,"categoryCount":0,"action":"No templates created; current global/category template count is audited only."}

## Summary

```json
{
  "total": 14,
  "ready": 223,
  "partial": 7,
  "readyProducts": 7,
  "errors": 0,
  "willAdd": 209,
  "willFix": 14,
  "existingOk": 0,
  "needsSource": 8,
  "absentByDesign": 7,
  "schemaBlocked": 0,
  "logicalSlots": 238,
  "definitionsToCreate": 10
}
```

## Source registry

- **danogips**: [Danogips official](https://www.danogips.ru/katalog/gotovye_shpatlevki_danogips/super_finish) — Официальная карточка SuperFinish и инструкция производителя.
- **knaufRotband**: [KNAUF Rotband Pasta Profi](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/shpaklyevki-polimernye/knauf-rotband-pasta-profi/) — Официальная страница и информационный лист.
- **semin**: [SEMIN CE 78](https://www.semin.com/en/products/plastering-insulation/fillers/ready-use-fillers/ce-78-perfect-filler-finisher) — Официальная международная карточка; белый цвет не записывается без explicit source.
- **vgt**: [VGT universal putty](https://vgtkraska.ru/shpatlevki/shpatlevka-universalnaya) — Официальная страница производителя.
- **vetonitLR**: [Vetonit LR+](https://vetonit.com/product/vetonit_lr_20_kg/) — Официальная карточка продукта.
- **vetonitKR**: [Vetonit KR technical map](https://vetonit.com/product/60/technical-map) — Актуальная официальная техническая карта; диапазон 1–3 мм, локально до 4 мм.
- **vetonitJS**: [Vetonit JS](https://vetonit.com/product/vetonit_dzhey_es_20_kg/) — Официальная карточка JS; локальный суффикс Plus оставлен только в title.
- **knaufPolymer**: [KNAUF Полимер Финиш](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-polimer-finish/) — Официальная страница и информационный лист 20 кг.
- **osnovit**: [ОСНОВИТ Элисилк PA39 W](https://osnovit.ru/catalog/shpaklevki/elisilk-pa39-w/) — Официальная карточка и техническая карта.
- **danoJet**: [Danogips Dano JET5](https://www.danogips.ru/katalog/shpatlevka_polimernaya/danojet5) — Официальная карточка и справочные материалы.
- **volma**: [ВОЛМА Искрит](https://www.volma.ru/production/catalog/putty/volma-iskrit/) — Официальная страница; composition note confirms mixed binders and polymer component ≤5%.
- **localTitle**: Локальная карточка MatMix — Only identity/weight guard; not a technical source.
