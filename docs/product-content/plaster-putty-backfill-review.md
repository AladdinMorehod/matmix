# Plaster and putty content backfill review

Дата: 2026-09-25T13:12:30.527Z
Режим: REVIEW_ONLY_DRY_RUN. Apply не выполнялся. Локальная БД открыта read-only; SHA-256 до сборки: `1a45eb9830642df1246b9ee075e65e2a8faeac0bf071079af24ce4d75f239e38`.

Поля `products.brand`, `products.weight`, описания, SEO, изображения и шаблоны не входят в этот review. `package_weight` допускается только при источнике, который подтверждает фасовку; источник `localTitle` не считается подтверждением свойства и переводится в `NEEDS_SOURCE`.

## Штукатурка: сводка

Всего: 28; SAFE_TO_APPLY: 1; PARTIAL_SAFE_TO_APPLY: 25; IDENTITY_BLOCKED: 2; NO_SAFE_VALUES: 0; безопасных WILL_ADD: 200; NEEDS_SOURCE: 170; конфликтных полей: 6.

SAFE_TO_APPLY: MAT-000002.
PARTIAL_SAFE_TO_APPLY: MAT-000001, MAT-000003, MAT-000004, MAT-000005, MAT-000006, MAT-000007, MAT-000008, MAT-000009, MAT-000010, MAT-000011, MAT-000012, MAT-000013, MAT-000014, MAT-000015, MAT-000016, MAT-000017, MAT-000018, MAT-000019, MAT-000020, MAT-000021, MAT-000022, MAT-000023, MAT-000024, MAT-000025, MAT-000026.
SOURCE_CONFLICT_BLOCKED поля: MAT-000006 (base, wall_layer_thickness); MAT-000007 (base); MAT-000008 (base); MAT-000017 (purpose); MAT-000018 (purpose).
IDENTITY_BLOCKED: MAT-000027 (SOURCE_IDENTITY_BLOCKED); MAT-000028 (SOURCE_IDENTITY_BLOCKED).
NO_SAFE_VALUES: —.

## Шпаклевка: сводка

Всего: 33; SAFE_TO_APPLY: 0; PARTIAL_SAFE_TO_APPLY: 30; IDENTITY_BLOCKED: 1; NO_SAFE_VALUES: 2; безопасных WILL_ADD: 297; NEEDS_SOURCE: 107; конфликтных полей: 0.

SAFE_TO_APPLY: —.
PARTIAL_SAFE_TO_APPLY: MAT-000033, MAT-000036, MAT-000037, MAT-000038, MAT-000039, MAT-000040, MAT-000041, MAT-000042, MAT-000043, MAT-000044, MAT-000045, MAT-000046, MAT-000047, MAT-000048, MAT-000049, MAT-000050, MAT-000051, MAT-000052, MAT-000053, MAT-000054, MAT-000055, MAT-000056, MAT-000057, MAT-000058, MAT-000059, MAT-000061, MAT-000062, MAT-000063, MAT-000064, MAT-000065.
SOURCE_CONFLICT_BLOCKED поля: —.
IDENTITY_BLOCKED: MAT-000060 (TITLE_MISMATCH).
NO_SAFE_VALUES: MAT-000034 (NEEDS_SOURCE: product_type, base, purpose, package_weight, application_temperature, shelf_life, color, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time; SCHEMA_BLOCKED: form); MAT-000035 (NEEDS_SOURCE: product_type, base, purpose, package_weight, application_temperature, shelf_life, color, application_area, application_method, substrates, layer_thickness, consumption, consumption_basis, pot_life, drying_time; SCHEMA_BLOCKED: form).

## Brand preview: все 61 MAT

Статусы отражают reviewed brand и текущее canonical `products.brand`. `SAFE_TO_FILL` — кандидат на запись после отдельного решения, но в этом batch никакой бренд не записывается.

Сводка: EXISTING_OK=1; SAFE_TO_FILL=57; CONFLICT=0; IDENTITY_BLOCKED=3; NO_REVIEWED_BRAND=0. safeBrandWrites (кандидаты): 57; blockedBrandWrites (конфликт/идентичность): 3; фактически записано: 0.

| MAT | CURRENT products.brand | PROPOSED reviewed brand | SOURCE | STATUS |
|---|---|---|---|---|
| MAT-000001 | — | KNAUF | plasters-core-content.js: КНАУФ-Ротбанд | SAFE_TO_FILL |
| MAT-000002 | KNAUF | KNAUF | plasters-core-content.js: КНАУФ-Ротбанд | EXISTING_OK |
| MAT-000003 | — | KNAUF | plasters-core-content.js: КНАУФ-Гольдбанд | SAFE_TO_FILL |
| MAT-000004 | — | KNAUF | plasters-core-content.js: КНАУФ-МП 75 (Россия) | SAFE_TO_FILL |
| MAT-000005 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Холст | SAFE_TO_FILL |
| MAT-000006 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Слой | SAFE_TO_FILL |
| MAT-000007 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Гипс-Актив | SAFE_TO_FILL |
| MAT-000008 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Гипс-Актив | SAFE_TO_FILL |
| MAT-000009 | — | Русеан | plasters-core-content.js: Русеан ПЛАСТЕР серый 30 кг | SAFE_TO_FILL |
| MAT-000010 | — | Русеан | plasters-core-content.js: Русеан ТЕРМОПЛАСТ белый 30 кг | SAFE_TO_FILL |
| MAT-000011 | — | UNIS | plasters-core-content.js: UNIS Теплон Белый | SAFE_TO_FILL |
| MAT-000012 | — | UNIS | plasters-core-content.js: UNIS Теплон Белый | SAFE_TO_FILL |
| MAT-000013 | — | Старатели | plasters-core-content.js: Старатели: классическая гипсовая штукатурка | SAFE_TO_FILL |
| MAT-000014 | — | Старатели | plasters-core-content.js: Старатели Оптимум 30 кг | SAFE_TO_FILL |
| MAT-000015 | — | ЦЕМЕНТУМ | plasters-core-content.js: ЦЕМЕНТУМ: цементная штукатурка | SAFE_TO_FILL |
| MAT-000016 | — | KNAUF | plasters-core-content.js: КНАУФ-Унтерпутц | SAFE_TO_FILL |
| MAT-000017 | — | KNAUF | plasters-core-content.js: КНАУФ-Грюнбанд | SAFE_TO_FILL |
| MAT-000018 | — | Vetonit | plasters-core-content.js: Vetonit: система выравнивания стен под плитку, weber.vetonit TT40 technical card | SAFE_TO_FILL |
| MAT-000019 | — | MAPEI | plasters-core-content.js: MAPEI Nivoplan Plus — русскоязычная техническая карта | SAFE_TO_FILL |
| MAT-000020 | — | Старатели | plasters-core-content.js: Старатели: цементная штукатурка | SAFE_TO_FILL |
| MAT-000021 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Цоколь | SAFE_TO_FILL |
| MAT-000022 | — | ВОЛМА | plasters-core-content.js: ВОЛМА-Термофасад | SAFE_TO_FILL |
| MAT-000023 | — | UNIS | plasters-core-content.js: UNIS Силин Универсальный Армированный | SAFE_TO_FILL |
| MAT-000024 | — | Основит | plasters-core-content.js: Основит Техно PC21 M 25 кг | SAFE_TO_FILL |
| MAT-000025 | — | Основит | plasters-core-content.js: Основит Стартвэлл PC21 25 кг | SAFE_TO_FILL |
| MAT-000026 | — | Kreisel | plasters-core-content.js: Kreisel OPTIMA-PUTZ 521 MH, Kreisel OPTIMA-PUTZ 521 MH technical card | SAFE_TO_FILL |
| MAT-000027 | — | — | — | IDENTITY_BLOCKED |
| MAT-000028 | — | — | — | IDENTITY_BLOCKED |
| MAT-000033 | — | KNAUF | putties-core-content.js: KNAUF Ротбанд Финиш | SAFE_TO_FILL |
| MAT-000034 | — | KNAUF | putties-core-content.js: KNAUF Унифлот RU/UZ, KNAUF Uniflott DE/AT | SAFE_TO_FILL |
| MAT-000035 | — | KNAUF | putties-core-content.js: KNAUF Унифлот RU/UZ, KNAUF Uniflott DE/AT | SAFE_TO_FILL |
| MAT-000036 | — | KNAUF | putties-core-content.js: KNAUF Фуген | SAFE_TO_FILL |
| MAT-000037 | — | KNAUF | putties-core-content.js: KNAUF Фуген | SAFE_TO_FILL |
| MAT-000038 | — | KNAUF | putties-core-content.js: KNAUF УниХард | SAFE_TO_FILL |
| MAT-000039 | — | Старатели | putties-core-content.js: Старатели Базовая гипсовая | SAFE_TO_FILL |
| MAT-000040 | — | Старатели | putties-core-content.js: Старатели Финишная гипсовая | SAFE_TO_FILL |
| MAT-000041 | — | ВОЛМА | putties-core-content.js: ВОЛМА-Финиш | SAFE_TO_FILL |
| MAT-000042 | — | ВОЛМА | putties-core-content.js: ВОЛМА-ШЕЛК TDS | SAFE_TO_FILL |
| MAT-000043 | — | ВОЛМА | putties-core-content.js: ВОЛМА Arctic | SAFE_TO_FILL |
| MAT-000044 | — | PUFAS | putties-core-content.js: PUFAS Glatt+Füll GFS 25 kg | SAFE_TO_FILL |
| MAT-000045 | — | PUFAS | putties-core-content.js: PUFAS Full+Finish Spachtel TDS | SAFE_TO_FILL |
| MAT-000046 | — | PUFAS | putties-core-content.js: PUFAS Full+Finish Spachtel TDS | SAFE_TO_FILL |
| MAT-000047 | — | Danogips | putties-core-content-batch2.js: Danogips official, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000048 | — | Danogips | putties-core-content-batch2.js: Danogips official, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000049 | — | KNAUF | putties-core-content-batch2.js: KNAUF Rotband Pasta Profi, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000050 | — | KNAUF | putties-core-content-batch2.js: KNAUF Rotband Pasta Profi, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000051 | — | SEMIN | putties-core-content-batch2.js: SEMIN CE 78, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000052 | — | VGT | putties-core-content-batch2.js: VGT universal putty, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000053 | — | Vetonit | putties-core-content-batch2.js: Vetonit LR+, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000054 | — | Vetonit | putties-core-content-batch2.js: Vetonit LR+, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000055 | — | Vetonit | putties-core-content-batch2.js: Vetonit KR technical map, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000056 | — | Vetonit | putties-core-content-batch2.js: Vetonit JS, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000057 | — | KNAUF | putties-core-content-batch2.js: KNAUF Полимер Финиш, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000058 | — | ОСНОВИТ | putties-core-content-batch2.js: ОСНОВИТ Элисилк PA39 W, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000059 | — | Danogips | putties-core-content-batch2.js: Danogips Dano JET5, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000060 | — | ВОЛМА | putties-core-content-batch2.js: ВОЛМА Искрит, Локальная карточка MatMix | IDENTITY_BLOCKED |
| MAT-000061 | — | KNAUF | putties-core-content-batch3.js: KNAUF-Мульти-Финиш — официальный сайт и TDS, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000062 | — | Старатели | putties-core-content-batch3.js: Старатели — цементная Базовая, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000063 | — | Старатели | putties-core-content-batch3.js: Старатели — цементная Фасадно-финишная, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000064 | — | Vetonit | putties-core-content-batch3.js: Vetonit ВХ 20 кг — официальный сайт и TDS, Локальная карточка MatMix | SAFE_TO_FILL |
| MAT-000065 | — | VGT | putties-core-content-batch3.js: VGT — Шпатлевка «Экстра» по дереву, Локальная карточка MatMix | SAFE_TO_FILL |

