# Смеси: пескобетон, цемент и ремонтные смеси — identity reconciliation batch 1

Статус: read-only исследование. Проверено 2026-10-02 на ветке `codex/mix-sand-cement-repair-batch1`, HEAD `a161b3ea407c0cae62ec7952fde37b07d72e4ce6`. Product data, attribute definitions/templates/values, SEO, images, production и исходная DB не изменялись.

## Результат

| MAT | Локальный title | Identity | Подтверждение / нерешённый вопрос | SEO identity | Image status |
|---|---|---|---|---|---|
| MAT-000109 | Пескобетон (ЦПС) М300 Русеан 40 кг | `IDENTITY_CONFIRMED` | Exact official Русеан page: М-300, 40 кг. Марка М-300, B25 и отдельные 30 МПа сохранены как разные понятия. На странице расход указан как 18–19 в тексте и 19 в таблице; F50 в описании и F35 в таблице. | yes | `IMAGE_RESEARCH_REQUIRED` |
| MAT-000110 | Пескобетон Tex Pro М-300 ГОСТ 40 кг | `BLOCKED_IDENTITY` | Нет official exact product match или manufacturer identifier; «Tex Pro» не связан с изготовителем/SKU. | no | `IMAGE_BLOCKED_BY_PRODUCT_IDENTITY` |
| MAT-000111 | Пескобетон Евро М-300 ГОСТ 40кг | `BLOCKED_IDENTITY` | Нельзя доказать, что «Евро» означает Евромикс, Евроцемент или иной конкретный бренд. | no | `IMAGE_BLOCKED_BY_PRODUCT_IDENTITY` |
| MAT-000113 | Цемент «Цементум» 40кг | `IDENTITY_PARTIAL` | Официальный кандидат ExtraCEM 500 40 кг существует, но локальная запись не содержит модели/завода. У производителя несколько цементных линий; ExtraCEM имеет заводозависимые обозначения и классы. | no | `IMAGE_BLOCKED_BY_PRODUCT_IDENTITY` |
| MAT-000114 | Цемент «РосЦемент» 50кг | `BLOCKED_IDENTITY` | Росцемент — поставщик разных заводов, марок и классов. Название продавца и масса не выделяют один цемент. | no | `IMAGE_BLOCKED_BY_PRODUCT_IDENTITY` |
| MAT-000115 | Цемент «Русеан» 40кг | `IDENTITY_PARTIAL` | У официального Русеан есть кандидат ЦЕМ I 42,5Н, 40 кг, однако local title не содержит марку, EAN/связи с listing нет; страница называет два возможных завода. | no | `IMAGE_BLOCKED_BY_PRODUCT_IDENTITY` |
| MAT-000117 | Цементная смесь ремонтная Ceresit CN 83 25 кг | `IDENTITY_CONFIRMED` | Local title совпадает с official Ceresit RU CN 83 и фасовкой 25 кг из официального RU TDS. Иностранные региональные TDS не подмешивались. | yes | `IMAGE_RESEARCH_REQUIRED` |
| MAT-000118 | Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг | `IDENTITY_CONFIRMED` | Exact official GLIMS PRO CRT-40, 25 кг; article О00010269, EAN 4607009095967. Отличается от CRT-40 AF (другой артикул). В local title отсутствует PRO, но exact CRT-40 без AF совпадает. | yes | `IMAGE_RESEARCH_REQUIRED` |

**Подмножества:** confirmed — MAT-000109, MAT-000117, MAT-000118 (3); partial — MAT-000113, MAT-000115 (2); blocked — MAT-000110, MAT-000111, MAT-000114 (3). Confirmed subset может перейти к отдельной guarded core-data preparation, но это не разрешение на apply.

## Внутренние данные проекта

В products доступны internal ids 100–107, MAT external IDs, title, slug, category/subcategory, weight/unit, `source=excel`, импортные даты, product_group и общая placeholder image URL. Нет колонок/значений supplier SKU, manufacturer article, GTIN/EAN или source URL. У всех 8 brand пустой, attribute values = 0, product_images rows = 0, descriptions/SEO пусты. Исторический apply-audit snapshot также показывает пустой brand для MAT; иных идентификаторов там нет.

Проверены семь workbook snapshots: `_ _5_ 1. _ _ _ _ _-updated-2026-07-13-16-49-25.xlsx`, четыре `baseline-catalog-updated-2026-07-13-*.xlsx`, `MatMix_catalog-updated-2026-07-15-16-45-04.xlsx` и `backend/tmp/baseline/baseline-catalog.xlsx`. Во всех повторяются те же MAT-код, локальное название, товарная группа, вес и единица; столбцы производителя, supplier SKU, артикула, EAN/GTIN и source URL отсутствуют. Эти файлы подтверждают происхождение локальных названий, но не добавляют manufacturer identity. Строки target MAT: 117, 118, 119, 121, 122, 123, 125 и 126 соответственно. Поэтому совпадение только локального названия/массы не использовалось как достаточное доказательство.

