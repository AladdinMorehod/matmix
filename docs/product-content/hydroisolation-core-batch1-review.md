# Гидроизоляция — CORE batch 1 review

Дата проверки источников: 2026-09-28. Подкатегория: Смеси → Гидроизоляция (structure_id=10, SUB-000009). Scope: MAT-000099, MAT-000100, MAT-000101, MAT-000102, MAT-000103, MAT-000104, MAT-000105, MAT-000106, MAT-000107.

Это подготовленный пакет; ни production, ни DB не открывались и не изменялись. Apply/deploy не выполнялись. Title/slug/price/weight/category/images не являются target-полями. У всех 9 исходный image_url — общий placeholder, product_images_count=1; image stage остаётся отдельным.

## Шаблон и write surface

MAIN (4): brand, product_type, shelf_life, package_weight.

REGULAR (19): base, purpose, application_area, application_method, substrates, color, layer_thickness, consumption, water_requirement, mixing_ratio, pot_life, drying_time, application_temperature, compressive_strength, adhesion, frost_resistance, waterproofness, crack_bridging, standard. Итого 23 memberships в структуре main 4 + regular 19. Переиспользуются 33 существующие definitions; H1 может создать только отсутствующие mixing_ratio (text), waterproofness (text), crack_bridging (text), без изменения существующих definitions.

- H1 пишет только до 3 allowlisted definitions и 23 memberships только structure_id=10; current memberships допускаются только baseline 0 или точные final 23.
- H2 пишет только products.brand при NULL/empty и READY-значения в attributes canonical template; package_weight attribute не меняет products.weight.
- H3 пишет только short_description, full_description, seo_title, seo_description.
- Каждая apply-стадия требует явный DB/confirm/backup-dir, exact scope, backup до транзакции, транзакционный postcheck и rollback. Dry-run — read-only.

## Сводка

| MAT | exact local title | brand | READY attrs incl brand | NEEDS_SOURCE | SOURCE_CONFLICT | ABSENT_BY_DESIGN | core status | identity | image |
|---|---|---|---:|---:|---:|---:|---|---|---|
| MAT-000099 | Гидроизоляция Knauf Флэхендихт 5 кг | KNAUF | 17 | 3 | 0 | 3 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000100 | Гидроизоляция полимерная СТК 5кг | СТК Профи | 13 | 7 | 0 | 3 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000101 | Гидроизоляция универсальная МК 5кг | Мастер-Класс | 12 | 8 | 0 | 3 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000102 | Гидроизоляция универсальная PROFI 5 кг | СТК Профи | 7 | 13 | 0 | 3 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000103 | Гидроизоляция Ceresit CR 65 20 кг | Ceresit | 19 | 3 | 0 | 1 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000104 | Гидроизоляция минерально химическая восстановительная НЦ Русеан 25 кг | Русеан | 6 | 12 | 4 | 1 | PARTIAL_SOURCE_CONFLICT | IDENTITY_CONFIRMED | untouched |
| MAT-000105 | Гидроизоляция обмазочная Глимс (Glims) водостоп 18 кг | GLIMS | 20 | 2 | 0 | 1 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000106 | Гидроизоляция Mapei Mapelastic двухкомп. компл. (А+Б) 32 кг | Mapei | 18 | 4 | 0 | 1 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |
| MAT-000107 | Гидроизоляция цементная Ceresit CR 166 двухкомп. компл. (А+Б) 32 кг | Ceresit | 17 | 5 | 0 | 1 | PARTIAL_SOURCE_GAPS | IDENTITY_CONFIRMED | untouched |

Totals: {"products":9,"identityConfirmed":9,"readyCoreAttributes":129,"needsSource":57,"sourceConflict":4,"absentByDesign":17,"partialCoreProducts":9,"visibleCopyReady":9,"seoReady":9,"imagesUntouched":9,"definitionsExistingBeforeH1":33,"definitionsToCreateIfAbsent":["mixing_ratio","waterproofness","crack_bridging"],"hydroTemplateMemberships":23,"postH3AuditStatusBeforePhotos":"NOT_CLOSED","postH3SeoIssues":0,"postH3ImageIssues":9}. READY count includes the brand attribute. All 9 are identity-confirmed and visible/SEO proposals are prepared; core stays PARTIAL where listed facts remain unresolved.

## Per-product review

### MAT-000099