## MAT-000001 — Штукатурка гипсовая Knauf Ротбанд 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: КНАУФ-Ротбанд; КНАУФ-Ротбанд |
| Срок хранения | — | 12 | месяцев | WILL_ADD: КНАУФ-Ротбанд |
| Фасовка | — | 5 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — КНАУФ-Ротбанд; plasters-content.js — КНАУФ-Ротбанд |
| purpose | Назначение | Ручное выравнивание стен и потолков внутри помещений | — | READY: plasters-core-content.js — КНАУФ-Ротбанд; plasters-content.js — КНАУФ-Ротбанд |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм; локально до 100 мм | — | READY: plasters-core-content.js — КНАУФ-Ротбанд; plasters-content.js — КНАУФ-Ротбанд |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–15 мм | — | READY: plasters-core-content.js — КНАУФ-Ротбанд; plasters-content.js — КНАУФ-Ротбанд |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — КНАУФ-Ротбанд |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — SKIP: Числовое поле не сохраняет признак приблизительного значения. Нужен согласованный способ представления; не усреднять и не терять квалификатор. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength
- adhesion — UNREPRESENTABLE_NUMBER:adhesion
- drying_time — MISSING_OR_INACTIVE_DEFINITION
- grain_size — MISSING_OR_INACTIVE_DEFINITION

## MAT-000002 — Штукатурка гипсовая Knauf Ротбанд 30 кг

STATUS: **READY_FOR_BACKFILL**; disposition: **SAFE_TO_APPLY**; текущих attribute rows: 11.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | KNAUF | KNAUF | — | EXISTING_OK (brand пишется отдельно и не включён в batch) |
| Тип продукта | Универсальная гипсовая штукатурка | Универсальная гипсовая штукатурка | — | EXISTING_OK: КНАУФ-Ротбанд |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | 30 | 30 | кг | EXISTING_OK: Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

- product_type — Тип продукта: Универсальная гипсовая штукатурка  (совпадает с reviewed proposal).
- base — Основа: Гипсовое вяжущее с модифицирующими добавками  (совпадает с reviewed proposal).
- purpose — Назначение: Ручное выравнивание стен и потолков внутри помещений  (совпадает с reviewed proposal).
- package_weight — Фасовка: 30 кг (совпадает с reviewed proposal).
- consumption_10mm — Расход при слое 10 мм: 8.5 кг/м² (совпадает с reviewed proposal).
- wall_layer_thickness — Толщина слоя на стене: 5–50 мм; локально до 100 мм  (совпадает с reviewed proposal).
- ceiling_layer_thickness — Толщина слоя на потолке: 5–15 мм  (совпадает с reviewed proposal).
- application_temperature — Температура основания и воздуха: +5…+30 °C  (совпадает с reviewed proposal).

### NEEDS_SOURCE

_Нет._

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000003 — Штукатурка гипсовая Knauf Гольдбанд 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: КНАУФ-Гольдбанд; КНАУФ-Гольдбанд |
| Срок хранения | — | 6 | месяцев | WILL_ADD: КНАУФ-Гольдбанд |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — КНАУФ-Гольдбанд; plasters-content.js — КНАУФ-Гольдбанд |
| purpose | Назначение | Ручное выравнивание стен внутри помещений | — | READY: plasters-core-content.js — КНАУФ-Гольдбанд; plasters-content.js — КНАУФ-Гольдбанд |
| wall_layer_thickness | Толщина слоя на стене | 8–50 мм | — | READY: plasters-core-content.js — КНАУФ-Гольдбанд; plasters-content.js — КНАУФ-Гольдбанд |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — КНАУФ-Гольдбанд |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — SKIP: Числовое поле не сохраняет признак приблизительного значения. Нужен согласованный способ представления; не усреднять и не терять квалификатор. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength
- adhesion — UNREPRESENTABLE_NUMBER:adhesion
- drying_time — MISSING_OR_INACTIVE_DEFINITION
- grain_size — MISSING_OR_INACTIVE_DEFINITION

## MAT-000004 — Штукатурка гипсовая Knauf МП-75 маш. 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка машинного нанесения | — | WILL_ADD: КНАУФ-МП 75 (Россия); КНАУФ-МП 75 (Россия) |
| Срок хранения | — | 6 | месяцев | WILL_ADD: КНАУФ-МП 75 (Россия) |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — КНАУФ-МП 75 (Россия); plasters-content.js — КНАУФ-МП 75 (Россия) |
| purpose | Назначение | Механизированное выравнивание стен и потолков внутри помещений | — | READY: plasters-core-content.js — КНАУФ-МП 75 (Россия); plasters-content.js — КНАУФ-МП 75 (Россия) |
| wall_layer_thickness | Толщина слоя на стене | 8–50 мм | — | READY: plasters-core-content.js — КНАУФ-МП 75 (Россия); plasters-content.js — КНАУФ-МП 75 (Россия) |
| ceiling_layer_thickness | Толщина слоя на потолке | 8–15 мм | — | READY: plasters-core-content.js — КНАУФ-МП 75 (Россия); plasters-content.js — КНАУФ-МП 75 (Россия) |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — КНАУФ-МП 75 (Россия) |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — SKIP: Диапазон не помещается в числовое поле; требуется отдельное решение по представлению. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000005 — Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Лёгкая гипсовая штукатурка ручного нанесения | — | WILL_ADD: ВОЛМА-Холст |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: plasters-core-content.js — ВОЛМА-Холст |
| purpose | Назначение | Выравнивание стен и потолков внутри помещений | — | READY: plasters-core-content.js — ВОЛМА-Холст |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; максимум 50 мм | — | READY: plasters-core-content.js — ВОЛМА-Холст |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–30 мм; максимум 50 мм | — | READY: plasters-core-content.js — ВОЛМА-Холст |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Холст |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

_Нет._

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000006 — Штукатурка гипсовая ВОЛМА Слой Бел. 30 кг

STATUS: **SOURCE_CONFLICT**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: ВОЛМА-Слой; ВОЛМА-Слой |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ВОЛМА-Слой |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| purpose | Назначение | Ручная внутренняя отделка стен и потолков | — | READY: plasters-core-content.js — ВОЛМА-Слой; plasters-content.js — ВОЛМА-Слой |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–30 мм; максимум 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Слой |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Слой |
| color | Цвет | Белый; допускаются бежевые и светло-серые оттенки | — | READY: plasters-content.js — ВОЛМА-Слой |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

- **base (Основа) — BLOCKED:** plasters-core-content.js: «Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками» [ВОЛМА-Слой]; plasters-content.js: «Гипсовая» [ВОЛМА-Слой]
- **wall_layer_thickness (Толщина слоя на стене) — BLOCKED:** plasters-core-content.js: «5–30 мм; максимум 60 мм» [ВОЛМА-Слой]; plasters-content.js: «5–30 мм; локальные углубления до 60 мм» [ВОЛМА-Слой]

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength

## MAT-000007 — Штукатурка гипсовая ВОЛМА Гипс Актив мех. Сер. 30 кг

STATUS: **SOURCE_CONFLICT**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка машинного нанесения | — | WILL_ADD: ВОЛМА-Гипс-Актив; ВОЛМА-Гипс-Актив |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| purpose | Назначение | Выравнивание стен и потолков внутри помещений с нормальной влажностью | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив; plasters-content.js — ВОЛМА-Гипс-Актив |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; максимум 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–30 мм; максимум 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

