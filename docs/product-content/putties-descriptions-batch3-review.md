# Putty full descriptions — Batch3 review

Изменяется только `products.full_description`; production не используется.

DESCRIPTION_MUTABLE_FIELDS_EXACTLY = ["full_description"]
UNSUPPORTED_CLAIMS=0

## Dry-run

| MAT | Current title | Status | Characters | Source keys |
|---|---|---|---:|---|
| MAT-000061 | Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг | NEEDS_FIX | 416 | knaufMultiFinish, localTitle |
| MAT-000062 | Шпаклевка цементная базовая Старатели 20 кг | NEEDS_FIX | 497 | starBaseCement, localTitle |
| MAT-000063 | Шпаклевка цементная фасадно финишная Старатели 20 кг | NEEDS_FIX | 631 | starFacadeFinish, localTitle |
| MAT-000064 | Шпаклевка Vetonit VH для влажных помещений белая 20 кг | NEEDS_FIX | 511 | vetonitVH, localTitle |
| MAT-000065 | Шпаклевка по дереву VGT Белая 1 кг | NEEDS_FIX | 426 | vgtExtraWood, localTitle |

## Per-MAT description review

### MAT-000061

- Exact current title: Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг
- Canonical identity: КНАУФ-Мульти-Финиш
- Status: **NEEDS_FIX**
- Character count: 416
- Source keys: knaufMultiFinish, localTitle
- Facts used: product_type: Цементная фасадная шпаклёвка; purpose: Выравнивание бетонных и цементных поверхностей, ремонт и заполнение дефектов; package_weight: 25; form: Сухая смесь; application_area: Наружные и внутренние работы, включая влажные помещения; application_method: Ручное нанесение; substrates: Бетон, цементные штукатурки; layer_thickness: 1–3 мм; локально до 5 мм; consumption: 1,2 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +5 °C; pot_life: не менее 3 часов
- Facts intentionally omitted: color: Официальный продукт выпускается в белом и сером вариантах; exact вариант локальной карточки не установлен.; drying_time: Точное время высыхания для exact SKU/условий не подтверждено.
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

КНАУФ-Мульти-Финиш 25 кг — цементная фасадная шпаклёвка для выравнивания бетонных и цементных поверхностей, ремонта и заполнения дефектов. Подходит для наружных и внутренних работ, включая влажные помещения.

Сухую смесь наносят вручную слоем 1–3 мм; локально допускается до 5 мм. Расход — 1,2 кг/м² при слое 1 мм. Работы выполняют при температуре не ниже +5 °C, жизнеспособность — не менее 3 часов. Фасовка — 25 кг.

### MAT-000062

- Exact current title: Шпаклевка цементная базовая Старатели 20 кг
- Canonical identity: Шпатлёвка цементная «Базовая» ГОСТ 33699-2015
- Status: **NEEDS_FIX**
- Character count: 497
- Source keys: starBaseCement, localTitle
- Facts used: product_type: Цементная шпатлёвка базовая; purpose: Выравнивание стен и потолков; package_weight: 20; form: Сухая смесь; application_area: Внутри помещений, нормальная и повышенная влажность; application_method: Ручное и механизированное; substrates: Бетон, железобетон, ячеистый бетон, кирпич, цементная штукатурка; layer_thickness: 0,8–8 мм; consumption: 1 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: от +10 до +30 °C; pot_life: не менее 3 часов; drying_time: 24 часа до последующей обработки; color: Светло-бежевый
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Старатели Базовая 20 кг — цементная базовая шпатлёвка для выравнивания стен и потолков внутри помещений с нормальной и повышенной влажностью. Подходит для бетона, железобетона, ячеистого бетона, кирпича и цементной штукатурки.

Сухую смесь наносят вручную или механизированно слоем 0,8–8 мм. Расход — 1 кг/м² при слое 1 мм. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — не менее 3 часов, последующая обработка возможна через 24 часа. Цвет — светло-бежевый. Фасовка — 20 кг.

### MAT-000063

- Exact current title: Шпаклевка цементная фасадно финишная Старатели 20 кг
- Canonical identity: Шпатлёвка цементная «Фасадно-финишная» ГОСТ 33699-2015
- Status: **NEEDS_FIX**
- Character count: 631
- Source keys: starFacadeFinish, localTitle
- Facts used: product_type: Цементная фасадно-финишная шпатлёвка; purpose: Финишное выравнивание фасадов, стен и потолков; package_weight: 20; form: Сухая смесь; application_area: Наружные и внутренние работы, включая влажные и неотапливаемые помещения; application_method: Ручное и механизированное; substrates: Бетон, цементные штукатурки, крупнозернистые шпатлёвки; допускаются ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон; layer_thickness: 0,3–3 мм; consumption: 1 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: от +10 до +30 °C; pot_life: не менее 3 часов; drying_time: 24 часа до последующей обработки; color: Белый
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Старатели Фасадно-финишная 20 кг — цементная фасадно-финишная шпатлёвка для финишного выравнивания фасадов, стен и потолков. Подходит для наружных и внутренних работ, включая влажные и неотапливаемые помещения. Применяется по бетону, цементным штукатуркам и крупнозернистым шпатлёвкам; также допускается нанесение на ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон.

