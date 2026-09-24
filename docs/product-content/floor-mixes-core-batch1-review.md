# Floor mixes — CORE batch 1 review

Checked 2026-09-24; local only. CONFIRM=BACKFILL_FLOOR_MIXES_CORE_BATCH1.

Scope: MAT-000075, MAT-000076, MAT-000077, MAT-000078, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000083, MAT-000084, MAT-000085, MAT-000086, MAT-000087, MAT-000089, MAT-000090

Writable product fields: brand, image_url. Attribute codes: brand, product_type, base, purpose, package_weight, application_area, application_method, substrates, color, layer_thickness, consumption_10mm, water_requirement, pot_life, application_temperature, compressive_strength, adhesion, frost_resistance, shelf_life, standard, mortar_grade, consumption, flexural_strength, walkability.
No title, slug, description, SEO, price, weight, unit, category, subcategory, stock or product_images writes.

## Summary

```json
{
  "total": 15,
  "readyProducts": 12,
  "partialProducts": 3,
  "errors": 0,
  "logicalSlots": 345,
  "willAdd": 0,
  "willFix": 0,
  "existingOk": 116,
  "needsSource": 229,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "brandConflict": 0,
  "titleGuardBlocked": 0,
  "imageCleanupEligible": 0,
  "definitionsToCreate": 0
}
```

| MAT | status | brand | willAdd | existingOk | needsSource | conflicts | image cleanup |
|---|---|---|---:|---:|---:|---:|---|
| MAT-000075 | IDENTITY_UNCERTAIN | UNIS | 0 | 2 | 21 | 0 | SKIPPED |
| MAT-000076 | READY | UNIS | 0 | 10 | 13 | 0 | SKIPPED |
| MAT-000077 | SOURCE_CONFLICT | Старатели | 0 | 2 | 21 | 0 | SKIPPED |
| MAT-000078 | READY | Старатели | 0 | 10 | 13 | 0 | SKIPPED |
| MAT-000079 | READY | Weber Vetonit | 0 | 10 | 13 | 0 | SKIPPED |
| MAT-000080 | READY | Weber Vetonit | 0 | 10 | 13 | 0 | SKIPPED |
| MAT-000081 | READY | Weber Vetonit | 0 | 11 | 12 | 0 | SKIPPED |
| MAT-000082 | READY | Weber Vetonit | 0 | 11 | 12 | 0 | SKIPPED |
| MAT-000083 | READY | Litokol | 0 | 6 | 17 | 0 | SKIPPED |
| MAT-000084 | READY | Litokol | 0 | 7 | 16 | 0 | SKIPPED |
| MAT-000085 | READY | ВОЛМА | 0 | 7 | 16 | 0 | SKIPPED |
| MAT-000086 | READY | Основит | 0 | 10 | 13 | 0 | SKIPPED |
| MAT-000087 | READY | Ceresit | 0 | 8 | 15 | 0 | SKIPPED |
| MAT-000089 | READY | KNAUF | 0 | 8 | 15 | 0 | SKIPPED |
| MAT-000090 | PARTIAL | Основит | 0 | 4 | 19 | 0 | SKIPPED |

## Per-MAT

### MAT-000075

- Title: Наливной пол "Unis Горизонт" 20 кг
- Identity: IDENTITY_UNCERTAIN
- Candidate title (review only): Наливной пол UNIS Горизонт 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | UNIS | UNIS | EXISTING_OK | unisFamily |
| product_type | — | — | NEEDS_SOURCE | unisFamily |
| base | — | — | NEEDS_SOURCE | unisFamily |
| purpose | — | — | NEEDS_SOURCE | unisFamily |
| package_weight | 20 | 20 | EXISTING_OK | unisFamily |
| application_area | — | — | NEEDS_SOURCE | unisFamily |
| application_method | — | — | NEEDS_SOURCE | unisFamily |
| substrates | — | — | NEEDS_SOURCE | unisFamily |
| color | — | — | NEEDS_SOURCE | unisFamily |
| layer_thickness | — | — | NEEDS_SOURCE | unisFamily |
| consumption_10mm | — | — | NEEDS_SOURCE | unisFamily |
| water_requirement | — | — | NEEDS_SOURCE | unisFamily |
| pot_life | — | — | NEEDS_SOURCE | unisFamily |
| application_temperature | — | — | NEEDS_SOURCE | unisFamily |
| compressive_strength | — | — | NEEDS_SOURCE | unisFamily |
| adhesion | — | — | NEEDS_SOURCE | unisFamily |
| frost_resistance | — | — | NEEDS_SOURCE | unisFamily |
| shelf_life | — | — | NEEDS_SOURCE | unisFamily |
| standard | — | — | NEEDS_SOURCE | unisFamily |
| mortar_grade | — | — | NEEDS_SOURCE | unisFamily |
| consumption | — | — | NEEDS_SOURCE | unisFamily |
| flexural_strength | — | — | NEEDS_SOURCE | unisFamily |
| walkability | — | — | NEEDS_SOURCE | unisFamily |