## Schema v4 → v11 на отдельной копии

Исходный `backend/database/matmix.db` сам сообщает `PRAGMA user_version=4`. Штатный `npm run database:migrate` направлен на runtime DB (по умолчанию этот файл), поэтому на оригинале его не запускали. Сначала SQLite online-backup создал отдельную копию в OS temp, затем экспортированная проектная функция `migrateDatabase(copy, {dryRun:false})` выполнила канонический путь v4→v11 с обычными backup, transaction и integrity checks. Не задавался `user_version` вручную и не применялись самодельные ALTER.

- Disposable DB: `C:/Users/Aladd/AppData/Local/Temp/matmix-sand-cement-v11-Ymq2Lk/matmix-v4-copy.db`
- Миграция: 4 → 11; `product_attribute_templates.section` присутствует; `integrity_check=ok`; foreign key violations = 0.
- Backup мигратора: `C:/Users/Aladd/AppData/Local/Temp/matmix-sand-cement-v11-Ymq2Lk/migration-backups/matmix-v4-2026-10-02T12-27-30-811Z.db`
- Исходная DB SHA256 before/after: `77c7d13dc6898e20f8b08af955f44b21d523bdc53e649ba8d1dd5a20093add33` / то же значение.
- В копии v11: всего 53 template rows, но для target structures 11/12/13 — 0. Definitions доступны; membership templates не создавались. Следовательно, schema-compatible validation готова, но template integrity этих подкатегорий не подтверждена.

Причина v4: используемый локальный snapshot остался на версии 4; версия приложения и явная migration function уже 11. Автоматический startup migration не запускался. Текущий CLI миграции применяет штатный механизм к `runtimePaths().dbPath`; для безопасной проверки тот же экспортированный мигратор вызван для disposable-копии.

## Source registry и атрибуты подтверждённого subset

Факты ниже — evidence/proposals, не записи в БД. Статусы: `SOURCE_CONFIRMED`, `NEEDS_MAPPING`, `CONFLICT`, `NOT_FOUND`.

### MAT-000109 — [официальная карточка Русеан](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/)

| Candidate | Source value / context | Нормализация для review | Status |
|---|---|---|---|
| brand | Страница Русеан для exact М-300 40 кг | Русеан | SOURCE_CONFIRMED |
| product_type | Пескобетон | Пескобетон | SOURCE_CONFIRMED |
| package_weight | 40 кг | 40 кг | SOURCE_CONFIRMED |
| base | Портландцемент, песок до 5 мм | Портландцемент; песок до 5 мм | SOURCE_CONFIRMED |
| purpose | Полы, фундаменты, отмостки/отливки, монтаж | Не расширять список источника | SOURCE_CONFIRMED |
| application_area / method | Внутри и снаружи; ручное нанесение | Внутренние/наружные; ручное | SOURCE_CONFIRMED |
| layer_thickness | 50–150 мм | 50–150 мм | SOURCE_CONFIRMED |
| water_requirement | 0,13–0,15 л/кг | Сохранить диапазон и единицу | SOURCE_CONFIRMED |
| pot_life | 1,5–2 ч в инструкции; 2 ч в таблице | Сохранить диапазон | SOURCE_CONFIRMED |
| application_temperature | +5…+25 °C | +5…+25 °C | SOURCE_CONFIRMED |
| mortar_grade / strength | Product M-300; B25 в описании; 30 МПа отдельной строкой прочности | Не конвертировать и не схлопывать | SOURCE_CONFIRMED |
| standard | ГОСТ 31358-2019 | ГОСТ 31358-2019 | SOURCE_CONFIRMED |
| consumption_10mm | 18–19 в описании, 19 в таблице | Не выбирать молча | CONFLICT |
| frost_resistance | F50 в описании, F35 в таблице | Не выбирать молча | CONFLICT |

### MAT-000117 — [официальный каталог Ceresit RU](https://www.ceresit.ru/ru/products/flooring/levelling-compounds) и [официальный RU TDS Henkel](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-)

| Candidate | Source value / context | Нормализация для review | Status |
|---|---|---|---|
| brand / product_type | Ceresit CN 83; ремонтная смесь для бетона | Ceresit; ремонтная смесь для бетона | SOURCE_CONFIRMED |
| package_weight | RU TDS: бумажные мешки 25 кг | 25 кг | SOURCE_CONFIRMED |
| base | Цемент, минеральные заполнители, модифицирующие добавки | Сохранить состав без лишних выводов | SOURCE_CONFIRMED |
| application_area | Для внутренних/наружных работ по RU source | Внутренние и наружные | SOURCE_CONFIRMED |
| layer_thickness | RU каталог: 5–35 мм | 5–35 мм | SOURCE_CONFIRMED |
| consumption | Около 2,0 кг/м² на 1 мм | Сохранить «около» и basis | SOURCE_CONFIRMED |
| water_requirement | 3,0–3,2 л на 25 кг | На фасовку 25 кг | SOURCE_CONFIRMED |
| pot_life / temperature | Около 30 минут; от +5 до +30 °C в RU TDS | Сохранить qualifiers | SOURCE_CONFIRMED |

