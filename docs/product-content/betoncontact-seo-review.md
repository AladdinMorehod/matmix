# Бетонконтакт — SEO review

Изменяются только `products.seo_title` и `products.seo_description`; title, descriptions, core attributes, images, price и stock не изменяются.

SEO_MUTABLE_FIELDS_EXACTLY = ["seo_title", "seo_description"]
CONFIRM = BACKFILL_BETONCONTACT_SEO

## Summary

```json
{
  "total": 5,
  "willAdd": 5,
  "existingOk": 0,
  "contentConflict": 0,
  "errors": 0,
  "duplicateSeoTitles": 0,
  "duplicateSeoDescriptions": 0
}
```

| MAT | Status | SEO title chars | SEO description chars |
|---|---|---:|---:|
| MAT-000217 | WILL_ADD | 44 | 131 |
| MAT-000218 | WILL_ADD | 45 | 132 |
| MAT-000219 | WILL_ADD | 42 | 149 |
| MAT-000220 | WILL_ADD | 43 | 150 |
| MAT-000221 | WILL_ADD | 38 | 166 |

## SEO proposals

### MAT-000217

- Title: Бетонконтакт Knauf Бетогрунд 5 кг
- Status: **WILL_ADD**
- Source keys: knaufBetogrund
- SEO title: KNAUF Бетогрунд 5 кг — бетонконтакт \| MatMix
- SEO description: KNAUF Бетогрунд 5 кг — готовая адгезионная грунтовка для бетонных и гладких оснований. Расход около 0,25 кг/м², высыхание 12 часов.

### MAT-000218

- Title: Бетонконтакт Knauf Бетогрунд 15 кг
- Status: **WILL_ADD**
- Source keys: knaufBetogrund
- SEO title: KNAUF Бетогрунд 15 кг — бетонконтакт \| MatMix
- SEO description: KNAUF Бетогрунд 15 кг — готовая адгезионная грунтовка для бетонных и гладких оснований. Расход около 0,25 кг/м², высыхание 12 часов.

### MAT-000219

- Title: Бетонконтакт Ceresit CT 19, 5 кг
- Status: **WILL_ADD**
- Source keys: ceresitCt19
- SEO title: Ceresit CT 19 5 кг — бетонконтакт \| MatMix
- SEO description: Ceresit CT 19 5 кг — готовая адгезионная грунтовка для гладкого бетона, внутренних и наружных работ. Расход около 0,2 кг/м², высыхание около 3 часов.

### MAT-000220

- Title: Бетонконтакт Ceresit CT 19, 15 кг
- Status: **WILL_ADD**
- Source keys: ceresitCt19
- SEO title: Ceresit CT 19 15 кг — бетонконтакт \| MatMix
- SEO description: Ceresit CT 19 15 кг — готовая адгезионная грунтовка для гладкого бетона, внутренних и наружных работ. Расход около 0,2 кг/м², высыхание около 3 часов.

### MAT-000221

- Title: Бетонконтакт Cтаратели 20 кг
- Status: **WILL_ADD**
- Source keys: starateliBeton
- SEO title: Старатели Бетон-Контакт 20 кг \| MatMix
- SEO description: Старатели Бетон-Контакт 20 кг — готовая грунтовка для бетонных, плиточных и окрашенных масляной краской оснований. Наносится валиком или кистью; расход 0,2–0,3 кг/м².

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