### MAT-000076

- Title: Наливной пол UNIS Горизонт Армированный 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол UNIS Горизонт Армированный 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | UNIS | UNIS | EXISTING_OK | unisArmored |
| product_type | Армированный базовый ровнитель для пола | Армированный базовый ровнитель для пола | EXISTING_OK | unisArmored |
| base | — | — | NEEDS_SOURCE | unisArmored |
| purpose | — | — | NEEDS_SOURCE | unisArmored |
| package_weight | 20 | 20 | EXISTING_OK | unisArmored |
| application_area | — | — | NEEDS_SOURCE | unisArmored |
| application_method | — | — | NEEDS_SOURCE | unisArmored |
| substrates | — | — | NEEDS_SOURCE | unisArmored |
| color | — | — | NEEDS_SOURCE | unisArmored |
| layer_thickness | 30–300 мм | 30–300 мм | EXISTING_OK | unisArmored |
| consumption_10mm | — | — | NEEDS_SOURCE | unisArmored |
| water_requirement | 3,8–4,8 л на 20 кг | 3,8–4,8 л на 20 кг | EXISTING_OK | unisArmored |
| pot_life | 1 | 1 | EXISTING_OK | unisArmored |
| application_temperature | — | — | NEEDS_SOURCE | unisArmored |
| compressive_strength | 15 | 15 | EXISTING_OK | unisArmored |
| adhesion | 0.6 | 0.6 | EXISTING_OK | unisArmored |
| frost_resistance | — | — | NEEDS_SOURCE | unisArmored |
| shelf_life | 12 | 12 | EXISTING_OK | unisArmored |
| standard | — | — | NEEDS_SOURCE | unisArmored |
| mortar_grade | — | — | NEEDS_SOURCE | unisArmored |
| consumption | — | — | NEEDS_SOURCE | unisArmored |
| flexural_strength | — | — | NEEDS_SOURCE | unisArmored |
| walkability | 12 часов | 12 часов | EXISTING_OK | unisArmored |

### MAT-000077

- Title: Наливной пол "Старатели" Быстрый 20 кг
- Identity: SOURCE_CONFLICT
- Candidate title (review only): Наливной пол Старатели Быстротвердеющий 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Старатели | Старатели | EXISTING_OK | starateliCatalog |
| product_type | — | — | NEEDS_SOURCE | starateliCatalog |
| base | — | — | NEEDS_SOURCE | starateliCatalog |
| purpose | — | — | NEEDS_SOURCE | starateliCatalog |
| package_weight | 20 | 20 | EXISTING_OK | starateliCatalog |
| application_area | — | — | NEEDS_SOURCE | starateliCatalog |
| application_method | — | — | NEEDS_SOURCE | starateliCatalog |
| substrates | — | — | NEEDS_SOURCE | starateliCatalog |
| color | — | — | NEEDS_SOURCE | starateliCatalog |
| layer_thickness | — | — | NEEDS_SOURCE | starateliCatalog |
| consumption_10mm | — | — | NEEDS_SOURCE | starateliCatalog |
| water_requirement | — | — | NEEDS_SOURCE | starateliCatalog |
| pot_life | — | — | NEEDS_SOURCE | starateliCatalog |
| application_temperature | — | — | NEEDS_SOURCE | starateliCatalog |
| compressive_strength | — | — | NEEDS_SOURCE | starateliCatalog |
| adhesion | — | — | NEEDS_SOURCE | starateliCatalog |
| frost_resistance | — | — | NEEDS_SOURCE | starateliCatalog |
| shelf_life | — | — | NEEDS_SOURCE | starateliCatalog |
| standard | — | — | NEEDS_SOURCE | starateliCatalog |
| mortar_grade | — | — | NEEDS_SOURCE | starateliCatalog |
| consumption | — | — | NEEDS_SOURCE | starateliCatalog |
| flexural_strength | — | — | NEEDS_SOURCE | starateliCatalog |
| walkability | — | — | NEEDS_SOURCE | starateliCatalog |

### MAT-000078

