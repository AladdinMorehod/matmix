# Putty full descriptions — Batch2 review

Изменяется только `products.full_description`; production не используется.

DESCRIPTION_MUTABLE_FIELDS_EXACTLY = ["full_description"]
UNSUPPORTED_CLAIMS=0

## Dry-run

| MAT | Current title | Status | Characters | Source keys |
|---|---|---|---:|---|
| MAT-000047 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг | NEEDS_FIX | 449 | danogips, localTitle |
| MAT-000048 | Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг | NEEDS_FIX | 451 | danogips, localTitle |
| MAT-000049 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг | NEEDS_FIX | 415 | knaufRotband, localTitle |
| MAT-000050 | Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг | NEEDS_FIX | 417 | knaufRotband, localTitle |
| MAT-000051 | Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг | NEEDS_FIX | 469 | semin, localTitle |
| MAT-000052 | Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг | NEEDS_FIX | 523 | vgt, localTitle |
| MAT-000053 | Шпаклевка Vetonit LR+ 5 кг | NEEDS_FIX | 477 | vetonitLR, localTitle |
| MAT-000054 | Шпаклевка Vetonit LR+ 20 кг | NEEDS_FIX | 479 | vetonitLR, localTitle |
| MAT-000055 | Шпаклевка Vetonit KR финиш белая 20 кг | NEEDS_FIX | 431 | vetonitKR, localTitle |
| MAT-000056 | Шпаклевка полимерная финишная Vetonit JS Plus 20 кг | NEEDS_FIX | 456 | vetonitJS, localTitle |
| MAT-000057 | Шпаклевка полимерная финишная Knauf Polymer finish 20 кг | NEEDS_FIX | 394 | knaufPolymer, localTitle |
| MAT-000058 | Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг | NEEDS_FIX | 442 | osnovit, localTitle |
| MAT-000059 | Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг | NEEDS_FIX | 440 | danoJet, localTitle |
| MAT-000060 | Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг | NEEDS_FIX | 376 | volma, localTitle |

## Per-MAT description review

### MAT-000047

- Exact current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг
- Canonical identity: Danogips SuperFinish
- Status: **NEEDS_FIX**
- Character count: 449
- Source keys: danogips, localTitle
- Facts used: product_type: Готовая финишная полимерная шпатлевка; purpose: Финишное выравнивание поверхностей внутри сухих помещений; package_weight: 5; form: Готовая паста; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ; layer_thickness: до 2 мм; consumption: 1 л/м²/мм; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +13 °C; drying_time: около 24 часов в зависимости от температуры, влажности и толщины слоя
- Facts intentionally omitted: pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Danogips SuperFinish 5 кг — готовая финишная полимерная шпаклёвка для выравнивания поверхностей внутри сухих помещений. Подходит для листовых материалов, ранее ошпатлёванных или окрашенных поверхностей, ПГП, стеклохолста, ГКЛ и швов ГКЛ.

Паста наносится вручную или механизированно слоем до 2 мм. Расход — 1 л/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; высыхание — около 24 часов в зависимости от условий. Фасовка — 5 кг.

### MAT-000048

- Exact current title: Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг
- Canonical identity: Danogips SuperFinish
- Status: **NEEDS_FIX**
- Character count: 451
- Source keys: danogips, localTitle
- Facts used: product_type: Готовая финишная полимерная шпатлевка; purpose: Финишное выравнивание поверхностей внутри сухих помещений; package_weight: 28; form: Готовая паста; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ; layer_thickness: до 2 мм; consumption: 1 л/м²/мм; consumption_basis: при толщине слоя 1 мм; application_temperature: Не менее +13 °C; drying_time: около 24 часов в зависимости от температуры, влажности и толщины слоя
- Facts intentionally omitted: pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Danogips SuperFinish 28 кг — готовая финишная полимерная шпаклёвка для выравнивания поверхностей внутри сухих помещений. Подходит для листовых материалов, ранее ошпатлёванных или окрашенных поверхностей, ПГП, стеклохолста, ГКЛ и швов ГКЛ.

Паста наносится вручную или механизированно слоем до 2 мм. Расход — 1 л/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; высыхание — около 24 часов в зависимости от условий. Фасовка — 28 кг.

