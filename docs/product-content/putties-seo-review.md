# Putty SEO — unified category review

Изменяются только `products.seo_title` и `products.seo_description`; production не используется.

SEO_MUTABLE_FIELDS_EXACTLY = ["seo_title", "seo_description"]
CONFIRM = BACKFILL_PUTTY_SEO

## Length policy

SEO title: непустой, не более 65 символов; ориентир 45–65 — мягкая рекомендация, короткие 42–43 символа допускаются для полного названия. SEO description: ориентир 120–170 символов.

## Summary

```json
{
  "total": 33,
  "existingOk": 0,
  "needsFix": 33,
  "blockedIdentity": 0,
  "excludedAllowlist": 0,
  "errors": 0,
  "duplicateSeoTitles": 0,
  "duplicateSeoDescriptions": 0,
  "unsupportedClaims": 0,
  "publicMetaLanguageCount": 0
}
```

## Dry-run

| MAT | Current title | Status | SEO title chars | SEO description chars |
|---|---|---|---:|---:|
| MAT-000033 | Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг | NEEDS_FIX | 46 | 152 |
| MAT-000034 | Шпаклевка гипсовая Knauf Унифлот 5 кг | NEEDS_FIX | 43 | 156 |
| MAT-000035 | Шпаклевка гипсовая Knauf Унифлот 25 кг | NEEDS_FIX | 45 | 147 |
| MAT-000036 | Шпаклевка гипсовая Knauf Фуген 25 кг | NEEDS_FIX | 47 | 161 |
| MAT-000037 | Шпаклевка гипсовая Knauf Фуген 5 кг | NEEDS_FIX | 42 | 167 |
| MAT-000038 | Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг | NEEDS_FIX | 45 | 156 |
| MAT-000039 | Шпаклевка гипсовая Старатели базовая 20 кг | NEEDS_FIX | 44 | 165 |
| MAT-000040 | Шпаклевка гипсовая Старатели финишная 20 кг | NEEDS_FIX | 45 | 161 |
| MAT-000041 | Шпаклевка гипсовая Волма Финиш 20 кг | NEEDS_FIX | 47 | 151 |
| MAT-000042 | Шпаклевка гипсовая финишная Волма Шелк 20 кг | NEEDS_FIX | 46 | 149 |
| MAT-000043 | Шпаклевка гипсовая финишная Волма Arctic 20 кг | NEEDS_FIX | 45 | 163 |
| MAT-000044 | Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг | NEEDS_FIX | 51 | 159 |
| MAT-000045 | Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг | NEEDS_FIX | 43 | 163 |
| MAT-000046 | Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг | NEEDS_FIX | 47 | 167 |
| MAT-000047 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг | NEEDS_FIX | 45 | 166 |
| MAT-000048 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг | NEEDS_FIX | 55 | 155 |
| MAT-000049 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг | NEEDS_FIX | 50 | 167 |
| MAT-000050 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг | NEEDS_FIX | 52 | 159 |
| MAT-000051 | Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг | NEEDS_FIX | 50 | 164 |
| MAT-000052 | Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг | NEEDS_FIX | 45 | 166 |
| MAT-000053 | Шпаклевка Vetonit LR+ 5 кг | NEEDS_FIX | 48 | 170 |
| MAT-000054 | Шпаклевка Vetonit LR+ 20 кг | NEEDS_FIX | 47 | 170 |
| MAT-000055 | Шпаклевка Vetonit KR финиш белая 20 кг | NEEDS_FIX | 43 | 166 |
| MAT-000056 | Шпаклевка полимерная финишная Vetonit JS Plus 20 кг | NEEDS_FIX | 47 | 169 |
| MAT-000057 | Шпаклевка полимерная финишная Knauf Polymer finish 20 кг | NEEDS_FIX | 43 | 167 |
| MAT-000058 | Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг | NEEDS_FIX | 48 | 169 |
| MAT-000059 | Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг | NEEDS_FIX | 50 | 158 |
| MAT-000060 | Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг | NEEDS_FIX | 51 | 150 |
| MAT-000061 | Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг | NEEDS_FIX | 46 | 162 |
| MAT-000062 | Шпаклевка цементная базовая Старатели 20 кг | NEEDS_FIX | 45 | 157 |
| MAT-000063 | Шпаклевка цементная фасадно финишная Старатели 20 кг | NEEDS_FIX | 54 | 170 |
| MAT-000064 | Шпаклевка Vetonit VH для влажных помещений белая 20 кг | NEEDS_FIX | 47 | 165 |
| MAT-000065 | Шпаклевка по дереву VGT Белая 1 кг | NEEDS_FIX | 43 | 163 |

## Per-MAT review

### MAT-000033

- Current title: Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг
- Slug: шпаклевка-гипсовая-knauf-ротбанд-финиш-25-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (46 chars):

КНАУФ Ротбанд Финиш 25 кг — гипсовая шпаклевка

- Proposed SEO description (152 chars):

КНАУФ Ротбанд Финиш 25 кг — гипсовая шпаклевка для финишного выравнивания внутри помещений. Подходит для ГКЛ, штукатурки, бетона и ПГП. Купить в MatMix.

- Source keys: knaufRotbandFinish
- Facts used: гипсовая шпаклёвка; внутренние работы; ГКЛ, ГВЛ, ПГП, штукатурка, бетон; слой 0,2–5 мм; расход около 1 кг/м²; жизнеспособность не менее 70 минут; фасовка 25 кг
- Facts intentionally omitted: температура применения; цвет; способ нанесения; время высыхания; основание расхода
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000034

- Current title: Шпаклевка гипсовая Knauf Унифлот 5 кг
- Slug: шпаклевка-гипсовая-knauf-унифлот-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (43 chars):

КНАУФ Унифлот 5 кг — шпаклевка для швов ГКЛ

- Proposed SEO description (156 chars):

