# Бетонконтакт — descriptions review

Изменяется только `products.full_description`; title, SEO, attributes, images, price, stock и другие product fields не изменяются.

DESCRIPTION_MUTABLE_FIELDS_EXACTLY = ["full_description"]
CONFIRM = BACKFILL_BETONCONTACT_DESCRIPTIONS

## Summary

```json
{
  "total": 5,
  "willAdd": 5,
  "existingOk": 0,
  "contentConflict": 0,
  "errors": 0,
  "excludedAllowlist": 0
}
```

| MAT | Status | Characters | Source keys |
|---|---|---:|---|
| MAT-000217 | WILL_ADD | 312 | knaufBetogrund |
| MAT-000218 | WILL_ADD | 313 | knaufBetogrund |
| MAT-000219 | WILL_ADD | 342 | ceresitCt19 |
| MAT-000220 | WILL_ADD | 343 | ceresitCt19 |
| MAT-000221 | WILL_ADD | 371 | starateliBeton |

## Proposed descriptions

### MAT-000217

- Title: Бетонконтакт Knauf Бетогрунд 5 кг
- Status: **WILL_ADD**
- Source keys: knaufBetogrund

КНАУФ-Бетогрунд — готовая к применению адгезионная грунтовка на полимерной дисперсии с кварцевым песком. Предназначена для подготовки бетонных и гладких плотных оснований перед нанесением последующих покрытий во внутренних работах. Расход — около 0,25 кг/м², высыхание — 12 часов. Цвет — розовый. Фасовка — 5 кг.

### MAT-000218

- Title: Бетонконтакт Knauf Бетогрунд 15 кг
- Status: **WILL_ADD**
- Source keys: knaufBetogrund

КНАУФ-Бетогрунд — готовая к применению адгезионная грунтовка на полимерной дисперсии с кварцевым песком. Предназначена для подготовки бетонных и гладких плотных оснований перед нанесением последующих покрытий во внутренних работах. Расход — около 0,25 кг/м², высыхание — 12 часов. Цвет — розовый. Фасовка — 15 кг.

### MAT-000219

- Title: Бетонконтакт Ceresit CT 19, 5 кг
- Status: **WILL_ADD**
- Source keys: ceresitCt19

Ceresit CT 19 — готовая к применению адгезионная грунтовка для гладких бетонных, монолитных и сборных железобетонных оснований. Предназначена для внутренних и наружных работ и повышения адгезии последующих покрытий. Расход — около 0,2 кг/м², высыхание — около 3 часов, температура применения — от +5 до +30 °C. Цвет — розовый. Фасовка — 5 кг.

### MAT-000220

- Title: Бетонконтакт Ceresit CT 19, 15 кг
- Status: **WILL_ADD**
- Source keys: ceresitCt19

Ceresit CT 19 — готовая к применению адгезионная грунтовка для гладких бетонных, монолитных и сборных железобетонных оснований. Предназначена для внутренних и наружных работ и повышения адгезии последующих покрытий. Расход — около 0,2 кг/м², высыхание — около 3 часов, температура применения — от +5 до +30 °C. Цвет — розовый. Фасовка — 15 кг.

### MAT-000221

- Title: Бетонконтакт Cтаратели 20 кг
- Status: **WILL_ADD**
- Source keys: starateliBeton

Грунтовка «БЕТОН-КОНТАКТ» «Старатели» — готовый к применению состав на полимерной дисперсии с песком. Используется для подготовки бетонных, плиточных и окрашенных масляной краской оснований во внутренних работах. Наносится валиком или кистью. Расход — 0,2–0,3 кг/м², высыхание — 2–3 часа, температура применения — от +5 до +30 °C. Цвет плёнки — вишнёвый. Фасовка — 20 кг.

## Source registry

- **knaufBetogrund**: [КНАУФ-Бетогрунд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/) — KNAUF Russia
- **ceresitCt19**: [Ceresit CT 19 Бетонконтакт](https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact) — Ceresit Russia
- **starateliBeton**: [Грунтовка БЕТОН-КОНТАКТ](https://www.starateli.ru/po-betonu/) — Старатели

## MAT-000225 identity research (out of scope)

- Status: **IDENTITY_PARTIAL**
- Primary source: not found.
- Secondary evidence: [MixTools listing](https://mixtools.ru/catalog/lakokrasochnye_materialy/gruntovki_i_betonokontakt/betonokontakt/betonokontakt_universalnyy_real_beton_kontakt_vedro_20kg_bs_725_20/) identifies REAL BETON-KONTAKT, article БС-725-20 / BS-725-20, 20 kg and reports manufacturer СТК Профи.
- Decision: retailer repetition is insufficient for confirmation; MAT-000225 is excluded from this batch.

## Local rehearsal

- Description and SEO apply rehearsals ran only on temporary database copies.
- Second dry-runs were stable (WILL_ADD=0, EXISTING_OK=5).
- Real local audit DB remained unchanged.