### MAT-000049

- Exact current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг
- Canonical identity: КНАУФ Ротбанд Паста Профи
- Status: **NEEDS_FIX**
- Character count: 415
- Source keys: knaufRotband, localTitle
- Facts used: product_type: Готовая финишная шпаклевка; base: Виниловая основа; purpose: Финишное выравнивание внутри помещений; package_weight: 5; form: Готовая паста; application_area: Внутри помещений, сухой и нормальный влажностный режим; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст; layer_thickness: 0,2–2 мм; consumption: 0,48 кг/м²; consumption_basis: при слое 0,3 мм; application_temperature: от +10 до +25 °C; drying_time: около 24 часов при слое 1 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

КНАУФ Ротбанд Паста Профи 5 кг — готовая финишная шпаклёвка на виниловой основе для выравнивания поверхностей внутри помещений. Подходит для ГКЛ, ГВЛ, оштукатуренных и бетонных поверхностей, ПГП и стеклохолста.

Пасту наносят вручную или механизированно слоем 0,2–2 мм. Расход — 0,48 кг/м² при слое 0,3 мм. Работы выполняют при температуре от +10 до +25 °C; высыхание — около 24 часов при слое 1 мм. Фасовка — 5 кг.

### MAT-000050

- Exact current title: Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг
- Canonical identity: КНАУФ Ротбанд Паста Профи
- Status: **NEEDS_FIX**
- Character count: 417
- Source keys: knaufRotband, localTitle
- Facts used: product_type: Готовая финишная шпаклевка; base: Виниловая основа; purpose: Финишное выравнивание внутри помещений; package_weight: 18; form: Готовая паста; application_area: Внутри помещений, сухой и нормальный влажностный режим; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст; layer_thickness: 0,2–2 мм; consumption: 0,48 кг/м²; consumption_basis: при слое 0,3 мм; application_temperature: от +10 до +25 °C; drying_time: около 24 часов при слое 1 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

КНАУФ Ротбанд Паста Профи 18 кг — готовая финишная шпаклёвка на виниловой основе для выравнивания поверхностей внутри помещений. Подходит для ГКЛ, ГВЛ, оштукатуренных и бетонных поверхностей, ПГП и стеклохолста.

Пасту наносят вручную или механизированно слоем 0,2–2 мм. Расход — 0,48 кг/м² при слое 0,3 мм. Работы выполняют при температуре от +10 до +25 °C; высыхание — около 24 часов при слое 1 мм. Фасовка — 18 кг.

### MAT-000051

- Exact current title: Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг
- Canonical identity: SEMIN CE 78
- Status: **NEEDS_FIX**
- Character count: 469
- Source keys: semin, localTitle
- Facts used: product_type: Готовая полимерная шпаклевка для швов и финиша; base: Акриловая дисперсия; purpose: Заделка швов ГКЛ и финишное выравнивание; package_weight: 20; form: Готовая паста; application_area: Внутри помещений: стены и потолки; application_method: Ручное, airless, bazooka, banjo и валик; substrates: ГКЛ, гипсовые блоки, окрашенные поверхности, силикат кальция; layer_thickness: 1–5 мм; consumption: 500 г/м²/мм для швов; 1 кг/м² при сплошном нанесении; consumption_basis: для швов / сплошного слоя 1–4 мм; drying_time: 12–24 часа до следующего слоя
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

SEMIN CE 78 20 кг — готовая полимерная шпаклёвка на акриловой дисперсии для заделки швов ГКЛ и финишного выравнивания стен и потолков внутри помещений. Подходит для ГКЛ, гипсовых блоков, окрашенных поверхностей и силикатного кальция.

Материал наносят вручную, валиком, airless, bazooka или banjo. Для швов расход составляет 500 г/м²/мм, для сплошного нанесения — 1 кг/м²; слой — 1–5 мм, для сплошного слоя 1–4 мм. Межслойная сушка занимает 12–24 часа. Фасовка — 20 кг.

### MAT-000052