КНАУФ Унифлот 5 кг — высокопрочная гипсовая шпаклевка для заделки стыков КНАУФ-листов, суперлистов и элементов пола без армирующей ленты. Заказать в MatMix.

- Source keys: knaufUniflottRuBrochure, knaufUniflottRuMaterial
- Facts used: высокопрочная гипсовая шпаклёвка; заделка стыков КНАУФ-листов, КНАУФ-суперлистов и элементов пола; без армирующей ленты для соответствующих стыков; фасовка 5 кг
- Facts intentionally omitted: толщина слоя; расход; температура применения; жизнеспособность; время высыхания; срок хранения; цвет; форма; способ нанесения; основания вне прямо перечисленных стыков
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000035

- Current title: Шпаклевка гипсовая Knauf Унифлот 25 кг
- Slug: шпаклевка-гипсовая-knauf-унифлот-25-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

КНАУФ Унифлот 25 кг — высокопрочная шпаклевка

- Proposed SEO description (147 chars):

КНАУФ Унифлот 25 кг — высокопрочная гипсовая шпаклевка для стыков КНАУФ-листов, суперлистов и элементов пола без армирующей ленты. Купить в MatMix.

- Source keys: knaufUniflottRuBrochure, knaufUniflottRuMaterial
- Facts used: высокопрочная гипсовая шпаклёвка; заделка стыков КНАУФ-листов, КНАУФ-суперлистов и элементов пола; без армирующей ленты для соответствующих стыков; фасовка 25 кг
- Facts intentionally omitted: толщина слоя; расход; температура применения; жизнеспособность; время высыхания; срок хранения; цвет; форма; способ нанесения; основания вне прямо перечисленных стыков
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000036

- Current title: Шпаклевка гипсовая Knauf Фуген 25 кг
- Slug: шпаклевка-гипсовая-knauf-фуген-25-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

КНАУФ Фуген 25 кг — гипсовая шпаклевка для швов

- Proposed SEO description (161 chars):

КНАУФ Фуген 25 кг — сухая гипсовая шпаклевка для швов и выравнивания внутри помещений. Работает по ГКЛ, ГВЛ, бетону и штукатурке, слой 1–5 мм. Заказать в MatMix.

- Source keys: knaufFugenRu
- Facts used: гипсовая шпаклёвка; заделка швов и выравнивание; ГКЛ, ГВЛ, бетон, штукатурка; слой 1–5 мм; расход при 1 мм и для швов ГКЛ; фасовка 25 кг
- Facts intentionally omitted: температура применения; способ нанесения; цвет; жизнеспособность; время высыхания
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000037

- Current title: Шпаклевка гипсовая Knauf Фуген 5 кг
- Slug: шпаклевка-гипсовая-knauf-фуген-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (42 chars):

КНАУФ Фуген 5 кг — шпаклевка для ГКЛ и ГВЛ

- Proposed SEO description (167 chars):

КНАУФ Фуген 5 кг — сухая гипсовая шпаклевка для заделки швов и выравнивания поверхностей внутри помещений. Подходит для ГКЛ, ГВЛ, бетона и штукатурки. Купить в MatMix.

- Source keys: knaufFugenRu
- Facts used: гипсовая шпаклёвка; заделка швов и выравнивание; ГКЛ, ГВЛ, бетон, штукатурка; слой 1–5 мм; расход при 1 мм и для швов ГКЛ; фасовка 5 кг
- Facts intentionally omitted: температура применения; способ нанесения; цвет; жизнеспособность; время высыхания
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000038

- Current title: Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг
- Slug: шпаклевка-гипсовая-высокопрочная-knauf-унихард-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

КНАУФ УниХард 20 кг — высокопрочная шпаклевка

- Proposed SEO description (156 chars):

КНАУФ УниХард 20 кг — высокопрочная гипсовая шпаклевка для выравнивания и финишной подготовки поверхностей внутри помещений. Сухая смесь. Заказать в MatMix.

- Source keys: knaufUnihard
- Facts used: высокопрочная гипсовая шпаклёвка; выравнивание и финишная подготовка внутри помещений; сухая смесь; фасовка 20 кг
- Facts intentionally omitted: основания; слой; расход; способ нанесения; температура; цвет; жизнеспособность; время высыхания
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000039

- Current title: Шпаклевка гипсовая Старатели базовая 20 кг
- Slug: шпаклевка-гипсовая-старатели-базовая-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (44 chars):

Старатели Базовая 20 кг — гипсовая шпаклевка

- Proposed SEO description (165 chars):

Старатели Базовая 20 кг — гипсовая шпаклевка для выравнивания стен и потолков внутри помещений. Наносится вручную или механизированно слоем 1–10 мм. Купить в MatMix.

- Source keys: starBase
- Facts used: гипсовая базовая шпаклёвка; стены и потолки внутри; перечень оснований; ручное и механизированное нанесение; слой 1–10 мм; расход 1 кг/м² при 1 мм; температура +10…+30 °C; жизнеспособность не менее 1 часа; около 24 часов; фасовка 20 кг
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000040

- Current title: Шпаклевка гипсовая Старатели финишная 20 кг
- Slug: шпаклевка-гипсовая-старатели-финишная-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

Старатели Финишная 20 кг — гипсовая шпаклевка

- Proposed SEO description (161 chars):

Старатели Финишная 20 кг — гипсовая шпаклевка для финишного выравнивания внутри помещений. Ручное и механизированное нанесение, слой 0,3–5 мм. Заказать в MatMix.

- Source keys: starFinish
- Facts used: гипсовая финишная шпаклёвка; внутренние стены и потолки; основания; ручное и механизированное нанесение; слой 0,3–5 мм; расход 0,9 кг/м² при 1 мм; температура +10…+30 °C; жизнеспособность не менее 1 часа; около 24 часов; фасовка 20 кг
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000041

- Current title: Шпаклевка гипсовая Волма Финиш 20 кг
- Slug: шпаклевка-гипсовая-волма-финиш-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