- Title: Наливной пол Старатели Толстый 25 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Старатели Толстый 25 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Старатели | Старатели | EXISTING_OK | starateliThick |
| product_type | — | — | NEEDS_SOURCE | starateliThick |
| base | Цементное вяжущее | Цементное вяжущее | EXISTING_OK | starateliThick |
| purpose | — | — | NEEDS_SOURCE | starateliThick |
| package_weight | 25 | 25 | EXISTING_OK | starateliThick |
| application_area | Внутренние и наружные работы; нормальная и высокая влажность | Внутренние и наружные работы; нормальная и высокая влажность | EXISTING_OK | starateliThick |
| application_method | Ручное и механизированное | Ручное и механизированное | EXISTING_OK | starateliThick |
| substrates | — | — | NEEDS_SOURCE | starateliThick |
| color | — | — | NEEDS_SOURCE | starateliThick |
| layer_thickness | 30–100 мм | 30–100 мм | EXISTING_OK | starateliThick |
| consumption_10mm | — | — | NEEDS_SOURCE | starateliThick |
| water_requirement | 5–6 л на 25 кг | 5–6 л на 25 кг | EXISTING_OK | starateliThick |
| pot_life | — | — | NEEDS_SOURCE | starateliThick |
| application_temperature | — | — | NEEDS_SOURCE | starateliThick |
| compressive_strength | — | — | NEEDS_SOURCE | starateliThick |
| adhesion | — | — | NEEDS_SOURCE | starateliThick |
| frost_resistance | — | — | NEEDS_SOURCE | starateliThick |
| shelf_life | — | — | NEEDS_SOURCE | starateliThick |
| standard | — | — | NEEDS_SOURCE | starateliThick |
| mortar_grade | — | — | NEEDS_SOURCE | starateliThick |
| consumption | 16–18 кг/м² при 10 мм | 16–18 кг/м² при 10 мм | EXISTING_OK | starateliThick |
| flexural_strength | ≥5 МПа | ≥5 МПа | EXISTING_OK | starateliThick |
| walkability | 24 часа | 24 часа | EXISTING_OK | starateliThick |

### MAT-000079

- Title: Наливной пол Weber Vetonit 3000 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Weber Vetonit 3000 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Weber Vetonit | Weber Vetonit | EXISTING_OK | vetonit3000 |
| product_type | Финишный самовыравнивающийся пол | Финишный самовыравнивающийся пол | EXISTING_OK | vetonit3000 |
| base | — | — | NEEDS_SOURCE | vetonit3000 |
| purpose | — | — | NEEDS_SOURCE | vetonit3000 |
| package_weight | 20 | 20 | EXISTING_OK | vetonit3000 |
| application_area | — | — | NEEDS_SOURCE | vetonit3000 |
| application_method | Ручное нанесение | Ручное нанесение | EXISTING_OK | vetonit3000 |
| substrates | — | — | NEEDS_SOURCE | vetonit3000 |
| color | — | — | NEEDS_SOURCE | vetonit3000 |
| layer_thickness | 1–5 мм | 1–5 мм | EXISTING_OK | vetonit3000 |
| consumption_10mm | — | — | NEEDS_SOURCE | vetonit3000 |
| water_requirement | — | — | NEEDS_SOURCE | vetonit3000 |
| pot_life | — | — | NEEDS_SOURCE | vetonit3000 |
| application_temperature | — | — | NEEDS_SOURCE | vetonit3000 |
| compressive_strength | 20 | 20 | EXISTING_OK | vetonit3000 |
| adhesion | 1 | 1 | EXISTING_OK | vetonit3000 |
| frost_resistance | — | — | NEEDS_SOURCE | vetonit3000 |
| shelf_life | — | — | NEEDS_SOURCE | vetonit3000 |
| standard | — | — | NEEDS_SOURCE | vetonit3000 |
| mortar_grade | — | — | NEEDS_SOURCE | vetonit3000 |
| consumption | 1,5 кг/м²/мм | 1,5 кг/м²/мм | EXISTING_OK | vetonit3000 |
| flexural_strength | 5 МПа | 5 МПа | EXISTING_OK | vetonit3000 |
| walkability | 3–4 часа | 3–4 часа | EXISTING_OK | vetonit3000 |

### MAT-000080