- Exact current title: Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг
- Canonical identity: VGT универсальная акриловая шпаклёвка
- Status: **NEEDS_FIX**
- Character count: 523
- Source keys: vgt, localTitle
- Facts used: product_type: Готовая акриловая универсальная шпаклевка; base: Акриловая; purpose: Выравнивание и заполнение трещин до 7 мм; package_weight: 18; form: Готовая паста; application_area: Внутри и снаружи под защитным покрытием; application_method: Шпателем; substrates: бетон, кирпич, штукатурка, минеральные основания; layer_thickness: около 1 мм (оптимальная толщина); consumption: 0,5–1,4 кг/м²; application_temperature: от +7 до +30 °C; drying_time: до отлипа 2 ч; полное 24 ч при 20±2 °C, RH 65±5%, слой ≤3 мм
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.; pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

VGT 18 кг — готовая акриловая универсальная шпаклёвка для внутренних работ и наружного применения на защищённых от прямых атмосферных осадков участках. Предназначена для выравнивания и заполнения трещин до 7 мм на бетоне, кирпиче, штукатурке и минеральных основаниях.

Оптимальная толщина слоя — около 1 мм, расход — 0,5–1,4 кг/м². Материал наносят шпателем при температуре от +7 до +30 °C. До отлипа — до 2 часов, полное высыхание — 24 часа при 20±2 °C, относительной влажности 65±5% и слое не более 3 мм. Фасовка — 18 кг.

### MAT-000053

- Exact current title: Шпаклевка Vetonit LR+ 5 кг
- Canonical identity: Vetonit LR+
- Status: **NEEDS_FIX**
- Character count: 477
- Source keys: vetonitLR, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; purpose: Финиш стен и потолков под обои, окраску и декор; package_weight: 5; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания; layer_thickness: 1–5 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 72 часов после затворения; drying_time: 24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Vetonit LR+ 5 кг — сухая полимерная финишная шпаклёвка для стен и потолков внутри сухих помещений под обои, окраску и декоративную отделку. Подходит для цементной и гипсовой штукатурки, гипсовых поверхностей, ГКЛ, ГВЛ и минеральных оснований.

После затворения смесь наносят вручную или механизированно слоем 1–5 мм. Расход — 1,2 кг/м²/мм при слое 1 мм; жизнеспособность — до 72 часов после затворения, высыхание — 24 часа. Температура работ — от +10 до +30 °C. Фасовка — 5 кг.

### MAT-000054

- Exact current title: Шпаклевка Vetonit LR+ 20 кг
- Canonical identity: Vetonit LR+
- Status: **NEEDS_FIX**
- Character count: 479
- Source keys: vetonitLR, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; purpose: Финиш стен и потолков под обои, окраску и декор; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания; layer_thickness: 1–5 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 72 часов после затворения; drying_time: 24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Vetonit LR+ 20 кг — сухая полимерная финишная шпаклёвка для стен и потолков внутри сухих помещений под обои, окраску и декоративную отделку. Подходит для цементной и гипсовой штукатурки, гипсовых поверхностей, ГКЛ, ГВЛ и минеральных оснований.

После затворения смесь наносят вручную или механизированно слоем 1–5 мм. Расход — 1,2 кг/м²/мм при слое 1 мм; жизнеспособность — до 72 часов после затворения, высыхание — 24 часа. Температура работ — от +10 до +30 °C. Фасовка — 20 кг.

### MAT-000055

- Exact current title: Шпаклевка Vetonit KR финиш белая 20 кг
- Canonical identity: Vetonit KR
- Status: **NEEDS_FIX**
- Character count: 431
- Source keys: vetonitKR, localTitle
- Facts used: product_type: Сухая финишная шпаклевка; base: Органический клей; purpose: Финиш стен и потолков в сухих помещениях; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: бетон, гипс, оштукатуренные поверхности, ГКЛ, ГВЛ, ЦСП; layer_thickness: 1–3 мм; локально до 4 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: 30 часов; до 60 часов в закрытой таре; drying_time: 1 сутки при 20 °C; application_temperature: от +10 до +30 °C; color: Белый
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Vetonit KR финиш белая 20 кг — сухая финишная шпаклёвка на основе органического клея для стен и потолков внутри сухих помещений. Подходит для бетона, гипса, оштукатуренных поверхностей, ГКЛ, ГВЛ и ЦСП.

