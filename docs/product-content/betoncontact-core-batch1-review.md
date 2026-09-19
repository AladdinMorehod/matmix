# Бетонконтакт — CORE batch 1 review

Режим: production-postcheck. Дата: 2026-09-19. Production apply уже завершён; products columns и запрещённые поверхности не изменялись.

## Final production audit

- TARGET_TOTAL=5
- PRODUCTION_APPLIED=yes
- EXISTING_OK=67
- NEEDS_SOURCE=8
- WILL_ADD=0
- WILL_FIX=0
- BLOCKERS=0
- ERRORS=0
- BETONCONTACT_CORE_POSTCHECK=PASS
- BETONCONTACT_PRODUCTS_UNCHANGED=PASS
- service active; health ok; ready ok
- backup: /var/backups/matmix/matmix-backup-2026-09-19T10-34-11-763Z-5a6fcfb7

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
  "willAdd": 0,
  "willFix": 0,
  "existingOk": 67,
  "needsSource": 8,
  "absentByDesign": 0,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "titleGuardBlocked": 0,
  "definitionsToCreate": 0
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
| brand | KNAUF | — | EXISTING_OK | knaufBetogrund |
| product_type | Грунтовка адгезионная для бетонных и гладких оснований | — | EXISTING_OK | knaufBetogrund |
| base | Полимерная дисперсия с кварцевым песком | — | EXISTING_OK | knaufBetogrund |
| purpose | Подготовка бетонных и гладких оснований перед нанесением последующих покрытий | — | EXISTING_OK | knaufBetogrund |
| package_weight | 5 | — | EXISTING_OK | knaufBetogrund |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | EXISTING_OK | knaufBetogrund |
| application_area | Внутренние работы | — | EXISTING_OK | knaufBetogrund |
| application_method | — | — | NEEDS_SOURCE | knaufBetogrund |
| substrates | Бетон, гладкие плотные основания | — | EXISTING_OK | knaufBetogrund |
| consumption | около 0,25 кг/м² | — | EXISTING_OK | knaufBetogrund |
| drying_time | 12 часов | — | EXISTING_OK | knaufBetogrund |
| concentrate | false | — | EXISTING_OK | knaufBetogrund |
| color | Розовый | — | EXISTING_OK | knaufBetogrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufBetogrund |
| shelf_life | 12 | — | EXISTING_OK | knaufBetogrund |

### MAT-000218

- Current title: Бетонконтакт Knauf Бетогрунд 15 кг
- Guard: PASS
- Source keys: knaufBetogrund

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | — | EXISTING_OK | knaufBetogrund |
| product_type | Грунтовка адгезионная для бетонных и гладких оснований | — | EXISTING_OK | knaufBetogrund |
| base | Полимерная дисперсия с кварцевым песком | — | EXISTING_OK | knaufBetogrund |
| purpose | Подготовка бетонных и гладких оснований перед нанесением последующих покрытий | — | EXISTING_OK | knaufBetogrund |
| package_weight | 15 | — | EXISTING_OK | knaufBetogrund |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | EXISTING_OK | knaufBetogrund |
| application_area | Внутренние работы | — | EXISTING_OK | knaufBetogrund |
| application_method | — | — | NEEDS_SOURCE | knaufBetogrund |
| substrates | Бетон, гладкие плотные основания | — | EXISTING_OK | knaufBetogrund |
| consumption | около 0,25 кг/м² | — | EXISTING_OK | knaufBetogrund |
| drying_time | 12 часов | — | EXISTING_OK | knaufBetogrund |
| concentrate | false | — | EXISTING_OK | knaufBetogrund |
| color | Розовый | — | EXISTING_OK | knaufBetogrund |
| application_temperature | — | — | NEEDS_SOURCE | knaufBetogrund |
| shelf_life | 12 | — | EXISTING_OK | knaufBetogrund |

### MAT-000219