- Title: Наливной пол Weber Vetonit fast 4000 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Weber Vetonit fast 4000 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Weber Vetonit | Weber Vetonit | EXISTING_OK | vetonitFast4000 |
| product_type | — | — | NEEDS_SOURCE | vetonitFast4000 |
| base | — | — | NEEDS_SOURCE | vetonitFast4000 |
| purpose | — | — | NEEDS_SOURCE | vetonitFast4000 |
| package_weight | 20 | 20 | EXISTING_OK | vetonitFast4000 |
| application_area | Сухие и влажные помещения | Сухие и влажные помещения | EXISTING_OK | vetonitFast4000 |
| application_method | Ручное и механизированное | Ручное и механизированное | EXISTING_OK | vetonitFast4000 |
| substrates | — | — | NEEDS_SOURCE | vetonitFast4000 |
| color | — | — | NEEDS_SOURCE | vetonitFast4000 |
| layer_thickness | 3–80 мм | 3–80 мм | EXISTING_OK | vetonitFast4000 |
| consumption_10mm | — | — | NEEDS_SOURCE | vetonitFast4000 |
| water_requirement | 5,2–5,4 л на 20 кг | 5,2–5,4 л на 20 кг | EXISTING_OK | vetonitFast4000 |
| pot_life | — | — | NEEDS_SOURCE | vetonitFast4000 |
| application_temperature | от +10 до +25 °C | от +10 до +25 °C | EXISTING_OK | vetonitFast4000 |
| compressive_strength | 16 | 16 | EXISTING_OK | vetonitFast4000 |
| adhesion | 0.6 | 0.6 | EXISTING_OK | vetonitFast4000 |
| frost_resistance | — | — | NEEDS_SOURCE | vetonitFast4000 |
| shelf_life | — | — | NEEDS_SOURCE | vetonitFast4000 |
| standard | — | — | NEEDS_SOURCE | vetonitFast4000 |
| mortar_grade | — | — | NEEDS_SOURCE | vetonitFast4000 |
| consumption | — | — | NEEDS_SOURCE | vetonitFast4000 |
| flexural_strength | — | — | NEEDS_SOURCE | vetonitFast4000 |
| walkability | 4 часа | 4 часа | EXISTING_OK | vetonitFast4000 |

### MAT-000081

- Title: Наливной пол Weber Vetonit 4100 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Weber Vetonit 4100 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Weber Vetonit | Weber Vetonit | EXISTING_OK | vetonit4100 |
| product_type | — | — | NEEDS_SOURCE | vetonit4100 |
| base | — | — | NEEDS_SOURCE | vetonit4100 |
| purpose | — | — | NEEDS_SOURCE | vetonit4100 |
| package_weight | 20 | 20 | EXISTING_OK | vetonit4100 |
| application_area | — | — | NEEDS_SOURCE | vetonit4100 |
| application_method | Ручное и механизированное | Ручное и механизированное | EXISTING_OK | vetonit4100 |
| substrates | — | — | NEEDS_SOURCE | vetonit4100 |
| color | — | — | NEEDS_SOURCE | vetonit4100 |
| layer_thickness | 2–30 мм | 2–30 мм | EXISTING_OK | vetonit4100 |
| consumption_10mm | — | — | NEEDS_SOURCE | vetonit4100 |
| water_requirement | 4,4–4,8 л на 20 кг | 4,4–4,8 л на 20 кг | EXISTING_OK | vetonit4100 |
| pot_life | — | — | NEEDS_SOURCE | vetonit4100 |
| application_temperature | от +10 до +25 °C | от +10 до +25 °C | EXISTING_OK | vetonit4100 |
| compressive_strength | 20 | 20 | EXISTING_OK | vetonit4100 |
| adhesion | 1 | 1 | EXISTING_OK | vetonit4100 |
| frost_resistance | — | — | NEEDS_SOURCE | vetonit4100 |
| shelf_life | — | — | NEEDS_SOURCE | vetonit4100 |
| standard | — | — | NEEDS_SOURCE | vetonit4100 |
| mortar_grade | — | — | NEEDS_SOURCE | vetonit4100 |
| consumption | 1,6 кг/м²/мм | 1,6 кг/м²/мм | EXISTING_OK | vetonit4100 |
| flexural_strength | 5 МПа | 5 МПа | EXISTING_OK | vetonit4100 |
| walkability | 3–4 часа | 3–4 часа | EXISTING_OK | vetonit4100 |

### MAT-000082

- Title: Наливной пол Weber Vetonit 5000 25 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Weber Vetonit 5000 25 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Weber Vetonit | Weber Vetonit | EXISTING_OK | vetonit5000 |
| product_type | — | — | NEEDS_SOURCE | vetonit5000 |
| base | — | — | NEEDS_SOURCE | vetonit5000 |
| purpose | — | — | NEEDS_SOURCE | vetonit5000 |
| package_weight | 25 | 25 | EXISTING_OK | vetonit5000 |
| application_area | Внутренние сухие и влажные помещения | Внутренние сухие и влажные помещения | EXISTING_OK | vetonit5000 |
| application_method | Ручное нанесение | Ручное нанесение | EXISTING_OK | vetonit5000 |
| substrates | — | — | NEEDS_SOURCE | vetonit5000 |
| color | — | — | NEEDS_SOURCE | vetonit5000 |
| layer_thickness | 5–50 мм; локально до 80 мм | 5–50 мм; локально до 80 мм | EXISTING_OK | vetonit5000 |
| consumption_10mm | — | — | NEEDS_SOURCE | vetonit5000 |
| water_requirement | 3–3,5 л на 25 кг | 3–3,5 л на 25 кг | EXISTING_OK | vetonit5000 |
| pot_life | — | — | NEEDS_SOURCE | vetonit5000 |
| application_temperature | — | — | NEEDS_SOURCE | vetonit5000 |
| compressive_strength | 20 | 20 | EXISTING_OK | vetonit5000 |
| adhesion | 1 | 1 | EXISTING_OK | vetonit5000 |
| frost_resistance | — | — | NEEDS_SOURCE | vetonit5000 |
| shelf_life | — | — | NEEDS_SOURCE | vetonit5000 |
| standard | — | — | NEEDS_SOURCE | vetonit5000 |
| mortar_grade | — | — | NEEDS_SOURCE | vetonit5000 |
| consumption | 1,8 кг/м²/мм | 1,8 кг/м²/мм | EXISTING_OK | vetonit5000 |
| flexural_strength | 5 МПа | 5 МПа | EXISTING_OK | vetonit5000 |
| walkability | 3–4 часа | 3–4 часа | EXISTING_OK | vetonit5000 |

