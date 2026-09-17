# Шпаклевка — CORE corrective review (batch 3)

Проверено: 2026-09-17. Локальный dry-run; production не используется. Scope: MAT-000061…MAT-000065.

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
| MAT-000061 | Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг | KNAUF (product: WILL_FIX; attribute: WILL_ADD) | PARTIAL | knaufMultiFinish, localTitle |
| MAT-000062 | Шпаклевка цементная базовая Старатели 20 кг | Старатели (product: WILL_FIX; attribute: WILL_ADD) | READY | starBaseCement, localTitle |
| MAT-000063 | Шпаклевка цементная фасадно финишная Старатели 20 кг | Старатели (product: WILL_FIX; attribute: WILL_ADD) | READY | starFacadeFinish, localTitle |
| MAT-000064 | Шпаклевка Vetonit VH для влажных помещений белая 20 кг | Vetonit (product: WILL_FIX; attribute: WILL_ADD) | READY | vetonitVH, localTitle |
| MAT-000065 | Шпаклевка по дереву VGT Белая 1 кг | VGT (product: WILL_FIX; attribute: WILL_ADD) | READY | vgtExtraWood, localTitle |

## Per-MAT details

### MAT-000061

- Current title: Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: KNAUF; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: KNAUF / Цементная фасадная шпаклёвка / 25 kg.
- Official identity name: КНАУФ-Мульти-Финиш.
- Title issues (review only; no title write): TYPOGRAPHY: Локальное «Мультифиниш» отличается от официального «КНАУФ-Мульти-Финиш»; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Цементная фасадная шпаклёвка | — | WILL_ADD | 2 (text) | knaufMultiFinish |
| base | Цемент, минеральный наполнитель, полимерные добавки, армирующее волокно | — | WILL_ADD | 3 (text) | knaufMultiFinish |
| purpose | Выравнивание бетонных и цементных поверхностей, ремонт и заполнение дефектов | — | WILL_ADD | 4 (text) | knaufMultiFinish |
| package_weight | 25 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | Не менее +5 °C | — | WILL_ADD | 10 (text) | knaufMultiFinish |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | knaufMultiFinish |
| color | — | — | NEEDS_SOURCE | to create (text) | knaufMultiFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | knaufMultiFinish |
| application_area | Наружные и внутренние работы, включая влажные помещения | — | WILL_ADD | to create (text) | knaufMultiFinish |
| application_method | Ручное нанесение | — | WILL_ADD | to create (text) | knaufMultiFinish |
| substrates | Бетон, цементные штукатурки | — | WILL_ADD | to create (text) | knaufMultiFinish |
| layer_thickness | 1–3 мм; локально до 5 мм | — | WILL_ADD | to create (text) | knaufMultiFinish |
| consumption | 1,2 кг/м² | — | WILL_ADD | to create (text) | knaufMultiFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | knaufMultiFinish |
| pot_life | не менее 3 часов | — | WILL_ADD | to create (text) | knaufMultiFinish |
| drying_time | — | — | NEEDS_SOURCE | to create (text) | knaufMultiFinish |

- NEEDS_SOURCE: color - Официальный продукт выпускается в белом и сером вариантах; exact вариант локальной карточки не установлен.; drying_time - Точное время высыхания для exact SKU/условий не подтверждено.
- shelf_life note: numeric months 12 is source-supported.

### MAT-000062

- Current title: Шпаклевка цементная базовая Старатели 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Старатели; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Старатели / Цементная шпатлёвка базовая / 20 kg.
- Official identity name: Шпатлёвка цементная «Базовая» ГОСТ 33699-2015.
- Title issues (review only; no title write): QUALIFIER/TYPOGRAPHY: Локальное описательное имя отличается от официального «Шпатлевка цементная «Базовая»»; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Цементная шпатлёвка базовая | — | WILL_ADD | 2 (text) | starBaseCement |
| base | Белый цемент с минеральными наполнителями и модифицирующими добавками | — | WILL_ADD | 3 (text) | starBaseCement |
| purpose | Выравнивание стен и потолков | — | WILL_ADD | 4 (text) | starBaseCement |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | starBaseCement |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | starBaseCement |
| color | Светло-бежевый | — | WILL_ADD | to create (text) | starBaseCement |
| form | Сухая смесь | — | WILL_ADD | to create (text) | starBaseCement |
| application_area | Внутри помещений, нормальная и повышенная влажность | — | WILL_ADD | to create (text) | starBaseCement |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | starBaseCement |
| substrates | Бетон, железобетон, ячеистый бетон, кирпич, цементная штукатурка | — | WILL_ADD | to create (text) | starBaseCement |
| layer_thickness | 0,8–8 мм | — | WILL_ADD | to create (text) | starBaseCement |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | starBaseCement |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | starBaseCement |
| pot_life | не менее 3 часов | — | WILL_ADD | to create (text) | starBaseCement |
| drying_time | 24 часа до последующей обработки | — | WILL_ADD | to create (text) | starBaseCement |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000063

