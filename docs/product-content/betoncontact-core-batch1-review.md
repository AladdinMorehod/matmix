# Бетонконтакт — CORE batch 1 review

Режим: dry-run. Дата: 2026-09-19. Production и product fields не изменяются.

## Scope

Только MAT-000217…MAT-000221. MAT-000222…224 заблокированы по identity, MAT-000225 частично подтверждён и исключён.

## Writable surface

- `products`: ничего не изменяется.
- `product_attribute_values`: только brand, product_type, base, purpose, package_weight, primer_type, application_area, application_method, substrates, consumption, drying_time, concentrate, color, application_temperature, shelf_life для пяти target MAT.
- Definitions создаются только для READY source-backed values; templates не создаются.
- Title, slug, descriptions, SEO, prices, weight/unit, category, images и stock не являются write targets.
- Dry-run read-only; apply требует explicit confirmation, backup и transaction.

## ABSENT_BY_DESIGN

- **package_volume**: All five exact SKUs are catalogued by mass (kg); no authoritative volume value exists, and kg↔l conversion is forbidden.

## Summary

```json
{
  "total": 5,
  "readyProducts": 1,
  "partialProducts": 4,
  "errors": 0,
  "logicalSlots": 75,
  "willAdd": 67,
  "willFix": 0,
  "existingOk": 0,
  "needsSource": 8,
  "absentByDesign": 0,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "titleGuardBlocked": 0,
  "definitionsToCreate": 8
}
```

## Products

| MAT | title | status | slots | willAdd | existingOk | needsSource | absentByDesign | conflicts |
|---|---|---|---:|---:|---:|---:|---:|---:|
| MAT-000217 | Бетонконтакт Knauf Бетогрунд 5 кг | PARTIAL | 15 | 13 | 0 | 2 | 0 | 0 |
| MAT-000218 | Бетонконтакт Knauf Бетогрунд 15 кг | PARTIAL | 15 | 13 | 0 | 2 | 0 | 0 |
| MAT-000219 | Бетонконтакт Ceresit CT 19, 5 кг | PARTIAL | 15 | 13 | 0 | 2 | 0 | 0 |
| MAT-000220 | Бетонконтакт Ceresit CT 19, 15 кг | PARTIAL | 15 | 13 | 0 | 2 | 0 | 0 |
| MAT-000221 | Бетонконтакт Cтаратели 20 кг | READY | 15 | 15 | 0 | 0 | 0 | 0 |

## Per-MAT details

### MAT-000217

- Current title: Бетонконтакт Knauf Бетогрунд 5 кг
- Guard: PASS
- Source keys: knaufBetogrund

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufBetogrund |
| product_type | Грунтовка адгезионная для бетонных и гладких оснований | — | WILL_ADD | knaufBetogrund |
| base | Полимерная дисперсия с кварцевым песком | — | WILL_ADD | knaufBetogrund |
| purpose | Подготовка бетонных и гладких оснований перед нанесением последующих покрытий | — | WILL_ADD | knaufBetogrund |
| package_weight | 5 | — | WILL_ADD | knaufBetogrund |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | WILL_ADD | knaufBetogrund |
| application_area | Внутренние работы | — | WILL_ADD | knaufBetogrund |
| application_method | — | — | NEEDS_SOURCE | knaufBetogrund |
| substrates | Бетон, гладкие плотные основания | — | WILL_ADD | knaufBetogrund |
| consumption | около 0,25 кг/м² | — | WILL_ADD | knaufBetogrund |
| drying_time | 12 часов | — | WILL_ADD | knaufBetogrund |
| concentrate | false | — | WILL_ADD | knaufBetogrund |
| color | Розовый | — | WILL_ADD | knaufBetogrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufBetogrund |
| shelf_life | 12 | — | WILL_ADD | knaufBetogrund |

### MAT-000218

- Current title: Бетонконтакт Knauf Бетогрунд 15 кг
- Guard: PASS
- Source keys: knaufBetogrund

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | WILL_ADD | knaufBetogrund |
| product_type | Грунтовка адгезионная для бетонных и гладких оснований | — | WILL_ADD | knaufBetogrund |
| base | Полимерная дисперсия с кварцевым песком | — | WILL_ADD | knaufBetogrund |
| purpose | Подготовка бетонных и гладких оснований перед нанесением последующих покрытий | — | WILL_ADD | knaufBetogrund |
| package_weight | 15 | — | WILL_ADD | knaufBetogrund |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | WILL_ADD | knaufBetogrund |
| application_area | Внутренние работы | — | WILL_ADD | knaufBetogrund |
| application_method | — | — | NEEDS_SOURCE | knaufBetogrund |
| substrates | Бетон, гладкие плотные основания | — | WILL_ADD | knaufBetogrund |
| consumption | около 0,25 кг/м² | — | WILL_ADD | knaufBetogrund |
| drying_time | 12 часов | — | WILL_ADD | knaufBetogrund |
| concentrate | false | — | WILL_ADD | knaufBetogrund |
| color | Розовый | — | WILL_ADD | knaufBetogrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufBetogrund |
| shelf_life | 12 | — | WILL_ADD | knaufBetogrund |

