# Шпаклевка — CORE corrective review

Проверено: 2026-09-17. Локальный dry-run; production не используется.

## Архитектура

- Scope: только core attributes и синхронизация `products.brand` с атрибутом `brand`.
- `TITLE_WRITES=0`: `products.title` используется только как identity guard; `canonicalIdentity` и `titleNormalization` — review metadata, не операции записи.
- Запись только targeted upsert; wholesale delete не используется.
- `consumption_10mm`, `coverage_30kg_10mm`, `wall_layer_thickness`, `ceiling_layer_thickness` не используются.
- `shelf_life` с текстом «не ограничен» имеет статус `SCHEMA_BLOCKED`; миграций нет.
- Templates: аудит без создания.

## Dry-run

| MAT | Current title | Brand | Core status | Source keys |
|---|---|---|---|---|
| MAT-000033 | Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг | KNAUF (WILL_ADD) | PARTIAL | knaufRotbandFinish |
| MAT-000034 | Шпаклевка гипсовая Knauf Унифлот 5 кг | KNAUF (WILL_ADD) | PARTIAL | knaufUniflottRu, knaufUniflottDe |
| MAT-000035 | Шпаклевка гипсовая Knauf Унифлот 25 кг | KNAUF (WILL_ADD) | PARTIAL | knaufUniflottRu, knaufUniflottDe |
| MAT-000036 | Шпаклевка гипсовая Knauf Фуген 25 кг | KNAUF (WILL_ADD) | PARTIAL | knaufFugenRu |
| MAT-000037 | Шпаклевка гипсовая Knauf Фуген 5 кг | KNAUF (WILL_ADD) | PARTIAL | knaufFugenRu |
| MAT-000038 | Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг | KNAUF (WILL_ADD) | PARTIAL | knaufUnihard |
| MAT-000039 | Шпаклевка гипсовая Старатели базовая 20 кг | Старатели (WILL_ADD) | READY | starBase |
| MAT-000040 | Шпаклевка гипсовая Старатели финишная 20 кг | Старатели (WILL_ADD) | READY | starFinish |
| MAT-000041 | Шпаклевка гипсовая Волма Финиш 20 кг | ВОЛМА (WILL_ADD) | PARTIAL | volmaFinish |
| MAT-000042 | Шпаклевка гипсовая финишная Волма Шелк 20 кг | ВОЛМА (WILL_ADD) | PARTIAL | volmaSilk |
| MAT-000043 | Шпаклевка гипсовая финишная Волма Arctic 20 кг | ВОЛМА (WILL_ADD) | READY | volmaArctic |
| MAT-000044 | Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг | PUFAS (WILL_ADD) | PARTIAL | pufasGlatt |
| MAT-000045 | Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг | PUFAS (WILL_ADD) | PARTIAL | pufasFullFinish |
| MAT-000046 | Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг | PUFAS (WILL_ADD) | PARTIAL | pufasFullFinish |

## Per-MAT details

### MAT-000033

- Current title: Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / Гипсовая шпаклевка / 25 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, shelf_life, form, application_area, substrates, layer_thickness, consumption, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая шпаклевка | — | WILL_ADD | 2 (text) | knaufRotbandFinish |
| base | Гипсовое вяжущее с полимерными добавками | — | WILL_ADD | 3 (text) | knaufRotbandFinish |
| purpose | Финишное выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | knaufRotbandFinish |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufRotbandFinish |
| shelf_life | 6 | — | WILL_ADD | 11 (number) | knaufRotbandFinish |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufRotbandFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufRotbandFinish |
| substrates | ГКЛ, ГВЛ, пазогребневые плиты, гипсовые и цементные штукатурки, бетон | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| layer_thickness | 0,2–5 мм | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| consumption_basis | — | — | NEEDS_SOURCE | to create (text) | knaufRotbandFinish |
| pot_life | не менее 70 минут | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufRotbandFinish |

- NEEDS_SOURCE: application_temperature - Точная температура применения для exact редакции не подтверждена в использованной карточке.; color - Цвет exact фасовки не зафиксирован в текстовой карточке.; application_method - Способ нанесения exact SKU не указан однозначно.; consumption_basis - Источник указывает расход, но не фиксирует толщину слоя для этого значения; базис нельзя выводить.; drying_time - Точное время высыхания exact условиями не подтверждено.
- shelf_life note: numeric months 6 is source-supported.

### MAT-000034

- Current title: Шпаклевка гипсовая Knauf Унифлот 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / — / 5 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, package_weight, form
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | — | — | NEEDS_SOURCE | 2 (text) | knaufUniflottRu, knaufUniflottDe |
| base | — | — | NEEDS_SOURCE | 3 (text) | knaufUniflottRu, knaufUniflottDe |
| purpose | — | — | NEEDS_SOURCE | 4 (text) | knaufUniflottRu, knaufUniflottDe |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufUniflottRu, knaufUniflottDe |
| shelf_life | — | — | NEEDS_SOURCE | 11 (number) | knaufUniflottRu, knaufUniflottDe |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| substrates | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| layer_thickness | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| consumption | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| consumption_basis | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| pot_life | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottDe |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottDe |

- NEEDS_SOURCE: product_type - Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven.; base - Foreign-market source; exact Russian formulation is not proven.; purpose - Foreign-market source; exact Russian SKU purpose is not proven.; application_temperature - Exact Russian SKU temperature is not proven; foreign-market values retained as research only.; shelf_life - 9 months is foreign-market data; exact Russian SKU applicability is not proven.; color - Цвет exact SKU не подтверждён.; application_area - Foreign-market source; exact Russian SKU application area is not proven.; application_method - Foreign-market source; exact Russian SKU method is not proven.; substrates - Foreign-market source; exact Russian SKU substrates are not proven.; layer_thickness - Диапазон толщины exact Russian SKU не подтверждён.; consumption - Foreign-market consumption cannot be copied to the Russian SKU.; consumption_basis - Foreign-market consumption basis cannot be copied to the Russian SKU.; pot_life - 45 minutes is DE/AT data; exact Russian SKU applicability is not proven.; drying_time - 24 hours/mm is DE/AT data; exact Russian SKU applicability is not proven.
- shelf_life note: numeric months null is source-supported.

### MAT-000035

- Current title: Шпаклевка гипсовая Knauf Унифлот 25 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / — / 25 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, package_weight, form
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | — | — | NEEDS_SOURCE | 2 (text) | knaufUniflottRu, knaufUniflottDe |
| base | — | — | NEEDS_SOURCE | 3 (text) | knaufUniflottRu, knaufUniflottDe |
| purpose | — | — | NEEDS_SOURCE | 4 (text) | knaufUniflottRu, knaufUniflottDe |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufUniflottRu, knaufUniflottDe |
| shelf_life | — | — | NEEDS_SOURCE | 11 (number) | knaufUniflottRu, knaufUniflottDe |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| substrates | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| layer_thickness | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| consumption | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| consumption_basis | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottRu, knaufUniflottDe |
| pot_life | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottDe |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufUniflottDe |

- NEEDS_SOURCE: product_type - Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven.; base - Foreign-market source; exact Russian formulation is not proven.; purpose - Foreign-market source; exact Russian SKU purpose is not proven.; application_temperature - Exact Russian SKU temperature is not proven; foreign-market values retained as research only.; shelf_life - 9 months is foreign-market data; exact Russian SKU applicability is not proven.; color - Цвет exact SKU не подтверждён.; application_area - Foreign-market source; exact Russian SKU application area is not proven.; application_method - Foreign-market source; exact Russian SKU method is not proven.; substrates - Foreign-market source; exact Russian SKU substrates are not proven.; layer_thickness - Диапазон толщины exact Russian SKU не подтверждён.; consumption - Foreign-market consumption cannot be copied to the Russian SKU.; consumption_basis - Foreign-market consumption basis cannot be copied to the Russian SKU.; pot_life - 45 minutes is DE/AT data; exact Russian SKU applicability is not proven.; drying_time - 24 hours/mm is DE/AT data; exact Russian SKU applicability is not proven.
- shelf_life note: numeric months null is source-supported.

