# Грунтовки — CORE batch 1 review

Режим: dry-run. Дата: 2026-09-18. Production и title/slug не изменяются.

## Writable surface

- `products`: только `brand`.
- `product_attribute_values`: только brand, product_type, base, purpose, package_weight, package_volume, primer_type, application_area, application_method, substrates, consumption, drying_time, dilution_ratio, concentrate, color, application_temperature, shelf_life для MAT-000227, 228, 230, 231, 232, 233, 235, 236, 240, 241, 242.
- Title, slug, descriptions, SEO, prices, inventory weight, stock и images не являются write targets.
- Existing different brand is `BRAND_CONFLICT` and blocks apply; other conflicting core values are `VALUE_CONFLICT`.
- Dry-run never writes.

## Summary

```json
{
  "total": 11,
  "readyProducts": 0,
  "partialProducts": 11,
  "errors": 0,
  "logicalSlots": 187,
  "willAdd": 146,
  "willFix": 0,
  "existingOk": 0,
  "needsSource": 26,
  "absentByDesign": 15,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "brandConflict": 0,
  "titleGuardBlocked": 0,
  "definitionsToCreate": 9
}
```

## Products

| MAT | title | status | logical slots | willAdd | willFix | existingOk | needsSource | absentByDesign | schemaBlocked | valueConflict | brandConflict |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MAT-000227 | Грунтовка Knauf Тифенгрунд 5 л | PARTIAL | 17 | 13 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| MAT-000228 | Грунтовка Knauf Тифенгрунд 10 л | PARTIAL | 17 | 13 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| MAT-000230 | Грунтовка Knauf Мульти Грунд универсальный 10 л | PARTIAL | 17 | 13 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| MAT-000231 | Грунтовка Ceresit CT-17 PRO, 5л | PARTIAL | 17 | 13 | 0 | 0 | 2 | 2 | 0 | 0 | 0 |
| MAT-000232 | Грунтовка Ceresit CT-17 PRO, 10л | PARTIAL | 17 | 13 | 0 | 0 | 2 | 2 | 0 | 0 | 0 |
| MAT-000233 | Грунтовка Ceresit CT16 под декоративную штукатурку 10 л | PARTIAL | 17 | 14 | 0 | 0 | 1 | 2 | 0 | 0 | 0 |
| MAT-000235 | Грунтовка Старатели универсальная 10 л | PARTIAL | 17 | 14 | 0 | 0 | 1 | 2 | 0 | 0 | 0 |
| MAT-000236 | Грунтовка UNIS глубокого проникновения укрепляющий 10 л | PARTIAL | 17 | 13 | 0 | 0 | 2 | 2 | 0 | 0 | 0 |
| MAT-000240 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | PARTIAL | 17 | 14 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| MAT-000241 | Грунт Tikkurila Euro Primer концентрат 0,9 л | PARTIAL | 17 | 13 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| MAT-000242 | Грунт Tikkurila Euro Primer концентрат 3 л | PARTIAL | 17 | 13 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |

## Per-MAT details

### MAT-000227

- Current title: Грунтовка Knauf Тифенгрунд 5 л
- Guard: PASS
- Source keys: knaufTiefengrund, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufTiefengrund |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | knaufTiefengrund |
| base | Полимерная дисперсия | — | WILL_ADD | knaufTiefengrund |
| purpose | Укрепление основания, снижение впитываемости и улучшение адгезии | — | WILL_ADD | knaufTiefengrund |
| package_weight | 5 | — | WILL_ADD | knaufTiefengrund |
| package_volume | — | — | NEEDS_SOURCE | knaufTiefengrund |
| primer_type | Глубокого проникновения | — | WILL_ADD | knaufTiefengrund |
| application_area | Внутренние и наружные работы | — | WILL_ADD | knaufTiefengrund |
| application_method | — | — | NEEDS_SOURCE | knaufTiefengrund |
| substrates | ГКЛ/ГВЛ, гипсовые и цементные штукатурки, ПГП, стяжки | — | WILL_ADD | knaufTiefengrund |
| consumption | 0,1 кг/м² | — | WILL_ADD | knaufTiefengrund |
| drying_time | 3 часа | — | WILL_ADD | knaufTiefengrund |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | knaufTiefengrund |
| concentrate | false | — | WILL_ADD | knaufTiefengrund |
| color | Белый | — | WILL_ADD | knaufTiefengrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufTiefengrund |
| shelf_life | 12 | — | WILL_ADD | knaufTiefengrund |