ВОЛМА-Финиш 20 кг — финишная гипсовая шпаклевка

- Proposed SEO description (151 chars):

ВОЛМА-Финиш 20 кг — гипсовая финишная шпаклевка для стен и потолков внутри помещений. Подходит для бетона, штукатурки, ГКЛ, ГВЛ и ПГП. Купить в MatMix.

- Source keys: volmaFinish
- Facts used: гипсовая финишная шпаклёвка; стены и потолки внутри; основания; слой 0,2–3 мм, максимум 5 мм; расход 0,9–1,0 кг/м² при 1 мм; ручное нанесение; температура +5…+30 °C; около 100 минут; 5–7 часов; фасовка 20 кг
- Facts intentionally omitted: цвет
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000042

- Current title: Шпаклевка гипсовая финишная Волма Шелк 20 кг
- Slug: шпаклевка-гипсовая-финишная-волма-шелк-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (46 chars):

ВОЛМА-ШЕЛК 20 кг — финишная гипсовая шпаклевка

- Proposed SEO description (149 chars):

ВОЛМА-ШЕЛК 20 кг — гипсовая финишная шпаклевка для выравнивания внутри помещений. Подходит для бетона, штукатурки, ГКЛ, ГВЛ и ПГП. Заказать в MatMix.

- Source keys: volmaSilk
- Facts used: гипсовая финишная шпаклёвка; внутренние работы; основания; слой 0,2–3 мм, максимум 5 мм; расход 0,9–1,0 кг/м² при 1 мм; ручное нанесение; температура +5…+30 °C; около 60 минут; 5–7 часов; фасовка 20 кг
- Facts intentionally omitted: цвет
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000043

- Current title: Шпаклевка гипсовая финишная Волма Arctic 20 кг
- Slug: шпаклевка-гипсовая-финишная-волма-arctic-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

ВОЛМА Arctic 20 кг — белая гипсовая шпаклевка

- Proposed SEO description (163 chars):

ВОЛМА Arctic 20 кг — белая гипсовая финишная шпаклевка для стен и потолков внутри помещений. Наносится вручную или механизированно слоем 0,2–3 мм. Купить в MatMix.

- Source keys: volmaArctic
- Facts used: белая гипсовая финишная шпаклёвка; стены и потолки внутри; основания; ручное и механизированное нанесение; слой 0,2–3 мм, максимум 5 мм; расход 0,9–1,0 кг/м² при 1 мм; температура +5…+30 °C; не менее 60 минут; 5–7 часов; фасовка 20 кг
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000044

- Current title: Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг
- Slug: шпаклевка-гипсовая-универсальная-glatt-und-full-pufas-пуфас-25кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (51 chars):

PUFAS Glatt+Füll GFS 25 кг — армированная шпаклевка

- Proposed SEO description (159 chars):

PUFAS Glatt+Füll GFS 25 кг — гипсовая армированная шпаклевка для заполнения и выравнивания внутри помещений. Подходит для бетона, ГКЛ и ГВЛ. Заказать в MatMix.

- Source keys: pufasGlatt
- Facts used: гипсовая армированная шпаклёвка; внутренние работы; основания; слой от 0 до 15 см и более; расход 0,8–1 кг/м² при 1 мм; жизнеспособность около 60 минут; фасовка 25 кг
- Facts intentionally omitted: температура; способ нанесения; время высыхания; числовой срок хранения
- Title issues (report only): Локальное смешанное название Glatt Und Full / Full содержит нетипичную форму; canonical source identity — PUFAS Glatt+Füll GFS.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000045

- Current title: Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг
- Slug: шпаклевка-гипсовая-финишная-заполняющая-full-finish-pufas-пуфас-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (43 chars):

PUFAS Full+Finish 5 кг — финишная шпаклевка

- Proposed SEO description (163 chars):

PUFAS Full+Finish 5 кг — гипсовая заполняющая и финишная шпаклевка для внутренних работ. Подходит для минеральных оснований, бетона, кладки и ГКЛ. Купить в MatMix.

- Source keys: pufasFullFinish
- Facts used: гипсовая заполняющая и финишная шпаклёвка; внутренние работы; основания; слой до 15 см и более; расход 1 кг/м² при 1 мм; жизнеспособность около 60 минут; фасовка 5 кг
- Facts intentionally omitted: температура; способ нанесения; время высыхания; числовой срок хранения
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000046

- Current title: Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг
- Slug: шпаклевка-гипсовая-финишная-заполняющая-full-finish-pufas-пуфас-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

PUFAS Full+Finish 20 кг — заполняющая шпаклевка

- Proposed SEO description (167 chars):

PUFAS Full+Finish 20 кг — гипсовая заполняющая и финишная шпаклевка для внутренних работ. Подходит для штукатурки, бетона, кладки, газобетона и ГКЛ. Заказать в MatMix.

- Source keys: pufasFullFinish
- Facts used: гипсовая заполняющая и финишная шпаклёвка; внутренние работы; основания; слой до 15 см и более; расход 1 кг/м² при 1 мм; жизнеспособность около 60 минут; фасовка 20 кг
- Facts intentionally omitted: температура; способ нанесения; время высыхания; числовой срок хранения
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000047

- Current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг
- Slug: шпаклевка-готовая-danogips-superfinish-шитрок-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

Danogips SuperFinish 5 кг — готовая шпаклевка

- Proposed SEO description (166 chars):

Danogips SuperFinish 5 кг — готовая финишная полимерная шпаклевка для сухих помещений. Подходит для ГКЛ, ПГП, стеклохолста и окрашенных поверхностей. Купить в MatMix.