### MAT-000118 — [официальная GLIMS product page](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/) и [TDS PDF](https://glims.ru/upload/iblock/269/6zxy9omk7p1uybqgmlb0upxynqo43qb7/GLIMS%C2%AE%20PRO%20CRT-40.pdf)

| Candidate | Source value / context | Нормализация для review | Status |
|---|---|---|---|
| manufacturer article / EAN | О00010269 / 4607009095967; стандартный PRO CRT-40, не AF | Сохранить identifiers в provenance | SOURCE_CONFIRMED |
| brand / product_type | GLIMS PRO CRT-40; ремонтная тиксотропная R3 | GLIMS; тиксотропная ремонтная смесь R3 | SOURCE_CONFIRMED |
| package_weight | TDS: мешок 25 кг | 25 кг | SOURCE_CONFIRMED |
| base / substrates | Цементное вяжущее; бетон, железобетон и минеральные основания | Не расширять список | SOURCE_CONFIRMED |
| layer_thickness / consumption | 10–40 мм; 1,8 кг/м² на 1 мм | Сохранить basis 1 мм | SOURCE_CONFIRMED |
| water_requirement / pot_life | 0,16–0,17 л/кг; 30 минут | Сохранить единицы | SOURCE_CONFIRMED |
| application_temperature | +5…+35 °C при нанесении/отверждении | Указать контекст | SOURCE_CONFIRMED |
| strengths / adhesion | ≥40 МПа через 28 суток; ≥15 МПа через 1 сутки; адгезия ≥1,5 МПа | Возраст/условия не терять | SOURCE_CONFIRMED |
| flexural_strength / standard | ≥8 МПа; ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2 | Сохранить класс и норматив отдельно | SOURCE_CONFIRMED |

Для MAT-000110/111/113/114/115 атрибуты не переносились: identity не достигла подтверждённого уровня. Новые definitions, template memberships и product values не создавались.

## Images, SEO и safety

- Все восемь image URLs остаются общим placeholder; ни одна упаковка визуально не сверялась, asset не готовился, `product_images` не менялась.
- SEO не создавался и не применялся. Идентичность достаточна для SEO только у MAT-000109/117/118, но SEO является отдельным этапом.
- Product/attribute/template/image/SEO writes = 0. Production/SSH/deploy = не использовались.
- Материалы к production не готовы.

## Проверки и итоговые markers

Проверки после обновления artifacts: `node backend/scripts/test-product-page-foundation.js` — PASS (`success=true`, migration 8→11, retry/constraints/cascade/rollback); `node backend/scripts/test-product-content.js` — PASS (content fields, legacy update, definitions/templates/typed values, image/gallery/API and DB health). JSON parse + consistency — PASS (8 уникальных MAT, 3/2/3 статуса, обязательные identity/image/attribute enums и source URL для каждой attr evidence). `git diff --check` — PASS; дополнительно проверен trailing whitespace в обоих untracked review-файлах. Исходная DB SHA256 до/после — `77c7d13dc6898e20f8b08af955f44b21d523bdc53e649ba8d1dd5a20093add33` (без изменений).

`SAND_CONCRETE_CEMENT_REPAIR_SCHEMA_V11_LOCAL_READY = true`

`SAND_CONCRETE_CEMENT_REPAIR_IDENTITY_RECONCILED = true`

`SAND_CONCRETE_CEMENT_REPAIR_CONFIRMED_SUBSET_COUNT = 3`

`SAND_CONCRETE_CEMENT_REPAIR_PARTIAL_SUBSET_COUNT = 2`

`SAND_CONCRETE_CEMENT_REPAIR_BLOCKED_SUBSET_COUNT = 3`

`SAND_CONCRETE_CEMENT_REPAIR_READY_FOR_CORE_PREPARATION = true`

`SAND_CONCRETE_CEMENT_REPAIR_READY_FOR_PRODUCTION = false`

Следующий технический шаг: отдельная guarded core-data preparation только MAT-000109/117/118; перед mapping MAT-000109 сохранить его внутренние конфликтующие значения раздельно. Применение данных, миграция оригинальной DB и production apply остаются вне этого этапа.

## Stage 2 — CORE batch 1 (confirmed subset)

Checked 2026-10-02. This proposal covers only MAT-000109, MAT-000117, MAT-000118. MAT-000113/115 remain PARTIAL; MAT-000110/111/114 remain BLOCKED and are excluded. No identity status for those five changed.

### Template audit