- **base (Основа) — BLOCKED:** plasters-core-content.js: «Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками» [ВОЛМА-Гипс-Актив]; plasters-content.js: «Гипсовая» [ВОЛМА-Гипс-Актив]

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000008 — Штукатурка гипсовая ВОЛМА Гипс Актив мех. Бел. 30 кг

STATUS: **SOURCE_CONFLICT**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка машинного нанесения | — | WILL_ADD: ВОЛМА-Гипс-Актив; ВОЛМА-Гипс-Актив |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| purpose | Назначение | Выравнивание стен и потолков внутри помещений с нормальной влажностью | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив; plasters-content.js — ВОЛМА-Гипс-Актив |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; максимум 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–30 мм; максимум 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Гипс-Актив |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

- **base (Основа) — BLOCKED:** plasters-core-content.js: «Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками» [ВОЛМА-Гипс-Актив]; plasters-content.js: «Гипсовая» [ВОЛМА-Гипс-Актив]

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000009 — Штукатурка гипсовая Русеан Plaster Сер. 30кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Русеан | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: Русеан ПЛАСТЕР серый 30 кг; Русеан PLASTER |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг; plasters-content.js — Русеан PLASTER |
| purpose | Назначение | Ручное выравнивание стен внутри помещений с нормальной влажностью | — | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг |
| consumption_10mm | Расход при слое 10 мм | 9.5 | кг/м² | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм | — | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг |
| ceiling_layer_thickness | Толщина слоя на потолке | до 15 мм | — | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг |
| application_temperature | Температура основания и воздуха | от +5 до +25 °C | — | READY: plasters-core-content.js — Русеан ПЛАСТЕР серый 30 кг |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000010 — Штукатурка гипсовая Русеан Termoplast Бел. 30кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Русеан | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: Русеан ТЕРМОПЛАСТ белый 30 кг; Русеан: карточка TERMOPLAST в каталоге |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг; plasters-content.js — Русеан: карточка TERMOPLAST в каталоге |
| purpose | Назначение | Черновая отделка внутри помещений под обои, краску или плитку | — | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг; plasters-content.js — Русеан: карточка TERMOPLAST в каталоге |
| consumption_10mm | Расход при слое 10 мм | 10.5 | кг/м² | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг |
| wall_layer_thickness | Толщина слоя на стене | 8–50 мм | — | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг |
| ceiling_layer_thickness | Толщина слоя на потолке | 8–15 мм | — | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг |
| application_temperature | Температура основания и воздуха | от +5 до +25 °C | — | READY: plasters-core-content.js — Русеан ТЕРМОПЛАСТ белый 30 кг |
| substrates | Основания | Кирпичные, бетонные и цементные основания | — | READY: plasters-content.js — Русеан: карточка TERMOPLAST в каталоге |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000011 — Штукатурка гипсовая UNIS Теплон белая 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | UNIS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Облегчённая гипсовая штукатурка с перлитом | — | WILL_ADD: UNIS Теплон Белый; UNIS Теплон Белый |
| Срок хранения | — | 12 | месяцев | WILL_ADD: UNIS Теплон Белый |
| Фасовка | — | 5 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| purpose | Назначение | Выравнивание стен и потолков внутри помещений | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| consumption_10mm | Расход при слое 10 мм | 8.5 | кг/м² | READY: plasters-core-content.js — UNIS Теплон Белый |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм; локально до 100 мм | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| ceiling_layer_thickness | Толщина слоя на потолке | До 20 мм | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| color | Цвет | Белый после высыхания | — | READY: plasters-content.js — UNIS Теплон Белый |
| application_method | Способ нанесения | Ручное и машинное | — | READY: plasters-content.js — UNIS Теплон Белый |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000012 — Штукатурка гипсовая UNIS Теплон белая 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | UNIS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Облегчённая гипсовая штукатурка с перлитом | — | WILL_ADD: UNIS Теплон Белый; UNIS Теплон Белый |
| Срок хранения | — | 12 | месяцев | WILL_ADD: UNIS Теплон Белый |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| purpose | Назначение | Выравнивание стен и потолков внутри помещений | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| consumption_10mm | Расход при слое 10 мм | 8.5 | кг/м² | READY: plasters-core-content.js — UNIS Теплон Белый |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм; локально до 100 мм | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| ceiling_layer_thickness | Толщина слоя на потолке | До 20 мм | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — UNIS Теплон Белый; plasters-content.js — UNIS Теплон Белый |
| color | Цвет | Белый после высыхания | — | READY: plasters-content.js — UNIS Теплон Белый |
| application_method | Способ нанесения | Ручное и машинное | — | READY: plasters-content.js — UNIS Теплон Белый |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000013 — Штукатурка гипсовая Старатели 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая штукатурка | — | WILL_ADD: Старатели: классическая гипсовая штукатурка; Старатели: классическая гипсовая штукатурка |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовая | — | READY: plasters-core-content.js — Старатели: классическая гипсовая штукатурка; plasters-content.js — Старатели: классическая гипсовая штукатурка |
| purpose | Назначение | Ручное выравнивание стен и потолков в помещениях с нормальной влажностью | — | READY: plasters-core-content.js — Старатели: классическая гипсовая штукатурка; plasters-content.js — Старатели: классическая гипсовая штукатурка |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм; локально до 100 мм | — | READY: plasters-core-content.js — Старатели: классическая гипсовая штукатурка |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–50 мм; локально до 100 мм | — | READY: plasters-core-content.js — Старатели: классическая гипсовая штукатурка |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — Старатели: классическая гипсовая штукатурка; plasters-content.js — Старатели: классическая гипсовая штукатурка |
| color | Цвет | Серый | — | READY: plasters-content.js — Старатели: классическая гипсовая штукатурка |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000014 — Штукатурка гипсово-цементная Старатели Оптимум серая универсальная мех. 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Штукатурная смесь | — | WILL_ADD: Старатели Оптимум 30 кг; Старатели Оптимум 30 кг |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипс и цемент | — | READY: plasters-core-content.js — Старатели Оптимум 30 кг; plasters-content.js — Старатели Оптимум 30 кг |
| purpose | Назначение | Выравнивание стен и потолков в помещениях с нормальной и повышенной влажностью | — | READY: plasters-core-content.js — Старатели Оптимум 30 кг; plasters-content.js — Старатели Оптимум 30 кг |
| wall_layer_thickness | Толщина слоя на стене | 5–60 мм; локально до 90 мм | — | READY: plasters-core-content.js — Старатели Оптимум 30 кг |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–60 мм; локально до 90 мм | — | READY: plasters-core-content.js — Старатели Оптимум 30 кг |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — Старатели Оптимум 30 кг |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: plasters-content.js — Старатели Оптимум 30 кг |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000015 — Штукатурка цементная Цементум 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ЦЕМЕНТУМ | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурка | — | WILL_ADD: ЦЕМЕНТУМ: цементная штукатурка; ЦЕМЕНТУМ: цементная штукатурка |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — ЦЕМЕНТУМ: цементная штукатурка; plasters-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| purpose | Назначение | Восстановление и выравнивание минеральных поверхностей внутри и снаружи зданий | — | READY: plasters-core-content.js — ЦЕМЕНТУМ: цементная штукатурка; plasters-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| consumption_10mm | Расход при слое 10 мм | 14 | кг/м² | READY: plasters-core-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; многослойно до 60 мм | — | READY: plasters-core-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: plasters-content.js — ЦЕМЕНТУМ: цементная штукатурка |
| substrates | Основания | Кирпич, бетон, ячеистый бетон, цементно-песчаные и цементно-известковые штукатурки | — | READY: plasters-content.js — ЦЕМЕНТУМ: цементная штукатурка |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000016 — Штукатурка цементная Knauf Унтерпутц 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная фасадная штукатурка | — | WILL_ADD: КНАУФ-Унтерпутц; КНАУФ-Унтерпутц |
| Срок хранения | — | 12 | месяцев | WILL_ADD: КНАУФ-Унтерпутц |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — КНАУФ-Унтерпутц; plasters-content.js — КНАУФ-Унтерпутц |
| purpose | Назначение | Выравнивание фасадов и стен в помещениях с высокой влажностью | — | READY: plasters-core-content.js — КНАУФ-Унтерпутц; plasters-content.js — КНАУФ-Унтерпутц |
| consumption_10mm | Расход при слое 10 мм | 17 | кг/м² | READY: plasters-core-content.js — КНАУФ-Унтерпутц |
| wall_layer_thickness | Толщина слоя на стене | 10–35 мм | — | READY: plasters-core-content.js — КНАУФ-Унтерпутц; plasters-content.js — КНАУФ-Унтерпутц |
| application_temperature | Температура основания и воздуха | Температура воздуха и основания не ниже +5 °C | — | READY: plasters-core-content.js — КНАУФ-Унтерпутц; plasters-content.js — КНАУФ-Унтерпутц |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- adhesion — UNREPRESENTABLE_NUMBER:adhesion
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength

## MAT-000017 — Штукатурка цементная Knauf Грюнбанд трещиностойкая 25 кг