- Current title: Бетонконтакт Ceresit CT 19, 5 кг
- Guard: PASS
- Source keys: ceresitCt19

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | EXISTING_OK | ceresitCt19 |
| product_type | Адгезионная грунтовка для бетонных оснований | — | EXISTING_OK | ceresitCt19 |
| base | Водная дисперсия акриловых сополимеров с минеральными наполнителями | — | EXISTING_OK | ceresitCt19 |
| purpose | Повышение адгезии последующих покрытий к гладким бетонным основаниям | — | EXISTING_OK | ceresitCt19 |
| package_weight | 5 | — | EXISTING_OK | ceresitCt19 |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | EXISTING_OK | ceresitCt19 |
| application_area | Внутренние и наружные работы | — | EXISTING_OK | ceresitCt19 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt19 |
| substrates | Гладкий бетон; монолитные и сборные железобетонные основания | — | EXISTING_OK | ceresitCt19 |
| consumption | около 0,2 кг/м² | — | EXISTING_OK | ceresitCt19 |
| drying_time | около 3 часов | — | EXISTING_OK | ceresitCt19 |
| concentrate | false | — | EXISTING_OK | ceresitCt19 |
| color | Розовый | — | EXISTING_OK | ceresitCt19 |
| application_temperature | +5…+30 °C | — | EXISTING_OK | ceresitCt19 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt19 |

### MAT-000220

- Current title: Бетонконтакт Ceresit CT 19, 15 кг
- Guard: PASS
- Source keys: ceresitCt19

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | — | EXISTING_OK | ceresitCt19 |
| product_type | Адгезионная грунтовка для бетонных оснований | — | EXISTING_OK | ceresitCt19 |
| base | Водная дисперсия акриловых сополимеров с минеральными наполнителями | — | EXISTING_OK | ceresitCt19 |
| purpose | Повышение адгезии последующих покрытий к гладким бетонным основаниям | — | EXISTING_OK | ceresitCt19 |
| package_weight | 15 | — | EXISTING_OK | ceresitCt19 |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | EXISTING_OK | ceresitCt19 |
| application_area | Внутренние и наружные работы | — | EXISTING_OK | ceresitCt19 |
| application_method | — | — | NEEDS_SOURCE | ceresitCt19 |
| substrates | Гладкий бетон; монолитные и сборные железобетонные основания | — | EXISTING_OK | ceresitCt19 |
| consumption | около 0,2 кг/м² | — | EXISTING_OK | ceresitCt19 |
| drying_time | около 3 часов | — | EXISTING_OK | ceresitCt19 |
| concentrate | false | — | EXISTING_OK | ceresitCt19 |
| color | Розовый | — | EXISTING_OK | ceresitCt19 |
| application_temperature | +5…+30 °C | — | EXISTING_OK | ceresitCt19 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCt19 |

### MAT-000221

- Current title: Бетонконтакт Cтаратели 20 кг
- Guard: PASS
- Source keys: starateliBeton

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Старатели | — | EXISTING_OK | starateliBeton |
| product_type | Грунтовка БЕТОН-КОНТАКТ | — | EXISTING_OK | starateliBeton |
| base | Полимерная дисперсия с песком, водой и функциональными добавками | — | EXISTING_OK | starateliBeton |
| purpose | Подготовка бетонных и других плотных оснований перед последующими покрытиями | — | EXISTING_OK | starateliBeton |
| package_weight | 20 | — | EXISTING_OK | starateliBeton |
| primer_type | Адгезионная грунтовка-бетонконтакт | — | EXISTING_OK | starateliBeton |
| application_area | Внутренние работы | — | EXISTING_OK | starateliBeton |
| application_method | Валик или кисть | — | EXISTING_OK | starateliBeton |
| substrates | Бетон, керамическая плитка, поверхности с масляной краской | — | EXISTING_OK | starateliBeton |
| consumption | 0,2–0,3 кг/м² | — | EXISTING_OK | starateliBeton |
| drying_time | 2–3 часа | — | EXISTING_OK | starateliBeton |
| concentrate | false | — | EXISTING_OK | starateliBeton |
| color | Вишнёвый | — | EXISTING_OK | starateliBeton |
| application_temperature | +5…+30 °C | — | EXISTING_OK | starateliBeton |
| shelf_life | 12 | — | EXISTING_OK | starateliBeton |

## Source registry

- **knaufBetogrund**: [КНАУФ-Бетогрунд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/) — Official RU product page confirms the product family, ready-to-use adhesive primer, 5/15 kg packs, pink color, consumption, drying and shelf life.
- **ceresitCt19**: [Ceresit CT 19 Бетонконтакт](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact) — Official RU product page confirms CT 19, ready-to-use adhesive primer, internal/external use, 5/15 kg packs, consumption, drying and temperature.
- **starateliBeton**: [Грунтовка БЕТОН-КОНТАКТ](https://www.starateli.ru/po-betonu/) — Official manufacturer page confirms 20/5/3 kg packs, ready-to-use composition, substrates, roller/brush application, consumption, drying, temperature, color and shelf life.