- Source keys: danogips, localTitle
- Facts used: product_type: Готовая финишная полимерная шпатлевка; purpose: Финишное выравнивание поверхностей внутри сухих помещений; package_weight: 5; form: Готовая паста; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ; layer_thickness: до 2 мм; consumption: 1 л/м²/мм; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +13 °C; drying_time: около 24 часов в зависимости от температуры, влажности и толщины слоя
- Facts intentionally omitted: pot_life: absent by design
- Title issues (report only): Локальное «(Шитрок)» не подтверждает официальное название Danogips SuperFinish; title не меняется.; Локальное «(Шитрок)» не является подтверждённым официальным названием Danogips SuperFinish.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000048

- Current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг
- Slug: шпаклевка-готовая-danogips-superfinish-шитрок-28-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 28
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (55 chars):

Danogips SuperFinish 28 кг — готовая финишная шпаклевка

- Proposed SEO description (155 chars):

Danogips SuperFinish 28 кг — готовая полимерная шпаклевка для выравнивания внутри сухих помещений. Подходит для ГКЛ, ПГП и стеклохолста. Заказать в MatMix.

- Source keys: danogips, localTitle
- Facts used: product_type: Готовая финишная полимерная шпатлевка; purpose: Финишное выравнивание поверхностей внутри сухих помещений; package_weight: 28; form: Готовая паста; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ; layer_thickness: до 2 мм; consumption: 1 л/м²/мм; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +13 °C; drying_time: около 24 часов в зависимости от температуры, влажности и толщины слоя
- Facts intentionally omitted: pot_life: absent by design
- Title issues (report only): Локальное «(Шитрок)» не подтверждает официальное название Danogips SuperFinish; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000049

- Current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг
- Slug: шпаклевка-готовая-финишная-knauf-ротбанд-паста-профи-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (50 chars):

КНАУФ Ротбанд Паста Профи 5 кг — готовая шпаклевка

- Proposed SEO description (167 chars):

КНАУФ Ротбанд Паста Профи 5 кг — готовая финишная шпаклевка на виниловой основе для внутренних работ. Подходит для ГКЛ, ГВЛ, бетона, штукатурки и ПГП. Купить в MatMix.

- Source keys: knaufRotband, localTitle
- Facts used: product_type: Готовая финишная шпаклевка; base: Виниловая основа; purpose: Финишное выравнивание внутри помещений; package_weight: 5; form: Готовая паста; application_area: Внутри помещений, сухой и нормальный влажностный режим; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст; layer_thickness: 0,2–2 мм; consumption: 0,48 кг/м²; consumption_basis: при слое 0,3 мм; application_temperature: от +10 до +25 °C; drying_time: около 24 часов при слое 1 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000050

- Current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг
- Slug: шпаклевка-готовая-финишная-knauf-ротбанд-паста-профи-18-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 18
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (52 chars):

КНАУФ Ротбанд Паста Профи 18 кг — финишная шпаклевка

- Proposed SEO description (159 chars):

КНАУФ Ротбанд Паста Профи 18 кг — готовая финишная шпаклевка на виниловой основе для внутренних работ по ГКЛ, ГВЛ, бетону, штукатурке и ПГП. Заказать в MatMix.

- Source keys: knaufRotband, localTitle
- Facts used: product_type: Готовая финишная шпаклевка; base: Виниловая основа; purpose: Финишное выравнивание внутри помещений; package_weight: 18; form: Готовая паста; application_area: Внутри помещений, сухой и нормальный влажностный режим; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст; layer_thickness: 0,2–2 мм; consumption: 0,48 кг/м²; consumption_basis: при слое 0,3 мм; application_temperature: от +10 до +25 °C; drying_time: около 24 часов при слое 1 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000051

- Current title: Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг
- Slug: шпаклевка-финишная-готовая-универсальная-semin-ce-78-белая-крышка-20кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (50 chars):

SEMIN CE 78 20 кг — готовая шпаклевка для швов ГКЛ

- Proposed SEO description (164 chars):

SEMIN CE 78 20 кг — готовая полимерная шпаклевка для швов ГКЛ и выравнивания стен и потолков внутри помещений. Ручное и механизированное нанесение. Купить в MatMix.

- Source keys: semin, localTitle
- Facts used: product_type: Готовая полимерная шпаклевка для швов и финиша; base: Акриловая дисперсия; purpose: Заделка швов ГКЛ и финишное выравнивание; package_weight: 20; form: Готовая паста; application_area: Внутри помещений: стены и потолки; application_method: Ручное, airless, bazooka, banjo и валик; substrates: ГКЛ, гипсовые блоки, окрашенные поверхности, силикат кальция; layer_thickness: 1–5 мм; consumption: 500 г/м²/мм для швов; 1 кг/м² при сплошном нанесении; consumption_basis: для швов / сплошного слоя 1–4 мм; drying_time: 12–24 часа до следующего слоя
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Title issues (report only): «Белая крышка» — признак упаковки, не подтверждение цвета состава.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000052

- Current title: Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг
- Slug: шпаклевка-готовая-vgt-акриловая-универсальная-для-наружных-и-внутренних-работ-18кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 18
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

VGT 18 кг — универсальная акриловая шпаклевка

- Proposed SEO description (166 chars):

VGT 18 кг — готовая акриловая универсальная шпаклевка для выравнивания и заполнения трещин на бетоне, кирпиче, штукатурке и минеральных основаниях. Заказать в MatMix.

- Source keys: vgt, localTitle
- Facts used: product_type: Готовая акриловая универсальная шпаклевка; base: Акриловая; purpose: Выравнивание и заполнение трещин до 7 мм; package_weight: 18; form: Готовая паста; application_area: Внутри и снаружи под защитным покрытием; application_method: Шпателем; substrates: бетон, кирпич, штукатурка, минеральные основания; layer_thickness: около 1 мм (оптимальная толщина); consumption: 0,5–1,4 кг/м²; application_temperature: от +7 до +30 °C; drying_time: до отлипа 2 ч; полное 24 ч при 20±2 °C, RH 65±5%, слой ≤3 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Title issues (report only): Указание наружных работ в локальном title шире подтверждённого применения: source ограничивает наружное использование защищёнными участками.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000053