### MAT-000228

- Current title: Грунтовка Knauf Тифенгрунд 10 л
- Guard: PASS
- Source keys: knaufTiefengrund, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufTiefengrund |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | knaufTiefengrund |
| base | Полимерная дисперсия | — | WILL_ADD | knaufTiefengrund |
| purpose | Укрепление основания, снижение впитываемости и улучшение адгезии | — | WILL_ADD | knaufTiefengrund |
| package_weight | 10 | — | WILL_ADD | knaufTiefengrund |
| package_volume | — | — | NEEDS_SOURCE | knaufTiefengrund |
| primer_type | Глубокого проникновения | — | WILL_ADD | knaufTiefengrund |
| application_area | Внутренние и наружные работы | — | WILL_ADD | knaufTiefengrund |
| application_method | — | — | NEEDS_SOURCE | knaufTiefengrund |
| substrates | ГКЛ/ГВЛ, гипсовые и цементные штукатурки, ПГП, стяжки | — | WILL_ADD | knaufTiefengrund |
| consumption | 0,1 кг/м² | — | WILL_ADD | knaufTiefengrund |
| drying_time | 3 часа | — | WILL_ADD | knaufTiefengrund |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | knaufTiefengrund |
| concentrate | false | — | WILL_ADD | knaufTiefengrund |
| color | Белый | — | WILL_ADD | knaufTiefengrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufTiefengrund |
| shelf_life | 12 | — | WILL_ADD | knaufTiefengrund |

### MAT-000230

- Current title: Грунтовка Knauf Мульти Грунд универсальный 10 л
- Guard: PASS
- Source keys: knaufMultigrund, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufMultigrund |
| product_type | Универсальная грунтовка для впитывающих оснований | — | WILL_ADD | knaufMultigrund |
| base | Полимерная дисперсия | — | WILL_ADD | knaufMultigrund |
| purpose | Снижение и регулирование впитываемости, улучшение адгезии | — | WILL_ADD | knaufMultigrund |
| package_weight | 10 | — | WILL_ADD | knaufMultigrund |
| package_volume | — | — | NEEDS_SOURCE | knaufMultigrund |
| primer_type | Универсальная для впитывающих оснований | — | WILL_ADD | knaufMultigrund |
| application_area | Внутренние и наружные работы | — | WILL_ADD | knaufMultigrund |
| application_method | — | — | NEEDS_SOURCE | knaufMultigrund |
| substrates | Газо- и пенобетон, кирпич, штукатурки, стяжки | — | WILL_ADD | knaufMultigrund |
| consumption | 0,2 кг/м² | — | WILL_ADD | knaufMultigrund |
| drying_time | 6 часов | — | WILL_ADD | knaufMultigrund |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | knaufMultigrund |
| concentrate | false | — | WILL_ADD | knaufMultigrund |
| color | Жёлтый | — | WILL_ADD | knaufMultigrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufMultigrund |
| shelf_life | 12 | — | WILL_ADD | knaufMultigrund |

### MAT-000231

- Current title: Грунтовка Ceresit CT-17 PRO, 5л
- Guard: PASS
- Source keys: ceresitCt17, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | WILL_ADD | ceresitCt17 |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | ceresitCt17 |
| base | Водная дисперсия сополимеров акрилатов | — | WILL_ADD | ceresitCt17 |
| purpose | Укрепление, связывание пыли, снижение впитываемости и повышение адгезии | — | WILL_ADD | ceresitCt17 |
| package_weight | — | — | ABSENT_BY_DESIGN | ceresitCt17 |
| package_volume | 5 | — | WILL_ADD | ceresitCt17 |
| primer_type | Глубокого проникновения | — | WILL_ADD | ceresitCt17 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ceresitCt17 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt17 |
| substrates | Цементные, известковые и гипсовые штукатурки, стяжки, бетон, кирпич, ГКЛ, ДСП/ДВП | — | WILL_ADD | ceresitCt17 |
| consumption | 0,1–0,2 л/м² | — | WILL_ADD | ceresitCt17 |
| drying_time | до 2 часов | — | WILL_ADD | ceresitCt17 |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | ceresitCt17 |
| concentrate | false | — | WILL_ADD | ceresitCt17 |
| color | Светло-жёлтый | — | WILL_ADD | ceresitCt17 |
| application_temperature | 0…+35 °C | — | WILL_ADD | ceresitCt17 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt17 |

