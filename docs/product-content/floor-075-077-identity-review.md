# Наливной Пол — identity/source corrective: MAT-000075 и MAT-000077

Подготовлено 2026-09-28. Production не открывался, production apply/deploy не выполнялись.

Exact batch: MAT-000075, MAT-000077. Confirm token: `FIX_FLOOR_075_077_IDENTITY`.

## Итог synthetic dry-run

| total | READY | EXISTING_OK | blocked | errors | attributes to add | product UPDATE statements | definitions/templates |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 2 | 0 | 0 | 0 | 27 | 2 | 0 / 0 |

Dry-run выполнен в тесте на SQLite synthetic fixture с OPEN_READONLY и подтвердил неизменность hash fixture DB. Production state из задачи используется только как exact guard.

## Защита записей

- `products.title`, `products.slug`, brand, weight/unit, price, category/subcategory, image, stock и timestamps неизменяемы.
- Разрешённые поля products: `short_description`, `full_description`, `seo_title`, `seo_description`.
- Атрибуты: только product_type, shelf_life, base, application_area, application_method, substrates, layer_thickness, consumption, water_requirement, pot_life, application_temperature, walkability, adhesion, flexural_strength для этих двух MAT. Уже существующие brand и package_weight — guards, не targets.
- Definitions и templates только читаются; обе записи обрабатываются атомарно, с backup перед BEGIN IMMEDIATE.
- Числовой диапазон прочности на сжатие 16–20 МПа не сводится к выдуманному числу и остаётся вне числового атрибута.

## MAT-000075

**Identity:** READY_FOR_CORE_REVIEW. Title guard: «Наливной пол "Unis Горизонт" 20 кг». Slug guard: `наливной-пол-unis-горизонт-20-кг`. Ни title, ни slug не меняются.

### Предлагаемый видимый текст и SEO

- Short: UNIS Горизонт Универсальный М-45 — армированный быстротвердеющий наливной пол. Фасовка — 20 кг.
- Full: UNIS Горизонт Универсальный М-45 — армированный быстротвердеющий наливной пол для базового и финишного выравнивания оснований. Материал подходит для бетонных, цементно-песчаных и гипсовых оснований, систем «Тёплый пол» и «Плавающий пол». Толщина слоя — 3–100 мм, расход — 15–17 кг/м² при слое 10 мм, возможность хождения — через 2–3 часа.
- SEO title (56 знаков): UNIS Горизонт Универсальный М-45 20 кг — купить в Москве
- SEO description (147 знаков): Армированный быстротвердеющий наливной пол UNIS Горизонт Универсальный М-45 20 кг. Слой 3–100 мм, хождение через 2–3 часа. Доставка по Москве и МО.

### Подтверждённые атрибуты

| code | value | sources | note |
|---|---|---|---|
| product_type | Армированный быстротвердеющий наливной пол | unisM45OwnerPack, unisM45Current, unisM45Tds | — |
| shelf_life | 12 | unisM45Tds | — |
| base | Композиционное вяжущее, мелкофракционные наполнители, модифицирующие добавки, армирующие волокна | unisM45Current, unisM45Tds | — |
| application_area | Внутренние отапливаемые помещения с умеренной и повышенной влажностью; системы «Тёплый пол» и «Плавающий пол» | unisM45Current, unisM45Tds | — |
| application_method | Ручное и машинное | unisM45Current, unisM45Tds | — |
| substrates | Бетонные, цементно-песчаные, гипсовые и другие недеформирующиеся основания | unisM45Current, unisM45Tds | — |
| layer_thickness | 3–100 мм | unisM45Current, unisM45Tds | — |
| consumption | 15–17 кг/м² при 10 мм | unisM45Current, unisM45Tds | — |
| water_requirement | 0,17–0,22 л/кг | unisM45Tds | — |
| pot_life | не менее 40 минут | unisM45Current, unisM45Tds | — |
| application_temperature | от +5 до +30 °C | unisM45Current, unisM45Tds | — |
| walkability | 2–3 часа | unisM45Current, unisM45Tds | — |
| adhesion | 0.7 | unisM45Current, unisM45Tds | Official source qualifies this number as not less than; qualifier retained here because the canonical attribute definition is numeric. |

### Источники и identity evidence