### MAT-000083

- Title: Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Litokol | Litokol | EXISTING_OK | litokolS10 |
| product_type | Тонкослойный самовыравнивающийся состав | Тонкослойный самовыравнивающийся состав | EXISTING_OK | litokolS10 |
| base | — | — | NEEDS_SOURCE | litokolS10 |
| purpose | — | — | NEEDS_SOURCE | litokolS10 |
| package_weight | 20 | 20 | EXISTING_OK | litokolS10 |
| application_area | Внутренние помещения, включая теплый пол | Внутренние помещения, включая теплый пол | EXISTING_OK | litokolS10 |
| application_method | — | — | NEEDS_SOURCE | litokolS10 |
| substrates | Бетонные и цементные/гипсовые стяжки | Бетонные и цементные/гипсовые стяжки | EXISTING_OK | litokolS10 |
| color | — | — | NEEDS_SOURCE | litokolS10 |
| layer_thickness | 1–10 мм | 1–10 мм | EXISTING_OK | litokolS10 |
| consumption_10mm | — | — | NEEDS_SOURCE | litokolS10 |
| water_requirement | — | — | NEEDS_SOURCE | litokolS10 |
| pot_life | — | — | NEEDS_SOURCE | litokolS10 |
| application_temperature | — | — | NEEDS_SOURCE | litokolS10 |
| compressive_strength | — | — | NEEDS_SOURCE | litokolS10 |
| adhesion | — | — | NEEDS_SOURCE | litokolS10 |
| frost_resistance | — | — | NEEDS_SOURCE | litokolS10 |
| shelf_life | — | — | NEEDS_SOURCE | litokolS10 |
| standard | — | — | NEEDS_SOURCE | litokolS10 |
| mortar_grade | — | — | NEEDS_SOURCE | litokolS10 |
| consumption | — | — | NEEDS_SOURCE | litokolS10 |
| flexural_strength | — | — | NEEDS_SOURCE | litokolS10 |
| walkability | — | — | NEEDS_SOURCE | litokolS10 |

### MAT-000084

- Title: Наливной пол Litokol LITOLIV S50 EVO 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Litokol LITOLIV S50 EVO 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Litokol | Litokol | EXISTING_OK | litokolS50 |
| product_type | — | — | NEEDS_SOURCE | litokolS50 |
| base | — | — | NEEDS_SOURCE | litokolS50 |
| purpose | — | — | NEEDS_SOURCE | litokolS50 |
| package_weight | 20 | 20 | EXISTING_OK | litokolS50 |
| application_area | — | — | NEEDS_SOURCE | litokolS50 |
| application_method | — | — | NEEDS_SOURCE | litokolS50 |
| substrates | — | — | NEEDS_SOURCE | litokolS50 |
| color | — | — | NEEDS_SOURCE | litokolS50 |
| layer_thickness | 2–100 мм | 2–100 мм | EXISTING_OK | litokolS50 |
| consumption_10mm | — | — | NEEDS_SOURCE | litokolS50 |
| water_requirement | 4,2–4,6 л на 20 кг | 4,2–4,6 л на 20 кг | EXISTING_OK | litokolS50 |
| pot_life | — | — | NEEDS_SOURCE | litokolS50 |
| application_temperature | от +5 до +35 °C | от +5 до +35 °C | EXISTING_OK | litokolS50 |
| compressive_strength | — | — | NEEDS_SOURCE | litokolS50 |
| adhesion | — | — | NEEDS_SOURCE | litokolS50 |
| frost_resistance | — | — | NEEDS_SOURCE | litokolS50 |
| shelf_life | 12 | 12 | EXISTING_OK | litokolS50 |
| standard | — | — | NEEDS_SOURCE | litokolS50 |
| mortar_grade | — | — | NEEDS_SOURCE | litokolS50 |
| consumption | — | — | NEEDS_SOURCE | litokolS50 |
| flexural_strength | — | — | NEEDS_SOURCE | litokolS50 |
| walkability | 2–4 часа | 2–4 часа | EXISTING_OK | litokolS50 |