- Current title: Шпаклевка цементная фасадно финишная Старатели 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Старатели; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Старатели / Цементная фасадно-финишная шпатлёвка / 20 kg.
- Official identity name: Шпатлёвка цементная «Фасадно-финишная» ГОСТ 33699-2015.
- Title issues (review only; no title write): TYPOGRAPHY: В локальном title отсутствует дефис в «фасадно финишная»; title не меняется.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Цементная фасадно-финишная шпатлёвка | — | WILL_ADD | 2 (text) | starFacadeFinish |
| base | Белый цемент с минеральными наполнителями и модифицирующими добавками | — | WILL_ADD | 3 (text) | starFacadeFinish |
| purpose | Финишное выравнивание фасадов, стен и потолков | — | WILL_ADD | 4 (text) | starFacadeFinish |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | starFacadeFinish |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | starFacadeFinish |
| color | Белый | — | WILL_ADD | to create (text) | starFacadeFinish |
| form | Сухая смесь | — | WILL_ADD | to create (text) | starFacadeFinish |
| application_area | Наружные и внутренние работы, включая влажные и неотапливаемые помещения | — | WILL_ADD | to create (text) | starFacadeFinish |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | starFacadeFinish |
| substrates | Бетон, цементные штукатурки, крупнозернистые шпатлёвки; допускаются ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон | — | WILL_ADD | to create (text) | starFacadeFinish |
| layer_thickness | 0,3–3 мм | — | WILL_ADD | to create (text) | starFacadeFinish |
| consumption | 1 кг/м² | — | WILL_ADD | to create (text) | starFacadeFinish |
| consumption_basis | при толщине слоя 1 мм | — | WILL_ADD | to create (text) | starFacadeFinish |
| pot_life | не менее 3 часов | — | WILL_ADD | to create (text) | starFacadeFinish |
| drying_time | 24 часа до последующей обработки | — | WILL_ADD | to create (text) | starFacadeFinish |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000064

- Current title: Шпаклевка Vetonit VH для влажных помещений белая 20 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: Vetonit; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: Vetonit / Цементная влагостойкая шпаклёвка / 20 kg.
- Official identity name: Vetonit ВХ.
- Title issues (review only; no title write): LEGACY/TYPOGRAPHY: Локальное Latin VH отличается от текущего официального Cyrillic ВХ; title не меняется.; QUALIFIER: «для влажных помещений» и «белая» подтверждены официальным источником.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Цементная влагостойкая шпаклёвка | — | WILL_ADD | 2 (text) | vetonitVH |
| base | Цемент, молотый мрамор, функциональные добавки | — | WILL_ADD | 3 (text) | vetonitVH |
| purpose | Финишное выравнивание стен и потолков под окраску и обои | — | WILL_ADD | 4 (text) | vetonitVH |
| package_weight | 20 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | от +10 до +30 °C | — | WILL_ADD | 10 (text) | vetonitVH |
| shelf_life | 12 | — | WILL_ADD | 11 (number) | vetonitVH |
| color | Белый | — | WILL_ADD | to create (text) | vetonitVH |
| form | Сухая смесь | — | WILL_ADD | to create (text) | vetonitVH |
| application_area | Сухие и влажные помещения, фасады | — | WILL_ADD | to create (text) | vetonitVH |
| application_method | Ручное и механизированное | — | WILL_ADD | to create (text) | vetonitVH |
| substrates | Цементные и цементно-известковые штукатурки, ГКЛ, ГВЛ | — | WILL_ADD | to create (text) | vetonitVH |
| layer_thickness | 1–4 мм | — | WILL_ADD | to create (text) | vetonitVH |
| consumption | 1,2 кг/м²/мм | — | WILL_ADD | to create (text) | vetonitVH |
| consumption_basis | на 1 мм слоя | — | WILL_ADD | to create (text) | vetonitVH |
| pot_life | 1,5 часа после затворения | — | WILL_ADD | to create (text) | vetonitVH |
| drying_time | 1–2 суток для одного слоя | — | WILL_ADD | to create (text) | vetonitVH |
- shelf_life note: numeric months 12 is source-supported.

### MAT-000065

- Current title: Шпаклевка по дереву VGT Белая 1 кг
- Identity: IDENTITY_CONFIRMED
- Category guard: Смеси / Шпаклевка
- Brand: VGT; product column: WILL_FIX; brand attribute: WILL_ADD. These storage targets are planned independently and postchecked together.
- Canonical identity: VGT / Готовая шпаклёвка по дереву / 1 kg.
- Official identity name: VGT «Шпатлевка Экстра по дереву».
- Title issues (review only; no title write): SUBSTANTIVE: Локальное title не содержит официальное «Экстра»; title не меняется.; PACKAGING/VARIANT: «Белая» — подтверждённый цветовой вариант официальной карточки.
- Title normalization: KEEP_UNCHANGED; Exact local title is an identity guard; title/category are review-only in this pass.
- Stored/planned fields: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life, color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, drying_time
- Not stored: title, slug, category, subcategory, weight, price, stock_status, image, image_url, description, short_description, full_description, seo_title, seo_description, consumption_10mm, coverage_30kg_10mm, wall_layer_thickness, ceiling_layer_thickness