### MAT-000036

- Current title: Шпаклевка гипсовая Knauf Фуген 25 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / Гипсовая шпаклевка / 25 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, shelf_life, form, application_area, substrates, layer_thickness, consumption, consumption_basis
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая шпаклевка | — | WILL_ADD | 2 (text) | knaufFugenRu |
| base | Гипсовое вяжущее с полимерными добавками | — | WILL_ADD | 3 (text) | knaufFugenRu |
| purpose | Заделка швов и выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | knaufFugenRu |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufFugenRu |
| shelf_life | 6 | — | WILL_ADD | 11 (number) | knaufFugenRu |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| substrates | ГКЛ, ГВЛ, бетон, штукатурка | — | WILL_ADD | to create (text) | knaufFugenRu |
| layer_thickness | 1–5 мм | — | WILL_ADD | to create (text) | knaufFugenRu |
| consumption | 0,8–1,0 кг/м² | — | WILL_ADD | to create (text) | knaufFugenRu |
| consumption_basis | при толщине слоя 1 мм; для швов ГКЛ 0,25 кг/м² | — | WILL_ADD | to create (text) | knaufFugenRu |
| pot_life | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |

- NEEDS_SOURCE: application_temperature - Температура применения не указана на проверенной странице.; color - Цвет не зафиксирован в карточке.; application_method - Способ нанесения exact SKU не указан однозначно.; pot_life - Время жизнеспособности замеса exact фасовки не подтверждено.; drying_time - Время высыхания не подтверждено.
- shelf_life note: numeric months 6 is source-supported.

### MAT-000037

- Current title: Шпаклевка гипсовая Knauf Фуген 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / Гипсовая шпаклевка / 5 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, shelf_life, form, application_area, substrates, layer_thickness, consumption, consumption_basis
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая шпаклевка | — | WILL_ADD | 2 (text) | knaufFugenRu |
| base | Гипсовое вяжущее с полимерными добавками | — | WILL_ADD | 3 (text) | knaufFugenRu |
| purpose | Заделка швов и выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | knaufFugenRu |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufFugenRu |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | knaufFugenRu |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| substrates | ГКЛ, ГВЛ, бетон, штукатурка | — | WILL_ADD | to create (text) | knaufFugenRu |
| layer_thickness | 1–5 мм | — | WILL_ADD | to create (text) | knaufFugenRu |
| consumption | 0,8–1,0 кг/м² | — | WILL_ADD | to create (text) | knaufFugenRu |
| consumption_basis | при толщине слоя 1 мм; для швов ГКЛ 0,25 кг/м² | — | WILL_ADD | to create (text) | knaufFugenRu |
| pot_life | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufFugenRu |

- NEEDS_SOURCE: application_temperature - Температура применения не указана на проверенной странице.; color - Цвет не зафиксирован в карточке.; application_method - Способ нанесения exact SKU не указан однозначно.; pot_life - Время жизнеспособности замеса exact фасовки не подтверждено.; drying_time - Время высыхания не подтверждено.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000038

- Current title: Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF - WILL_ADD; product column and attribute are planned together.
- Canonical identity: KNAUF / Высокопрочная гипсовая шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, shelf_life, form, application_area
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Высокопрочная гипсовая шпаклевка | — | WILL_ADD | 2 (text) | knaufUnihard |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | knaufUnihard |
| purpose | Выравнивание и финишная подготовка поверхностей внутри помещений | — | WILL_ADD | 4 (text) | knaufUnihard |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | knaufUnihard |
| shelf_life | 6 | — | WILL_ADD | 11 (number) | knaufUnihard |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | knaufRotbandFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| substrates | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| layer_thickness | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| consumption | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| consumption_basis | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| pot_life | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufUnihard |

- NEEDS_SOURCE: application_temperature - Температура применения exact SKU не подтверждена.; color - Цвет не зафиксирован.; application_method - Способ нанесения exact SKU не подтверждён.; substrates - Перечень оснований exact версии не подтверждён.; layer_thickness - Диапазон слоя не подтверждён.; consumption - Расход exact версии не подтверждён.; consumption_basis - Основание расхода не подтверждено.; pot_life - Жизнеспособность не подтверждена.; drying_time - Время высыхания не подтверждено.
- shelf_life note: numeric months 6 is source-supported.

### MAT-000039

- Current title: Шпаклевка гипсовая Старатели базовая 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Старатели - WILL_ADD; product column and attribute are planned together.
- Canonical identity: Старатели / Гипсовая базовая шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая базовая шпаклевка | — | WILL_ADD | 2 (text) | starBase |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | starBase |
| purpose | Базовое выравнивание стен и потолков внутри помещений | — | WILL_ADD | 4 (text) | starBase |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | starBase |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | starBase |
| color | Белый | — | WILL_ADD | to create (text) | starBase |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений с нормальной влажностью | — | WILL_ADD | to create (text) | starBase |
| application_method | Ручное и механизированное нанесение | — | WILL_ADD | to create (text) | starBase |
| substrates | Бетон, кирпич, цементная и гипсовая штукатурка, ПГП, ГКЛ, ГВЛ | — | WILL_ADD | to create (text) | starBase |
| layer_thickness | 1–10 мм | — | WILL_ADD | to create (text) | starBase |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | starBase |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | starBase |
| pot_life | не менее 1 часа | — | WILL_ADD | to create (text) | starBase |
| drying_time | около 24 часов до готовности | — | WILL_ADD | to create (text) | starBase |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000040

- Current title: Шпаклевка гипсовая Старатели финишная 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Старатели - WILL_ADD; product column and attribute are planned together.
- Canonical identity: Старатели / Гипсовая финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая финишная шпаклевка | — | WILL_ADD | 2 (text) | starFinish |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | starFinish |
| purpose | Финишное выравнивание стен и потолков внутри помещений | — | WILL_ADD | 4 (text) | starFinish |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | starFinish |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | starFinish |
| color | Белый | — | WILL_ADD | to create (text) | starFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений с нормальной влажностью | — | WILL_ADD | to create (text) | starFinish |
| application_method | Ручное и механизированное нанесение | — | WILL_ADD | to create (text) | starFinish |
| substrates | Бетон, кирпич, гипсовая и цементная штукатурка, ПГП, ГКЛ, ГВЛ | — | WILL_ADD | to create (text) | starFinish |
| layer_thickness | 0,3–5 мм | — | WILL_ADD | to create (text) | starFinish |
| consumption | 0,9 кг/м² | — | WILL_ADD | to create (text) | starFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | starFinish |
| pot_life | не менее 1 часа | — | WILL_ADD | to create (text) | starFinish |
| drying_time | около 24 часов до готовности | — | WILL_ADD | to create (text) | starFinish |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000041

- Current title: Шпаклевка гипсовая Волма Финиш 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: ВОЛМА - WILL_ADD; product column and attribute are planned together.
- Canonical identity: ВОЛМА / Гипсовая финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая финишная шпаклевка | — | WILL_ADD | 2 (text) | volmaFinish |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | volmaFinish |
| purpose | Финишное выравнивание стен и потолков внутри помещений | — | WILL_ADD | 4 (text) | volmaFinish |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +5 до +30 °C | — | WILL_ADD | 10 (text) | volmaFinish |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | volmaFinish |
| color | — | — | NEEDS_SOURCE | to create (text) | volmaFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | volmaFinish |
| application_method | Ручное нанесение | — | WILL_ADD | to create (text) | volmaFinish |
| substrates | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | WILL_ADD | to create (text) | volmaFinish |
| layer_thickness | 0,2–3 мм; максимум 5 мм | — | WILL_ADD | to create (text) | volmaFinish |
| consumption | 0,9–1,0 кг/м² | — | WILL_ADD | to create (text) | volmaFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | volmaFinish |
| pot_life | около 100 минут | — | WILL_ADD | to create (text) | volmaFinish |
| drying_time | 5–7 часов | — | WILL_ADD | to create (text) | volmaFinish |