Сухую смесь наносят вручную или механизированно слоем 0,3–3 мм. Расход — 1 кг/м² при слое 1 мм. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — не менее 3 часов, последующая обработка возможна через 24 часа. Цвет — белый. Фасовка — 20 кг.

### MAT-000064

- Exact current title: Шпаклевка Vetonit VH для влажных помещений белая 20 кг
- Canonical identity: Vetonit ВХ
- Status: **NEEDS_FIX**
- Character count: 511
- Source keys: vetonitVH, localTitle
- Facts used: product_type: Цементная влагостойкая шпаклёвка; purpose: Финишное выравнивание стен и потолков под окраску и обои; package_weight: 20; form: Сухая смесь; application_area: Сухие и влажные помещения, фасады; application_method: Ручное и механизированное; substrates: Цементные и цементно-известковые штукатурки, ГКЛ, ГВЛ; layer_thickness: 1–4 мм; consumption: 1,2 кг/м²/мм; consumption_basis: на 1 мм слоя; application_temperature: от +10 до +30 °C; pot_life: 1,5 часа после затворения; drying_time: 1–2 суток для одного слоя; color: Белый
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Vetonit ВХ 20 кг — цементная влагостойкая шпаклёвка для финишного выравнивания стен и потолков под окраску и обои. Подходит для сухих и влажных помещений, а также фасадов; наносится по цементным и цементно-известковым штукатуркам, ГКЛ и ГВЛ.

Сухую смесь наносят вручную или механизированно слоем 1–4 мм. Расход — 1,2 кг/м² на каждый 1 мм слоя. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — 1,5 часа после затворения, высыхание — 1–2 суток для одного слоя. Цвет — белый. Фасовка — 20 кг.

### MAT-000065

- Exact current title: Шпаклевка по дереву VGT Белая 1 кг
- Canonical identity: VGT «Шпатлевка Экстра по дереву»
- Status: **NEEDS_FIX**
- Character count: 426
- Source keys: vgtExtraWood, localTitle
- Facts used: product_type: Готовая шпаклёвка по дереву; purpose: Заполнение и выравнивание деревянных поверхностей; package_weight: 1; form: Готовая паста; application_area: Внутренние и наружные работы; application_method: Шпатель; substrates: Деревянные поверхности; layer_thickness: около 1 мм (оптимально); локальное заполнение неровностей до 7 мм; consumption: 0,5–1,4 кг/м²; application_temperature: Не ниже +7 °C; drying_time: до отлипа 2 часа; полное высыхание 24 часа при +20±2 °C, RH ≤65%, слой ≤2 мм; color: Белая
- Facts intentionally omitted: pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

VGT «Экстра по дереву» 1 кг — готовая белая шпаклёвка для заполнения и выравнивания деревянных поверхностей внутри и снаружи помещений.

Состав наносят шпателем. Оптимальная толщина слоя — около 1 мм; локально можно заполнять неровности до 7 мм. Расход — 0,5–1,4 кг/м². Работы выполняют при температуре не ниже +7 °C; полное высыхание — 24 часа при +20±2 °C, относительной влажности не выше 65% и слое до 2 мм. Фасовка — 1 кг.

## Summary

```json
{
  "total": 5,
  "existingOk": 0,
  "needsFix": 5,
  "blockedIdentity": 0,
  "excludedAllowlist": 0,
  "errors": 0,
  "unsupportedClaims": 0
}
```

## Source registry

- **knaufMultiFinish**: [KNAUF-Мульти-Финиш — официальный сайт и TDS](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-multi-finish/) — Официальная карточка продукта; белая TDS: https://www.knauf.ru/upload/iblock/a6f/znbug54f7lfpmcp0h0bw9bl9oiboa70i/25_IL_KNAUF_Multi_Finish_belyy_25_03_2025_v01_Preview.pdf. Цвет exact local variant и точное время высыхания не установлены.
- **starBaseCement**: [Старатели — цементная Базовая](https://www.starateli.ru/catalog/229-229/) — Официальная карточка цементной шпатлевки «Базовая» ГОСТ 33699-2015, фасовка 20 кг.
- **starFacadeFinish**: [Старатели — цементная Фасадно-финишная](https://www.starateli.ru/good/show/59/) — Официальная карточка цементной шпатлевки «Фасадно-финишная» ГОСТ 33699-2015, фасовка 20 кг.
- **vetonitVH**: [Vetonit ВХ 20 кг — официальный сайт и TDS](https://vetonit.com/product/vetonit_vkh_20_kg/) — Официальная карточка Vetonit ВХ 20 кг; TDS: https://vetonit.com/upload/iblock/5c0/pd6sfdysuk62adx6p07bk210y3o6iu7q.pdf. Локальное VH — legacy spelling; title не меняется.
- **vgtExtraWood**: [VGT — Шпатлевка «Экстра» по дереву](https://vgtkraska.ru/ekstra-po-derevu) — Официальная карточка готовой белой шпатлевки по дереву; фасовка 1 кг.
- **localTitle**: Локальная карточка MatMix — Только identity/weight guard; не источник технических свойств и не production truth.