Смесь наносят вручную или механизированно слоем 1–3 мм; локально допускается до 4 мм. Расход — 1,2 кг/м²/мм при слое 1 мм. Жизнеспособность — 30 часов, в закрытой таре до 60 часов; высыхание — 1 сутки при 20 °C. Фасовка — 20 кг.

### MAT-000056

- Exact current title: Шпаклевка полимерная финишная Vetonit JS Plus 20 кг
- Canonical identity: Vetonit JS
- Status: **NEEDS_FIX**
- Character count: 456
- Source keys: vetonitJS, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; base: Сополимер ПВА ≤4%; purpose: Заделка швов ГКЛ и финишное выравнивание; package_weight: 20; form: Сухая смесь; application_area: Внутри сухих помещений; application_method: Ручное и механизированное; substrates: ГКЛ, ГВЛ, старая краска, гипсовая, цементная и известково-цементная штукатурка; layer_thickness: 1–2 мм; consumption: 0,1–0,2 кг/м²/мм для швов; 1,2 кг/м²/мм для сплошного шпаклевания; consumption_basis: для швов / для сплошного слоя; pot_life: 1–2 суток; drying_time: 3–24 часа; application_temperature: от +10 до +30 °C
- Facts intentionally omitted: —
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Vetonit JS 20 кг — сухая полимерная финишная шпаклёвка на основе сополимера ПВА для заделки швов ГКЛ и финишного выравнивания внутри сухих помещений. Подходит для ГКЛ, ГВЛ, старой краски, гипсовой, цементной и известково-цементной штукатурки.

Смесь наносят вручную или механизированно слоем 1–2 мм. Для швов расход составляет 0,1–0,2 кг/м²/мм, для сплошного шпаклевания — 1,2 кг/м²/мм. Жизнеспособность — 1–2 суток, высыхание — 3–24 часа. Фасовка — 20 кг.

### MAT-000057

- Exact current title: Шпаклевка полимерная финишная Knauf Polymer finish 20 кг
- Canonical identity: КНАУФ-Полимер Финиш
- Status: **NEEDS_FIX**
- Character count: 394
- Source keys: knaufPolymer, localTitle
- Facts used: product_type: Сухая полимерная финишная шпаклевка; base: Полимерное вяжущее с микроволокнами; purpose: Финишное выравнивание внутри помещений; package_weight: 20; form: Сухая смесь; application_area: Внутри помещений; application_method: Ручное и механизированное; substrates: бетон, ГКЛ, ГВЛ, гипсовая и цементная штукатурка; layer_thickness: 0,2–4 мм; consumption: 1,2 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; pot_life: до 24 часов; до 72 часов в закрытой емкости при t≥+10 °C
- Facts intentionally omitted: application_temperature: Точная температура для exact SKU не подтверждена.; drying_time: Числовое время высыхания exact SKU не подтверждено.
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

КНАУФ-Полимер Финиш 20 кг — сухая полимерная финишная шпаклёвка с микроволокнами для выравнивания поверхностей внутри помещений. Подходит для бетона, ГКЛ, ГВЛ, гипсовой и цементной штукатурки.

Смесь наносят вручную или механизированно слоем 0,2–4 мм. Расход — 1,2 кг/м² при слое 1 мм. Жизнеспособность — до 24 часов, в закрытой ёмкости при температуре от +10 °C — до 72 часов. Фасовка — 20 кг.

### MAT-000058

- Exact current title: Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг
- Canonical identity: ОСНОВИТ Элисилк PA39 W
- Status: **NEEDS_FIX**
- Character count: 442
- Source keys: osnovit, localTitle
- Facts used: product_type: Готовая суперфинишная полимерная шпаклевка; purpose: Суперфинишное выравнивание стен и потолков; package_weight: 28; form: Готовая паста; application_area: Внутри сухих отапливаемых помещений, включая влажные зоны; application_method: Ручное и механизированное; substrates: бетон, гипсовая и цементная штукатурка, выравнивающая шпаклевка, ГКЛ, ГВЛ, ПГП, СМЛ и минеральные основания; layer_thickness: 0–2 мм; consumption: 1,6 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; application_temperature: от +5 до +30 °C; drying_time: 24 часа
- Facts intentionally omitted: pot_life: absent by design
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

