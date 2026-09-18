# Грунтовки — CORE batch 2 review

Режим: dry-run. Дата: 2026-09-18. Production и title/slug не изменяются.

## Writable surface

- `products`: только `brand`.
- `product_attribute_values`: только brand, product_type, base, purpose, package_weight, package_volume, primer_type, application_area, application_method, substrates, consumption, drying_time, dilution_ratio, concentrate, color, application_temperature, shelf_life для MAT-000234, 237, 243, 244.
- Title, slug, descriptions, SEO, prices, inventory weight, stock и images не являются write targets.
- Existing different brand is `BRAND_CONFLICT` and blocks apply; other conflicting core values are `VALUE_CONFLICT`.
- Dry-run never writes.

## Summary

```json
{
  "total": 4,
  "readyProducts": 0,
  "partialProducts": 4,
  "errors": 0,
  "logicalSlots": 68,
  "willAdd": 51,
  "willFix": 0,
  "existingOk": 0,
  "needsSource": 15,
  "absentByDesign": 2,
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
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | PARTIAL | 17 | 14 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | PARTIAL | 17 | 7 | 0 | 0 | 10 | 0 | 0 | 0 | 0 |
| MAT-000243 | Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг | PARTIAL | 17 | 16 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| MAT-000244 | Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг | PARTIAL | 17 | 14 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |

## Per-MAT details

### MAT-000234

- Current title: Грунт Litokol PRIMER A универсальный укрепляющий 10 л
- Guard: PASS
- Source keys: litokolPrimerA, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | LITOKOL | — | WILL_ADD | litokolPrimerA |
| product_type | Универсальная грунтовка | — | WILL_ADD | litokolPrimerA |
| base | Водная дисперсия | — | WILL_ADD | litokolPrimerA |
| purpose | Подготовка оснований перед покраской, оклейкой обоями, облицовкой плиткой, штукатурными и шпатлёвочными работами | — | WILL_ADD | litokolPrimerA |
| package_weight | 10 | — | WILL_ADD | litokolPrimerA |
| package_volume | — | — | NEEDS_SOURCE | litokolPrimerA, localTitle |
| primer_type | Универсальная | — | WILL_ADD | litokolPrimerA |
| application_area | Внутренние и наружные работы | — | WILL_ADD | litokolPrimerA |
| application_method | Валик, кисть или распылитель | — | WILL_ADD | litokolPrimerA |
| substrates | Цементные, известковые и гипсовые штукатурки и шпатлёвки, стяжки, бетон, кирпич, ГКЛ, ГВЛ и гипсовые блоки | — | WILL_ADD | litokolPrimerA |
| consumption | от 100 г/м² | — | WILL_ADD | litokolPrimerA |
| drying_time | 2–4 часа | — | WILL_ADD | litokolPrimerA |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | litokolPrimerA |
| concentrate | false | — | WILL_ADD | litokolPrimerA |
| color | Голубой | — | WILL_ADD | litokolPrimerA |
| application_temperature | от +5 до +35 °C | — | WILL_ADD | litokolPrimerA |
| shelf_life | — | — | NEEDS_SOURCE | litokolPrimerA |

### MAT-000237

- Current title: Грунтовка Oscar глубокого проникновения 10 л
- Guard: PASS
- Source keys: oscarG, oscarCatalog, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Oscar | — | WILL_ADD | oscarG, oscarCatalog |
| product_type | Грунтовка глубокого проникновения | — | WILL_ADD | oscarG, oscarCatalog |
| base | Латексная грунтовка | — | WILL_ADD | oscarG, oscarCatalog |
| purpose | Укрепление оснований и снижение впитываемости | — | WILL_ADD | oscarG, oscarCatalog |
| package_weight | 10 | — | WILL_ADD | oscarG, oscarCatalog |
| package_volume | — | — | NEEDS_SOURCE | oscarG, oscarCatalog, localTitle |
| primer_type | Глубокого проникновения | — | WILL_ADD | oscarG, oscarCatalog |
| application_area | Наружные работы | — | WILL_ADD | oscarG |
| application_method | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| substrates | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| consumption | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| drying_time | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| dilution_ratio | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| concentrate | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| color | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| application_temperature | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |
| shelf_life | — | — | NEEDS_SOURCE | oscarG, oscarCatalog |

### MAT-000243

- Current title: Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг
- Guard: PASS
- Source keys: forbo044, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Forbo Eurocol | — | WILL_ADD | forbo044 |
| product_type | Универсальная грунтовка-концентрат | — | WILL_ADD | forbo044 |
| base | Акриловая дисперсия | — | WILL_ADD | forbo044 |
| purpose | Снижение влаговпитывания пористых оснований и создание адгезии выравнивающих смесей к гладким, невпитывающим и деревянным основаниям | — | WILL_ADD | forbo044 |
| package_weight | 10 | — | WILL_ADD | forbo044 |
| package_volume | — | — | NEEDS_SOURCE | forbo044 |
| primer_type | Концентрат | — | WILL_ADD | forbo044 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | forbo044 |
| application_method | Валик или распылитель | — | WILL_ADD | forbo044 |
| substrates | Цементные стяжки, основания на основе сульфата кальция, гипсовые поверхности, терраццо, керамическая плитка, натуральный камень, наливной асфальт, ДСП и фанера | — | WILL_ADD | forbo044 |
| consumption | около 50–150 г/м² | — | WILL_ADD | forbo044 |
| drying_time | 0,5–15 часов в зависимости от основания | — | WILL_ADD | forbo044 |
| dilution_ratio | 1:1–1:5 в зависимости от основания | — | WILL_ADD | forbo044 |
| concentrate | true | — | WILL_ADD | forbo044 |
| color | Белый | — | WILL_ADD | forbo044 |
| application_temperature | материал и помещение не ниже +18 °C; пол не ниже +15 °C | — | WILL_ADD | forbo044 |
| shelf_life | 15 | — | WILL_ADD | forbo044 |

### MAT-000244

- Current title: Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг
- Guard: PASS
- Source keys: forbo041, localTitle

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Forbo Eurocol | — | WILL_ADD | forbo041 |
| product_type | Токопроводящая водно-дисперсионная грунтовка | — | WILL_ADD | forbo041 |
| base | Акриловая дисперсия | — | WILL_ADD | forbo041 |
| purpose | Создание поперечной токопроводимости перед нанесением токопроводящего клея | — | WILL_ADD | forbo041 |
| package_weight | 10 | — | WILL_ADD | forbo041 |
| package_volume | — | — | NEEDS_SOURCE | forbo041 |
| primer_type | Токопроводящая | — | WILL_ADD | forbo041 |
| application_area | — | — | NEEDS_SOURCE | forbo041 |
| application_method | Валик из пеноматериала | — | WILL_ADD | forbo041 |
| substrates | Подготовленные влаговпитывающие поверхности | — | WILL_ADD | forbo041 |
| consumption | около 100–150 г/м² | — | WILL_ADD | forbo041 |
| drying_time | 2–4 часа в зависимости от основания | — | WILL_ADD | forbo041 |
| dilution_ratio | — | — | ABSENT_BY_DESIGN | forbo041 |
| concentrate | false | — | WILL_ADD | forbo041 |
| color | Чёрный | — | WILL_ADD | forbo041 |
| application_temperature | материал и помещение не ниже +18 °C; пол не ниже +15 °C | — | WILL_ADD | forbo041 |
| shelf_life | 15 | — | WILL_ADD | forbo041 |

## Definitions

- Reusable definitions: brand, product_type, base, purpose, package_weight, application_temperature, shelf_life
- Proposed definitions: package_volume (number, л), primer_type (text), application_area (text), application_method (text), substrates (text), consumption (text), drying_time (text), dilution_ratio (text), concentrate (boolean), color (text)
- Definitions to create in this runtime: primer_type, application_area, application_method, substrates, consumption, drying_time, concentrate, color, dilution_ratio

## Source registry

- **litokolPrimerA**: [LITOKOL Primer A — официальный сайт](https://www.litokol.ru/catalog/primer-a/) — LITOKOL
- **oscarG**: [Oscar G os-10kg — brand support/catalog](https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html) — Oscar / brand support
- **oscarCatalog**: [Oscar — catalog PDF](https://itelgroup-bucket.storage.yandexcloud.net/Production/exb_doc/2032/4956/%D0%9F%D1%80%D0%B0%D0%B9%D1%81-%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3_300425_preview2.pdf) — Oscar / brand catalog
- **forbo044**: [Forbo Eurocol 044 Europrimer Multi — официальный сайт](https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw) — Forbo Eurocol
- **forbo041**: [Forbo Eurocol 041 Europrimer EC — официальный сайт](https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag) — Forbo Eurocol
- **localTitle**: Локальная карточка MatMix — MatMix local audit

## Final identity pass

| MAT | status | current title | finding | missing evidence |
|---|---|---|---|---|
| MAT-000229 | IDENTITY_BLOCKED_FINAL | Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л | KNAUF Tiefengrund family is known, but a distinct exact frost-resistant до -40 SKU/package is not proven by the available official source. | Exact manufacturer SKU or current TDS/packaging proving the морозостойкая до -40 10 l identity. |
| MAT-000238 | IDENTITY_BLOCKED_FINAL | Грунтовка Акрил 5 л | Generic title has no manufacturer, product model, or authoritative source identity. | Manufacturer and exact model/SKU for the 5 l acrylic primer. |
| MAT-000239 | IDENTITY_BLOCKED_FINAL | Грунтовка Акрил 10 л | Generic title has no manufacturer, product model, or authoritative source identity. | Manufacturer and exact model/SKU for the 10 l acrylic primer. |
| MAT-000259 | IDENTITY_BLOCKED_FINAL | Грунт ГФ-021 по металлу и дереву серый 0,8 кг | GF-021 is a generic product class; no manufacturer or exact SKU is established. Historical secondary reference is insufficient. | Manufacturer, exact GF-021 model, and authoritative 0.8 kg package evidence. |
| MAT-000260 | IDENTITY_BLOCKED_FINAL | Грунт по металлу серый 1 л | Generic grey metal-primer title has no manufacturer or exact product model. | Manufacturer, exact model/SKU, and authoritative 1 l package evidence. |

## Read-only production inspection

The following SQL is SELECT-only and must be run separately in the approved read-only production inspection process. This batch does not execute it:

```sql
SELECT p.external_id,p.title,p.brand,p.weight,
  CASE WHEN COALESCE(p.description,p.short_description,p.full_description,'')<>'' THEN 1 ELSE 0 END AS description_present,
  p.image,p.image_url,
  (SELECT GROUP_CONCAT(d.code || '=' || COALESCE(v.value_text,CAST(v.value_number AS TEXT),CAST(v.value_boolean AS TEXT)), ' | ')
   FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
   WHERE v.product_id=p.id) AS primer_attributes,
  (SELECT GROUP_CONCAT(i.image_url, ' | ') FROM product_images i WHERE i.product_id=p.id) AS gallery_refs
FROM products p
WHERE p.external_id IN ('MAT-000234','MAT-000237','MAT-000243','MAT-000244','MAT-000229','MAT-000238','MAT-000239','MAT-000259','MAT-000260')
ORDER BY p.external_id;
```