Schema v11 contains `product_attribute_templates.section`. The resolver intentionally supports subcategories with no template rows: the four global main attributes are shown first; regular fields follow definition sort order, label and definition id. The canonical closed-subcategory data does not define templates for Пескобетон or Смесь Ремонтная. The empty memberships observed for structure IDs 11 and 13 therefore use the supported generic fallback; no template or definition additions are required.

| Structure | Subcategory | Existing memberships | Required/missing | Definitions | Ordering | Status |
|---:|---|---|---|---|---|---|
| 11 | Пескобетон | 0 | 0/0 | 23 reused, 0 missing | Global main fields first (brand, product_type, shelf_life, package_weight); regular attributes use definition sort_order, then label, then definition id. | TEMPLATE_READY |
| 12 | Цемент | 0 | 0/0 | 0 reused, 0 missing | Generic no-membership fallback; included as architecture context only. | TEMPLATE_READY |
| 13 | Смесь Ремонтная | 0 | 0/0 | 23 reused, 0 missing | Global main fields first (brand, product_type, shelf_life, package_weight); regular attributes use definition sort_order, then label, then definition id. | TEMPLATE_READY |

No new attribute definitions or template memberships are proposed or applied.

### Dry-run on disposable schema-v11 copy

```json
{
  "logicalSlots": 69,
  "ready": 51,
  "willAdd": 51,
  "existingOk": 0,
  "sourceConflict": 2,
  "needsMapping": 7,
  "notAvailable": 9,
  "schemaBlocked": 0,
  "valueConflict": 0,
  "brandConflict": 0,
  "titleGuardBlocked": 0,
  "errors": 0,
  "total": 3,
  "readyProducts": 0,
  "partialProducts": 3,
  "blockedProducts": 0,
  "definitionsToCreate": 0,
  "templateMembershipChanges": 0
}
```

The dry-run was read-only. Transactional apply/rollback behavior was tested only in synthetic temporary SQLite fixtures, never against the original local DB or production.

### Source-backed field mapping

#### MAT-000109 — Пескобетон (ЦПС) М300 Русеан 40 кг

Identity: Exact official product page and 40 kg title/weight match; official class is M-300.

| Canonical key | Source value/unit | Proposed value | Dry-run | Source/context | Decision/reason |
|---|---|---|---|---|---|
| brand / #1 | Русеан | Русеан | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Manufacturer page for Пескобетон М-300, 40 кг. | Source-backed mapping. |
| product_type / #2 | Пескобетон | Пескобетон | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official product title and product description. | Source-backed mapping. |
| base / #3 | Портландцемент и песок фракцией до 5 мм | Портландцемент и песок фракцией до 5 мм | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Описание: inorganic binder (Portland cement) and sand up to 5 mm. | Source-backed mapping. |
| purpose / #4 | Устройство полов; ленточные фундаменты в малоэтажном строительстве; отмостки и отливки; монтажные работы | Устройство полов; ленточные фундаменты в малоэтажном строительстве; отмостки и отливки; монтажные работы | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official application list. | Source-backed mapping. |
| package_weight / #5 | 40 кг | 40 (кг) | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Exact official page title and weight field. | Source-backed mapping. |
| application_area / #13 | Внутренние и наружные работы | Внутренние и наружные работы | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Manual application inside and outside buildings. | Source-backed mapping. |
| application_method / #14 | Ручное нанесение | Ручное нанесение | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page explicitly says hand application. | Source-backed mapping. |
| substrates / #15 | Бетонное основание | Бетонное основание | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Application instructions call for a sound concrete substrate. | Source-backed mapping. |
| color / #16 | Серый | Серый | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official characteristics table. | Source-backed mapping. |
| layer_thickness / #17 | 50–150 мм | 50–150 мм | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official characteristics table. | Source-backed mapping. |
| consumption_10mm / #6 | 18–19; таблица: 19 кг/м² при 10 мм | — | SOURCE_CONFLICT | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page, prose consumption section versus characteristics table. | Official description states 18–19 kg/m² at 10 mm; the same page table states 19 kg/m². No value selected. |
| consumption / #25 | — | — | NOT_AVAILABLE | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): The 10 mm consumption conflict is recorded under consumption_10mm; a second generic value is intentionally not duplicated. | The 10 mm consumption conflict is recorded under consumption_10mm; a second generic value is intentionally not duplicated. |
| water_requirement / #18 | 0,13–0,15 л/кг | 0,13–0,15 л/кг | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official table gives 0.13–0.15 L per kg; prose gives the equivalent 1.3–1.5 L per 10 kg. | Source-backed mapping. |
| pot_life / #19 | 1,5–2; таблица: 2 час | — | NEEDS_MAPPING | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page usage prose and characteristics table. | Prose states 1.5–2 hours, while the table gives 2 hours. A single numeric canonical value would discard the range. |
| application_temperature / #10 | от +5 до +25 °C | от +5 до +25 °C | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official characteristics table. | Source-backed mapping. |
| compressive_strength / #20 | 30 МПа | 30 (МПа) | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official characteristics table states 30 MPa. | Source-backed mapping. |
| adhesion / #21 | 0,4 МПа | 0.4 (МПа) | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official table: adhesion to concrete after 28 days is 0.4 MPa. | Source-backed mapping. |
| frost_resistance / #22 | F50; таблица: F35 | — | SOURCE_CONFLICT | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page description heading versus characteristics table. | Official description labels the product F50; the same page table says F35. No value selected. |
| shelf_life / #11 | 6 месяцев | 6 (месяцев) | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official storage section and characteristics table: 6 months. | Source-backed mapping. |
| standard / #23 | ГОСТ 31358-2019 | ГОСТ 31358-2019 | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page product classification. | Source-backed mapping. |
| mortar_grade / #12 | М-300 | М-300 | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official exact product name. Kept distinct from B25 class and 30 MPa strength. | Source-backed mapping. |
| walkability / #24 | 48 часов | 48 часов | WILL_ADD | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): Official page: minimum strength for walking after 48 hours under +5…+25 °C conditions. | Source-backed mapping. |
| flexural_strength / #26 | — | — | NOT_AVAILABLE | [Пескобетон М-300, 40 кг](https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/): No exact flexural-strength value is provided on the reviewed official product page. | No exact flexural-strength value is provided on the reviewed official product page. |