ОСНОВИТ Элисилк PA39 W 28 кг — готовая суперфинишная полимерная шпаклёвка для выравнивания стен и потолков внутри сухих и влажных отапливаемых помещений. Подходит для бетона, гипсовой и цементной штукатурки, выравнивающей шпаклёвки, ГКЛ, ГВЛ, ПГП, СМЛ и минеральных оснований.

Пасту наносят вручную или механизированно слоем 0–2 мм. Расход — 1,6 кг/м² при слое 1 мм. Температура работ — от +5 до +30 °C, высыхание — 24 часа. Фасовка — 28 кг.

### MAT-000059

- Exact current title: Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг
- Canonical identity: Danogips Dano JET5
- Status: **NEEDS_FIX**
- Character count: 440
- Source keys: danoJet, localTitle
- Facts used: product_type: Сухая полимерная выравнивающая шпаклевка; purpose: Выравнивание плоскости перед финишной отделкой или обоями; package_weight: 25; form: Сухая смесь; application_area: Внутри помещений; application_method: Ручное и механизированное, включая безвоздушное нанесение; substrates: минеральные основания; layer_thickness: до 6 мм; consumption: 1,2 кг/м²/мм; consumption_basis: при толщине слоя 1 мм; pot_life: не менее 72 часов; drying_time: около 24 часов; application_temperature: Не менее +13 °C
- Facts intentionally omitted: color: Цвет exact SKU не подтверждён.
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

Danogips Dano JET5 25 кг — сухая полимерная выравнивающая шпаклёвка для подготовки плоскости перед финишной отделкой или оклейкой обоями внутри помещений. Подходит для минеральных оснований.

Смесь наносят вручную, механизированно или безвоздушным способом слоем до 6 мм. Расход — 1,2 кг/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; жизнеспособность — не менее 72 часов, высыхание — около 24 часов. Фасовка — 25 кг.

### MAT-000060

- Exact current title: Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг
- Canonical identity: ВОЛМА-Искрит
- Status: **NEEDS_FIX**
- Character count: 376
- Source keys: volma, localTitle
- Facts used: product_type: Финишная шпаклевка; base: Смешанные вяжущие; полимерная составляющая до 5% массы смеси; purpose: Финишное выравнивание стен и потолков внутри помещений; package_weight: 19; form: Сухая смесь; application_area: Внутри помещений с нормальной относительной влажностью; application_method: Ручное и машинное; substrates: стены, потолки и прочие недеформирующиеся основания; layer_thickness: 0,2–3 мм; consumption: 1,0–1,1 кг/м² при слое 1 мм; consumption_basis: при толщине слоя 1 мм; pot_life: 72 часа; application_temperature: от +5 до +30 °C; color: Белоснежный
- Facts intentionally omitted: drying_time: Числовое время высыхания exact SKU не подтверждено.
- Title issue: **SUBSTANTIVE** — локальный title содержит «для внутренних и наружных работ», тогда как официальный источник ВОЛМА-Искрит подтверждает применение внутри помещений с нормальной относительной влажностью; title не изменяется, требуется ручная корректировка номенклатуры.
- Reason: Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.

**Proposed description:**

ВОЛМА-Искрит 19 кг — сухая белоснежная финишная шпаклёвка для выравнивания стен, потолков и других недеформирующихся оснований внутри помещений с нормальной относительной влажностью.

Смесь наносят вручную или машинным способом слоем 0,2–3 мм. Расход — 1,0–1,1 кг/м² при слое 1 мм. Температура работ — от +5 до +30 °C, жизнеспособность раствора — до 72 часов. Фасовка — 19 кг.

## Summary

```json
{
  "total": 14,
  "existingOk": 0,
  "needsFix": 14,
  "blockedIdentity": 0,
  "excludedAllowlist": 0,
  "errors": 0,
  "unsupportedClaims": 0
}
```

## Source registry

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
- **localTitle**: Локальная карточка MatMix — Only identity/weight guard; not a technical source.