- NEEDS_SOURCE: color - Цвет exact фасовки отдельно не указан.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000042

- Current title: Шпаклевка гипсовая финишная Волма Шелк 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: ВОЛМА - WILL_ADD; product column and attribute are planned together.
- Canonical identity: ВОЛМА / Гипсовая финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая финишная шпаклевка | — | WILL_ADD | 2 (text) | volmaSilk |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | volmaSilk |
| purpose | Финишное выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | volmaSilk |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +5 до +30 °C | — | WILL_ADD | 10 (text) | volmaSilk |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | volmaSilk |
| color | — | — | NEEDS_SOURCE | to create (text) | volmaSilk |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений с нормальной влажностью | — | WILL_ADD | to create (text) | volmaSilk |
| application_method | Ручное нанесение | — | WILL_ADD | to create (text) | volmaSilk |
| substrates | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | WILL_ADD | to create (text) | volmaSilk |
| layer_thickness | 0,2–3 мм; максимум 5 мм | — | WILL_ADD | to create (text) | volmaSilk |
| consumption | 0,9–1,0 кг/м² | — | WILL_ADD | to create (text) | volmaSilk |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | volmaSilk |
| pot_life | около 60 минут | — | WILL_ADD | to create (text) | volmaSilk |
| drying_time | 5–7 часов | — | WILL_ADD | to create (text) | volmaSilk |

- NEEDS_SOURCE: color - Цвет exact фасовки не указан в TDS.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000043

- Current title: Шпаклевка гипсовая финишная Волма Arctic 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: ВОЛМА - WILL_ADD; product column and attribute are planned together.
- Canonical identity: ВОЛМА / Гипсовая финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая финишная шпаклевка | — | WILL_ADD | 2 (text) | volmaArctic |
| base | Гипсовое вяжущее | — | WILL_ADD | 3 (text) | volmaArctic |
| purpose | Финишное выравнивание стен и потолков внутри помещений | — | WILL_ADD | 4 (text) | volmaArctic |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +5 до +30 °C | — | WILL_ADD | 10 (text) | volmaArctic |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | volmaArctic |
| color | Белый / снежно-белый | — | WILL_ADD | to create (text) | volmaArctic |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений с нормальной влажностью | — | WILL_ADD | to create (text) | volmaArctic |
| application_method | Ручное и механизированное нанесение | — | WILL_ADD | to create (text) | volmaArctic |
| substrates | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | WILL_ADD | to create (text) | volmaArctic |
| layer_thickness | 0,2–3 мм; максимум 5 мм | — | WILL_ADD | to create (text) | volmaArctic |
| consumption | 0,9–1,0 кг/м² | — | WILL_ADD | to create (text) | volmaArctic |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | volmaArctic |
| pot_life | не менее 60 минут | — | WILL_ADD | to create (text) | volmaArctic |
| drying_time | 5–7 часов | — | WILL_ADD | to create (text) | volmaArctic |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000044

- Current title: Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: PUFAS - WILL_ADD; product column and attribute are planned together.
- Canonical identity: PUFAS / Гипсовая армированная шпаклевка / 25 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, color, form, application_area, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая армированная шпаклевка | — | WILL_ADD | 2 (text) | pufasGlatt |
| base | Гипсовое вяжущее с целлюлозным армированием | — | WILL_ADD | 3 (text) | pufasGlatt |
| purpose | Заполнение и выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | pufasGlatt |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | pufasGlatt |
| shelf_life | — | — | SCHEMA_BLOCKED | 11 (number) | pufasGlatt |
| color | Белый | — | WILL_ADD | to create (text) | pufasGlatt |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | pufasGlatt |
| application_method | — | — | NEEDS_SOURCE | to create (text) | pufasGlatt |
| substrates | Минеральные основания, кирпич, бетон, штукатурка, ГКЛ, ГВЛ | — | WILL_ADD | to create (text) | pufasGlatt |
| layer_thickness | от 0 до 15 см и более | — | WILL_ADD | to create (text) | pufasGlatt |
| consumption | 0,8–1 кг/м² | — | WILL_ADD | to create (text) | pufasGlatt |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | pufasGlatt |
| pot_life | около 60 минут | — | WILL_ADD | to create (text) | pufasGlatt |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | pufasGlatt |