STATUS: **SOURCE_CONFLICT**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Лёгкая цементная фасадная штукатурка | — | WILL_ADD: КНАУФ-Грюнбанд; КНАУФ-Грюнбанд |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цемент с лёгким заполнителем из гранул пенополистирола | — | READY: plasters-core-content.js — КНАУФ-Грюнбанд; plasters-content.js — КНАУФ-Грюнбанд |
| consumption_10mm | Расход при слое 10 мм | 12 | кг/м² | READY: plasters-core-content.js — КНАУФ-Грюнбанд |
| wall_layer_thickness | Толщина слоя на стене | 10–30 мм | — | READY: plasters-core-content.js — КНАУФ-Грюнбанд; plasters-content.js — КНАУФ-Грюнбанд |
| application_temperature | Температура основания и воздуха | Температура воздуха и основания не ниже +5 °C | — | READY: plasters-core-content.js — КНАУФ-Грюнбанд; plasters-content.js — КНАУФ-Грюнбанд |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

- **purpose (Назначение) — BLOCKED:** plasters-core-content.js: «Выравнивание фасадов и стен во влажных помещениях» [КНАУФ-Грюнбанд]; plasters-content.js: «Выравнивание фасадов, стен и потолков во влажных помещениях» [КНАУФ-Грюнбанд]

### SCHEMA_BLOCKED

- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- adhesion — UNREPRESENTABLE_NUMBER:adhesion
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength

## MAT-000018 — Штукатурка цементная Weber Vetonit ТТ40 фасадная 25 кг

STATUS: **SOURCE_CONFLICT**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурка | — | WILL_ADD: Vetonit: система выравнивания стен под плитку; Vetonit: система выравнивания стен под плитку |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — Vetonit: система выравнивания стен под плитку; plasters-content.js — Vetonit: система выравнивания стен под плитку |
| consumption_10mm | Расход при слое 10 мм | 17 | кг/м² | READY: plasters-core-content.js — weber.vetonit TT40 technical card |
| wall_layer_thickness | Толщина слоя на стене | 5–40 мм за одно нанесение; локально до 60 мм | — | READY: plasters-core-content.js — Vetonit: система выравнивания стен под плитку; plasters-content.js — Vetonit: система выравнивания стен под плитку |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–40 мм; локально до 60 мм | — | READY: plasters-core-content.js — weber.vetonit TT40 technical card |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — weber.vetonit TT40 technical card |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: plasters-content.js — Vetonit: система выравнивания стен под плитку |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

- **purpose (Назначение) — BLOCKED:** plasters-core-content.js: «Базовое выравнивание стен и потолков в сухих, влажных и мокрых помещениях, а также фасадов» [weber.vetonit TT40 technical card]; plasters-content.js: «Базовое выравнивание стен под плитку в сухих помещениях» [Vetonit: система выравнивания стен под плитку]

### SCHEMA_BLOCKED

_Нет._

## MAT-000019 — Штукатурка цементная Mapei Nivoplan Plus 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | MAPEI | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурная смесь | — | WILL_ADD: MAPEI Nivoplan Plus — русскоязычная техническая карта; MAPEI Nivoplan Plus — русскоязычная техническая карта |
| Срок хранения | — | 12 | месяцев | WILL_ADD: MAPEI Nivoplan Plus — русскоязычная техническая карта |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; MAPEI Nivoplan Plus — русскоязычная техническая карта |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта; plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| purpose | Назначение | Выравнивание стен, потолков и полов внутри и снаружи помещений | — | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта; plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| consumption_10mm | Расход при слое 10 мм | 16 | кг/м² | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта; plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| wall_layer_thickness | Толщина слоя на стене | 5–50 мм | — | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта; plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–50 мм | — | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| application_temperature | Температура основания и воздуха | От +5 °C до +30 °C | — | READY: plasters-core-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта; plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| color | Цвет | Серый | — | READY: plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |
| substrates | Основания | Бетон, кирпич; для гипсовых оснований требуется грунтовка по технической карте | — | READY: plasters-content.js — MAPEI Nivoplan Plus — русскоязычная техническая карта |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- compressive_strength — UNREPRESENTABLE_NUMBER:compressive_strength
- adhesion — UNREPRESENTABLE_NUMBER:adhesion
- grain_size — MISSING_OR_INACTIVE_DEFINITION

## MAT-000020 — Штукатурка цементная Старатели 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурка | — | WILL_ADD: Старатели: цементная штукатурка; Старатели: цементная штукатурка |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — Старатели: цементная штукатурка; plasters-content.js — Старатели: цементная штукатурка |
| purpose | Назначение | Выравнивание стен внутри помещений и фасадов выше цоколя | — | READY: plasters-core-content.js — Старатели: цементная штукатурка; plasters-content.js — Старатели: цементная штукатурка |
| wall_layer_thickness | Толщина слоя на стене | до 30 мм; многослойно до 60 мм | — | READY: plasters-core-content.js — Старатели: цементная штукатурка |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — Старатели: цементная штукатурка |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: plasters-content.js — Старатели: цементная штукатурка |
| substrates | Основания | Бетон, ячеистый бетон, кирпич, цементная штукатурка | — | READY: plasters-content.js — Старатели: цементная штукатурка |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000021 — Штукатурка цементная Волма Цоколь 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурка с армирующими волокнами | — | WILL_ADD: ВОЛМА-Цоколь; ВОЛМА-Цоколь |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ВОЛМА-Цоколь |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Портландцемент | — | READY: plasters-core-content.js — ВОЛМА-Цоколь; plasters-content.js — ВОЛМА-Цоколь |
| purpose | Назначение | Выравнивание наружных и внутренних стен, цоколей и фундаментов | — | READY: plasters-core-content.js — ВОЛМА-Цоколь; plasters-content.js — ВОЛМА-Цоколь |
| wall_layer_thickness | Толщина слоя на стене | 10–30 мм; при заделке раковин и выбоин до 60 мм | — | READY: plasters-core-content.js — ВОЛМА-Цоколь; plasters-content.js — ВОЛМА-Цоколь |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Цоколь |
| color | Цвет | Серый | — | READY: plasters-content.js — ВОЛМА-Цоколь |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- grain_size — MISSING_OR_INACTIVE_DEFINITION

## MAT-000022 — Штукатурка цементная клеевая ВОЛМА Термофасад 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурно-клеевая смесь | — | WILL_ADD: ВОЛМА-Термофасад; ВОЛМА-Термофасад |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Портландцемент | — | READY: plasters-core-content.js — ВОЛМА-Термофасад; plasters-content.js — ВОЛМА-Термофасад |
| purpose | Назначение | Клеевой и базовый штукатурный слои фасадных теплоизоляционных систем | — | READY: plasters-core-content.js — ВОЛМА-Термофасад; plasters-content.js — ВОЛМА-Термофасад |
| wall_layer_thickness | Толщина слоя на стене | 2–10 мм | — | READY: plasters-core-content.js — ВОЛМА-Термофасад |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — ВОЛМА-Термофасад |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Официальное значение расхода на слое 10 мм не подтверждено. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000023 — Штукатурка цементная Unis Силин армированная универсальная 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | UNIS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Универсальная армированная цементная штукатурка | — | WILL_ADD: UNIS Силин Универсальный Армированный; UNIS Силин Универсальный Армированный |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — UNIS Силин Универсальный Армированный; plasters-content.js — UNIS Силин Универсальный Армированный |
| purpose | Назначение | Выравнивание стен и потолков внутри и снаружи зданий | — | READY: plasters-core-content.js — UNIS Силин Универсальный Армированный |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм | — | READY: plasters-core-content.js — UNIS Силин Универсальный Армированный |
| ceiling_layer_thickness | Толщина слоя на потолке | 5–30 мм | — | READY: plasters-core-content.js — UNIS Силин Универсальный Армированный |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — UNIS Силин Универсальный Армированный |
| application_method | Способ нанесения | Ручное и машинное | — | READY: plasters-content.js — UNIS Силин Универсальный Армированный |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm
- work_area — MISSING_OR_INACTIVE_DEFINITION