### MAT-000085

- Title: Наливной пол ВОЛМА-Нивелир Экспресс 25 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол ВОЛМА-Нивелир Экспресс 25 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | ВОЛМА | ВОЛМА | EXISTING_OK | volmaExpress |
| product_type | — | — | NEEDS_SOURCE | volmaExpress |
| base | — | — | NEEDS_SOURCE | volmaExpress |
| purpose | — | — | NEEDS_SOURCE | volmaExpress |
| package_weight | 25 | 25 | EXISTING_OK | volmaExpress |
| application_area | — | — | NEEDS_SOURCE | volmaExpress |
| application_method | — | — | NEEDS_SOURCE | volmaExpress |
| substrates | — | — | NEEDS_SOURCE | volmaExpress |
| color | — | — | NEEDS_SOURCE | volmaExpress |
| layer_thickness | 2–100 мм | 2–100 мм | EXISTING_OK | volmaExpress |
| consumption_10mm | — | — | NEEDS_SOURCE | volmaExpress |
| water_requirement | 0,29–0,34 л/кг | 0,29–0,34 л/кг | EXISTING_OK | volmaExpress |
| pot_life | — | — | NEEDS_SOURCE | volmaExpress |
| application_temperature | от +5 до +30 °C | от +5 до +30 °C | EXISTING_OK | volmaExpress |
| compressive_strength | — | — | NEEDS_SOURCE | volmaExpress |
| adhesion | — | — | NEEDS_SOURCE | volmaExpress |
| frost_resistance | — | — | NEEDS_SOURCE | volmaExpress |
| shelf_life | 12 | 12 | EXISTING_OK | volmaExpress |
| standard | — | — | NEEDS_SOURCE | volmaExpress |
| mortar_grade | — | — | NEEDS_SOURCE | volmaExpress |
| consumption | — | — | NEEDS_SOURCE | volmaExpress |
| flexural_strength | — | — | NEEDS_SOURCE | volmaExpress |
| walkability | 3 часа | 3 часа | EXISTING_OK | volmaExpress |

### MAT-000086

- Title: Наливной пол Основит Скорлайн FK45 R 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Основит Скорлайн FK45 R 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Основит | Основит | EXISTING_OK | osnovitFk45 |
| product_type | — | — | NEEDS_SOURCE | osnovitFk45 |
| base | — | — | NEEDS_SOURCE | osnovitFk45 |
| purpose | — | — | NEEDS_SOURCE | osnovitFk45 |
| package_weight | 20 | 20 | EXISTING_OK | osnovitFk45 |
| application_area | Внутренние сухие и влажные помещения | Внутренние сухие и влажные помещения | EXISTING_OK | osnovitFk45 |
| application_method | Ручное и механизированное | Ручное и механизированное | EXISTING_OK | osnovitFk45 |
| substrates | Бетон, гипсовые и цементно-песчаные основания | Бетон, гипсовые и цементно-песчаные основания | EXISTING_OK | osnovitFk45 |
| color | — | — | NEEDS_SOURCE | osnovitFk45 |
| layer_thickness | 2–100 мм | 2–100 мм | EXISTING_OK | osnovitFk45 |
| consumption_10mm | — | — | NEEDS_SOURCE | osnovitFk45 |
| water_requirement | 0,26–0,27 л/кг | 0,26–0,27 л/кг | EXISTING_OK | osnovitFk45 |
| pot_life | — | — | NEEDS_SOURCE | osnovitFk45 |
| application_temperature | от +5 до +30 °C | от +5 до +30 °C | EXISTING_OK | osnovitFk45 |
| compressive_strength | — | — | NEEDS_SOURCE | osnovitFk45 |
| adhesion | — | — | NEEDS_SOURCE | osnovitFk45 |
| frost_resistance | — | — | NEEDS_SOURCE | osnovitFk45 |
| shelf_life | 12 | 12 | EXISTING_OK | osnovitFk45 |
| standard | — | — | NEEDS_SOURCE | osnovitFk45 |
| mortar_grade | — | — | NEEDS_SOURCE | osnovitFk45 |
| consumption | — | — | NEEDS_SOURCE | osnovitFk45 |
| flexural_strength | — | — | NEEDS_SOURCE | osnovitFk45 |
| walkability | 4 часа | 4 часа | EXISTING_OK | osnovitFk45 |

### MAT-000087