- NEEDS_SOURCE: application_temperature - Температура применения не указана в использованном TDS.; application_method - Способ нанесения exact SKU не указан однозначно.; drying_time - Время высыхания зависит от толщины/условий; точное значение не подтверждено.

- SCHEMA_BLOCKED: shelf_life - В официальном источнике указано, что срок хранения неначатой упаковки не ограничен в сухом месте; числовая схема месяцев это не представляет.
- shelf_life note: unlimited/textual source is intentionally not coerced to numeric months.

### MAT-000045

- Current title: Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: PUFAS - WILL_ADD; product column and attribute are planned together.
- Canonical identity: PUFAS / Гипсовая заполняющая и финишная шпаклевка / 5 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, color, form, application_area, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая заполняющая и финишная шпаклевка | — | WILL_ADD | 2 (text) | pufasFullFinish |
| base | Гипсовое вяжущее с целлюлозным армированием | — | WILL_ADD | 3 (text) | pufasFullFinish |
| purpose | Заполнение и финишное выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | pufasFullFinish |
| package_weight | 5 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | pufasFullFinish |
| shelf_life | — | — | SCHEMA_BLOCKED | 11 (number) | pufasFullFinish |
| color | Белый | — | WILL_ADD | to create (text) | pufasFullFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | pufasFullFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | pufasFullFinish |
| substrates | Минеральные основания, штукатурка, бетон, кладка, газобетон, ГКЛ | — | WILL_ADD | to create (text) | pufasFullFinish |
| layer_thickness | до 15 см и более; с растушёвкой до нуля | — | WILL_ADD | to create (text) | pufasFullFinish |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | pufasFullFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | pufasFullFinish |
| pot_life | около 60 минут | — | WILL_ADD | to create (text) | pufasFullFinish |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | pufasFullFinish |

- NEEDS_SOURCE: application_temperature - Температура применения не указана в использованном TDS.; application_method - Способ нанесения exact SKU не указан однозначно.; drying_time - Зависит от толщины и условий; точное время не подтверждено.

- SCHEMA_BLOCKED: shelf_life - Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается.
- shelf_life note: unlimited/textual source is intentionally not coerced to numeric months.

### MAT-000046

- Current title: Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: PUFAS - WILL_ADD; product column and attribute are planned together.
- Canonical identity: PUFAS / Гипсовая заполняющая и финишная шпаклевка / 20 kg.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, color, form, application_area, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Гипсовая заполняющая и финишная шпаклевка | — | WILL_ADD | 2 (text) | pufasFullFinish |
| base | Гипсовое вяжущее с целлюлозным армированием | — | WILL_ADD | 3 (text) | pufasFullFinish |
| purpose | Заполнение и финишное выравнивание поверхностей внутри помещений | — | WILL_ADD | 4 (text) | pufasFullFinish |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | — | — | NEEDS_SOURCE | 10 (text) | pufasFullFinish |
| shelf_life | — | — | SCHEMA_BLOCKED | 11 (number) | pufasFullFinish |
| color | Белый | — | WILL_ADD | to create (text) | pufasFullFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | localTitle |
| application_area | Внутри помещений | — | WILL_ADD | to create (text) | pufasFullFinish |
| application_method | — | — | NEEDS_SOURCE | to create (text) | pufasFullFinish |
| substrates | Минеральные основания, штукатурка, бетон, кладка, газобетон, ГКЛ | — | WILL_ADD | to create (text) | pufasFullFinish |
| layer_thickness | до 15 см и более; с растушёвкой до нуля | — | WILL_ADD | to create (text) | pufasFullFinish |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | pufasFullFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | pufasFullFinish |
| pot_life | около 60 минут | — | WILL_ADD | to create (text) | pufasFullFinish |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | pufasFullFinish |