### MAT-000232

- Current title: Грунтовка Ceresit CT-17 PRO, 10л
- Guard: PASS
- Source keys: ceresitCt17, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | WILL_ADD | ceresitCt17 |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | ceresitCt17 |
| base | Водная дисперсия сополимеров акрилатов | — | WILL_ADD | ceresitCt17 |
| purpose | Укрепление, связывание пыли, снижение впитываемости и повышение адгезии | — | WILL_ADD | ceresitCt17 |
| package_weight | — | — | ABSENT_BY_DESIGN | ceresitCt17 |
| package_volume | 10 | — | WILL_ADD | ceresitCt17 |
| primer_type | Глубокого проникновения | — | WILL_ADD | ceresitCt17 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ceresitCt17 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt17 |
| substrates | Цементные, известковые и гипсовые штукатурки, стяжки, бетон, кирпич, ГКЛ, ДСП/ДВП | — | WILL_ADD | ceresitCt17 |
| consumption | 0,1–0,2 л/м² | — | WILL_ADD | ceresitCt17 |
| drying_time | до 2 часов | — | WILL_ADD | ceresitCt17 |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | ceresitCt17 |
| concentrate | false | — | WILL_ADD | ceresitCt17 |
| color | Светло-жёлтый | — | WILL_ADD | ceresitCt17 |
| application_temperature | 0…+35 °C | — | WILL_ADD | ceresitCt17 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt17 |

### MAT-000233

- Current title: Грунтовка Ceresit CT16 под декоративную штукатурку 10 л
- Guard: PASS
- Source keys: ceresitCt16, ceresitFacade, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | WILL_ADD | ceresitCt16 |
| product_type | Кварц-грунтовка под декоративные штукатурки | — | WILL_ADD | ceresitCt16 |
| base | Водная дисперсия полимеров с пигментами и минеральными наполнителями | — | WILL_ADD | ceresitCt16 |
| purpose | Подготовка оснований перед декоративными штукатурками и повышение адгезии | — | WILL_ADD | ceresitCt16 |
| package_weight | — | — | ABSENT_BY_DESIGN | ceresitCt16 |
| package_volume | 10 | — | WILL_ADD | ceresitCt16 |
| primer_type | Кварц-грунтовка | — | WILL_ADD | ceresitCt16 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ceresitCt16 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt16 |
| substrates | Бетон, цементные/гипсовые/цементно-известковые штукатурки, ГКЛ, ДСП, прочные ЛКМ | — | WILL_ADD | ceresitCt16 |
| consumption | 0,2–0,5 л/м² | — | WILL_ADD | ceresitCt16 |
| drying_time | около 3 часов | — | WILL_ADD | ceresitCt16 |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | ceresitCt16 |
| concentrate | false | — | WILL_ADD | ceresitCt16 |
| color | Белый, может колероваться | — | WILL_ADD | ceresitCt16 |
| application_temperature | +5…+30 °C | — | WILL_ADD | ceresitCt16 |
| shelf_life | 12 | — | WILL_ADD | ceresitCt16 |

### MAT-000235

- Current title: Грунтовка Старатели универсальная 10 л
- Guard: PASS
- Source keys: starateli, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Старатели | — | WILL_ADD | starateli |
| product_type | Универсальная грунтовка | — | WILL_ADD | starateli |
| base | Водная грунтовка; binder не указан в карточке | — | WILL_ADD | starateli |
| purpose | Увеличение сцепления, обеспыливание, регулирование впитываемости, подготовка стен, потолков и полов | — | WILL_ADD | starateli |
| package_weight | — | — | ABSENT_BY_DESIGN | starateli |
| package_volume | 10 | — | WILL_ADD | starateli |
| primer_type | Универсальная | — | WILL_ADD | starateli |
| application_area | Внутренние и наружные работы | — | WILL_ADD | starateli |
| application_method | — | — | NEEDS_SOURCE | starateli |
| substrates | Стены, потолки и полы; полный список оснований требует TDS | — | WILL_ADD | starateli |
| consumption | 100–200 мл/м² | — | WILL_ADD | starateli |
| drying_time | не менее 1 часа | — | WILL_ADD | starateli |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | starateli |
| concentrate | false | — | WILL_ADD | starateli |
| color | Прозрачный после высыхания | — | WILL_ADD | starateli |
| application_temperature | +5…+30 °C | — | WILL_ADD | starateli |
| shelf_life | 18 | — | WILL_ADD | starateli |