### MAT-000219

- Current title: Бетонконтакт Ceresit CT 19, 5 кг
- Guard: PASS
- Source keys: ceresitCt19

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | WILL_ADD | ceresitCt19 |
| product_type | Адгезионная грунтовка для бетонных оснований | — | WILL_ADD | ceresitCt19 |
| base | Водная дисперсия акриловых сополимеров с минеральными наполнителями | — | WILL_ADD | ceresitCt19 |
| purpose | Повышение адгезии последующих покрытий к гладким бетонным основаниям | — | WILL_ADD | ceresitCt19 |
| package_weight | 5 | — | WILL_ADD | ceresitCt19 |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | WILL_ADD | ceresitCt19 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ceresitCt19 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt19 |
| substrates | Гладкий бетон; монолитные и сборные железобетонные основания | — | WILL_ADD | ceresitCt19 |
| consumption | около 0,2 кг/м² | — | WILL_ADD | ceresitCt19 |
| drying_time | около 3 часов | — | WILL_ADD | ceresitCt19 |
| concentrate | false | — | WILL_ADD | ceresitCt19 |
| color | Розовый | — | WILL_ADD | ceresitCt19 |
| application_temperature | +5…+30 °C | — | WILL_ADD | ceresitCt19 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt19 |

### MAT-000220

- Current title: Бетонконтакт Ceresit CT 19, 15 кг
- Guard: PASS
- Source keys: ceresitCt19

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | WILL_ADD | ceresitCt19 |
| product_type | Адгезионная грунтовка для бетонных оснований | — | WILL_ADD | ceresitCt19 |
| base | Водная дисперсия акриловых сополимеров с минеральными наполнителями | — | WILL_ADD | ceresitCt19 |
| purpose | Повышение адгезии последующих покрытий к гладким бетонным основаниям | — | WILL_ADD | ceresitCt19 |
| package_weight | 15 | — | WILL_ADD | ceresitCt19 |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | WILL_ADD | ceresitCt19 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ceresitCt19 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt19 |
| substrates | Гладкий бетон; монолитные и сборные железобетонные основания | — | WILL_ADD | ceresitCt19 |
| consumption | около 0,2 кг/м² | — | WILL_ADD | ceresitCt19 |
| drying_time | около 3 часов | — | WILL_ADD | ceresitCt19 |
| concentrate | false | — | WILL_ADD | ceresitCt19 |
| color | Розовый | — | WILL_ADD | ceresitCt19 |
| application_temperature | +5…+30 °C | — | WILL_ADD | ceresitCt19 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt19 |

### MAT-000221

- Current title: Бетонконтакт Cтаратели 20 кг
- Guard: PASS
- Source keys: starateliBeton

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Старатели | — | WILL_ADD | starateliBeton |
| product_type | Грунтовка БЕТОН-КОНТАКТ | — | WILL_ADD | starateliBeton |
| base | Полимерная дисперсия с песком, водой и функциональными добавками | — | WILL_ADD | starateliBeton |
| purpose | Подготовка бетонных и других плотных оснований перед последующими покрытиями | — | WILL_ADD | starateliBeton |
| package_weight | 20 | — | WILL_ADD | starateliBeton |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | WILL_ADD | starateliBeton |
| application_area | Внутренние работы | — | WILL_ADD | starateliBeton |
| application_method | Валик или кисть | — | WILL_ADD | starateliBeton |
| substrates | Бетон, керамическая плитка, поверхности с масляной краской | — | WILL_ADD | starateliBeton |
| consumption | 0,2–0,3 кг/м² | — | WILL_ADD | starateliBeton |
| drying_time | 2–3 часа | — | WILL_ADD | starateliBeton |
| concentrate | false | — | WILL_ADD | starateliBeton |
| color | Вишнёвый | — | WILL_ADD | starateliBeton |
| application_temperature | +5…+30 °C | — | WILL_ADD | starateliBeton |
| shelf_life | 12 | — | WILL_ADD | starateliBeton |

## Source registry

- **knaufBetogrund**: [КНАУФ-Бетогрунд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/) — Official RU product page confirms the product family, ready-to-use adhesive primer, 5/15 kg packs, pink color, consumption, drying and shelf life.
- **ceresitCt19**: [Ceresit CT 19 Бетонконтакт](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact) — Official RU product page confirms CT 19, ready-to-use adhesive primer, internal/external use, 5/15 kg packs, consumption, drying and temperature.
- **starateliBeton**: [Грунтовка БЕТОН-КОНТАКТ](https://www.starateli.ru/po-betonu/) — Official manufacturer page confirms 20/5/3 kg packs, ready-to-use composition, substrates, roller/brush application, consumption, drying, temperature, color and shelf life.