- NEEDS_SOURCE: application_temperature - Температура применения не указана в использованном TDS.; application_method - Способ нанесения exact SKU не указан однозначно.; drying_time - Зависит от толщины и условий; точное время не подтверждено.

- SCHEMA_BLOCKED: shelf_life - Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается.
- shelf_life note: unlimited/textual source is intentionally not coerced to numeric months.

## Definitions and templates

- Reused canonical definitions: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life.
- New TEXT definitions (default unit null): color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Definitions planned to create: color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Template audit: {"globalCount":0,"categoryCount":0,"action":"No templates created; current global/category template count is audited only."}

## Summary

```json
{
  "total": 14,
  "ready": 3,
  "partial": 11,
  "errors": 0,
  "willAdd": 172,
  "willFix": 0,
  "existingOk": 0,
  "needsSource": 63,
  "schemaBlocked": 3,
  "definitionsToCreate": 10
}
```

## Source registry

- **knaufRotbandFinish**: [KNAUF Ротбанд Финиш](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-rotband-finish/) — Официальная страница продукта; свойства приведены только для соответствующего семейства.
- **knaufUniflottRu**: [KNAUF Унифлот RU/UZ](https://knauf.com/ru-UZ/p/produkt/knauf-uniflot-10132_0604) [market: RU-UZ (не российская карточка)] — Официальная карточка продукта; варианты 5/25 кг и материал указаны производителем. Используется как research note; exact RU SKU не доказан.
- **knaufUniflottDe**: [KNAUF Uniflott DE/AT](https://knauf.com/de-AT/p/produkt/uniflott-10132_0070) [market: DE/AT] — Официальная региональная карточка; используется только как research note/corroboration идентичности, не как доказательство российского SKU.
- **knaufFugenRu**: [KNAUF Фуген](https://www.knauf.ru/catalog/shpaklyevki/shpaklyevki-gipsovye/knauf-fugen/) — Официальная российская страница продукта и фасовок.
- **knaufUnihard**: [KNAUF УниХард](https://www.knauf.ru/catalog/shpaklyevki/shpaklyevki-gipsovye/knauf-unikhard/) — Официальная карточка продукта; exact 20 кг проверяется по маркировке/каталогу.
- **starBase**: [Старатели Базовая гипсовая](https://www.starateli.ru/good/show/152/) — Текущая официальная страница: гипсовая базовая шпаклевка, мешок 20 кг.
- **starFinish**: [Старатели Финишная гипсовая](https://www.starateli.ru/good/show/60/) — Текущая официальная страница: гипсовая финишная шпаклевка, мешок 20 кг.
- **volmaFinish**: [ВОЛМА-Финиш](https://www.volma.ru/production/catalog/putty/volma-finish-finish-plaster/) — Официальная страница продукта; дополнительная документация производителя доступна в каталоге.
- **volmaSilk**: [ВОЛМА-ШЕЛК TDS](https://www.volma.ru/upload/iblock/590/5908ad985839daa82335e6eb757acca8.pdf) — Официальный TDS: фасовки 20/25 кг и характеристики ВОЛМА-ШЕЛК.
- **volmaArctic**: [ВОЛМА Arctic](https://www.volma.ru/production/catalog/putty/volma-arctic/) — Официальная страница продукта; белая гипсовая финишная шпаклевка.
- **pufasGlatt**: [PUFAS Glatt+Füll GFS 25 kg](https://www.pufas.com/org/products/filling-and-smoothing/glatt-und-fullspachtel-gfs/25kg/) — Официальная страница 25 кг, article 003203000/EAN 4007954032039.
- **pufasFullFinish**: [PUFAS Full+Finish Spachtel TDS](https://www.pufas.com/site/assets/files/3223/tds_p_full_finish_spachtel_ru.pdf) — Официальный русскоязычный TDS: фасовки 5/20 кг и свойства exact продукта.
- **localTitle**: Локальная карточка MatMix — Только для проверки external_id/title/массы; не production truth и не источник свойств.