- Title: Наливной пол Ceresit CN 175 Super 20 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Наливной пол Ceresit CN 175 Super 20 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Ceresit | Ceresit | EXISTING_OK | ceresitCn175 |
| product_type | — | — | NEEDS_SOURCE | ceresitCn175 |
| base | — | — | NEEDS_SOURCE | ceresitCn175 |
| purpose | — | — | NEEDS_SOURCE | ceresitCn175 |
| package_weight | 20 | 20 | EXISTING_OK | ceresitCn175 |
| application_area | — | — | NEEDS_SOURCE | ceresitCn175 |
| application_method | Ручное и механизированное | Ручное и механизированное | EXISTING_OK | ceresitCn175 |
| substrates | — | — | NEEDS_SOURCE | ceresitCn175 |
| color | — | — | NEEDS_SOURCE | ceresitCn175 |
| layer_thickness | 3–60 мм | 3–60 мм | EXISTING_OK | ceresitCn175 |
| consumption_10mm | — | — | NEEDS_SOURCE | ceresitCn175 |
| water_requirement | около 3,6 л на 20 кг; 4,5 л на 25 кг | около 3,6 л на 20 кг; 4,5 л на 25 кг | EXISTING_OK | ceresitCn175 |
| pot_life | — | — | NEEDS_SOURCE | ceresitCn175 |
| application_temperature | от +5 до +30 °C | от +5 до +30 °C | EXISTING_OK | ceresitCn175 |
| compressive_strength | — | — | NEEDS_SOURCE | ceresitCn175 |
| adhesion | — | — | NEEDS_SOURCE | ceresitCn175 |
| frost_resistance | — | — | NEEDS_SOURCE | ceresitCn175 |
| shelf_life | — | — | NEEDS_SOURCE | ceresitCn175 |
| standard | — | — | NEEDS_SOURCE | ceresitCn175 |
| mortar_grade | — | — | NEEDS_SOURCE | ceresitCn175 |
| consumption | около 1,8 кг/м²/мм | около 1,8 кг/м²/мм | EXISTING_OK | ceresitCn175 |
| flexural_strength | — | — | NEEDS_SOURCE | ceresitCn175 |
| walkability | не менее 5 часов | не менее 5 часов | EXISTING_OK | ceresitCn175 |

### MAT-000089

- Title: Легкая стяжка пола KNAUF Ubo 25 кг
- Identity: READY_FOR_CORE_REVIEW
- Candidate title (review only): Легкая стяжка пола KNAUF Ubo 25 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | KNAUF | KNAUF | EXISTING_OK | knaufUbo |
| product_type | — | — | NEEDS_SOURCE | knaufUbo |
| base | Специальный цемент и гранулы полистирола | Специальный цемент и гранулы полистирола | EXISTING_OK | knaufUbo |
| purpose | Легкая стяжка для слабых оснований и размещения коммуникаций | Легкая стяжка для слабых оснований и размещения коммуникаций | EXISTING_OK | knaufUbo |
| package_weight | 25 | 25 | EXISTING_OK | knaufUbo |
| application_area | — | — | NEEDS_SOURCE | knaufUbo |
| application_method | — | — | NEEDS_SOURCE | knaufUbo |
| substrates | — | — | NEEDS_SOURCE | knaufUbo |
| color | — | — | NEEDS_SOURCE | knaufUbo |
| layer_thickness | 3–30 см | 3–30 см | EXISTING_OK | knaufUbo |
| consumption_10mm | — | — | NEEDS_SOURCE | knaufUbo |
| water_requirement | — | — | NEEDS_SOURCE | knaufUbo |
| pot_life | — | — | NEEDS_SOURCE | knaufUbo |
| application_temperature | — | — | NEEDS_SOURCE | knaufUbo |
| compressive_strength | — | — | NEEDS_SOURCE | knaufUbo |
| adhesion | — | — | NEEDS_SOURCE | knaufUbo |
| frost_resistance | — | — | NEEDS_SOURCE | knaufUbo |
| shelf_life | 12 | 12 | EXISTING_OK | knaufUbo |
| standard | — | — | NEEDS_SOURCE | knaufUbo |
| mortar_grade | — | — | NEEDS_SOURCE | knaufUbo |
| consumption | — | — | NEEDS_SOURCE | knaufUbo |
| flexural_strength | >0,5 МПа | >0,5 МПа | EXISTING_OK | knaufUbo |
| walkability | 48 часов | 48 часов | EXISTING_OK | knaufUbo |

### MAT-000090