- Current title: Шпаклевка Vetonit LR+ 5 кг
- Slug: шпаклевка-vetonit-lr-5-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 5
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (48 chars):

Vetonit LR+ 5 кг — полимерная финишная шпаклевка

- Proposed SEO description (170 chars):

Vetonit LR+ 5 кг — сухая полимерная финишная шпаклевка для стен и потолков внутри сухих помещений под обои и окраску. Подходит для ГКЛ, ГВЛ и штукатурки. Купить в MatMix.

- Source keys: vetonitLR, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; purpose: Финиш стен и потолков под обои, окраску и декор; package_weight: 5; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания; layer_thickness: 1–5 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 72 часов после затворения; drying_time: 24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000054

- Current title: Шпаклевка Vetonit LR+ 20 кг
- Slug: шпаклевка-vetonit-lr-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

Vetonit LR+ 20 кг — финишная шпаклевка для стен

- Proposed SEO description (170 chars):

Vetonit LR+ 20 кг — сухая полимерная финишная шпаклевка для стен и потолков внутри сухих помещений. Ручное или механизированное нанесение, слой 1–5 мм. Заказать в MatMix.

- Source keys: vetonitLR, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; purpose: Финиш стен и потолков под обои, окраску и декор; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания; layer_thickness: 1–5 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 72 часов после затворения; drying_time: 24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000055

- Current title: Шпаклевка Vetonit KR финиш белая 20 кг
- Slug: шпаклевка-vetonit-kr-финиш-белая-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (43 chars):

Vetonit KR 20 кг — белая финишная шпаклевка

- Proposed SEO description (166 chars):

Vetonit KR 20 кг — белая сухая финишная шпаклевка для стен и потолков внутри сухих помещений. Подходит для бетона, гипса, штукатурки, ГКЛ, ГВЛ и ЦСП. Купить в MatMix.

- Source keys: vetonitKR, localTitle
- Facts used: product_type: Сухая финишная шпаклевка; base: Органический клей; purpose: Финиш стен и потолков в сухих помещениях; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: бетон, гипс, оштукатуренные поверхности, ГКЛ, ГВЛ, ЦСП; layer_thickness: 1–3 мм; локально до 4 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: 30 часов; до 60 часов в закрытой таре; drying_time: 1 сутки при 20 °C; application_temperature: от +10 до +30 °C; color: Белый
- Facts intentionally omitted: —
- Title issues (report only): —
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000056

- Current title: Шпаклевка полимерная финишная Vetonit JS Plus 20 кг
- Slug: шпаклевка-полимерная-финишная-vetonit-js-plus-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

Vetonit JS 20 кг — полимерная шпаклевка для ГКЛ

- Proposed SEO description (169 chars):

Vetonit JS 20 кг — сухая полимерная финишная шпаклевка для швов ГКЛ и выравнивания внутри сухих помещений. Подходит для ГКЛ, ГВЛ, краски и штукатурки. Заказать в MatMix.

- Source keys: vetonitJS, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; base: Сополимер ПВА ≤4%; purpose: Заделка швов ГКЛ и финишное выравнивание; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, старая краска, гипсовая, цементная и известково-цементная штукатурка; layer_thickness: 1–2 мм; consumption: 0,1–0,2 кг/м²/мм для швов; 1,2 кг/м²/мм для сплошного шпаклевания; consumption_basis: для швов / для сплошного слоя; pot_life: 1–2 суток; drying_time: 3–24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Title issues (report only): Текущий title содержит JS Plus; актуальная официальная карточка — Vetonit JS. Title не меняется.; Локальное «JS Plus» шире canonical identity Vetonit JS; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000057

- Current title: Шпаклевка полимерная финишная Knauf Polymer finish 20 кг
- Slug: шпаклевка-полимерная-финишная-knauf-polymer-finish-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (43 chars):

КНАУФ-Полимер Финиш 20 кг — сухая шпаклевка

- Proposed SEO description (167 chars):

КНАУФ-Полимер Финиш 20 кг — сухая полимерная шпаклевка с микроволокнами для выравнивания внутри помещений. Подходит для бетона, ГКЛ, ГВЛ и штукатурки. Купить в MatMix.

- Source keys: knaufPolymer, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; base: Полимерное вяжущее с микроволокнами; purpose: Финишное выравнивание внутри помещений; package_weight: 20; form: Сухая смесь; application_area: Внутри помещений; application_method: Ручное и механизированное; substrates: бетон, ГКЛ, ГВЛ, гипсовая и цементная штукатурка; layer_thickness: 0,2–4 мм; consumption: 1,2 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 24 часов; до 72 часов в закрытой емкости при t≥+10 °C
- Facts intentionally omitted: application_temperature: Точная температура для exact SKU не подтверждена.; drying_time: Числовое время высыхания exact SKU не подтверждено.
- Title issues (report only): Локальная латиница Polymer finish отличается от официального написания КНАУФ-Полимер Финиш; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000058

- Current title: Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг
- Slug: шпаклевка-полимерная-финишная-основит-элисилк-ра39-w-28-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 28
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (48 chars):

ОСНОВИТ Элисилк PA39 W 28 кг — готовая шпаклевка

- Proposed SEO description (169 chars):

ОСНОВИТ Элисилк PA39 W 28 кг — готовая суперфинишная полимерная шпаклевка для стен и потолков в сухих и влажных помещениях. Подходит для бетона и ГКЛ. Заказать в MatMix.

- Source keys: osnovit, localTitle
- Facts used: product_type: Готовая суперфинишная полимерная шпаклевка; purpose: Суперфинишное выравнивание стен и потолков; package_weight: 28; form: Готовая паста; application_area: Внутри сухих отапливаемых помещений, включая влажные зоны; application_method: Ручное и механизированное; substrates: бетон, гипсовая и цементная штукатурка, выравнивающая шпаклевка, ГКЛ, ГВЛ, ПГП, СМЛ и минеральные основания; layer_thickness: 0–2 мм; consumption: 1,6 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; application_temperature: от +5 до +30 °C; drying_time: 24 часа
- Facts intentionally omitted: pot_life: absent by design
- Title issues (report only): Локальное РА39 W отличается от официального написания PA39 W; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000059