### MAT-000236

- Current title: Грунтовка UNIS глубокого проникновения укрепляющий 10 л
- Guard: PASS
- Source keys: unisCatalog, unisRetailer, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | UNIS | — | WILL_ADD | unisCatalog |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | unisCatalog |
| base | Акриловый полимер | — | WILL_ADD | unisCatalog |
| purpose | Укрепление рыхлых, мелящих и сильновпитывающих оснований, обеспыливание | — | WILL_ADD | unisCatalog |
| package_weight | — | — | ABSENT_BY_DESIGN | unisCatalog, unisRetailer |
| package_volume | 10 | — | WILL_ADD | unisCatalog, unisRetailer |
| primer_type | Глубокого проникновения | — | WILL_ADD | unisCatalog |
| application_area | Внутренние и наружные работы | — | WILL_ADD | unisCatalog |
| application_method | — | — | NEEDS_SOURCE | unisCatalog |
| substrates | Минеральные впитывающие основания; полный список требует TDS | — | WILL_ADD | unisCatalog |
| consumption | около 100 мл/м² | — | WILL_ADD | unisCatalog |
| drying_time | около 3 часов | — | WILL_ADD | unisCatalog |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | unisCatalog |
| concentrate | false | — | WILL_ADD | unisCatalog |
| color | — | — | NEEDS_SOURCE | unisCatalog |
| application_temperature | +5…+30 °C | — | WILL_ADD | unisCatalog |
| shelf_life | 12 | — | WILL_ADD | unisCatalog |

### MAT-000240

- Current title: Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л
- Guard: PASS
- Source keys: knaufMittelgrund, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufMittelgrund |
| product_type | Грунтовка-концентрат для впитывающих оснований | — | WILL_ADD | knaufMittelgrund |
| base | Полимерная дисперсия с жёлтым пигментом | — | WILL_ADD | knaufMittelgrund |
| purpose | Снижение и регулирование впитываемости, подготовка под штукатурки, плитку и стяжки | — | WILL_ADD | knaufMittelgrund |
| package_weight | 10 | — | WILL_ADD | knaufMittelgrund |
| package_volume | — | — | NEEDS_SOURCE | knaufMittelgrund |
| primer_type | Концентрат для впитывающих оснований | — | WILL_ADD | knaufMittelgrund |
| application_area | Внутренние и наружные работы | — | WILL_ADD | knaufMittelgrund |
| application_method | — | — | NEEDS_SOURCE | knaufMittelgrund |
| substrates | Газо- и пенобетон, кирпич, штукатурки, бетонные и гипсовые стяжки | — | WILL_ADD | knaufMittelgrund |
| consumption | 0,05 кг/м² концентрата; раствор зависит от основания | — | WILL_ADD | knaufMittelgrund |
| drying_time | 6 часов | — | WILL_ADD | knaufMittelgrund |
| dilution_ratio | 1:3–1:5 в зависимости от основания | — | WILL_ADD | knaufMittelgrund |
| concentrate | true | — | WILL_ADD | knaufMittelgrund |
| color | Жёлтый | — | WILL_ADD | knaufMittelgrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufMittelgrund |
| shelf_life | 12 | — | WILL_ADD | knaufMittelgrund |

### MAT-000241

- Current title: Грунт Tikkurila Euro Primer концентрат 0,9 л
- Guard: PASS
- Source keys: tikkurila, tikkurilaCatalog, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Tikkurila | — | WILL_ADD | tikkurila |
| product_type | Акрилатная грунтовка-концентрат глубокого проникновения | — | WILL_ADD | tikkurila |
| base | Акрилатная основа | — | WILL_ADD | tikkurila |
| purpose | Укрепление пористых оснований и выравнивание впитываемости перед окраской | — | WILL_ADD | tikkurila |
| package_weight | — | — | ABSENT_BY_DESIGN | tikkurila, tikkurilaCatalog |
| package_volume | 0.9 | — | WILL_ADD | tikkurila, tikkurilaCatalog |
| primer_type | Концентрат глубокого проникновения | — | WILL_ADD | tikkurila |
| application_area | Внутренние и наружные работы | — | WILL_ADD | tikkurila |
| application_method | — | — | NEEDS_SOURCE | tikkurila |
| substrates | Штукатурка, кирпич, бетон, ГКЛ, газобетон, гипсовые материалы, ДВП/ДСП | — | WILL_ADD | tikkurila |
| consumption | 5–14 м²/л | — | WILL_ADD | tikkurila |
| drying_time | 1–1,5 часа | — | WILL_ADD | tikkurila |
| dilution_ratio | 1:3 | — | WILL_ADD | tikkurila |
| concentrate | true | — | WILL_ADD | tikkurila |
| color | — | — | NEEDS_SOURCE | tikkurila |
| application_temperature | — | — | NEEDS_SOURCE | tikkurila |
| shelf_life | 24 | — | WILL_ADD | tikkurila |