Separate source class B25 is not mapped to mortar_grade М-300 or compressive strength 30 MPa.

#### MAT-000117 — Цементная смесь ремонтная Ceresit CN 83 25 кг

Identity: Exact local model CN 83 and 25 kg match the official Russian catalogue and Russian TDS. No Ukrainian/foreign-market values used.

| Canonical key | Source value/unit | Proposed value | Dry-run | Source/context | Decision/reason |
|---|---|---|---|---|---|
| brand / #1 | Ceresit | Ceresit | WILL_ADD | [Официальный российский каталог CN 83](https://www.ceresit.ru/ru/products/flooring/levelling-compounds): Official Russian catalogue. | Source-backed mapping. |
| product_type / #2 | Ремонтная смесь для бетона | Ремонтная смесь для бетона | WILL_ADD | [Официальный российский каталог CN 83](https://www.ceresit.ru/ru/products/flooring/levelling-compounds): Official Russian catalogue heading. | Source-backed mapping. |
| base / #3 | Цемент, минеральные заполнители, модифицирующие добавки | Цемент, минеральные заполнители, модифицирующие добавки | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS composition. | Source-backed mapping. |
| purpose / #4 | Срочный ремонт бетонных и железобетонных конструкций; заполнение выбоин, каверн, дефектов и неровностей глубиной от 5 мм; изготовление стяжек | Срочный ремонт бетонных и железобетонных конструкций; заполнение выбоин, каверн, дефектов и неровностей глубиной от 5 мм; изготовление стяжек | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS application section. | Source-backed mapping. |
| package_weight / #5 | 25 кг | 25 (кг) | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS: multilayer paper bags of 25 kg. | Source-backed mapping. |
| application_area / #13 | Внутренние и наружные работы | Внутренние и наружные работы | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS explicitly permits internal and external work. | Source-backed mapping. |
| application_method / #14 | Шпатель или кельма; для стяжек — виброрейка | Шпатель или кельма; для стяжек — виброрейка | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS application instructions. | Source-backed mapping. |
| substrates / #15 | Бетон и железобетон; горизонтальные и вертикальные основания | Бетон и железобетон; горизонтальные и вертикальные основания | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS application scope and instructions. | Source-backed mapping. |
| color / #16 | — | — | NOT_AVAILABLE | [Официальный российский каталог CN 83](https://www.ceresit.ru/ru/products/flooring/levelling-compounds), [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): The reviewed Russian catalogue/TDS does not state the product color. | The reviewed Russian catalogue/TDS does not state the product color. |
| layer_thickness / #17 | 5–35 мм | 5–35 мм | WILL_ADD | [Официальный российский каталог CN 83](https://www.ceresit.ru/ru/products/flooring/levelling-compounds), [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): Both RU catalogue and TDS specify 5–35 mm per pass. | Source-backed mapping. |
| consumption_10mm / #6 | — | — | NOT_AVAILABLE | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): The RU TDS gives consumption per 1 mm; it is retained verbatim in the text consumption attribute instead of deriving a 10 mm figure. | The RU TDS gives consumption per 1 mm; it is retained verbatim in the text consumption attribute instead of deriving a 10 mm figure. |
| consumption / #25 | около 2,0 кг/м² на 1 мм | около 2,0 кг/м² на 1 мм толщины слоя | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS table, consumption of dry CN 83 per 1 mm layer. | Source-backed mapping. |
| water_requirement / #18 | 3,0–3,2 л на 25 кг | 3,0–3,2 л на 25 кг сухой смеси | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS table; do not substitute the Ukrainian document's different range. | Source-backed mapping. |
| pot_life / #19 | около 30 минут | — | NEEDS_MAPPING | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS table: time of use. | RU TDS says about 30 minutes, but the canonical definition is a scalar number of hours and cannot preserve the approximation qualifier. |
| application_temperature / #10 | от +5 до +30 °C | от +5 до +30 °C | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS: application temperature. | Source-backed mapping. |
| compressive_strength / #20 | не менее 13 (1 сутки); не менее 36 (28 суток) МПа | — | NEEDS_MAPPING | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS technical table. | RU TDS has separate minimum values for 1 day and 28 days (13 MPa and 36 MPa); the numeric definition cannot preserve both age qualifiers. |
| adhesion / #21 | не менее 1,0 через 28 суток* МПа | — | NEEDS_MAPPING | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS technical table; *when using CC 81 adhesion layer. | RU TDS gives a minimum 1.0 MPa at 28 days, with a footnote requiring a CC 81 adhesion layer; scalar definition would lose both qualifiers. |
| frost_resistance / #22 | F300 (затвердевший раствор); Fкз100 (контактная зона) | F300 (затвердевший раствор); Fкз100 (контактная зона) | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS separates hardened mortar and contact-zone frost resistance. | Source-backed mapping. |
| shelf_life / #11 | 12 месяцев | 12 (месяцев) | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS: up to 12 months from manufacture in intact packaging, dry storage. | Source-backed mapping. |
| standard / #23 | — | — | NOT_AVAILABLE | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): The reviewed Russian TDS extract does not provide a sufficiently clear standard mapping for a canonical value. | The reviewed Russian TDS extract does not provide a sufficiently clear standard mapping for a canonical value. |
| mortar_grade / #12 | — | — | NOT_AVAILABLE | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): No separate mortar-grade value is used; classification codes are not mapped into mortar_grade. | No separate mortar-grade value is used; classification codes are not mapped into mortar_grade. |
| walkability / #24 | 6 часов | через 6 часов | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS: technological passage after 6 hours. | Source-backed mapping. |
| flexural_strength / #26 | не менее 2,5 МПа (1 сутки); не менее 5,0 МПа (28 суток) | не менее 2,5 МПа (1 сутки); не менее 5,0 МПа (28 суток) | WILL_ADD | [CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS](https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-): RU TDS gives separate minimum values by age; text type preserves both qualifiers. | Source-backed mapping. |