## MAT-000024 — Штукатурка цементная ручного и машинного нанесения Основит Техно PC 21 M (25кг)

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Основит | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная фасадная штукатурка | — | WILL_ADD: Основит Техно PC21 M 25 кг; Основит Техно PC21 M 25 кг |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — Основит Техно PC21 M 25 кг; plasters-content.js — Основит Техно PC21 M 25 кг |
| purpose | Назначение | Выравнивание внутренних стен и фасадов выше цокольной части | — | READY: plasters-core-content.js — Основит Техно PC21 M 25 кг; plasters-content.js — Основит Техно PC21 M 25 кг |
| consumption_10mm | Расход при слое 10 мм | 13 | кг/м² | READY: plasters-core-content.js — Основит Техно PC21 M 25 кг |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; локально до 40 мм | — | READY: plasters-core-content.js — Основит Техно PC21 M 25 кг |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — Основит Техно PC21 M 25 кг |
| application_method | Способ нанесения | Ручное и машинное | — | READY: plasters-content.js — Основит Техно PC21 M 25 кг |
| substrates | Основания | Бетон, кирпич, пено- и газобетон, цементные штукатурки | — | READY: plasters-content.js — Основит Техно PC21 M 25 кг |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000025 — Штукатурка цементно - известковая фасадная Основит стартвэлл PC21 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Основит | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Фасадная штукатурка | — | WILL_ADD: Основит Стартвэлл PC21 25 кг; Основит Стартвэлл PC21 25 кг |
| Срок хранения | — | — | месяцев | NO_REVIEWED_PROPOSAL |
| Фасовка | — | 25 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цементная | — | READY: plasters-core-content.js — Основит Стартвэлл PC21 25 кг |
| purpose | Назначение | Выравнивание внутренних стен и фасадов выше цокольной части | — | READY: plasters-core-content.js — Основит Стартвэлл PC21 25 кг; plasters-content.js — Основит Стартвэлл PC21 25 кг |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм; локально до 40 мм | — | READY: plasters-core-content.js — Основит Стартвэлл PC21 25 кг |
| application_temperature | Температура основания и воздуха | +5…+30 °C | — | READY: plasters-core-content.js — Основит Стартвэлл PC21 25 кг |
| substrates | Основания | Бетон, кирпич, пено- и газобетон, цементные штукатурки | — | READY: plasters-content.js — Основит Стартвэлл PC21 25 кг |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- base — NEEDS_SOURCE: Цементно-известковая основа из локального title не подтверждена техническим листом. (значение не предлагается).
- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000026 — Штукатурка цементная Kreisel 521 MH OPTIMA-PUTZ мех. Сер. 30 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Kreisel | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная штукатурка машинного нанесения | — | WILL_ADD: Kreisel OPTIMA-PUTZ 521 MH; Kreisel OPTIMA-PUTZ 521 MH |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Kreisel OPTIMA-PUTZ 521 MH |
| Фасовка | — | 30 | кг | WILL_ADD: Перечень товаров и фасовок в задании пользователя; Перечень товаров и фасовок в задании пользователя |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Портландцемент | — | READY: plasters-core-content.js — Kreisel OPTIMA-PUTZ 521 MH; plasters-content.js — Kreisel OPTIMA-PUTZ 521 MH |
| purpose | Назначение | Штукатурные работы внутри и снаружи зданий выше цокольной части | — | READY: plasters-core-content.js — Kreisel OPTIMA-PUTZ 521 MH; plasters-content.js — Kreisel OPTIMA-PUTZ 521 MH |
| wall_layer_thickness | Толщина слоя на стене | 5–30 мм | — | READY: plasters-core-content.js — Kreisel OPTIMA-PUTZ 521 MH technical card |
| application_temperature | Температура основания и воздуха | +5…+25 °C | — | READY: plasters-core-content.js — Kreisel OPTIMA-PUTZ 521 MH technical card |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- consumption_10mm — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- wall_layer_thickness — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- compressive_strength — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- adhesion — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- grain_size — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).
- substrates — NEEDS_SOURCE: Не подтверждено в проверенных источниках для этой версии товара; нужен технический лист с условиями измерения. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- consumption_10mm — UNREPRESENTABLE_NUMBER:consumption_10mm

## MAT-000027 — Штукатурная смесь цементная Евро М-150 40кг

STATUS: **IDENTITY_UNCERTAIN**; disposition: **IDENTITY_BLOCKED**; текущих attribute rows: 0.

**Полная блокировка по идентичности:** SOURCE_IDENTITY_BLOCKED. В источнике ключ «Евро М-150» совпадает с возможными разными производителями; официальный каталог Euro RS содержит М-150 40 кг, но не доказывает соответствие этому MAT. Предлагаемые значения к apply скрыты.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | BLOCKED | — | IDENTITY_BLOCKED (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | BLOCKED | — | IDENTITY_BLOCKED: BLOCKED_IDENTITY: точная модификация и производитель не установлены. |
| Срок хранения | — | BLOCKED | месяцев | IDENTITY_BLOCKED |
| Фасовка | — | BLOCKED | кг | IDENTITY_BLOCKED: BLOCKED_IDENTITY: точная модификация и производитель не установлены.; Не установлено точное соответствие продукта техническому источнику; запись заблокирована. |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

_Нет._

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000028 — Штукатурная смесь цементная Русеан М-150 40кг

STATUS: **IDENTITY_UNCERTAIN**; disposition: **IDENTITY_BLOCKED**; текущих attribute rows: 0.

**Полная блокировка по идентичности:** SOURCE_IDENTITY_BLOCKED. В каталоге Русеан для М-150 40 кг есть несколько вариантов — СТАНДАРТ/рецепт №2 и модифицированная версия; локальный title не устанавливает точный вариант. Предлагаемые значения к apply скрыты.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | BLOCKED | — | IDENTITY_BLOCKED (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | BLOCKED | — | IDENTITY_BLOCKED: BLOCKED_IDENTITY: точная модификация и производитель не установлены. |
| Срок хранения | — | BLOCKED | месяцев | IDENTITY_BLOCKED |
| Фасовка | — | BLOCKED | кг | IDENTITY_BLOCKED: BLOCKED_IDENTITY: точная модификация и производитель не установлены.; Не установлено точное соответствие продукта техническому источнику; запись заблокирована. |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

_Нет._

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000033 — Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая шпаклевка | — | WILL_ADD: KNAUF Ротбанд Финиш |
| Срок хранения | — | 6 | месяцев | WILL_ADD: KNAUF Ротбанд Финиш |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с полимерными добавками | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| purpose | Назначение | Финишное выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| substrates | Основания | ГКЛ, ГВЛ, пазогребневые плиты, гипсовые и цементные штукатурки, бетон | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| layer_thickness | Толщина слоя | 0,2–5 мм | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Точная температура применения для exact редакции не подтверждена в использованной карточке. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact фасовки не зафиксирован в текстовой карточке. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- consumption_basis — NEEDS_SOURCE: Источник указывает расход, но не фиксирует толщину слоя для этого значения; базис нельзя выводить. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Точное время высыхания exact условиями не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000034 — Шпаклевка гипсовая Knauf Унифлот 5 кг

STATUS: **PARTIAL**; disposition: **NO_SAFE_VALUES**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | — | — | NEEDS_SOURCE: Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven. |
| Срок хранения | — | — | месяцев | NEEDS_SOURCE: 9 months is foreign-market data; exact Russian SKU applicability is not proven. |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- product_type — NEEDS_SOURCE: Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven. (значение не предлагается).
- base — NEEDS_SOURCE: Foreign-market source; exact Russian formulation is not proven. (значение не предлагается).
- purpose — NEEDS_SOURCE: Foreign-market source; exact Russian SKU purpose is not proven. (значение не предлагается).
- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Exact Russian SKU temperature is not proven; foreign-market values retained as research only. (значение не предлагается).
- shelf_life — NEEDS_SOURCE: 9 months is foreign-market data; exact Russian SKU applicability is not proven. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).
- application_area — NEEDS_SOURCE: Foreign-market source; exact Russian SKU application area is not proven. (значение не предлагается).
- application_method — NEEDS_SOURCE: Foreign-market source; exact Russian SKU method is not proven. (значение не предлагается).
- substrates — NEEDS_SOURCE: Foreign-market source; exact Russian SKU substrates are not proven. (значение не предлагается).
- layer_thickness — NEEDS_SOURCE: Диапазон толщины exact Russian SKU не подтверждён. (значение не предлагается).
- consumption — NEEDS_SOURCE: Foreign-market consumption cannot be copied to the Russian SKU. (значение не предлагается).
- consumption_basis — NEEDS_SOURCE: Foreign-market consumption basis cannot be copied to the Russian SKU. (значение не предлагается).
- pot_life — NEEDS_SOURCE: 45 minutes is DE/AT data; exact Russian SKU applicability is not proven. (значение не предлагается).
- drying_time — NEEDS_SOURCE: 24 hours/mm is DE/AT data; exact Russian SKU applicability is not proven. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION

## MAT-000035 — Шпаклевка гипсовая Knauf Унифлот 25 кг

STATUS: **PARTIAL**; disposition: **NO_SAFE_VALUES**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | — | — | NEEDS_SOURCE: Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven. |
| Срок хранения | — | — | месяцев | NEEDS_SOURCE: 9 months is foreign-market data; exact Russian SKU applicability is not proven. |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- product_type — NEEDS_SOURCE: Foreign-market source confirms product family, but exact Russian MatMix SKU applicability is not proven. (значение не предлагается).
- base — NEEDS_SOURCE: Foreign-market source; exact Russian formulation is not proven. (значение не предлагается).
- purpose — NEEDS_SOURCE: Foreign-market source; exact Russian SKU purpose is not proven. (значение не предлагается).
- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Exact Russian SKU temperature is not proven; foreign-market values retained as research only. (значение не предлагается).
- shelf_life — NEEDS_SOURCE: 9 months is foreign-market data; exact Russian SKU applicability is not proven. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).
- application_area — NEEDS_SOURCE: Foreign-market source; exact Russian SKU application area is not proven. (значение не предлагается).
- application_method — NEEDS_SOURCE: Foreign-market source; exact Russian SKU method is not proven. (значение не предлагается).
- substrates — NEEDS_SOURCE: Foreign-market source; exact Russian SKU substrates are not proven. (значение не предлагается).
- layer_thickness — NEEDS_SOURCE: Диапазон толщины exact Russian SKU не подтверждён. (значение не предлагается).
- consumption — NEEDS_SOURCE: Foreign-market consumption cannot be copied to the Russian SKU. (значение не предлагается).
- consumption_basis — NEEDS_SOURCE: Foreign-market consumption basis cannot be copied to the Russian SKU. (значение не предлагается).
- pot_life — NEEDS_SOURCE: 45 minutes is DE/AT data; exact Russian SKU applicability is not proven. (значение не предлагается).
- drying_time — NEEDS_SOURCE: 24 hours/mm is DE/AT data; exact Russian SKU applicability is not proven. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION

## MAT-000036 — Шпаклевка гипсовая Knauf Фуген 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая шпаклевка | — | WILL_ADD: KNAUF Фуген |
| Срок хранения | — | 6 | месяцев | WILL_ADD: KNAUF Фуген |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с полимерными добавками | — | READY: putties-core-content.js — KNAUF Фуген |
| purpose | Назначение | Заделка швов и выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — KNAUF Фуген |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| substrates | Основания | ГКЛ, ГВЛ, бетон, штукатурка | — | READY: putties-core-content.js — KNAUF Фуген |
| layer_thickness | Толщина слоя | 1–5 мм | — | READY: putties-core-content.js — KNAUF Фуген |
| consumption | Расход | 0,8–1,0 кг/м² | — | READY: putties-core-content.js — KNAUF Фуген |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения не указана на проверенной странице. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет не зафиксирован в карточке. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Время жизнеспособности замеса exact фасовки не подтверждено. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Время высыхания не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION

## MAT-000037 — Шпаклевка гипсовая Knauf Фуген 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая шпаклевка | — | WILL_ADD: KNAUF Фуген |
| Срок хранения | — | 12 | месяцев | WILL_ADD: KNAUF Фуген |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с полимерными добавками | — | READY: putties-core-content.js — KNAUF Фуген |
| purpose | Назначение | Заделка швов и выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — KNAUF Фуген |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |
| substrates | Основания | ГКЛ, ГВЛ, бетон, штукатурка | — | READY: putties-core-content.js — KNAUF Фуген |
| layer_thickness | Толщина слоя | 1–5 мм | — | READY: putties-core-content.js — KNAUF Фуген |
| consumption | Расход | 0,8–1,0 кг/м² | — | READY: putties-core-content.js — KNAUF Фуген |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения не указана на проверенной странице. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет не зафиксирован в карточке. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Время жизнеспособности замеса exact фасовки не подтверждено. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Время высыхания не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION

## MAT-000038 — Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Высокопрочная гипсовая шпаклевка | — | WILL_ADD: KNAUF УниХард |
| Срок хранения | — | 6 | месяцев | WILL_ADD: KNAUF УниХард |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — KNAUF УниХард |
| purpose | Назначение | Выравнивание и финишная подготовка поверхностей внутри помещений | — | READY: putties-core-content.js — KNAUF УниХард |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — KNAUF Ротбанд Финиш |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения exact SKU не подтверждена. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет не зафиксирован. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не подтверждён. (значение не предлагается).
- substrates — NEEDS_SOURCE: Перечень оснований exact версии не подтверждён. (значение не предлагается).
- layer_thickness — NEEDS_SOURCE: Диапазон слоя не подтверждён. (значение не предлагается).
- consumption — NEEDS_SOURCE: Расход exact версии не подтверждён. (значение не предлагается).
- consumption_basis — NEEDS_SOURCE: Основание расхода не подтверждено. (значение не предлагается).
- pot_life — NEEDS_SOURCE: Жизнеспособность не подтверждена. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Время высыхания не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION

## MAT-000039 — Шпаклевка гипсовая Старатели базовая 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая базовая шпаклевка | — | WILL_ADD: Старатели Базовая гипсовая |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Старатели Базовая гипсовая |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| purpose | Назначение | Базовое выравнивание стен и потолков внутри помещений | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| color | Цвет | Белый | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| application_area | Область применения | Внутри помещений с нормальной влажностью | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| application_method | Способ нанесения | Ручное и механизированное нанесение | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| substrates | Основания | Бетон, кирпич, цементная и гипсовая штукатурка, ПГП, ГКЛ, ГВЛ | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| layer_thickness | Толщина слоя | 1–10 мм | — | READY: putties-core-content.js — Старатели Базовая гипсовая |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content.js — Старатели Базовая гипсовая |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000040 — Шпаклевка гипсовая Старатели финишная 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая финишная шпаклевка | — | WILL_ADD: Старатели Финишная гипсовая |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Старатели Финишная гипсовая |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| purpose | Назначение | Финишное выравнивание стен и потолков внутри помещений | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| color | Цвет | Белый | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| application_area | Область применения | Внутри помещений с нормальной влажностью | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| application_method | Способ нанесения | Ручное и механизированное нанесение | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| substrates | Основания | Бетон, кирпич, гипсовая и цементная штукатурка, ПГП, ГКЛ, ГВЛ | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| layer_thickness | Толщина слоя | 0,3–5 мм | — | READY: putties-core-content.js — Старатели Финишная гипсовая |
| consumption | Расход | 0,9 кг/м² | — | READY: putties-core-content.js — Старатели Финишная гипсовая |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000041 — Шпаклевка гипсовая Волма Финиш 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая финишная шпаклевка | — | WILL_ADD: ВОЛМА-Финиш |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ВОЛМА-Финиш |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| purpose | Назначение | Финишное выравнивание стен и потолков внутри помещений | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| application_temperature | Температура основания и воздуха | от +5 до +30 °C | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| application_method | Способ нанесения | Ручное нанесение | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| substrates | Основания | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| layer_thickness | Толщина слоя | 0,2–3 мм; максимум 5 мм | — | READY: putties-core-content.js — ВОЛМА-Финиш |
| consumption | Расход | 0,9–1,0 кг/м² | — | READY: putties-core-content.js — ВОЛМА-Финиш |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact фасовки отдельно не указан. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000042 — Шпаклевка гипсовая финишная Волма Шелк 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая финишная шпаклевка | — | WILL_ADD: ВОЛМА-ШЕЛК TDS |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ВОЛМА-ШЕЛК TDS |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| purpose | Назначение | Финишное выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| application_temperature | Температура основания и воздуха | от +5 до +30 °C | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| application_area | Область применения | Внутри помещений с нормальной влажностью | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| application_method | Способ нанесения | Ручное нанесение | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| substrates | Основания | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| layer_thickness | Толщина слоя | 0,2–3 мм; максимум 5 мм | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |
| consumption | Расход | 0,9–1,0 кг/м² | — | READY: putties-core-content.js — ВОЛМА-ШЕЛК TDS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact фасовки не указан в TDS. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000043 — Шпаклевка гипсовая финишная Волма Arctic 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ВОЛМА | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая финишная шпаклевка | — | WILL_ADD: ВОЛМА Arctic |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ВОЛМА Arctic |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее | — | READY: putties-core-content.js — ВОЛМА Arctic |
| purpose | Назначение | Финишное выравнивание стен и потолков внутри помещений | — | READY: putties-core-content.js — ВОЛМА Arctic |
| application_temperature | Температура основания и воздуха | от +5 до +30 °C | — | READY: putties-core-content.js — ВОЛМА Arctic |
| color | Цвет | Белый / снежно-белый | — | READY: putties-core-content.js — ВОЛМА Arctic |
| application_area | Область применения | Внутри помещений с нормальной влажностью | — | READY: putties-core-content.js — ВОЛМА Arctic |
| application_method | Способ нанесения | Ручное и механизированное нанесение | — | READY: putties-core-content.js — ВОЛМА Arctic |
| substrates | Основания | Бетон, гипсовая штукатурка, ГКЛ, ГВЛ, ПГП | — | READY: putties-core-content.js — ВОЛМА Arctic |
| layer_thickness | Толщина слоя | 0,2–3 мм; максимум 5 мм | — | READY: putties-core-content.js — ВОЛМА Arctic |
| consumption | Расход | 0,9–1,0 кг/м² | — | READY: putties-core-content.js — ВОЛМА Arctic |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000044 — Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | PUFAS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая армированная шпаклевка | — | WILL_ADD: PUFAS Glatt+Füll GFS 25 kg |
| Срок хранения | — | — | месяцев | NEEDS_SOURCE: В официальном источнике указано, что срок хранения неначатой упаковки не ограничен в сухом месте; числовая схема месяцев это не представляет. |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с целлюлозным армированием | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| purpose | Назначение | Заполнение и выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| color | Цвет | Белый | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| substrates | Основания | Минеральные основания, кирпич, бетон, штукатурка, ГКЛ, ГВЛ | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| layer_thickness | Толщина слоя | от 0 до 15 см и более | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |
| consumption | Расход | 0,8–1 кг/м² | — | READY: putties-core-content.js — PUFAS Glatt+Füll GFS 25 kg |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения не указана в использованном TDS. (значение не предлагается).
- shelf_life — SCHEMA_BLOCKED: В официальном источнике указано, что срок хранения неначатой упаковки не ограничен в сухом месте; числовая схема месяцев это не представляет. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Время высыхания зависит от толщины/условий; точное значение не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000045 — Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | PUFAS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая заполняющая и финишная шпаклевка | — | WILL_ADD: PUFAS Full+Finish Spachtel TDS |
| Срок хранения | — | — | месяцев | NEEDS_SOURCE: Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается. |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с целлюлозным армированием | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| purpose | Назначение | Заполнение и финишное выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| color | Цвет | Белый | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| substrates | Основания | Минеральные основания, штукатурка, бетон, кладка, газобетон, ГКЛ | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| layer_thickness | Толщина слоя | до 15 см и более; с растушёвкой до нуля | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения не указана в использованном TDS. (значение не предлагается).
- shelf_life — SCHEMA_BLOCKED: Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Зависит от толщины и условий; точное время не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000046 — Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | PUFAS | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Гипсовая заполняющая и финишная шпаклевка | — | WILL_ADD: PUFAS Full+Finish Spachtel TDS |
| Срок хранения | — | — | месяцев | NEEDS_SOURCE: Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается. |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Гипсовое вяжущее с целлюлозным армированием | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| purpose | Назначение | Заполнение и финишное выравнивание поверхностей внутри помещений | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| color | Цвет | Белый | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| substrates | Основания | Минеральные основания, штукатурка, бетон, кладка, газобетон, ГКЛ | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| layer_thickness | Толщина слоя | до 15 см и более; с растушёвкой до нуля | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content.js — PUFAS Full+Finish Spachtel TDS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Температура применения не указана в использованном TDS. (значение не предлагается).
- shelf_life — SCHEMA_BLOCKED: Официальный TDS указывает неограниченный срок хранения в сухом месте; числовое значение не записывается. (значение не предлагается).
- application_method — NEEDS_SOURCE: Способ нанесения exact SKU не указан однозначно. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Зависит от толщины и условий; точное время не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000047 — Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Danogips | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая финишная полимерная шпатлевка | — | WILL_ADD: Danogips official |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Danogips official |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер этилена и винилацетата | — | READY: putties-core-content-batch2.js — Danogips official |
| purpose | Назначение | Финишное выравнивание поверхностей внутри сухих помещений | — | READY: putties-core-content-batch2.js — Danogips official |
| application_temperature | Температура основания и воздуха | Не менее +13 °C | — | READY: putties-core-content-batch2.js — Danogips official |
| color | Цвет | Белый; возможен серый или кремовый оттенок | — | READY: putties-core-content-batch2.js — Danogips official |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Danogips official |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Danogips official |
| substrates | Основания | листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ | — | READY: putties-core-content-batch2.js — Danogips official |
| layer_thickness | Толщина слоя | до 2 мм | — | READY: putties-core-content-batch2.js — Danogips official |
| consumption | Расход | 1 л/м²/мм | — | READY: putties-core-content-batch2.js — Danogips official |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000048 — Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Danogips | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая финишная полимерная шпатлевка | — | WILL_ADD: Danogips official |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Danogips official |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер этилена и винилацетата | — | READY: putties-core-content-batch2.js — Danogips official |
| purpose | Назначение | Финишное выравнивание поверхностей внутри сухих помещений | — | READY: putties-core-content-batch2.js — Danogips official |
| application_temperature | Температура основания и воздуха | Не менее +13 °C | — | READY: putties-core-content-batch2.js — Danogips official |
| color | Цвет | Белый; возможен серый или кремовый оттенок | — | READY: putties-core-content-batch2.js — Danogips official |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Danogips official |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Danogips official |
| substrates | Основания | листовые материалы, ранее ошпатлеванные или окрашенные поверхности, ПГП, стеклохолст, ГКЛ и швы ГКЛ | — | READY: putties-core-content-batch2.js — Danogips official |
| layer_thickness | Толщина слоя | до 2 мм | — | READY: putties-core-content-batch2.js — Danogips official |
| consumption | Расход | 1 л/м²/мм | — | READY: putties-core-content-batch2.js — Danogips official |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000049 — Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая финишная шпаклевка | — | WILL_ADD: KNAUF Rotband Pasta Profi |
| Срок хранения | — | 12 | месяцев | WILL_ADD: KNAUF Rotband Pasta Profi |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Виниловая основа | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| purpose | Назначение | Финишное выравнивание внутри помещений | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_temperature | Температура основания и воздуха | от +10 до +25 °C | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_area | Область применения | Внутри помещений, сухой и нормальный влажностный режим | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| substrates | Основания | ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| layer_thickness | Толщина слоя | 0,2–2 мм | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| consumption | Расход | 0,48 кг/м² | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000050 — Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая финишная шпаклевка | — | WILL_ADD: KNAUF Rotband Pasta Profi |
| Срок хранения | — | 12 | месяцев | WILL_ADD: KNAUF Rotband Pasta Profi |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Виниловая основа | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| purpose | Назначение | Финишное выравнивание внутри помещений | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_temperature | Температура основания и воздуха | от +10 до +25 °C | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_area | Область применения | Внутри помещений, сухой и нормальный влажностный режим | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| substrates | Основания | ГКЛ, ГВЛ, оштукатуренные и бетонные поверхности, ПГП, стеклохолст | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| layer_thickness | Толщина слоя | 0,2–2 мм | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |
| consumption | Расход | 0,48 кг/м² | — | READY: putties-core-content-batch2.js — KNAUF Rotband Pasta Profi |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000051 — Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | SEMIN | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая полимерная шпаклевка для швов и финиша | — | WILL_ADD: SEMIN CE 78 |
| Срок хранения | — | 18 | месяцев | WILL_ADD: SEMIN CE 78 |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Акриловая дисперсия | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| purpose | Назначение | Заделка швов ГКЛ и финишное выравнивание | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| application_temperature | Температура основания и воздуха | от +8 до +35 °C | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| application_area | Область применения | Внутри помещений: стены и потолки | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| application_method | Способ нанесения | Ручное, airless, bazooka, banjo и валик | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| substrates | Основания | ГКЛ, гипсовые блоки, окрашенные поверхности, силикат кальция | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| layer_thickness | Толщина слоя | 1–5 мм | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |
| consumption | Расход | 500 г/м²/мм для швов; 1 кг/м² при сплошном нанесении | — | READY: putties-core-content-batch2.js — SEMIN CE 78 |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000052 — Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | VGT | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая акриловая универсальная шпаклевка | — | WILL_ADD: VGT universal putty |
| Срок хранения | — | 24 | месяцев | WILL_ADD: VGT universal putty |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Акриловая | — | READY: putties-core-content-batch2.js — VGT universal putty |
| purpose | Назначение | Выравнивание и заполнение трещин до 7 мм | — | READY: putties-core-content-batch2.js — VGT universal putty |
| application_temperature | Температура основания и воздуха | от +7 до +30 °C | — | READY: putties-core-content-batch2.js — VGT universal putty |
| application_area | Область применения | Внутри и снаружи под защитным покрытием | — | READY: putties-core-content-batch2.js — VGT universal putty |
| application_method | Способ нанесения | Шпателем | — | READY: putties-core-content-batch2.js — VGT universal putty |
| substrates | Основания | бетон, кирпич, штукатурка, минеральные основания | — | READY: putties-core-content-batch2.js — VGT universal putty |
| layer_thickness | Толщина слоя | около 1 мм (оптимальная толщина) | — | READY: putties-core-content-batch2.js — VGT universal putty |
| consumption | Расход | 0,5–1,4 кг/м² | — | READY: putties-core-content-batch2.js — VGT universal putty |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000053 — Шпаклевка Vetonit LR+ 5 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая полимерная финишная шпаклевка | — | WILL_ADD: Vetonit LR+ |
| Срок хранения | — | 18 | месяцев | WILL_ADD: Vetonit LR+ |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер ПВА ≤2,5% | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| purpose | Назначение | Финиш стен и потолков под обои, окраску и декор | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| color | Цвет | Белый | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| substrates | Основания | цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| layer_thickness | Толщина слоя | 1–5 мм | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| consumption | Расход | 1,2 кг/м²/мм | — | READY: putties-core-content-batch2.js — Vetonit LR+ |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000054 — Шпаклевка Vetonit LR+ 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая полимерная финишная шпаклевка | — | WILL_ADD: Vetonit LR+ |
| Срок хранения | — | 18 | месяцев | WILL_ADD: Vetonit LR+ |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер ПВА ≤2,5% | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| purpose | Назначение | Финиш стен и потолков под обои, окраску и декор | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| color | Цвет | Белый | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| substrates | Основания | цементная и гипсовая штукатурка, гипсовые поверхности, ГКЛ, ГВЛ, минеральные основания | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| layer_thickness | Толщина слоя | 1–5 мм | — | READY: putties-core-content-batch2.js — Vetonit LR+ |
| consumption | Расход | 1,2 кг/м²/мм | — | READY: putties-core-content-batch2.js — Vetonit LR+ |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000055 — Шпаклевка Vetonit KR финиш белая 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая финишная шпаклевка | — | WILL_ADD: Vetonit KR technical map |
| Срок хранения | — | 18 | месяцев | WILL_ADD: Vetonit KR technical map |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Органический клей | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| purpose | Назначение | Финиш стен и потолков в сухих помещениях | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| color | Цвет | Белый | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| substrates | Основания | бетон, гипс, оштукатуренные поверхности, ГКЛ, ГВЛ, ЦСП | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| layer_thickness | Толщина слоя | 1–3 мм; локально до 4 мм | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |
| consumption | Расход | 1,2 кг/м²/мм | — | READY: putties-core-content-batch2.js — Vetonit KR technical map |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000056 — Шпаклевка полимерная финишная Vetonit JS Plus 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая полимерная финишная шпаклевка | — | WILL_ADD: Vetonit JS |
| Срок хранения | — | 18 | месяцев | WILL_ADD: Vetonit JS |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер ПВА ≤4% | — | READY: putties-core-content-batch2.js — Vetonit JS |
| purpose | Назначение | Заделка швов ГКЛ и финишное выравнивание | — | READY: putties-core-content-batch2.js — Vetonit JS |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch2.js — Vetonit JS |
| color | Цвет | Белый | — | READY: putties-core-content-batch2.js — Vetonit JS |
| application_area | Область применения | Внутри сухих помещений | — | READY: putties-core-content-batch2.js — Vetonit JS |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — Vetonit JS |
| substrates | Основания | ГКЛ, ГВЛ, старая краска, гипсовая, цементная и известково-цементная штукатурка | — | READY: putties-core-content-batch2.js — Vetonit JS |
| layer_thickness | Толщина слоя | 1–2 мм | — | READY: putties-core-content-batch2.js — Vetonit JS |
| consumption | Расход | 0,1–0,2 кг/м²/мм для швов; 1,2 кг/м²/мм для сплошного шпаклевания | — | READY: putties-core-content-batch2.js — Vetonit JS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000057 — Шпаклевка полимерная финишная Knauf Polymer finish 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая полимерная финишная шпаклевка | — | WILL_ADD: KNAUF Полимер Финиш |
| Срок хранения | — | 18 | месяцев | WILL_ADD: KNAUF Полимер Финиш |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Полимерное вяжущее с микроволокнами | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| purpose | Назначение | Финишное выравнивание внутри помещений | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| color | Цвет | Белый | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| substrates | Основания | бетон, ГКЛ, ГВЛ, гипсовая и цементная штукатурка | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| layer_thickness | Толщина слоя | 0,2–4 мм | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |
| consumption | Расход | 1,2 кг/м² при слое 1 мм | — | READY: putties-core-content-batch2.js — KNAUF Полимер Финиш |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- application_temperature — NEEDS_SOURCE: Точная температура для exact SKU не подтверждена. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Числовое время высыхания exact SKU не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000058 — Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | ОСНОВИТ | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая суперфинишная полимерная шпаклевка | — | WILL_ADD: ОСНОВИТ Элисилк PA39 W |
| Срок хранения | — | 12 | месяцев | WILL_ADD: ОСНОВИТ Элисилк PA39 W |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Полимерное вяжущее, наполнитель и модифицирующие добавки | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| purpose | Назначение | Суперфинишное выравнивание стен и потолков | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| application_temperature | Температура основания и воздуха | от +5 до +30 °C | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| color | Цвет | Сверхбелый | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| application_area | Область применения | Внутри сухих отапливаемых помещений, включая влажные зоны | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| substrates | Основания | бетон, гипсовая и цементная штукатурка, выравнивающая шпаклевка, ГКЛ, ГВЛ, ПГП, СМЛ и минеральные основания | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| layer_thickness | Толщина слоя | 0–2 мм | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |
| consumption | Расход | 1,6 кг/м² при слое 1 мм | — | READY: putties-core-content-batch2.js — ОСНОВИТ Элисилк PA39 W |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000059 — Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Danogips | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Сухая полимерная выравнивающая шпаклевка | — | WILL_ADD: Danogips Dano JET5 |
| Срок хранения | — | 18 | месяцев | WILL_ADD: Danogips Dano JET5 |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Сополимер винилацетата | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| purpose | Назначение | Выравнивание плоскости перед финишной отделкой или обоями | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| application_temperature | Температура основания и воздуха | Не менее +13 °C | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| application_area | Область применения | Внутри помещений | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| application_method | Способ нанесения | Ручное и механизированное, включая безвоздушное нанесение | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| substrates | Основания | минеральные основания | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| layer_thickness | Толщина слоя | до 6 мм | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |
| consumption | Расход | 1,2 кг/м²/мм | — | READY: putties-core-content-batch2.js — Danogips Dano JET5 |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Цвет exact SKU не подтверждён. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000060 — Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг

STATUS: **IDENTITY_UNCERTAIN**; disposition: **IDENTITY_BLOCKED**; текущих attribute rows: 0.

**Полная блокировка по идентичности:** TITLE_MISMATCH. Title в БД отличается от source title. БД: «Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг»; dataset: «Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг». Источник не подтверждает «мех.» как отдельный SKU и не подтверждает класс «полимерная»; идентичность требует отдельной сверки. Предлагаемые значения к apply скрыты.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | BLOCKED | — | IDENTITY_BLOCKED (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | BLOCKED | — | IDENTITY_BLOCKED: ВОЛМА Искрит |
| Срок хранения | — | BLOCKED | месяцев | IDENTITY_BLOCKED: ВОЛМА Искрит |
| Фасовка | — | BLOCKED | кг | IDENTITY_BLOCKED: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

_Без безопасных новых значений._

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

_Нет._

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

_Нет._

## MAT-000061 — Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | KNAUF | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная фасадная шпаклёвка | — | WILL_ADD: KNAUF-Мульти-Финиш — официальный сайт и TDS |
| Срок хранения | — | 12 | месяцев | WILL_ADD: KNAUF-Мульти-Финиш — официальный сайт и TDS |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цемент, минеральный наполнитель, полимерные добавки, армирующее волокно | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| purpose | Назначение | Выравнивание бетонных и цементных поверхностей, ремонт и заполнение дефектов | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| application_temperature | Температура основания и воздуха | Не менее +5 °C | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| application_area | Область применения | Наружные и внутренние работы, включая влажные помещения | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| application_method | Способ нанесения | Ручное нанесение | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| substrates | Основания | Бетон, цементные штукатурки | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| layer_thickness | Толщина слоя | 1–3 мм; локально до 5 мм | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |
| consumption | Расход | 1,2 кг/м² | — | READY: putties-core-content-batch3.js — KNAUF-Мульти-Финиш — официальный сайт и TDS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).
- color — NEEDS_SOURCE: Официальный продукт выпускается в белом и сером вариантах; exact вариант локальной карточки не установлен. (значение не предлагается).
- drying_time — NEEDS_SOURCE: Точное время высыхания для exact SKU/условий не подтверждено. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life

## MAT-000062 — Шпаклевка цементная базовая Старатели 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная шпатлёвка базовая | — | WILL_ADD: Старатели — цементная Базовая |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Старатели — цементная Базовая |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Белый цемент с минеральными наполнителями и модифицирующими добавками | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| purpose | Назначение | Выравнивание стен и потолков | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| color | Цвет | Светло-бежевый | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| application_area | Область применения | Внутри помещений, нормальная и повышенная влажность | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| substrates | Основания | Бетон, железобетон, ячеистый бетон, кирпич, цементная штукатурка | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| layer_thickness | Толщина слоя | 0,8–8 мм | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content-batch3.js — Старатели — цементная Базовая |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000063 — Шпаклевка цементная фасадно финишная Старатели 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Старатели | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная фасадно-финишная шпатлёвка | — | WILL_ADD: Старатели — цементная Фасадно-финишная |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Старатели — цементная Фасадно-финишная |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Белый цемент с минеральными наполнителями и модифицирующими добавками | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| purpose | Назначение | Финишное выравнивание фасадов, стен и потолков | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| color | Цвет | Белый | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| application_area | Область применения | Наружные и внутренние работы, включая влажные и неотапливаемые помещения | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| substrates | Основания | Бетон, цементные штукатурки, крупнозернистые шпатлёвки; допускаются ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| layer_thickness | Толщина слоя | 0,3–3 мм | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |
| consumption | Расход | 1 кг/м² | — | READY: putties-core-content-batch3.js — Старатели — цементная Фасадно-финишная |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000064 — Шпаклевка Vetonit VH для влажных помещений белая 20 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | Vetonit | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Цементная влагостойкая шпаклёвка | — | WILL_ADD: Vetonit ВХ 20 кг — официальный сайт и TDS |
| Срок хранения | — | 12 | месяцев | WILL_ADD: Vetonit ВХ 20 кг — официальный сайт и TDS |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Цемент, молотый мрамор, функциональные добавки | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| purpose | Назначение | Финишное выравнивание стен и потолков под окраску и обои | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| application_temperature | Температура основания и воздуха | от +10 до +30 °C | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| color | Цвет | Белый | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| application_area | Область применения | Сухие и влажные помещения, фасады | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| application_method | Способ нанесения | Ручное и механизированное | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| substrates | Основания | Цементные и цементно-известковые штукатурки, ГКЛ, ГВЛ | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| layer_thickness | Толщина слоя | 1–4 мм | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |
| consumption | Расход | 1,2 кг/м²/мм | — | READY: putties-core-content-batch3.js — Vetonit ВХ 20 кг — официальный сайт и TDS |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- pot_life — UNREPRESENTABLE_NUMBER:pot_life
- drying_time — MISSING_OR_INACTIVE_DEFINITION

## MAT-000065 — Шпаклевка по дереву VGT Белая 1 кг

STATUS: **PARTIAL**; disposition: **PARTIAL_SAFE_TO_APPLY**; текущих attribute rows: 0.

### MAIN

| Поле | Current | Proposed | Unit | Status / source |
|---|---|---|---|---|
| Brand | — | VGT | — | SAFE_TO_FILL (brand пишется отдельно и не включён в batch) |
| Тип продукта | — | Готовая шпаклёвка по дереву | — | WILL_ADD: VGT — Шпатлевка «Экстра» по дереву |
| Срок хранения | — | 24 | месяцев | WILL_ADD: VGT — Шпатлевка «Экстра» по дереву |
| Фасовка | — | — | кг | NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. |

### REGULAR: безопасные новые значения

| code | Характеристика | Значение | Единица | Статус / источник |
|---|---|---|---|---|
| base | Основа | Водная дисперсия стирол-акрилового полимера, наполнитель, модифицирующие добавки, пигмент | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| purpose | Назначение | Заполнение и выравнивание деревянных поверхностей | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| application_temperature | Температура основания и воздуха | Не ниже +7 °C | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| color | Цвет | Белая | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| application_area | Область применения | Внутренние и наружные работы | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| application_method | Способ нанесения | Шпатель | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| substrates | Основания | Деревянные поверхности | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| layer_thickness | Толщина слоя | около 1 мм (оптимально); локальное заполнение неровностей до 7 мм | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |
| consumption | Расход | 0,5–1,4 кг/м² | — | READY: putties-core-content-batch3.js — VGT — Шпатлевка «Экстра» по дереву |

### EXISTING_OK

_Нет._

### NEEDS_SOURCE

- package_weight — NEEDS_SOURCE: Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара. (значение не предлагается).

### SOURCE_CONFLICT

_Нет._

### SCHEMA_BLOCKED

- form — MISSING_OR_INACTIVE_DEFINITION
- consumption_basis — MISSING_OR_INACTIVE_DEFINITION
- drying_time — MISSING_OR_INACTIVE_DEFINITION