### MAT-000242

- Current title: Грунт Tikkurila Euro Primer концентрат 3 л
- Guard: PASS
- Source keys: tikkurila, tikkurilaCatalog, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Tikkurila | — | WILL_ADD | tikkurila |
| product_type | Акрилатная грунтовка-концентрат глубокого проникновения | — | WILL_ADD | tikkurila |
| base | Акрилатная основа | — | WILL_ADD | tikkurila |
| purpose | Укрепление пористых оснований и выравнивание впитываемости перед окраской | — | WILL_ADD | tikkurila |
| package_weight | — | — | ABSENT_BY_DESIGN | tikkurila, tikkurilaCatalog |
| package_volume | 3 | — | WILL_ADD | tikkurila, tikkurilaCatalog |
| primer_type | Концентрат глубокого проникновения | — | WILL_ADD | tikkurila |
| application_area | Внутренние и наружные работы | — | WILL_ADD | tikkurila |
| application_method | — | — | NEEDS_SOURCE | tikkurila |
| substrates | Штукатурка, кирпич, бетон, ГКЛ, газобетон, гипсовые материалы, ДВП/ДСП | — | WILL_ADD | tikkurila |
| consumption | 5–14 м²/л | — | WILL_ADD | tikkurila |
| drying_time | 1–1,5 часа | — | WILL_ADD | tikkurila |
| dilution_ratio | 1:3 | — | WILL_ADD | tikkurila |
| concentrate | true | — | WILL_ADD | tikkurila |
| color | — | — | NEEDS_SOURCE | tikkurila |
| application_temperature | — | — | NEEDS_SOURCE | tikkurila |
| shelf_life | 24 | — | WILL_ADD | tikkurila |

## Definitions

- Reusable definitions: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life
- Proposed definitions: package_volume (number, л), primer_type (text), application_area (text), application_method (text), substrates (text), consumption (text), drying_time (text), dilution_ratio (text), concentrate (boolean), color (text)
- Definitions to create in this runtime: primer_type, application_area, substrates, consumption, drying_time, concentrate, color, package_volume, dilution_ratio

## Source registry

- **knaufTiefengrund**: [KNAUF Tiefengrund — официальный сайт](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) — KNAUF
- **knaufMultigrund**: [KNAUF Multigrund — официальный сайт](https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/) — KNAUF
- **ceresitCt17**: [Ceresit CT 17 PRO — официальный сайт](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct_17_pro) — Ceresit
- **ceresitCt16**: [Ceresit CT 16 — официальный TDS](https://dm.henkel-dam.com/is/content/henkel/tds-ru-ceresit-ct16pdf) — Henkel/Ceresit
- **ceresitFacade**: [Ceresit facade plasters — официальный каталог](https://www.ceresit.ru/ru/products/etics/facade-plasters) — Ceresit
- **starateli**: [Старатели — Грунтовка Универсальная](https://www.starateli.ru/gruntovka_universalnaya/) — Старатели
- **unisCatalog**: [UNIS — каталог грунтовок](https://unistrom.ru/catalog/grunty/gruntovki-10-litrov/) — UNIS
- **unisRetailer**: [UNIS — exact 10 l retailer context](https://www.unimart24.ru/product/gruntovka-glubokogo-proniknoveniya-unis-kanistra-10-l/) — UNIS / retailer
- **knaufMittelgrund**: [KNAUF Mittelgrund — официальный сайт](https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/) — KNAUF
- **tikkurila**: [Tikkurila Euro Primer — regional product page](https://tikkurila-russia.ru/tikkurila-euro-primer) — Tikkurila regional
- **tikkurilaCatalog**: [Tikkurila — catalog PDF](https://tikkurila-color.ru/upload/iblock/b78/8ru2u12d2dcid0ndjs6k284anryu30xu.pdf) — Tikkurila regional
- **localTitle**: Локальная карточка MatMix — MatMix local audit
