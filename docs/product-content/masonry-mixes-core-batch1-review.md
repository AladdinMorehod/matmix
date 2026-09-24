# Кладочные смеси — CORE batch 1 review

Проверено: 2026-09-24. Локальный режим; production не используется.

## Scope and writable surface

Только MAT-000067, MAT-000068, MAT-000069. `products.brand` и `product_attribute_values` для allowlisted core codes; `image_url` очищается только отдельным флагом и только для известного shared placeholder при отсутствии product_images.
Title, slug, descriptions, SEO, price, weight, unit, category, subcategory, stock и image tables не являются write targets.
CONFIRM=BACKFILL_MASONRY_MIXES_CORE_BATCH1. Dry-run read-only; apply требует backup, transaction и exact guards.

## Summary

```json
{
  "total": 3,
  "readyProducts": 1,
  "partialProducts": 2,
  "errors": 0,
  "logicalSlots": 60,
  "willAdd": 32,
  "willFix": 0,
  "existingOk": 0,
  "needsSource": 28,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "brandConflict": 0,
  "titleGuardBlocked": 0,
  "imageCleanupEligible": 3,
  "definitionsToCreate": 12
}
```

| MAT | status | willAdd | existingOk | needsSource | conflicts | image cleanup |
|---|---|---:|---:|---:|---:|---|
| MAT-000067 | PARTIAL | 4 | 0 | 16 | 0 | ELIGIBLE |
| MAT-000068 | READY | 20 | 0 | 0 | 0 | ELIGIBLE |
| MAT-000069 | PARTIAL | 8 | 0 | 12 | 0 | ELIGIBLE |

## Per-MAT

### MAT-000067

- Current title: Кладочно - монтажная смесь цементная Евро М-200 40кг
- Title candidate: Кладочно-монтажная смесь EUROmix М-200 40 кг
- Brand: EUROMIX
- Image URL: /uploads/products/MAT-000001-20260714153714969-3fb7fe.png
- Product images: 0
- Image cleanup: ELIGIBLE — Remove only the known MAT-000001 shared placeholder when no product_images rows exist; SSR and SPA render the neutral 'Фото скоро появятся' fallback for an empty URL.

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | EUROMIX | — | WILL_ADD | ownerEuromix |
| product_type | Кладочно-монтажная смесь | — | WILL_ADD | ownerEuromix |
| base | — | — | NEEDS_SOURCE | ownerEuromix |
| purpose | — | — | NEEDS_SOURCE | ownerEuromix |
| package_weight | 40 | — | WILL_ADD | ownerEuromix, euromixSecondary |
| application_area | — | — | NEEDS_SOURCE | ownerEuromix |
| application_method | — | — | NEEDS_SOURCE | ownerEuromix |
| substrates | — | — | NEEDS_SOURCE | ownerEuromix |
| color | — | — | NEEDS_SOURCE | ownerEuromix |
| layer_thickness | — | — | NEEDS_SOURCE | ownerEuromix |
| consumption_10mm | — | — | NEEDS_SOURCE | ownerEuromix |
| water_requirement | — | — | NEEDS_SOURCE | ownerEuromix |
| pot_life | — | — | NEEDS_SOURCE | ownerEuromix |
| application_temperature | — | — | NEEDS_SOURCE | ownerEuromix |
| compressive_strength | — | — | NEEDS_SOURCE | ownerEuromix |
| adhesion | — | — | NEEDS_SOURCE | ownerEuromix |
| frost_resistance | — | — | NEEDS_SOURCE | ownerEuromix |
| shelf_life | — | — | NEEDS_SOURCE | ownerEuromix |
| standard | — | — | NEEDS_SOURCE | ownerEuromix |
| mortar_grade | М-200 | — | WILL_ADD | ownerEuromix, euromixSecondary |

### MAT-000068

- Current title: Кладочно - монтажная смесь цементная Русеан М-200 40кг
- Title candidate: Кладочно-монтажная смесь Русеан М-200 40 кг
- Brand: Русеан
- Image URL: /uploads/products/MAT-000001-20260714153714969-3fb7fe.png
- Product images: 0
- Image cleanup: ELIGIBLE — Remove only the known MAT-000001 shared placeholder when no product_images rows exist; SSR and SPA render the neutral 'Фото скоро появятся' fallback for an empty URL.

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | Русеан | — | WILL_ADD | ruseanM200 |
| product_type | Сухая монтажно-кладочная смесь | — | WILL_ADD | ruseanM200 |
| base | Портландцемент и сухой фракционный песок | — | WILL_ADD | ruseanM200 |
| purpose | Кладка кирпича, монтаж бетонных блоков, укладка тротуарной плитки и брусчатки, ремонт кирпичных и бетонных стен и полов, заделка швов, трещин, выбоин и углублений, фиксация металлических элементов и конструкций | — | WILL_ADD | ruseanM200 |
| package_weight | 40 | — | WILL_ADD | ruseanM200 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | ruseanM200 |
| application_method | Ручное нанесение | — | WILL_ADD | ruseanM200 |
| substrates | Кирпич, бетонные основания и бетонные блоки | — | WILL_ADD | ruseanM200 |
| color | Серый | — | WILL_ADD | ruseanM200 |
| layer_thickness | 10–30 мм | — | WILL_ADD | ruseanM200 |
| consumption_10mm | 19.5 | — | WILL_ADD | ruseanM200 |
| water_requirement | 4,4–5,6 л на 40 кг | — | WILL_ADD | ruseanM200 |
| pot_life | 1 | — | WILL_ADD | ruseanM200 |
| application_temperature | от +5 до +25 °C | — | WILL_ADD | ruseanM200 |
| compressive_strength | 23 | — | WILL_ADD | ruseanM200 |
| adhesion | 0.4 | — | WILL_ADD | ruseanM200 |
| frost_resistance | F35 | — | WILL_ADD | ruseanM200 |
| shelf_life | 6 | — | WILL_ADD | ruseanM200 |
| standard | ГОСТ 31357-2007 | — | WILL_ADD | ruseanM200 |
| mortar_grade | М-200 | — | WILL_ADD | ruseanM200 |