- **Owner-provided MAT-000075 package image** — owner-provided evidence, URL отсутствует: На упаковке указаны UNIS, ГОРИЗОНТ УНИВЕРСАЛЬНЫЙ М-45, наливной пол армированный быстротвердеющий и ГОСТ 31358-2019. Подтверждает точный 20 кг вариант/маркировку; не является источником технических параметров.
- **UNIS Горизонт Универсальный М-45 — current official product page** — [source](https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/): Текущая карточка называет продукт Горизонт Универсальный М-45; объясняет переименование прежней линейки Горизонт Универсальный / F-45 без изменения формулы. Перечисляет фасовки 20/25 кг, состав, область, применение и технические параметры.
- **UNIS Горизонт Универсальный М-45 — official technical sheet** — [source](https://unistrom.ru/upload/iblock/7c4/qwogsbpzwhq3wvfbor2cxgtb0ddfzwvh.pdf): Официальный TDS с точной маркировкой М-45. Указывает 0,17–0,22 л/кг, слой 3–100 мм, расход 15–17 кг/м² при 10 мм, жизнеспособность не менее 40 минут, температуру +5…+30 °C, хождение 2–3 часа, адгезию не менее 0,7 МПа и хранение 12 месяцев. Прочность на сжатие дана диапазоном/по площадкам и не записывается в числовое поле.
- **Owner decision on legacy MAT-000075 title** — owner-provided evidence, URL отсутствует: Текущий title и slug сохраняются; legacy title используется только как точный guard и не служит техническим источником.

Назначение, не записываемое как отдельный шаблонный атрибут: Ручное и машинное выравнивание бетонных полов и цементных стяжек, устранение перепадов под последующую укладку напольных покрытий; системы «Тёплый пол» и «Плавающий пол».
Прочность на сжатие: 16–20 МПа (производственная площадка влияет на минимум); не записывается в numeric definition, чтобы не потерять диапазон/квалификатор.

Существующие атрибуты brand=UNIS, package_weight=20 кг проверяются и остаются без изменений.

## MAT-000077

**Identity:** READY_FOR_CORE_REVIEW. Title guard: «Наливной пол "Старатели" Быстрый 20 кг». Slug guard: `наливной-пол-старатели-быстрый-20-кг`. Ни title, ни slug не меняются.

### Предлагаемый видимый текст и SEO

- Short: Старатели Быстротвердеющий — самонивелирующийся наливной пол для внутренних работ. Фасовка — 20 кг.
- Full: Наливной пол «Старатели Быстротвердеющий» в фасовке 20 кг предназначен для базового и финишного выравнивания бетонных, цементно-песчаных, гипсовых и ангидридных оснований. Подходит для системы «Тёплый пол» и ручного или механизированного нанесения. Толщина слоя — 3–100 мм, расход — около 14,5 кг/м² при слое 10 мм, возможность хождения — через 4 часа.
- SEO title (54 знаков): Старатели Быстротвердеющий 20 кг — купить наливной пол
- SEO description (140 знаков): Самонивелирующийся наливной пол Старатели Быстротвердеющий 20 кг. Слой 3–100 мм, расход около 14,5 кг/м² при 10 мм. Доставка по Москве и МО.

### Подтверждённые атрибуты

| code | value | sources | note |
|---|---|---|---|
| product_type | Самонивелирующийся быстротвердеющий наливной пол | starateli77OwnerPack, starateli77Official | — |
| shelf_life | 12 | starateli77Official | — |
| base | Комплексное минеральное вяжущее на основе гипса и цемента, фракционированный песок и модифицирующие добавки | starateli77Official | — |
| application_area | Внутренние работы; помещения с нормальной влажностью; система «Тёплый пол»; стяжка на разделительном слое | starateli77Official | — |
| application_method | Ручное и механизированное | starateli77Official | — |
| substrates | Бетон, цементные стяжки, гипсовые и ангидридные основания | starateli77Official | — |
| layer_thickness | 3–100 мм | starateli77Official | — |
| consumption | около 14,5 кг/м² при 10 мм | starateli77Official | — |
| water_requirement | 5,0–6,0 л на 20 кг | starateli77Official | — |
| pot_life | не менее 40 минут | starateli77Official | — |
| application_temperature | от +5 до +30 °C | starateli77Official | — |
| walkability | 4 часа | starateli77Official | — |
| adhesion | 0.8 | starateli77Official | Official source qualifies this number as not less than; qualifier retained here because the canonical attribute definition is numeric. |
| flexural_strength | не менее 4 МПа | starateli77Official | Official source states not less than 4 MPa; qualifier is retained in text. |

### Источники и identity evidence

- **Owner-provided MAT-000077 package image** — owner-provided evidence, URL отсутствует: На упаковке указаны Старатели, НАЛИВНОЙ ПОЛ, БЫСТРОТВЕРДЕЮЩИЙ, САМОНИВЕЛИРУЮЩИЙСЯ, 20 кг и ГОСТ 31358-2019. Подтверждает точный 20 кг SKU; слово «Быстрый» из legacy title не является техническим источником.
- **Старатели — Наливной пол Быстротвердеющий 20 кг** — [source](https://www.starateli.ru/nalivnoi_pol_bistrodeistvuyushiy/): Официальная текущая страница производителя. Явно перечисляет 20/25 кг, состав, назначение, применения/основания, ручной и механизированный способ, слой 3–100 мм, расход, воду на 20 кг, жизнеспособность, температуру, хождение, адгезию и срок хранения.
- **Owner decision on legacy MAT-000077 title** — owner-provided evidence, URL отсутствует: Текущий title и slug сохраняются; слово «Быстрый» остаётся только в exact guard и не переносится в новые характеристики, описания или SEO.

Назначение, не записываемое как отдельный шаблонный атрибут: Базовое и финишное выравнивание оснований под последующую укладку напольных покрытий; система «Тёплый пол» и устройство стяжки на разделительном слое.
Прочность на сжатие: 16–20 МПа; не записывается в numeric definition, чтобы не потерять диапазон/квалификатор.

Существующие атрибуты brand=Старатели, package_weight=20 кг проверяются и остаются без изменений.

## Репетиция apply и audit fixture

- Synthetic apply: 27 attribute INSERT + 2 UPDATE statements, весь batch атомарен.
- Backup присутствовал до BEGIN IMMEDIATE; проверено содержимое backup против логического снимка pre-state.
- Injected failure на втором товаре привёл к rollback всего batch.
- Повторный apply: оба товара EXISTING_OK, 0 writes.
- Audit classifier из c330 fixture: MAT-000075/077 больше не SOURCE_BLOCKED и без source anomalies; MAT-000076 остаётся без source blocker после неизменённого baseline dataset.
- Полный агрегат DATA_CLOSED для всей подкатегории здесь не заявляется: проверен synthetic fixture затронутых товаров и MAT-000076, а не production/category database.