#### MAT-000118 — Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг

Identity: Exact PRO CRT-40, 25 kg, article О00010269/EAN 4607009095967. CRT-40 AF is a separate product (article О00014105) and is excluded.

| Canonical key | Source value/unit | Proposed value | Dry-run | Source/context | Decision/reason |
|---|---|---|---|---|---|
| brand / #1 | GLIMS | GLIMS | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official product name. | Source-backed mapping. |
| product_type / #2 | Ремонтная тиксотропная смесь класса R3 | Ремонтная тиксотропная смесь класса R3 | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official product page classification. | Source-backed mapping. |
| base / #3 | Цементное вяжущее, фракционированный песок, минеральные наполнители и химические добавки; полимерная фибра | Цементное вяжущее, фракционированный песок, минеральные наполнители и химические добавки; полимерная фибра | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official product page composition; phrasing follows manufacturer list. | Source-backed mapping. |
| purpose / #4 | Конструкционный ремонт бетонных и железобетонных конструкций | Конструкционный ремонт бетонных и железобетонных конструкций | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page scope and stated use. | Source-backed mapping. |
| package_weight / #5 | 25 кг | 25 (кг) | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official product page shows 25 kg; exact product page and EAN match the local model. | Source-backed mapping. |
| application_area / #13 | Внутренние и наружные работы | Внутренние и наружные работы | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page explicitly states indoor and outdoor use. | Source-backed mapping. |
| application_method / #14 | Ручное нанесение шпателем | Ручное нанесение шпателем | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official application instructions say to fill defects and level with a spatula; no machine application inferred. | Source-backed mapping. |
| substrates / #15 | Бетон, железобетон и другие минеральные основания | Бетон, железобетон и другие минеральные основания | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page application substrates. | Source-backed mapping. |
| color / #16 | Серый | Серый | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics table. | Source-backed mapping. |
| layer_thickness / #17 | 10–40 мм | 10–40 мм | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page layer range. | Source-backed mapping. |
| consumption_10mm / #6 | — | — | NOT_AVAILABLE | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): The official source states consumption per 1 mm; no derived 10 mm number is written. | The official source states consumption per 1 mm; no derived 10 mm number is written. |
| consumption / #25 | 1,8 кг/м² на 1 мм | 1,8 кг/м² на каждый 1 мм слоя | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics table gives 1.8 kg/m² at 1 mm. | Source-backed mapping. |
| water_requirement / #18 | 0,16–0,17; 4,0–4,25 л/кг; л на 25 кг | 0,16–0,17 л/кг (4,0–4,25 л на 25 кг) | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page states both normalized per kg and exact 25 kg bag range. | Source-backed mapping. |
| pot_life / #19 | не менее 30 минут | — | NEEDS_MAPPING | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics and application instructions. | Official source says at least 30 minutes; a numeric hour field cannot retain the lower-bound qualifier. |
| application_temperature / #10 | от +5 до +35 °C | от +5 до +35 °C | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page: substrate and air temperature during application and curing. | Source-backed mapping. |
| compressive_strength / #20 | не менее 15 (1 сутки); не менее 40 (28 суток) МПа | — | NEEDS_MAPPING | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics table. | Official page gives separate minimum values after 1 day and 28 days (15 MPa and 40 MPa); numeric definition cannot preserve age qualifiers. |
| adhesion / #21 | не менее 1,5 МПа | — | NEEDS_MAPPING | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics table. | Official source says adhesion is at least 1.5 MPa; numeric definition cannot preserve the threshold qualifier. |
| frost_resistance / #22 | F2 300 | F2 300 | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page's exact typography for frost resistance: F2 300. | Source-backed mapping. |
| shelf_life / #11 | 12 месяцев | 12 (месяцев) | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official page: 12 months in intact factory packaging under stated dry-storage conditions. | Source-backed mapping. |
| standard / #23 | ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2 | ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2 | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official product page normative section. | Source-backed mapping. |
| mortar_grade / #12 | — | — | NOT_AVAILABLE | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): No mortar-grade value is stated; B20 substrate qualification is not a mortar grade and is not mapped here. | No mortar-grade value is stated; B20 substrate qualification is not a mortar grade and is not mapped here. |
| walkability / #24 | — | — | NOT_AVAILABLE | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): No walkability time is provided by the reviewed official source. | No walkability time is provided by the reviewed official source. |
| flexural_strength / #26 | не менее 8 МПа | не менее 8 МПа | WILL_ADD | [GLIMS PRO CRT-40 — ремонтная смесь класса R3](https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/): Official characteristics table; text definition preserves the minimum qualifier. | Source-backed mapping. |