- Title: Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг
- Identity: PARTIAL
- Candidate title (review only): Стяжка пола Основит Стартолайн FC41 H 25 кг
- Image: —; product_images=0
- Cleanup: SKIPPED

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Основит | Основит | EXISTING_OK | osnovitFc41 |
| product_type | Высокопрочная стяжка | Высокопрочная стяжка | EXISTING_OK | osnovitFc41 |
| base | — | — | NEEDS_SOURCE | osnovitFc41 |
| purpose | — | — | NEEDS_SOURCE | osnovitFc41 |
| package_weight | 25 | 25 | EXISTING_OK | osnovitFc41 |
| application_area | Внутренние и наружные работы; тёплый пол | Внутренние и наружные работы; тёплый пол | EXISTING_OK | osnovitFc41 |
| application_method | — | — | NEEDS_SOURCE | osnovitFc41 |
| substrates | — | — | NEEDS_SOURCE | osnovitFc41 |
| color | — | — | NEEDS_SOURCE | osnovitFc41 |
| layer_thickness | — | — | NEEDS_SOURCE | osnovitFc41 |
| consumption_10mm | — | — | NEEDS_SOURCE | osnovitFc41 |
| water_requirement | — | — | NEEDS_SOURCE | osnovitFc41 |
| pot_life | — | — | NEEDS_SOURCE | osnovitFc41 |
| application_temperature | — | — | NEEDS_SOURCE | osnovitFc41 |
| compressive_strength | — | — | NEEDS_SOURCE | osnovitFc41 |
| adhesion | — | — | NEEDS_SOURCE | osnovitFc41 |
| frost_resistance | — | — | NEEDS_SOURCE | osnovitFc41 |
| shelf_life | — | — | NEEDS_SOURCE | osnovitFc41 |
| standard | — | — | NEEDS_SOURCE | osnovitFc41 |
| mortar_grade | — | — | NEEDS_SOURCE | osnovitFc41 |
| consumption | — | — | NEEDS_SOURCE | osnovitFc41 |
| flexural_strength | — | — | NEEDS_SOURCE | osnovitFc41 |
| walkability | — | — | NEEDS_SOURCE | osnovitFc41 |

## Definitions

Existing/reused: brand, product_type, base, purpose, package_weight, consumption_10mm, application_area, application_method, substrates, color, layer_thickness, water_requirement, pot_life, application_temperature, compressive_strength, adhesion, frost_resistance, shelf_life, standard, mortar_grade
Created on apply only if absent: consumption, flexural_strength, walkability
No templates created.

## Title normalization

| MAT | before guard title | target title | current result |
|---|---|---|---|
| MAT-000075 | Наливной пол "Unis Горизонт" 20 кг | Наливной пол UNIS Горизонт 20 кг | UNCHANGED_BY_POLICY |
| MAT-000076 | Наливной пол "Unis Горизонт" Армированный 20 кг | Наливной пол UNIS Горизонт Армированный 20 кг | EXISTING_OK |
| MAT-000077 | Наливной пол "Старатели" Быстрый 20 кг | Наливной пол Старатели Быстротвердеющий 20 кг | UNCHANGED_BY_POLICY |
| MAT-000078 | Наливной пол "Старатели" Толстый 25кг | Наливной пол Старатели Толстый 25 кг | EXISTING_OK |
| MAT-000079 | Наливной пол финишный Weber Vetonit 3000 самовыравнивающийся 20 кг | Наливной пол Weber Vetonit 3000 20 кг | EXISTING_OK |
| MAT-000080 | Наливной пол универсальный Weber Vetonit fast 4000 20 кг | Наливной пол Weber Vetonit fast 4000 20 кг | EXISTING_OK |
| MAT-000081 | Наливной пол финишный Vetonit 4100 высокопрочный 20 кг | Наливной пол Weber Vetonit 4100 20 кг | EXISTING_OK |
| MAT-000082 | Наливной пол первичный Weber Vetonit 5000 быстротвердеющий 25 кг | Наливной пол Weber Vetonit 5000 25 кг | EXISTING_OK |
| MAT-000083 | Наливной пол Litokol LitoLiv S10 Express 20 кг | Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг | EXISTING_OK |
| MAT-000084 | Наливной пол универсальный Litokol Litoliv S50 самовыравнивающийся 20 кг | Наливной пол Litokol LITOLIV S50 EVO 20 кг | EXISTING_OK |
| MAT-000085 | Наливной пол Волма Нивелир Экспресс 25 кг | Наливной пол ВОЛМА-Нивелир Экспресс 25 кг | EXISTING_OK |
| MAT-000086 | Наливной пол Основит Скорлайн FK45R самовыравнивающийся 20 кг | Наливной пол Основит Скорлайн FK45 R 20 кг | EXISTING_OK |
| MAT-000087 | Наливной пол самовыравнивающийся Ceresit CN 175 20 кг | Наливной пол Ceresit CN 175 Super 20 кг | EXISTING_OK |
| MAT-000089 | Стяжка пола цементная, легкая Knauf Ubo 25 кг | Легкая стяжка пола KNAUF Ubo 25 кг | EXISTING_OK |
| MAT-000090 | Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг | Стяжка пола Основит Стартолайн FC41 H 25 кг | UNCHANGED_BY_POLICY |

## Safety

Placeholder cleanup requires --cleanup-shared-placeholder and exact shared URL with zero product_images. MAT-000075 and MAT-000077 remain unresolved by policy. MAT-000090 receives only identity/core facts.