- Current title: Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг
- Slug: шпаклевка-полимерная-danogips-dano-jet-5-выравнивающая-25-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (50 chars):

Danogips Dano JET5 25 кг — выравнивающая шпаклевка

- Proposed SEO description (158 chars):

Danogips Dano JET5 25 кг — сухая полимерная шпаклевка для подготовки поверхностей перед отделкой и обоями. Ручное или безвоздушное нанесение. Купить в MatMix.

- Source keys: danoJet, localTitle
- Facts used: product_type: Сухая полимерная выравнивающая шпаклевка; purpose: Выравнивание плоскости перед финишной отделкой или обоями; package_weight: 25; form: Сухая смесь; application_area: Внутри помещений; application_method: Ручное и механизированное, включая безвоздушное нанесение; substrates: минеральные основания; layer_thickness: до 6 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: не менее 72 часов; drying_time: около 24 часов; application_temperature: Не менее +13 °C
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.
- Title issues (report only): Локальное Dano Jet 5 отличается от официального Dano JET5; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000060

- Current title: Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг
- Slug: шпаклевка-полимерная-финишная-волма-искрит-для-внутренних-и-наружных-работ-белоснежная-мех-19-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 19
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (51 chars):

ВОЛМА-Искрит 19 кг — белоснежная финишная шпаклевка

- Proposed SEO description (150 chars):

ВОЛМА-Искрит 19 кг — сухая белоснежная шпаклевка для стен и потолков внутри помещений. Ручное или машинное нанесение, слой до 3 мм. Заказать в MatMix.

- Source keys: volma, localTitle
- Facts used: product_type: Финишная шпаклевка; base: Смешанные вяжущие; полимерная составляющая до 5% массы смеси; purpose: Финишное выравнивание стен и потолков внутри помещений; package_weight: 19; form: Сухая смесь; application_area: Внутри помещений с нормальной относительной влажностью; application_method: Ручное и машинное; substrates: стены, потолки и прочие недеформирующиеся основания; layer_thickness: 0,2–3 мм; consumption: 1,0–1,1 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; pot_life: 72 часа; application_temperature: от +5 до +30 °C; color: Белоснежный
- Facts intentionally omitted: drying_time: Числовое время высыхания exact SKU не подтверждено.
- Title issues (report only): «мех.» не доказывает отдельный SKU: официальный продукт допускает ручное и машинное нанесение.; «полимерная» в title не является установленным официальным классом: источник указывает смешанные вяжущие и полимерную составляющую до 5%.; Локальный snapshot содержит устаревший title; authoritative production title — «Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг».
- Slug issues (report only): Legacy slug содержит устаревшую фразу «для внутренних и наружных работ»; slug не меняется в этом corrective.
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000061

- Current title: Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг
- Slug: шпаклевка-цементная-knauf-мультифиниш-фасадная-25-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 25
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (46 chars):

КНАУФ-Мульти-Финиш 25 кг — цементная шпаклевка

- Proposed SEO description (162 chars):

КНАУФ-Мульти-Финиш 25 кг — цементная шпаклевка для бетона и цементных поверхностей внутри и снаружи. Подходит для влажных помещений, слой 1–3 мм. Купить в MatMix.

- Source keys: knaufMultiFinish, localTitle
- Facts used: product_type: Цементная фасадная шпаклёвка; purpose: Выравнивание бетонных и цементных поверхностей, ремонт и заполнение дефектов; package_weight: 25; form: Сухая смесь; application_area: Наружные и внутренние работы, включая влажные помещения; application_method: Ручное нанесение; substrates: Бетон, цементные штукатурки; layer_thickness: 1–3 мм; локально до 5 мм; consumption: 1,2 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +5 °C; pot_life: не менее 3 часов
- Facts intentionally omitted: color: Официальный продукт выпускается в белом и сером вариантах; exact вариант локальной карточки не установлен.; drying_time: Точное время высыхания для exact SKU/условий не подтверждено.
- Title issues (report only): Локальное «Мультифиниш» отличается от официального «КНАУФ-Мульти-Финиш»; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000062

- Current title: Шпаклевка цементная базовая Старатели 20 кг
- Slug: шпаклевка-цементная-базовая-старатели-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (45 chars):

Старатели Базовая 20 кг — цементная шпаклевка

- Proposed SEO description (157 chars):

Старатели Базовая 20 кг — цементная шпатлевка для стен и потолков внутри помещений с нормальной и повышенной влажностью. Ручное нанесение. Заказать в MatMix.

- Source keys: starBaseCement, localTitle
- Facts used: product_type: Цементная шпатлёвка базовая; purpose: Выравнивание стен и потолков; package_weight: 20; form: Сухая смесь; application_area: Внутри помещений, нормальная и повышенная влажность; application_method: Ручное и механизированное; substrates: Бетон, железобетон, ячеистый бетон, кирпич, цементная штукатурка; layer_thickness: 0,8–8 мм; consumption: 1 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: от +10 до +30 °C; pot_life: не менее 3 часов; drying_time: 24 часа до последующей обработки; color: Светло-бежевый
- Facts intentionally omitted: —
- Title issues (report only): Локальное описательное имя отличается от официального «Шпатлевка цементная «Базовая»»; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000063

- Current title: Шпаклевка цементная фасадно финишная Старатели 20 кг
- Slug: шпаклевка-цементная-фасадно-финишная-старатели-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (54 chars):

Старатели Фасадно-финишная 20 кг — цементная шпаклевка

- Proposed SEO description (170 chars):

Старатели Фасадно-финишная 20 кг — цементная шпатлевка для фасадов, стен и потолков. Подходит для наружных и внутренних работ, включая влажные помещения. Купить в MatMix.