The B20 minimum concrete-substrate suitability condition is not treated as product compressive strength or mortar grade. CRT-40 AF (article О00014105) is a different SKU and is not used.

### Evidence caveats

- MAT-000109: the official Русеан page says 18–19 kg/m² at 10 mm in its prose but 19 in its table; it says F50 in the description and F35 in its table. Neither disputed value is proposed.
- MAT-000117: only the Russian CERESIT_CN 83_11.2020 TDS text and RU catalogue were used. Henkel DAM's indexed official result exposes the technical table, while a direct fetch of that URL returned 404 during this check. The Ukrainian CN 83 TDS has different values and is explicitly excluded.
- MAT-000118: exact official GLIMS PRO CRT-40 25 kg/EAN 4607009095967; the earlier identity audit records article О00010269. The official page identifies CRT-40 AF separately as article О00014105.

### Validation and write boundary

- Definitions created: 0; template memberships created: 0.
- Writable product field: `products.brand` only; attribute writes, if later separately authorized, are limited to the listed existing canonical definitions and exact three-MAT allowlist.
- No title, slug, descriptions, SEO, price, weight, unit, category, stock, image, image binding, definition or template changes are permitted by this task.
- Original local DB schema v4 SHA-256 before/after: `77c7d13dc6898e20f8b08af955f44b21d523bdc53e649ba8d1dd5a20093add33`.
- Production and deploy were not used. No apply was run on the disposable v11 copy.

- Existing template-management regression `test-backfill-attribute-templates-closed-subcategories.js`: FAIL before DB work. This is not safe to classify as a stale number alone: the shared canonical dataset now contains six structures (72 regular tuples), while the backfill, its test, and bootstrap retain an exact five-structure allowlist. No expected count was changed; the shared canonical-consumer contract must be resolved before any template or core apply rehearsal.

## Template reconciliation and apply gate — 2026-10-02

### Reconciliation result: PASS — consumer contracts aligned

The shared canonical dataset remains unchanged and is the single source of truth: six structures (IDs 2, 4, 5, 7, 8, 10), 72 regular memberships and four main memberships per structure, for 96 total memberships. No definitions or canonical membership tuples were added, removed or reordered.

The closed-subcategories backfill now has an explicit five-structure scope: IDs **2, 4, 5, 7, 8** only. It filters the six-structure canonical source by those IDs, verifies the corresponding names and retains exactly 53 regular memberships. On schema v11 it also requires the four resolver main fields in the `main` section at sort positions 0–3 for each scoped structure. Those 20 rows are included in the plan/state guard and are never written. Structure 10 is excluded from this backfill. A section-less schema-v4 fixture remains supported for local compatibility checks.