- **Identity:** IDENTITY_CONFIRMED; brand KNAUF; package 5 kg.
- **Current title:** Гидроизоляция Knauf Флэхендихт 5 кг
- **Current slug:** гидроизоляция-knauf-флэхендихт-5-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** 2106 / 5 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- knaufPage (manufacturer-page; КНАУФ): [КНАУФ-Флэхендихт — официальный сайт](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/mastika-dlya-gidroizolyatsii/knauf-flekhendikht/)
- knaufSheet (manufacturer-technical-sheet; КНАУФ): [КНАУФ-Флэхендихт — информационный лист 03/2025](https://www.knauf.ru/upload/iblock/072/sdivcslbnj7bz5q8y940f453or6b5uve/35_IL_KNAUF_Flekhendikht_25_03_2025_v01_Preview.pdf)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | KNAUF | READY | knaufPage; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Готовая латексная гидроизоляционная мастика | READY | knaufPage |
| shelf_life | 18 | READY | knaufPage |
| package_weight | 5 | READY | knaufPage; Локальный title и официальный вес упаковки совпадают. |
| base | Водная дисперсия синтетического латекса и инертные заполнители | READY | knaufPage |
| purpose | Создание водонепроницаемой эластичной гидроизоляции стен и полов перед укладкой керамической плитки или природного камня | READY | knaufPage |
| application_area | Внутренние работы; влажные помещения; системы обогреваемых полов и стен | READY | knaufPage |
| application_method | Кисть, щётка или валик; минимум два слоя | READY | knaufSheet |
| substrates | ГКЛ, гипсовые, известково-цементные и цементные штукатурки, цементные плиты и стяжки, бетон, пористый бетон | READY | knaufPage |
| color | Голубой | READY | knaufPage |
| layer_thickness | около 1,1 мм в сыром состоянии; около 0,8 мм после высыхания | READY | knaufPage |
| consumption | 0,7–1,0 кг/м² для гладких оснований; 0,9–1,4 кг/м² для грубых и пористых оснований | READY | knaufPage |
| water_requirement | — | ABSENT_BY_DESIGN | knaufPage; Готовая к применению мастика; затворение водой не предусмотрено. |
| mixing_ratio | — | ABSENT_BY_DESIGN | knaufPage; Однокомпонентная готовая мастика; смешивание компонентов не предусмотрено. |
| pot_life | — | ABSENT_BY_DESIGN | knaufPage; Для готовой мастики время жизни затворённого раствора неприменимо. |
| drying_time | Между слоями — не менее 3 часов; перед укладкой плитки — не менее 12 часов | READY | knaufPage |
| application_temperature | — | NEEDS_SOURCE | knaufPage; Текущая карточка/TDS не задаёт температуру нанесения. |
| compressive_strength | — | NEEDS_SOURCE | knaufPage; Не заявлена как характеристика этого готового покрытия. |
| adhesion | 1.5 | READY | knaufPage; Официальная карточка: 1,5 МПа; числовое значение сохранено в MPa. |
| frost_resistance | 5 циклов в неповреждённой упаковке | READY | knaufPage |
| waterproofness | 0,7 МПа (W7) | READY | knaufPage |
| crack_bridging | до 2,5 мм | READY | knaufPage |
| standard | — | NEEDS_SOURCE | knaufPage; В доступной текущей карточке применимый стандарт/ТУ не подтверждён. |

Unresolved fields:
- NEEDS_SOURCE: application_temperature, compressive_strength, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Готовая к применению мастика; затворение водой не предусмотрено.; mixing_ratio: Однокомпонентная готовая мастика; смешивание компонентов не предусмотрено.; pot_life: Для готовой мастики время жизни затворённого раствора неприменимо.
- Facts not stored: none

Short description:

KNAUF-Флэхендихт, 5 кг — готовая латексная гидроизоляционная мастика для внутренних влажных помещений.

Full description:

KNAUF-Флэхендихт — готовая гидроизоляционная мастика на водной дисперсии синтетического латекса с инертными заполнителями, фасовка 5 кг. Её применяют внутри зданий на стенах и полах во влажных помещениях перед облицовкой плиткой или природным камнем. Мастику наносят кистью, щёткой или валиком минимум в два слоя; между слоями выдерживают не менее 3 часов, до укладки плитки — не менее 12 часов.

SEO title:

KNAUF Флэхендихт 5 кг — купить гидроизоляцию в Москве

SEO description:

Готовая латексная гидроизоляционная мастика KNAUF-Флэхендихт 5 кг для влажных помещений. Закажите в MatMix с доставкой по Москве и области.

### MAT-000100

- **Identity:** IDENTITY_CONFIRMED; brand СТК Профи; package 5 kg.
- **Current title:** Гидроизоляция полимерная СТК 5кг
- **Current slug:** гидроизоляция-полимерная-стк-5кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** 1458 / 5 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- stk774 (manufacturer-page; СТК Профи): [БС-774 EURO Professional — официальный каталог СТК Профи](https://stkprofi.ru/shop/bs-774-gidroizolyatsiya-polimernaya-mastika-euro--professional-2/)
- owner100 (owner-identity-evidence; MatMix owner): Фото упаковки, предоставленное владельцем (идентичность MAT-000100) (no URL; owner-provided identity evidence)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | СТК Профи | READY | stk774; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Готовая полимерная гидроизоляционная мастика | READY | stk774 |
| shelf_life | 12 | READY | stk774 |
| package_weight | 5 | READY | stk774; Позиция БС-774 5 кг подтверждена производителем; owner photo доказывает упаковку EURO Professional. |
| base | Вода, акриловая дисперсия, мраморный наполнитель, диоксид титана, функциональные добавки, консервант | READY | stk774 |
| purpose | Бесшовное эластичное водонепроницаемое покрытие для придания основаниям гидроизолирующих свойств | READY | stk774 |
| application_area | Стены, полы и потолки; душевые, ванные комнаты, бани и сауны | READY | stk774 |
| application_method | Кисть, валик или распыление | READY | stk774 |
| substrates | Гипсокартон, кирпич, асбестоцемент, гипсовые, полимерные и цементные основания, железобетон, дерево, фанера | READY | stk774 |
| color | — | NEEDS_SOURCE | stk774; Цвет exact фасовки не подтверждён в официальной карточке. |
| layer_thickness | 0,8–2,0 мм | READY | stk774 |
| consumption | 0,3–0,4 кг/м² на однослойное покрытие | READY | stk774 |
| water_requirement | — | ABSENT_BY_DESIGN | stk774; Готовая к применению мастика. |
| mixing_ratio | — | ABSENT_BY_DESIGN | stk774; Однокомпонентная готовая мастика. |
| pot_life | — | ABSENT_BY_DESIGN | stk774; Для готовой мастики время жизни затворённого раствора неприменимо. |
| drying_time | Межслойная сушка — 12 часов при температуре выше +15 °C; полное высыхание — 24 часа при +20 °C | READY | stk774 |
| application_temperature | не ниже +5 °C | READY | stk774 |
| compressive_strength | — | NEEDS_SOURCE | stk774; Не заявлена для эластичного мастичного покрытия. |
| adhesion | — | NEEDS_SOURCE | stk774; Числовая адгезия не приводится в официальной карточке. |
| frost_resistance | — | NEEDS_SOURCE | stk774; Не подтверждена для exact SKU. |
| waterproofness | — | NEEDS_SOURCE | stk774; Числовой класс/давление не указаны. |
| crack_bridging | — | NEEDS_SOURCE | stk774; Числовой показатель не указан. |
| standard | — | NEEDS_SOURCE | stk774; Применимый стандарт/ТУ не подтверждён карточкой. |

Unresolved fields:
- NEEDS_SOURCE: color, compressive_strength, adhesion, frost_resistance, waterproofness, crack_bridging, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Готовая к применению мастика.; mixing_ratio: Однокомпонентная готовая мастика.; pot_life: Для готовой мастики время жизни затворённого раствора неприменимо.
- Facts not stored: none

Short description:

СТК Профи БС-774 EURO Professional, 5 кг — готовая полимерная гидроизоляционная мастика.

Full description:

Готовая полимерная мастика СТК Профи БС-774 EURO Professional поставляется в ведре 5 кг. Она образует бесшовное водонепроницаемое покрытие для стен, полов и потолков во влажных помещениях. Материал наносят кистью, валиком или распылением слоем 0,8–2,0 мм; производитель указывает расход 0,3–0,4 кг/м² на однослойное покрытие.

SEO title:

СТК Профи БС-774 5 кг — купить гидроизоляцию в Москве

SEO description:

Готовая мастика СТК Профи БС-774 EURO Professional 5 кг для влажных помещений. Закажите гидроизоляцию с доставкой по Москве и области.

### MAT-000101

- **Identity:** IDENTITY_CONFIRMED; brand Мастер-Класс; package 5 kg.
- **Current title:** Гидроизоляция универсальная МК 5кг
- **Current slug:** гидроизоляция-универсальная-мк-5кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** NULL / 5 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- masterclass (manufacturer-page; Мастер-Класс): [Гидроизоляция 5 кг — официальный сайт Мастер-Класс](https://mk-podolsk.ru/product/zashchitnye-sredstva-i-mastiki/gidroizolyatsiya-5-kg/)
- owner101 (owner-identity-evidence; MatMix owner): Фото упаковки, предоставленное владельцем (идентичность MAT-000101) (no URL; owner-provided identity evidence)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | Мастер-Класс | READY | masterclass; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Универсальная акриловая гидроизоляционная мастика | READY | masterclass |
| shelf_life | 12 | READY | masterclass |
| package_weight | 5 | READY | masterclass |
| base | Акриловая | READY | masterclass |
| purpose | Придание основаниям гидроизолирующих свойств; формирование ровной эластичной водозащитной плёнки | READY | masterclass |
| application_area | Внутренние и наружные работы; душевые, ванные комнаты, бани и сауны | READY | masterclass |
| application_method | — | NEEDS_SOURCE | masterclass; Не указано в доступной официальной карточке; не заимствуется со вторичных сайтов. |
| substrates | Гипсокартон, гипсолит, асбестоцемент, кирпич, бетон | READY | masterclass |
| color | Голубой | READY | masterclass |
| layer_thickness | — | NEEDS_SOURCE | masterclass; Толщина слоя не указана. |
| consumption | 0,25–0,35 кг/м² на однослойное покрытие | READY | masterclass |
| water_requirement | — | ABSENT_BY_DESIGN | masterclass; Готовая акриловая мастика; затворение водой не предусмотрено. |
| mixing_ratio | — | ABSENT_BY_DESIGN | masterclass; Однокомпонентная готовая мастика. |
| pot_life | — | ABSENT_BY_DESIGN | masterclass; Для готовой мастики время жизни затворённого раствора неприменимо. |
| drying_time | 24 часа при +20 °C | READY | masterclass |
| application_temperature | не ниже +5 °C | READY | masterclass |
| compressive_strength | — | NEEDS_SOURCE | masterclass; Не заявлена. |
| adhesion | — | NEEDS_SOURCE | masterclass; Числовая адгезия не указана. |
| frost_resistance | — | NEEDS_SOURCE | masterclass; Не подтверждена. |
| waterproofness | — | NEEDS_SOURCE | masterclass; Числовой класс/давление не указаны. |
| crack_bridging | — | NEEDS_SOURCE | masterclass; Не подтверждена. |
| standard | — | NEEDS_SOURCE | masterclass; Применимый стандарт/ТУ не подтверждён. |

Unresolved fields:
- NEEDS_SOURCE: application_method, layer_thickness, compressive_strength, adhesion, frost_resistance, waterproofness, crack_bridging, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Готовая акриловая мастика; затворение водой не предусмотрено.; mixing_ratio: Однокомпонентная готовая мастика.; pot_life: Для готовой мастики время жизни затворённого раствора неприменимо.
- Facts not stored: none

Short description:

Мастер-Класс, универсальная акриловая гидроизоляция 5 кг для внутренних и наружных работ.

Full description:

Универсальная акриловая мастика Мастер-Класс в фасовке 5 кг предназначена для придания основаниям гидроизолирующих свойств. После нанесения образует ровную эластичную водозащитную плёнку. Производитель указывает применение по гипсокартону, гипсолиту, асбестоцементу, кирпичу и бетону, в том числе во влажных помещениях, банях и саунах. Расход однослойного покрытия составляет 0,25–0,35 кг/м²; высыхание — 24 часа при +20 °C.

SEO title:

Мастер-Класс гидроизоляция 5 кг — купить в Москве

SEO description:

Универсальная акриловая гидроизоляционная мастика Мастер-Класс 5 кг для внутренних и наружных работ. Закажите в MatMix с доставкой по Москве.

### MAT-000102

- **Identity:** IDENTITY_CONFIRMED; brand СТК Профи; package 5 kg.
- **Current title:** Гидроизоляция универсальная PROFI 5 кг
- **Current slug:** гидроизоляция-универсальная-profi-5-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** NULL / 5 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- stk755 (manufacturer-page; СТК Профи): [БС-755 PROFI — официальный каталог СТК Профи](https://stkprofi.ru/shop/bs-755-poliakrilovaya-mastika-gidroizolyatsiya-profi/)
- owner102 (owner-identity-evidence; MatMix owner): Фото упаковки, предоставленное владельцем (идентичность MAT-000102) (no URL; owner-provided identity evidence)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | СТК Профи | READY | stk755; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Готовая полиакриловая гидроизоляционная мастика | READY | stk755 |
| shelf_life | — | NEEDS_SOURCE | stk755; Срок хранения exact БС-755 не подтверждён; значение БС-774 не переносится. |
| package_weight | 5 | READY | stk755 |
| base | Полиакриловая | READY | stk755 |
| purpose | Водоотталкивающая гидроизоляционная обработка жилых и нежилых помещений | READY | stk755 |
| application_area | Жилые и нежилые помещения; санузлы и ванные комнаты | READY | stk755 |
| application_method | — | NEEDS_SOURCE | stk755; Способ нанесения для БС-755 не подтверждён. |
| substrates | — | NEEDS_SOURCE | stk755; Список оснований для БС-755 не подтверждён; данные БС-774 не переносятся. |
| color | — | NEEDS_SOURCE | stk755; Цвет exact SKU не указан. |
| layer_thickness | — | NEEDS_SOURCE | stk755; Толщина слоя для БС-755 не подтверждена. |
| consumption | 0,10–0,12 кг/м² | READY | stk755 |
| water_requirement | — | ABSENT_BY_DESIGN | stk755; Готовая к применению мастика. |
| mixing_ratio | — | ABSENT_BY_DESIGN | stk755; Однокомпонентная готовая мастика. |
| pot_life | — | ABSENT_BY_DESIGN | stk755; Для готовой мастики время жизни затворённого раствора неприменимо. |
| drying_time | — | NEEDS_SOURCE | stk755; Время сушки для БС-755 не подтверждено. |
| application_temperature | — | NEEDS_SOURCE | stk755; Температура нанесения для БС-755 не подтверждена. |
| compressive_strength | — | NEEDS_SOURCE | stk755; Не заявлена. |
| adhesion | — | NEEDS_SOURCE | stk755; Числовая адгезия не указана. |
| frost_resistance | — | NEEDS_SOURCE | stk755; Не подтверждена. |
| waterproofness | — | NEEDS_SOURCE | stk755; Числовое значение/класс не указан. |
| crack_bridging | — | NEEDS_SOURCE | stk755; Не подтверждена. |
| standard | — | NEEDS_SOURCE | stk755; Применимый стандарт/ТУ не подтверждён. |

Unresolved fields:
- NEEDS_SOURCE: shelf_life, application_method, substrates, color, layer_thickness, drying_time, application_temperature, compressive_strength, adhesion, frost_resistance, waterproofness, crack_bridging, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Готовая к применению мастика.; mixing_ratio: Однокомпонентная готовая мастика.; pot_life: Для готовой мастики время жизни затворённого раствора неприменимо.
- Facts not stored: none

Short description:

СТК Профи БС-755 PROFI, 5 кг — готовая полиакриловая гидроизоляционная мастика.

Full description:

Готовая полиакриловая мастика СТК Профи БС-755 PROFI поставляется в ведре 5 кг. Предназначена для гидроизоляционной обработки жилых и нежилых помещений, включая санузлы и ванные комнаты. Расход составляет 100–120 г/м².

SEO title:

СТК Профи PROFI 5 кг — купить гидроизоляцию в Москве

SEO description:

Готовая полиакриловая мастика СТК Профи PROFI 5 кг, расход 100–120 г/м². Закажите гидроизоляцию с доставкой по Москве и области.

### MAT-000103

- **Identity:** IDENTITY_CONFIRMED; brand Ceresit; package 20 kg.
- **Current title:** Гидроизоляция Ceresit CR 65 20 кг
- **Current slug:** гидроизоляция-ceresit-cr-65-20-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** 1566 / 20 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- ceresit65 (manufacturer-page; Ceresit / Henkel): [Церезит CR 65 — официальный сайт](https://www.ceresit.ru/ru/products/waterproofing/waterproofing-materials/cr_65_waterproof)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | Ceresit | READY | ceresit65; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Цементная обмазочная гидроизоляция | READY | ceresit65 |
| shelf_life | — | NEEDS_SOURCE | ceresit65; Срок хранения не подтверждён в доступной текущей странице. |
| package_weight | 20 | READY | ceresit65 |
| base | Цемент, минеральные заполнители, пигмент, модифицирующие добавки | READY | ceresit65 |
| purpose | Водонепроницаемые покрытия на недеформирующихся, трещиностойких, незасоленных минеральных основаниях без гипса | READY | ceresit65 |
| application_area | Внутренние и наружные работы; заглублённые сооружения; влажные помещения; небольшие бассейны и резервуары; стяжки с подогревом; защита бетонных конструкций | READY | ceresit65 |
| application_method | Кисть или шпатель | READY | ceresit65 |
| substrates | Недеформирующиеся трещиностойкие незасоленные минеральные основания без гипса | READY | ceresit65 |
| color | Серо-розовый | READY | ceresit65 |
| layer_thickness | 2–5 мм в зависимости от условий эксплуатации | READY | ceresit65 |
| consumption | около 3 кг/м² при 2 мм; около 4 кг/м² при 2,5 мм; около 5 кг/м² при 3 мм; до около 8 кг/м² при 5 мм | READY | ceresit65 |
| water_requirement | 4,8–5,2 л на 20 кг при нанесении кистью; около 4,0 л на 20 кг при нанесении шпателем | READY | ceresit65 |
| mixing_ratio | — | ABSENT_BY_DESIGN | ceresit65; Однокомпонентная сухая смесь затворяется водой; соотношение компонентов A:B неприменимо. |
| pot_life | около 2 часов | READY | ceresit65 |
| drying_time | Крепление плитки — через 3 суток; гидравлическая нагрузка — через 5 суток | READY | ceresit65 |
| application_temperature | от +5 до +30 °C | READY | ceresit65 |
| compressive_strength | 20 | READY | ceresit65; Не менее 20,0 МПа через 28 суток; minimum qualifier retained in provenance. |
| adhesion | 1 | READY | ceresit65; Не менее 1,0 МПа через 28 суток; minimum qualifier retained in provenance. |
| frost_resistance | F200 | READY | ceresit65 |
| waterproofness | не менее 1,0 МПа (W10) | READY | ceresit65 |
| crack_bridging | — | NEEDS_SOURCE | ceresit65; Не подтверждено для CR 65; эластичность отсылается к CR 166. |
| standard | — | NEEDS_SOURCE | ceresit65; Применимый стандарт/ТУ не подтверждён карточкой. |

Unresolved fields:
- NEEDS_SOURCE: shelf_life, crack_bridging, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: mixing_ratio: Однокомпонентная сухая смесь затворяется водой; соотношение компонентов A:B неприменимо.
- Facts not stored: none

Short description:

Ceresit CR 65, 20 кг — цементная обмазочная гидроизоляция для недеформирующихся минеральных оснований.

Full description:

Цементную гидроизоляцию Ceresit CR 65 применяют внутри и снаружи зданий на недеформирующихся незасоленных минеральных основаниях без гипса. Её наносят кистью или шпателем; толщина покрытия составляет 2–5 мм в зависимости от условий эксплуатации. Для затворения 20 кг требуется 4,8–5,2 л воды при нанесении кистью или около 4,0 л при нанесении шпателем. Плитку можно крепить через 3 суток, гидравлическая нагрузка допускается через 5 суток.

SEO title:

Ceresit CR 65 20 кг — купить гидроизоляцию в Москве

SEO description:

Цементная гидроизоляция Ceresit CR 65 20 кг для внутренних и наружных работ. Нанесение кистью или шпателем, слой 2–5 мм. Доставка по Москве и области.

### MAT-000104

- **Identity:** IDENTITY_CONFIRMED; brand Русеан; package 25 kg.
- **Current title:** Гидроизоляция минерально химическая восстановительная НЦ Русеан 25 кг
- **Current slug:** гидроизоляция-минерально-химическая-восстановительная-нц-русеан-25-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** NULL / 25 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- ruseanNc (manufacturer-article; Русеан): [Гидроизоляционные смеси Русеан — материал производителя](https://rusean.ru/articles/smesi-dlya-gidroizolyatsii-articles/gidroizolyatsionnye-smesi-rusean/)
- ruseanRetail1 (secondary-exact-product-card; ДЛЯ ПРОРАБА / Pannel): [Гидроизоляционная смесь Русеан НЦ 25 кг — точная карточка продавца](https://pannel.ru/product/gidroizolyacionnaya-smes-rusean-nc-25-kg)
- ruseanRetail2 (secondary-exact-product-card; ГК Промсервис): [Смесь НЦ Русеан 25 кг — точная карточка продавца](https://gk-promservis.ru/tsement-nts-dlya-gidroizolyatsii-25kg-rusean/)
- localCatalog (local-catalog-metadata; MatMix local catalog): Exact local MatMix package title and weight metadata (no URL; owner-provided identity evidence)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | Русеан | READY | ruseanNc; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Гидроизоляционная сухая смесь на основе напрягающего цемента | READY | ruseanNc |
| shelf_life | — | SOURCE_CONFLICT | ruseanRetail1, ruseanRetail2; Вторичные exact карточки противоречат друг другу: 6 и 24 месяца; без актуального официального TDS значение не выбирается. |
| package_weight | 25 | READY | ruseanNc, localCatalog; Local title/package metadata agree with exact 25 kg secondary listings; manufacturer article confirms НЦ product family. |
| base | — | NEEDS_SOURCE | ruseanNc; Точный компонентный состав НЦ для этой фасовки не найден в актуальном официальном TDS. |
| purpose | Конструкционная гидроизоляция; производитель указывает напрягающий цемент НЦ как смесь для этого назначения. | READY | ruseanNc |
| application_area | Подземные конструкции и ёмкости; детали применения конкретного SKU требуют подтверждения актуальной техкартой. | READY | ruseanNc |
| application_method | Кисть или распыление | READY | ruseanNc |
| substrates | — | NEEDS_SOURCE | ruseanNc; Совместимые основания конкретной смеси НЦ не подтверждены производителем в доступном документе. |
| color | — | NEEDS_SOURCE | ruseanRetail1; Цвет exact 25 kg SKU не подтверждён официальным источником. |
| layer_thickness | — | NEEDS_SOURCE | ruseanRetail1, ruseanRetail2; Розничные источники расходятся по применению/слоям; не выбран диапазон. |
| consumption | — | NEEDS_SOURCE | ruseanRetail1, ruseanRetail2; Не найдено согласованное официальное значение для exact 25 kg продукта. |
| water_requirement | — | NEEDS_SOURCE | ruseanRetail1, ruseanRetail2; Не найден актуальный официальный расход воды для exact product version. |
| mixing_ratio | — | ABSENT_BY_DESIGN | ruseanNc; Однокомпонентная сухая смесь; отдельное соотношение A:B не применяется. |
| pot_life | — | NEEDS_SOURCE | ruseanRetail1, ruseanRetail2; Вторичные карточки не дают единого подтверждённого значения для exact версии. |
| drying_time | — | NEEDS_SOURCE | ruseanNc; Не найдено актуальное официальное время высыхания/нагрузки. |
| application_temperature | — | SOURCE_CONFLICT | ruseanRetail1, ruseanRetail2; Вторичные данные расходятся: +5…+25 °C и +10…+25 °C; оставить незаполненным до exact актуального TDS. |
| compressive_strength | — | SOURCE_CONFLICT | ruseanRetail1, ruseanRetail2; Вторичные exact карточки расходятся: 20 и 39,7 МПа; не выбирать значение без актуального официального TDS. |
| adhesion | — | SOURCE_CONFLICT | ruseanRetail1, ruseanRetail2; Найденные вторичные значения адгезии несовместимы; актуальный официальный TDS отсутствует. |
| frost_resistance | — | NEEDS_SOURCE | ruseanRetail1, ruseanRetail2; F50 встречается во вторичных карточках, но независимое согласование exact SKU не завершено. |
| waterproofness | — | NEEDS_SOURCE | ruseanNc; Класс водонепроницаемости для exact product не удалось подтвердить первичным источником. |
| crack_bridging | — | NEEDS_SOURCE | ruseanNc; Не заявлено/не подтверждено. |
| standard | — | NEEDS_SOURCE | ruseanNc; Применимый стандарт/ТУ exact SKU не найден. |

Unresolved fields:
- NEEDS_SOURCE: base, substrates, color, layer_thickness, consumption, water_requirement, pot_life, drying_time, frost_resistance, waterproofness, crack_bridging, standard
- SOURCE_CONFLICT: shelf_life: Вторичные exact карточки противоречат друг другу: 6 и 24 месяца; без актуального официального TDS значение не выбирается. Facts=6 месяцев / 24 месяца; application_temperature: Вторичные данные расходятся: +5…+25 °C и +10…+25 °C; оставить незаполненным до exact актуального TDS. Facts=+5…+25 °C / +10…+25 °C; compressive_strength: Вторичные exact карточки расходятся: 20 и 39,7 МПа; не выбирать значение без актуального официального TDS. Facts=20 МПа / 39,7 МПа; adhesion: Найденные вторичные значения адгезии несовместимы; актуальный официальный TDS отсутствует. Facts=conflicting secondary values
- ABSENT_BY_DESIGN: mixing_ratio: Однокомпонентная сухая смесь; отдельное соотношение A:B не применяется.
- Facts not stored: 18–19 кг/м² при 10 мм (нет подтверждения exact current source); 0,15–0,17 л/кг (нет подтверждения exact current source); срок хранения 6/24 мес.; прочность 20/39,7 МПа; адгезия и температура расходятся

Short description:

Русеан НЦ, 25 кг — гидроизоляционная сухая смесь на основе напрягающего цемента.

Full description:

Русеан НЦ, 25 кг — сухая смесь на основе напрягающего цемента для конструкционной гидроизоляции. Применяется для подземных конструкций и ёмкостей. Состав наносят кистью или распылением.

SEO title:

Русеан НЦ 25 кг — купить гидроизоляционную смесь в Москве

SEO description:

Гидроизоляционная смесь Русеан НЦ на основе напрягающего цемента, фасовка 25 кг. Закажите с доставкой по Москве и области.

### MAT-000105

- **Identity:** IDENTITY_CONFIRMED; brand GLIMS; package 18 kg.
- **Current title:** Гидроизоляция обмазочная Глимс (Glims) водостоп 18 кг
- **Current slug:** гидроизоляция-обмазочная-глимс-glims-водостоп-18-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** 1425.6000000000001 / 18 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- glims (manufacturer-page-and-tds; GLIMS): [GLIMS ВодоStop 18 кг — официальный сайт и TDS](https://glims.ru/catalog/gidroizolyatsiya/gidroizolyatsiya-tsementnaya-obmazochnaya-glims-vodostop-18-kg/)
- glimsPdf (manufacturer-technical-sheet; GLIMS): [GLIMS ВодоStop — официальный PDF](https://www.glims.ru/upload/iblock/95c/d49vru9wi52cjhr8txetqria7r11dza5/GLIMS%C2%AE%20%D0%92%D0%BE%D0%B4%D0%BEStop.pdf)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | GLIMS | READY | glims; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Сухая цементная обмазочная гидроизоляция | READY | glims |
| shelf_life | 12 | READY | glims |
| package_weight | 18 | READY | glims |
| base | Цементное вяжущее, минеральные наполнители, модифицирующие добавки | READY | glims |
| purpose | Создание бесшовного гидроизоляционного барьера на вертикальных и горизонтальных недеформируемых основаниях | READY | glims |
| application_area | Внутренние и наружные работы; фундаменты, подвалы, фасады, цоколи, террасы, балконы, резервуары, бассейны, колодцы и влажные помещения | READY | glims |
| application_method | Кисть или шпатель | READY | glims |
| substrates | Вертикальные и горизонтальные основания, не подверженные деформации | READY | glims |
| color | Серый | READY | glims |
| layer_thickness | 0,5–1 мм за слой; суммарно 1–3 мм в два слоя | READY | glims |
| consumption | 1,4 кг/м² при толщине 1 мм | READY | glims |
| water_requirement | 0,33–0,34 л/кг сухой смеси | READY | glims |
| mixing_ratio | — | ABSENT_BY_DESIGN | glims; Однокомпонентная сухая смесь затворяется водой; соотношение компонентов A:B неприменимо. |
| pot_life | не менее 240 минут | READY | glims |
| drying_time | Контакт с водой — через 3 суток | READY | glims |
| application_temperature | от +5 до +35 °C | READY | glims |
| compressive_strength | 6 | READY | glims; Не менее 6 МПа через 28 суток; minimum qualifier retained in provenance. |
| adhesion | 1 | READY | glims; Не менее 1 МПа; minimum qualifier retained in provenance. |
| frost_resistance | Fкз75 | READY | glims |
| waterproofness | — | NEEDS_SOURCE | glims; Официальная страница показывает raw 8/2 MPa, однако направление/единица требуют проверки TDS; не нормализовано и не записывается. |
| crack_bridging | — | NEEDS_SOURCE | glims; Не заявлено для жёсткой гидроизоляции. |
| standard | ТУ 5745-010-40397319-2003 № 0430/1 | READY | glims |

Unresolved fields:
- NEEDS_SOURCE: waterproofness, crack_bridging
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: mixing_ratio: Однокомпонентная сухая смесь затворяется водой; соотношение компонентов A:B неприменимо.
- Facts not stored: raw official waterproofness=8/2 MPa; semantics/units appear ambiguous, not normalized

Short description:

GLIMS ВодоStop, 18 кг — цементная обмазочная гидроизоляция для недеформируемых оснований.

Full description:

GLIMS ВодоStop — сухая цементная гидроизоляция в упаковке 18 кг для вертикальных и горизонтальных оснований, не подверженных деформации. Материал наносят кистью или шпателем в один или два слоя общей толщиной 1–3 мм. Для затворения требуется 0,33–0,34 л воды на 1 кг смеси; расход — 1,4 кг/м² при слое 1 мм. Производитель указывает контакт с водой через 3 суток.

SEO title:

GLIMS ВодоStop 18 кг — купить гидроизоляцию в Москве

SEO description:

Цементная гидроизоляция GLIMS ВодоStop 18 кг для недеформируемых оснований. Расход 1,4 кг/м² на 1 мм слоя. Доставка по Москве и области.

### MAT-000106

- **Identity:** IDENTITY_CONFIRMED; brand Mapei; package 32 kg.
- **Current title:** Гидроизоляция Mapei Mapelastic двухкомп. компл. (А+Б) 32 кг
- **Current slug:** гидроизоляция-mapei-mapelastic-двухкомп-компл-а-б-32-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** NULL / 32 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- mapeiRu (manufacturer-technical-sheet; Mapei Russia): [Mapelastic — официальный российский technical leaflet](https://cdnmedia.mapei.com/docs/librariesprovider50/line-technical-documentation-documents/mapei_19-mapelastic_leflet_a6.pdf?sfvrsn=97e83777_18)
- mapeiPage (manufacturer-page; Mapei): [MAPELASTIC — официальный Mapei Kazakhstan (рус.)](https://www.mapei.com/kz/ru/%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D1%8B/%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA-%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2/%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%B0/mapelastic)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | Mapei | READY | mapeiRu; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Двухкомпонентный эластичный цементный гидроизоляционный состав | READY | mapeiRu |
| shelf_life | — | NEEDS_SOURCE | mapeiRu, mapeiPage; Срок хранения различается по компонентам A/B (12/24 месяца); одно числовое значение было бы потерей смысла. |
| package_weight | 32 | READY | mapeiRu, mapeiPage; Официальный источник подтверждает комплект A+B 32 кг; products.weight/title не меняются. |
| base | Цементное вяжущее, мелкофракционные заполнители, специальные добавки и синтетические полимеры в водной дисперсии | READY | mapeiRu |
| purpose | Гидроизоляция балконов, террас, ванных комнат и бассейнов; защита бетонных конструкций | READY | mapeiRu |
| application_area | Внутренние и наружные работы | READY | mapeiRu |
| application_method | Шпатель или распыление | READY | mapeiRu |
| substrates | — | NEEDS_SOURCE | mapeiRu; Полный список совместимых оснований не перенесён без точного сверенного фрагмента TDS. |
| color | Серый | READY | mapeiRu |
| layer_thickness | не менее 2 мм в два слоя | READY | mapeiRu |
| consumption | около 1,7 кг/м² на 1 мм при нанесении шпателем; около 2,2 кг/м² на 1 мм при распылении | READY | mapeiRu |
| water_requirement | — | ABSENT_BY_DESIGN | mapeiRu; Жидкий компонент B участвует в смешивании; добавление воды в состав не задаётся. |
| mixing_ratio | Компонент A : компонент B = 3 : 1 | READY | mapeiRu |
| pot_life | около 1 часа | READY | mapeiRu |
| drying_time | 4–5 часов между слоями; около 5 суток до укладки покрытия | READY | mapeiRu |
| application_temperature | от +5 до +35 °C | READY | mapeiRu |
| compressive_strength | — | NEEDS_SOURCE | mapeiRu; Не является сохранённым подтверждённым полем для этого продукта в RU TDS. |
| adhesion | 0.9 | READY | mapeiRu; российский технический лист: сцепление с бетонным основанием через 28 суток — 0,9 МПа; 0,5 МПа относится к отдельному испытанию после выдерживания в воде; 1,0 МПа из отдельной таблицы EN 1504 не используется. |
| frost_resistance | — | NEEDS_SOURCE | mapeiRu; Значение из отдельного покрытия/стандарта не переносится без совпадающего тест-контекста. |
| waterproofness | W20 | READY | mapeiRu |
| crack_bridging | Трещиностойкость 0,75 мм через 28 суток | READY | mapeiRu |
| standard | EN 1504-2; EN 14891; ГОСТ 32016-2012; ГОСТ 32017-2012 | READY | mapeiRu |

Unresolved fields:
- NEEDS_SOURCE: shelf_life, substrates, compressive_strength, frost_resistance
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Жидкий компонент B участвует в смешивании; добавление воды в состав не задаётся.
- Facts not stored: none

Short description:

Mapei Mapelastic, комплект A+B 32 кг — двухкомпонентная эластичная цементная гидроизоляция.

Full description:

Mapei Mapelastic — двухкомпонентный эластичный цементный гидроизоляционный состав; комплект A+B имеет фасовку 32 кг. Его применяют для гидроизоляции балконов, террас, ванных комнат и бассейнов, а также для защиты бетонных конструкций. Компоненты смешивают в соотношении A:B = 3:1; состав наносят шпателем или распылением, формируя слой не менее 2 мм в два прохода.

SEO title:

Mapei Mapelastic A+B 32 кг — купить гидроизоляцию в Москве

SEO description:

Двухкомпонентная гидроизоляция Mapei Mapelastic, комплект A+B 32 кг, для балконов, террас, ванных комнат и бассейнов. Доставка по Москве и области.

### MAT-000107

- **Identity:** IDENTITY_CONFIRMED; brand Ceresit; package 32 kg.
- **Current title:** Гидроизоляция цементная Ceresit CR 166 двухкомп. компл. (А+Б) 32 кг
- **Current slug:** гидроизоляция-цементная-ceresit-cr-166-двухкомп-компл-а-б-32-кг
- **Current category:** Смеси / Гидроизоляция
- **Current price / operational weight / unit:** NULL / 32 / шт; unchanged.
- **Current visible fields:** empty; proposed status: visible copy + SEO READY.
- **Current image:** /uploads/products/MAT-000001-20260714153714969-3fb7fe.png; one product_images row, shared placeholder; untouched.
- **Final status:** CORE_PARTIAL_VISIBLE_READY_IMAGE_PENDING

Sources:
- ceresit166 (manufacturer-page; Ceresit / Henkel): [Церезит CR 166 — официальный сайт](https://www.ceresit.ru/ru/products/waterproofing/waterproofing-materials/cr-166)

Attributes (current values empty; production attribute_count pre-state 0):

| code | proposed value | status | sources / note |
|---|---|---|---|
| brand | Ceresit | READY | ceresit166; products.brand разрешён только H2, если NULL/empty; синхронное значение attribute brand создаётся H2. |
| product_type | Двухкомпонентная эластичная цементно-полимерная гидроизоляция | READY | ceresit166 |
| shelf_life | — | NEEDS_SOURCE | ceresit166; Единый срок хранения комплекта не подтверждён; компонентные сроки не сведены. |
| package_weight | 32 | READY | ceresit166; Локальная фасовка 32 кг сохраняется; официальный комплект описан как 24 кг компонента A + 8 л компонента B; литры не конвертируются в килограммы. |
| base | Компонент A: цемент, минеральные заполнители и модифицирующие добавки; компонент B: водная дисперсия полимера | READY | ceresit166 |
| purpose | Эластичная гидроизоляция незасоленных минеральных оснований без гипса, в том числе подверженных деформациям | READY | ceresit166 |
| application_area | Внутренние и наружные работы; фундаменты, гидротехнические сооружения, террасы, балконы, бассейны и резервуары; защита бетона и железобетона | READY | ceresit166 |
| application_method | Шпатель, кисть или механизированное нанесение | READY | ceresit166 |
| substrates | Незасоленные минеральные основания без гипса, в том числе подверженные деформациям | READY | ceresit166 |
| color | — | NEEDS_SOURCE | ceresit166; Цвет не подтверждён для точной упаковки. |
| layer_thickness | — | NEEDS_SOURCE | ceresit166; Точное общее ограничение слоя не подтверждено. |
| consumption | 1,5–1,7 кг/м² на 1 мм толщины | READY | ceresit166 |
| water_requirement | — | ABSENT_BY_DESIGN | ceresit166; Двухкомпонентная система использует жидкий компонент B вместо воды затворения. |
| mixing_ratio | Компонент A : компонент B = 3 : 1 по массе | READY | ceresit166 |
| pot_life | около 1 часа | READY | ceresit166 |
| drying_time | Укладка плитки — через 12 часов; гидравлическая нагрузка — через 7 суток | READY | ceresit166 |
| application_temperature | от +5 до +30 °C | READY | ceresit166 |
| compressive_strength | — | NEEDS_SOURCE | ceresit166; Не подтверждена на текущей странице. |
| adhesion | 1 | READY | ceresit166; Не менее 1,0 МПа после 28 суток; minimum qualifier retained in provenance. |
| frost_resistance | Fкз100 | READY | ceresit166 |
| waterproofness | Позитивное давление: не менее 2,0 МПа (W20); негативное: не менее 0,2 МПа (W2) | READY | ceresit166 |
| crack_bridging | Не менее 1,25 мм при +20 °C; не менее 1,0 мм при −5 °C; не менее 0,5 мм при −20 °C | READY | ceresit166 |
| standard | — | NEEDS_SOURCE | ceresit166; Применимый стандарт/ТУ не подтверждён доступной карточкой. |

Unresolved fields:
- NEEDS_SOURCE: shelf_life, color, layer_thickness, compressive_strength, standard
- SOURCE_CONFLICT: none
- ABSENT_BY_DESIGN: water_requirement: Двухкомпонентная система использует жидкий компонент B вместо воды затворения.
- Facts not stored: none

Short description:

Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ.

Full description:

Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ. Комплект включает сухой компонент A 24 кг и жидкий эластификатор B 8 л. Состав наносят шпателем, кистью или механизированно на незасоленные минеральные основания без гипса. Плитку можно укладывать через 12 часов, гидравлическая нагрузка допускается через 7 суток.

SEO title:

Ceresit CR 166 A+B — купить гидроизоляцию в Москве

SEO description:

Двухкомпонентная гидроизоляция Ceresit CR 166: сухой компонент 24 кг и жидкий эластификатор 8 л. Для внутренних и наружных работ. Доставка по Москве.

## MAT-000104 — unresolved source conflicts

Для Русеан НЦ 25 кг не найден актуальный официальный exact TDS с едиными числовыми характеристиками. Exact product identity подтверждается названием производителя и точными карточками продавцов, но вторичные материалы конфликтуют; поэтому соответствующие значения остаются не записанными:

| field | conflicting evidence | disposition |
|---|---|---|
| shelf_life | 6 мес. / 24 мес. | SOURCE_CONFLICT; no value stored |
| compressive_strength | 20 / 39,7 МПа (secondary source claims differ) | SOURCE_CONFLICT; no value stored |
| adhesion | secondary values conflict | SOURCE_CONFLICT; no value stored |
| application_temperature | +5…+25 °C / +10…+25 °C | SOURCE_CONFLICT; no value stored |

Для разблокировки нужна текущая официальная technical card/passport именно Русеан НЦ для фасовки 25 кг и текущей редакции продукта, с датой/кодом редакции и числовыми разделами прочности, адгезии, хранения и температуры. Старые/вторичные значения не переносятся в карточку. Exact источник Русеан подтверждает продуктовую семью и способ нанесения; вторичные exact SKU страницы сохранены в JSON как provenance.

## Final audit expectation

Canonical audit знает шесть подкатегорий и общий eventual scope 88 товаров. До будущего photo stage hydro template/source/SEO audit использует штатные правила: после синтетического H1+H2+H3 получено products=9, seoIssues=0, sourceOptionalGaps=9, imageIssues=9, blockers=9 от placeholder images, status=NOT_CLOSED. DATA_CLOSED семантика не менялась; image readiness не маскировалась.

## Источники

Первичные ссылки приведены по каждому source key в JSON и per-MAT выше. Owner photo evidence для MAT-000100/101/102 использована только как identity provenance; файлов и изображений в репозиторий не добавляли.

## H3 public-copy corrective

После review ранее применённого H3-текста нижеуказанные формулировки являются канонической корректировкой. Guarded migration принимает только точное прежнее H3-значение либо точное новое значение; любое третье значение блокирует весь batch.

| MAT | corrected fields | unchanged |
|---|---|---|
| MAT-000102 | `full_description` | short description and both SEO fields |
| MAT-000104 | `full_description` | short description and both SEO fields; unresolved source conflicts remain omitted |
| MAT-000107 | `short_description`, `full_description`, `seo_title` | `seo_description`, title, weight, identity and all other fields |

Для MAT-000107 сохраняются локальные title и operational weight 32. Публичный текст указывает компоненты официальной упаковки: A — 24 кг и B — 8 л; 32 кг не представляются как официальная масса комплекта.