| Code | Proposed | Current | Status | Definition | Sources / reason |
|---|---|---|---|---|---|
| product_type | Готовая шпаклёвка по дереву | — | WILL_ADD | 2 (text) | vgtExtraWood |
| base | Водная дисперсия стирол-акрилового полимера, наполнитель, модифицирующие добавки, пигмент | — | WILL_ADD | 3 (text) | vgtExtraWood |
| purpose | Заполнение и выравнивание деревянных поверхностей | — | WILL_ADD | 4 (text) | vgtExtraWood |
| package_weight | 1 | — | WILL_ADD | 5 (number) | localTitle |
| application_temperature | Не ниже +7 °C | — | WILL_ADD | 10 (text) | vgtExtraWood |
| shelf_life | 24 | — | WILL_ADD | 11 (number) | vgtExtraWood |
| color | Белая | — | WILL_ADD | to create (text) | vgtExtraWood |
| form | Готовая паста | — | WILL_ADD | to create (text) | vgtExtraWood |
| application_area | Внутренние и наружные работы | — | WILL_ADD | to create (text) | vgtExtraWood |
| application_method | Шпатель | — | WILL_ADD | to create (text) | vgtExtraWood |
| substrates | Деревянные поверхности | — | WILL_ADD | to create (text) | vgtExtraWood |
| layer_thickness | около 1 мм (оптимально); локальное заполнение неровностей до 7 мм | — | WILL_ADD | to create (text) | vgtExtraWood |
| consumption | 0,5–1,4 кг/м² | — | WILL_ADD | to create (text) | vgtExtraWood |
| consumption_basis | по данным производителя, без фиксированной толщины слоя | — | WILL_ADD | to create (text) | vgtExtraWood |
| pot_life | — | — | ABSENT_BY_DESIGN | to create (text) | vgtExtraWood |
| drying_time | до отлипа 2 часа; полное высыхание 24 часа при +20±2 °C, RH ≤65%, слой ≤2 мм | — | WILL_ADD | to create (text) | vgtExtraWood |
- shelf_life note: numeric months 24 is source-supported.

## Definitions and templates

- Reused canonical definitions: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life.
- New TEXT definitions (default unit null): color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Definitions planned to create: color, form, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time.
- Template audit: {"globalCount":0,"categoryCount":0,"action":"No templates created; current global/category template count is audited only."}

## Summary

```json
{
  "total": 5,
  "ready": 82,
  "partial": 1,
  "readyProducts": 4,
  "errors": 0,
  "willAdd": 77,
  "willFix": 5,
  "existingOk": 0,
  "needsSource": 2,
  "absentByDesign": 1,
  "schemaBlocked": 0,
  "logicalSlots": 85,
  "definitionsToCreate": 10
}
```

## Source registry

- **knaufMultiFinish**: [KNAUF-Мульти-Финиш — официальный сайт и TDS](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-multi-finish/) — Официальная карточка продукта; белая TDS: https://www.knauf.ru/upload/iblock/a6f/znbug54f7lfpmcp0h0bw9bl9oiboa70i/25_IL_KNAUF_Multi_Finish_belyy_25_03_2025_v01_Preview.pdf. Цвет exact local variant и точное время высыхания не установлены.
- **starBaseCement**: [Старатели — цементная Базовая](https://www.starateli.ru/catalog/229-229/) — Официальная карточка цементной шпатлевки «Базовая» ГОСТ 33699-2015, фасовка 20 кг.
- **starFacadeFinish**: [Старатели — цементная Фасадно-финишная](https://www.starateli.ru/good/show/59/) — Официальная карточка цементной шпатлевки «Фасадно-финишная» ГОСТ 33699-2015, фасовка 20 кг.
- **vetonitVH**: [Vetonit ВХ 20 кг — официальный сайт и TDS](https://vetonit.com/product/vetonit_vkh_20_kg/) — Официальная карточка Vetonit ВХ 20 кг; TDS: https://vetonit.com/upload/iblock/5c0/pd6sfdysuk62adx6p07bk210y3o6iu7q.pdf. Локальное VH — legacy spelling; title не меняется.
- **vgtExtraWood**: [VGT — Шпатлевка «Экстра» по дереву](https://vgtkraska.ru/ekstra-po-derevu) — Официальная карточка готовой белой шпатлевки по дереву; фасовка 1 кг.
- **localTitle**: Локальная карточка MatMix — Только identity/weight guard; не источник технических свойств и не production truth.