The shared `bootstrap-attribute-templates.js` is a global canonical bootstrap: its name, full-canonical iteration, migration-v11 section handling and absence of narrower call sites establish that it should process all six current structures. It now validates unique structure IDs/names and membership tuples, exact resolver main ordering, no main/regular overlap and deterministic per-section ordering. Its expected set is derived from the canonical contents: 72 regular + 24 main = **96**. It does not use a fixed historical category count.

The closed-subcategories synthetic test verifies exact IDs, all 53 regular memberships, 20 preserved v11 main memberships, sections/order, no mutation of Hydro structure 10, dry-run immutability, rollback/idempotency and the legacy v4 shape. The global bootstrap test verifies all six structures, all 96 exact unique memberships, main/regular ordering and section semantics. The Hydroisolation synthetic suite passes; its structure 10 remains present in its intended flow.

No template membership data was changed as part of this reconciliation. No production template apply was run.

### Core status labels

The three confirmed products remain `IDENTITY_CONFIRMED`; `PARTIAL` describes only incomplete core attribute coverage. The batch report now emits separate `identityStatus` and `coreCoverageStatus` fields (`IDENTITY_CONFIRMED` + `CORE_PARTIAL`); the old `status: PARTIAL` is retained as a compatibility alias. A failed exact identity guard reports `IDENTITY_GUARD_BLOCKED` and `coreCoverageStatus: NOT_EVALUATED`.

### Apply gate and disposable rehearsal

After the template consumer suite passed, a **new disposable database** was created from the original schema-v4 snapshot using SQLite online backup, then migrated with the project migration function v4→v11. The copy passed `integrity_check=ok` and had zero foreign-key violations. The original `backend/database/matmix.db` was not migrated or written.

Pre-apply dry-run on the disposable copy, exact batch MAT-000109, MAT-000117, MAT-000118:

- total 3; logical slots 69;
- READY source fields / willAdd 51;
- sourceConflict 2; needsMapping 7; notAvailable 9;
- schema/value/brand/title blockers 0; errors 0;
- definitionsToCreate 0; templateMembershipChanges 0.

The explicitly authorized guarded apply ran **only on that disposable copy**. It made 54 writes: 51 attribute-value inserts (including three brand attribute values) and three `products.brand` updates. No definition, template or image rows changed. The runner created and verified a backup before its transaction and passed immutable-field postchecks.

Second dry-run: willAdd 0, existingOk 51, the same 2 source conflicts / 7 mapping gaps / 9 absent values, blockers 0 and errors 0. All three product brands and all READY attributes are now EXISTING_OK in the disposable copy. This is an idempotent rehearsal, not production readiness.

Disposable DB: `C:/Users/Aladd/AppData/Local/Temp/matmix-sand-cement-final-v11-umXc0B/matmix-disposable-v11.db`.

Original DB SHA-256 before and after all tests/rehearsal: `77c7d13dc6898e20f8b08af955f44b21d523bdc53e649ba8d1dd5a20093add33` (unchanged). Production was not accessed.

### Follow-up verification

- PASS: `node --check` for both template consumers and both corresponding tests.
- PASS: `test-backfill-attribute-templates-closed-subcategories.js` — explicit five-structure scope, exact 53 regular memberships, v11 main tuple checks, v4 compatibility, Hydro exclusion, dry-run immutability, rollback and idempotency.
- PASS: `test-bootstrap-attribute-templates.js` — six canonical structures, 72 regular + 24 main = 96, exact sections/order and unique tuples.
- PASS: Hydroisolation regression suite (shared H1/H2/H3 synthetic groups plus its template-bootstrap checks).
- PASS: section-aware attribute-order and template-management UI regressions.
- PASS: sand/cement/repair core synthetic test; product-content; product-page foundation; masonry core and title tests; floor-mix core and title tests.
- PASS: fresh disposable schema-v11 preflight/apply/second dry-run; no blockers/errors; the second dry-run planned zero writes.
- PASS: `git diff --check`.
- Original local database remains schema v4; its file SHA-256 is unchanged. No production DB, SSH or deployment was used.

Final markers:

```text
TEMPLATE_MEMBERSHIP_SOURCE_OF_TRUTH_RECONCILED = true
ATTRIBUTE_TEMPLATE_CONSUMER_SCOPES_EXPLICIT = true
ATTRIBUTE_TEMPLATE_REGRESSION_SUITE_PASS = true
HYDROISOLATION_TEMPLATE_REGRESSION_PASS = true
SAND_CONCRETE_CEMENT_REPAIR_DISPOSABLE_APPLY_PASS = true
SAND_CONCRETE_CEMENT_REPAIR_IDEMPOTENCY_PASS = true
SAND_CONCRETE_CEMENT_REPAIR_READY_FOR_COMMIT_REVIEW = true
SAND_CONCRETE_CEMENT_REPAIR_READY_FOR_PRODUCTION = false
PRODUCTION_TOUCHED = false
ORIGINAL_LOCAL_DB_MUTATED = false
```