- Source keys: starFacadeFinish, localTitle
- Facts used: product_type: Цементная фасадно-финишная шпатлёвка; purpose: Финишное выравнивание фасадов, стен и потолков; package_weight: 20; form: Сухая смесь; application_area: Наружные и внутренние работы, включая влажные и неотапливаемые помещения; application_method: Ручное и механизированное; substrates: Бетон, цементные штукатурки, крупнозернистые шпатлёвки; допускаются ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон; layer_thickness: 0,3–3 мм; consumption: 1 кг/м²; consumption_basis: при толщине слоя 1 мм; application_temperature: от +10 до +30 °C; pot_life: не менее 3 часов; drying_time: 24 часа до последующей обработки; color: Белый
- Facts intentionally omitted: —
- Title issues (report only): В локальном title отсутствует дефис в «фасадно финишная»; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000064

- Current title: Шпаклевка Vetonit VH для влажных помещений белая 20 кг
- Slug: шпаклевка-vetonit-vh-для-влажных-помещений-белая-20-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 20
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (47 chars):

Vetonit ВХ 20 кг — влагостойкая белая шпаклевка

- Proposed SEO description (165 chars):

Vetonit ВХ 20 кг — белая цементная влагостойкая шпаклевка для стен и потолков под окраску и обои. Подходит для сухих, влажных помещений и фасадов. Заказать в MatMix.

- Source keys: vetonitVH, localTitle
- Facts used: product_type: Цементная влагостойкая шпаклёвка; purpose: Финишное выравнивание стен и потолков под окраску и обои; package_weight: 20; form: Сухая смесь; application_area: Сухие и влажные помещения, фасады; application_method: Ручное и механизированное; substrates: Цементные и цементно-известковые штукатурки, ГКЛ, ГВЛ; layer_thickness: 1–4 мм; consumption: 1,2 кг/м²/мм; consumption_basis: на 1 мм слоя; application_temperature: от +10 до +30 °C; pot_life: 1,5 часа после затворения; drying_time: 1–2 суток для одного слоя; color: Белый
- Facts intentionally omitted: —
- Title issues (report only): Локальное Latin VH отличается от текущего официального Cyrillic ВХ; title не меняется.; «для влажных помещений» и «белая» подтверждены официальным источником.; Локальное «VH» отличается от canonical identity Vetonit ВХ; title не меняется.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

### MAT-000065

- Current title: Шпаклевка по дереву VGT Белая 1 кг
- Slug: шпаклевка-по-дереву-vgt-белая-1-кг
- Category / subcategory: Смеси / Шпаклевка
- Brand: —
- Weight: 1
- Current full_description: —
- Current SEO title: —
- Current SEO description: —
- Proposed SEO title (43 chars):

VGT Экстра по дереву 1 кг — белая шпаклевка

- Proposed SEO description (163 chars):

VGT «Экстра по дереву» 1 кг — готовая белая шпаклевка для деревянных поверхностей внутри и снаружи. Заполнение и выравнивание, нанесение шпателем. Купить в MatMix.

- Source keys: vgtExtraWood, localTitle
- Facts used: product_type: Готовая шпаклёвка по дереву; purpose: Заполнение и выравнивание деревянных поверхностей; package_weight: 1; form: Готовая паста; application_area: Внутренние и наружные работы; application_method: Шпатель; substrates: Деревянные поверхности; layer_thickness: около 1 мм (оптимально); локальное заполнение неровностей до 7 мм; consumption: 0,5–1,4 кг/м²; application_temperature: Не ниже +7 °C; drying_time: до отлипа 2 часа; полное высыхание 24 часа при +20±2 °C, RH ≤65%, слой ≤2 мм; color: Белая
- Facts intentionally omitted: pot_life: absent by design
- Title issues (report only): Локальное title не содержит официальное «Экстра»; title не меняется.; «Белая» — подтверждённый цветовой вариант официальной карточки.
- Slug issues (report only): —
- Identity status: IDENTITY_CONFIRMED
- Status: **NEEDS_FIX**

## Source registry