### MAT-000069

- Current title: Кладочно - монтажная смесь цементная Вертекс М-200 40кг
- Title candidate: Кладочно-монтажная смесь VERTEX М-200 40 кг
- Brand: VERTEX
- Image URL: /uploads/products/MAT-000001-20260714153714969-3fb7fe.png
- Product images: 0
- Image cleanup: ELIGIBLE — Remove only the known MAT-000001 shared placeholder when no product_images rows exist; SSR and SPA render the neutral 'Фото скоро появятся' fallback for an empty URL.

| code | proposed | current | status | source/reason |
|---|---|---|---|---|
| brand | VERTEX | — | WILL_ADD | vertexM200 |
| product_type | Сухая монтажно-кладочная смесь | — | WILL_ADD | vertexM200 |
| base | Цемент и специальные добавки | — | WILL_ADD | vertexM200 |
| purpose | Кладка стен из кирпича, монтаж бетонных блоков, укладка тротуарной плитки и брусчатки, устройство стяжек, ремонт кирпичных и бетонных стен, полов и фундаментов, заделка швов, трещин, выбоин и углублений, монтаж и крепление металлических элементов и конструкций | — | WILL_ADD | vertexM200 |
| package_weight | 40 | — | WILL_ADD | vertexM200 |
| application_area | Внутренние и наружные работы | — | WILL_ADD | vertexM200 |
| application_method | — | — | NEEDS_SOURCE | vertexM200 |
| substrates | Кирпич, бетонные блоки, кирпичные и бетонные основания | — | WILL_ADD | vertexM200 |
| color | — | — | NEEDS_SOURCE | vertexM200 |
| layer_thickness | — | — | NEEDS_SOURCE | vertexM200 |
| consumption_10mm | — | — | NEEDS_SOURCE | vertexM200 |
| water_requirement | — | — | NEEDS_SOURCE | vertexM200 |
| pot_life | — | — | NEEDS_SOURCE | vertexM200 |
| application_temperature | — | — | NEEDS_SOURCE | vertexM200 |
| compressive_strength | — | — | NEEDS_SOURCE | vertexM200 |
| adhesion | — | — | NEEDS_SOURCE | vertexM200 |
| frost_resistance | — | — | NEEDS_SOURCE | vertexM200 |
| shelf_life | — | — | NEEDS_SOURCE | vertexM200 |
| standard | — | — | NEEDS_SOURCE | vertexM200 |
| mortar_grade | М-200 | — | WILL_ADD | vertexM200 |

## Definitions

Reused: brand, product_type, base, purpose, package_weight, consumption_10mm, application_temperature, shelf_life
Created on apply only: application_area, application_method, substrates, color, layer_thickness, water_requirement, pot_life, compressive_strength, adhesion, frost_resistance, standard, mortar_grade
Templates: none created; frontend reads product values independently of template rows.

## Title candidates

- MAT-000067: Кладочно - монтажная смесь цементная Евро М-200 40кг → Кладочно-монтажная смесь EUROmix М-200 40 кг (review only)
- MAT-000068: Кладочно - монтажная смесь цементная Русеан М-200 40кг → Кладочно-монтажная смесь Русеан М-200 40 кг (review only)
- MAT-000069: Кладочно - монтажная смесь цементная Вертекс М-200 40кг → Кладочно-монтажная смесь VERTEX М-200 40 кг (review only)

## Source registry

- **ownerEuromix**: Owner-confirmed EUROMIX M-200 identity — Owner-confirmed EUROMIX/EUROmix M-200 cement dry masonry/installation mix, 40 kg. Identity source only; technical fields remain unresolved.
- **euromixSecondary**: [Сухая смесь М-200 Euromix Кладочная (40 кг)](https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/) — Exact product/pack context from a secondary listing; not used for unverified technical specifications.
- **ruseanM200**: [Сухая смесь М-200 монтажно-кладочная, 40 кг](https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/) — Official product page with exact 40 kg identity and specification table.
- **ruseanPrice**: [Русеан official price list](https://rusean.ru/pricelist/) — Official price list separately lists the exact M-200 монтажно-кладочная 40 kg product.
- **vertexM200**: [VERTEX.production M-200](https://vertexproduction.ru/) — Official manufacturer page identifies M-200 as a 40 kg cement-based dry masonry/installation mix for internal and external work.