- **knaufRotbandFinish**: [KNAUF Ротбанд Финиш](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-rotband-finish/) — Официальная страница продукта; свойства приведены только для соответствующего семейства.
- **knaufUniflottRu**: [KNAUF Унифлот RU/UZ](https://knauf.com/ru-UZ/p/produkt/knauf-uniflot-10132_0604) — Официальная карточка продукта; варианты 5/25 кг и материал указаны производителем. Используется как research note; exact RU SKU не доказан.
- **knaufUniflottDe**: [KNAUF Uniflott DE/AT](https://knauf.com/de-AT/p/produkt/uniflott-10132_0070) — Официальная региональная карточка; используется только как research note/corroboration идентичности, не как доказательство российского SKU.
- **knaufFugenRu**: [KNAUF Фуген](https://www.knauf.ru/catalog/shpaklyevki/shpaklyevki-gipsovye/knauf-fugen/) — Официальная российская страница продукта и фасовок.
- **knaufUnihard**: [KNAUF УниХард](https://www.knauf.ru/catalog/shpaklyevki/shpaklyevki-gipsovye/knauf-unikhard/) — Официальная карточка продукта; exact 20 кг проверяется по маркировке/каталогу.
- **starBase**: [Старатели Базовая гипсовая](https://www.starateli.ru/good/show/152/) — Текущая официальная страница: гипсовая базовая шпаклевка, мешок 20 кг.
- **starFinish**: [Старатели Финишная гипсовая](https://www.starateli.ru/good/show/60/) — Текущая официальная страница: гипсовая финишная шпаклевка, мешок 20 кг.
- **volmaFinish**: [ВОЛМА-Финиш](https://www.volma.ru/production/catalog/putty/volma-finish-finish-plaster/) — Официальная страница продукта; дополнительная документация производителя доступна в каталоге.
- **volmaSilk**: [ВОЛМА-ШЕЛК TDS](https://www.volma.ru/upload/iblock/590/5908ad985839daa82335e6eb757acca8.pdf) — Официальный TDS: фасовки 20/25 кг и характеристики ВОЛМА-ШЕЛК.
- **volmaArctic**: [ВОЛМА Arctic](https://www.volma.ru/production/catalog/putty/volma-arctic/) — Официальная страница продукта; белая гипсовая финишная шпаклевка.
- **pufasGlatt**: [PUFAS Glatt+Füll GFS 25 kg](https://www.pufas.com/org/products/filling-and-smoothing/glatt-und-fullspachtel-gfs/25kg/) — Официальная страница 25 кг, article 003203000/EAN 4007954032039.
- **pufasFullFinish**: [PUFAS Full+Finish Spachtel TDS](https://www.pufas.com/site/assets/files/3223/tds_p_full_finish_spachtel_ru.pdf) — Официальный русскоязычный TDS: фасовки 5/20 кг и свойства exact продукта.
- **localTitle**: Локальная карточка MatMix — Только identity/weight guard; не источник технических свойств и не production truth.
- **knaufUniflottRuBrochure**: [KNAUF-Унифлот — официальный RU каталог/брошюра](https://www.knauf.ru/upload/iblock/5e2/he31pez0jw25xvza01kmu5qytpyju21a/929190_Br_KNAUF_SuperPol_A5_29_05_18_preview_sogl.pdf) — Официальный русскоязычный материал KNAUF: КНАУФ-Унифлот — высокопрочная гипсовая шпаклёвка; фасовки 5 кг и 25 кг; назначение — заделка стыков КНАУФ-листов, КНАУФ-суперлистов и элементов пола, для соответствующих стыков без армирующей ленты.
- **knaufUniflottRuMaterial**: [KNAUF-Унифлот — официальный RU материал](https://www.knauf.ru/upload/iblock/78f/pqsuv0etkm9bd8eynfmo1odyy3ly3msx/742348_A5_01_04_2022_v01_CS6_Preview.pdf) — Официальный русскоязычный материал KNAUF, подтверждающий product family КНАУФ-Унифлот, классификацию высокопрочной гипсовой шпаклёвки, назначение и фасовки 5/25 кг. Числовые технические параметры из foreign-market карточек не переносятся.
- **danogips**: [Danogips official](https://www.danogips.ru/katalog/gotovye_shpatlevki_danogips/super_finish) — Официальная карточка SuperFinish и инструкция производителя.
- **knaufRotband**: [KNAUF Rotband Pasta Profi](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/shpaklyevki-polimernye/knauf-rotband-pasta-profi/) — Официальная страница и информационный лист.
- **semin**: [SEMIN CE 78](https://www.semin.com/en/products/plastering-insulation/fillers/ready-use-fillers/ce-78-perfect-filler-finisher) — Официальная международная карточка; белый цвет не записывается без explicit source.
- **vgt**: [VGT universal putty](https://vgtkraska.ru/shpatlevki/shpatlevka-universalnaya) — Официальная страница производителя.
- **vetonitLR**: [Vetonit LR+](https://vetonit.com/product/vetonit_lr_20_kg/) — Официальная карточка продукта.
- **vetonitKR**: [Vetonit KR technical map](https://vetonit.com/product/60/technical-map) — Актуальная официальная техническая карта; диапазон 1–3 мм, локально до 4 мм.
- **vetonitJS**: [Vetonit JS](https://vetonit.com/product/vetonit_dzhey_es_20_kg/) — Официальная карточка JS; локальный суффикс Plus оставлен только в title.
- **knaufPolymer**: [KNAUF Полимер Финиш](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-polimer-finish/) — Официальная страница и информационный лист 20 кг.
- **osnovit**: [ОСНОВИТ Элисилк PA39 W](https://osnovit.ru/catalog/shpaklevki/elisilk-pa39-w/) — Официальная карточка и техническая карта.
- **danoJet**: [Danogips Dano JET5](https://www.danogips.ru/katalog/shpatlevka_polimernaya/danojet5) — Официальная карточка и справочные материалы.
- **volma**: [ВОЛМА Искрит](https://www.volma.ru/production/catalog/putty/volma-iskrit/) — Официальная страница; composition note confirms mixed binders and polymer component ≤5%.
- **knaufMultiFinish**: [KNAUF-Мульти-Финиш — официальный сайт и TDS](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-multi-finish/) — Официальная карточка продукта; белая TDS: https://www.knauf.ru/upload/iblock/a6f/znbug54f7lfpmcp0h0bw9bl9oiboa70i/25_IL_KNAUF_Multi_Finish_belyy_25_03_2025_v01_Preview.pdf. Цвет exact local variant и точное время высыхания не установлены.
- **starBaseCement**: [Старатели — цементная Базовая](https://www.starateli.ru/catalog/229-229/) — Официальная карточка цементной шпатлевки «Базовая» ГОСТ 33699-2015, фасовка 20 кг.
- **starFacadeFinish**: [Старатели — цементная Фасадно-финишная](https://www.starateli.ru/good/show/59/) — Официальная карточка цементной шпатлевки «Фасадно-финишная» ГОСТ 33699-2015, фасовка 20 кг.
- **vetonitVH**: [Vetonit ВХ 20 кг — официальный сайт и TDS](https://vetonit.com/product/vetonit_vkh_20_kg/) — Официальная карточка Vetonit ВХ 20 кг; TDS: https://vetonit.com/upload/iblock/5c0/pd6sfdysuk62adx6p07bk210y3o6iu7q.pdf. Локальное VH — legacy spelling; title не меняется.
- **vgtExtraWood**: [VGT — Шпатлевка «Экстра» по дереву](https://vgtkraska.ru/ekstra-po-derevu) — Официальная карточка готовой белой шпатлевки по дереву; фасовка 1 кг.
