# Кладочные смеси — Stage 1 discovery review

Дата аудита: 2026-09-24. Объём: только MAT-000067, MAT-000068 и MAT-000069.

## Safety boundary

Это read-only аудит. Production, production DB, deploy, apply, импорт изображений, titles, slugs, descriptions, SEO и attribute definitions/templates не изменялись. Локальная БД использовалась только для чтения.

## Local state

| MAT | Current title | brand column | weight/unit | category / subcategory | content | attrs | image_url |
|---|---|---:|---:|---|---|---:|---|
| MAT-000067 | Кладочно - монтажная смесь цементная Евро М-200 40кг | `NULL` | 40 / шт | Смеси / Кладочные Смеси | empty | 0 | `/uploads/products/MAT-000001-20260714153714969-3fb7fe.png` |
| MAT-000068 | Кладочно - монтажная смесь цементная Русеан М-200 40кг | `NULL` | 40 / шт | Смеси / Кладочные Смеси | empty | 0 | same MAT-000001 placeholder |
| MAT-000069 | Кладочно - монтажная смесь цементная Вертекс М-200 40кг | `NULL` | 40 / шт | Смеси / Кладочные Смеси | empty | 0 | same MAT-000001 placeholder |

У трёх строк нет записей `product_images`. Локальный `image_url` одинаков для всех и потому не считается exact image. Это только диагностическая фиксация; изображения не трогались.

## Identity and source review

### MAT-000067 — EUROMIX / EUROmix M-200, 40 кг

- Владелец номенклатуры подтвердил exact identity: **EUROMIX**, **EUROmix M-200**, цементная сухая монтажно-кладочная смесь, **40 кг**.
- Предложенный title correction: `Кладочно-монтажная смесь EUROmix М-200 40 кг`.
- Exact 40 kg Euromix listing есть у [Bobrёнок](https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/) и в каталоге [Для прораба](https://dlyaproraba.ru/), но это вторичные источники. Официальный RU производственный TDS для exact SKU в этом проходе не найден.
- В core безопасно считать подтверждёнными только owner identity и фасовку. Технические параметры (состав, основания, расход, вода, температура, жизнеспособность, прочность, морозостойкость и т. п.) остаются `NEEDS_SOURCE`.
- Статус: **CONFIRMED_OWNER_IDENTITY_PARTIAL_PRIMARY_SOURCE / PARTIAL**.
- Изображение: **IMAGE_PARTIAL**. Secondary listing не даёт достаточного доказательства чистого exact 40 kg packshot для импорта.

### MAT-000068 — Русеан М-200, 40 кг

- [Официальная страница Русеан](https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/) прямо называет `Сухая смесь М-200 монтажно-кладочная, 40 кг`, а официальный [прайс-лист](https://rusean.ru/pricelist/) повторяет exact product/pack.
- Primary facts on the page: Portland cement + dry fractionated sand up to 2.5 mm; masonry of brick and concrete blocks; paving; repairs and joint/crack/void filling; fixing metal elements; inside/outside; manual application; water 4.4–5.6 l per 40 kg; pot life 1 h; consumption 19.5 kg/m² at 10 mm; storage 6 months; grey; layer 10–30 mm; adhesion 0.4 MPa at 28 days; +5…+25 °C; F35; compressive strength 23 MPa; GOST 31357-2007 / Пк-2, В15, F35.
- Статус: **CONFIRMED_PRIMARY / READY_FOR_CORE_REVIEW**. Это не apply-ready: сначала нужен отдельный approved core implementation.
- Изображение: **IMAGE_CONFIRMED_CANDIDATE** по exact official product page, но direct asset URL, dimensions, watermark and white-background QA ещё не проверены.

### MAT-000069 — VERTEX М-200, 40 кг

- На [официальном сайте VERTEX.production](https://vertexproduction.ru/) ООО «Вертекс Продакшн» указано как производитель сухих смесей. В разделе `М-200` прямо указаны: сухая монтажно-кладочная смесь на основе цемента и специальных добавок, фасовка 40 кг, наружные и внутренние работы, кладка кирпича, монтаж бетонных блоков, плитка/брусчатка, стяжки, ремонт и заделка дефектов, крепление металлических элементов.
- Эти данные подтверждают identity и общий scope, но страница не подтверждает ручное/машинное нанесение, цвет, расход, воду, слой, жизнеспособность, температуру, прочность, адгезию, морозостойкость или срок хранения. `M-200` не переводится автоматически в MPa.
- Статус: **CONFIRMED_PRIMARY_LIMITED_TECHNICAL_DATA / PARTIAL**.
- Изображение: **IMAGE_PARTIAL** — exact product page found, но clean direct asset и visual package proof не извлечены.

## Title / brand audit

Все текущие title сохраняются до отдельного решения. Рекомендуемые кандидаты:

| MAT | Current title | Recommended candidate | Action now |
|---|---|---|---|
| 067 | Кладочно - монтажная смесь цементная Евро М-200 40кг | Кладочно-монтажная смесь EUROmix М-200 40 кг | review only |
| 068 | Кладочно - монтажная смесь цементная Русеан М-200 40кг | Кладочно-монтажная смесь Русеан М-200 40 кг | review only |
| 069 | Кладочно - монтажная смесь цементная Вертекс М-200 40кг | Кладочно-монтажная смесь VERTEX М-200 40 кг | review only |

`products.brand` у всех трёх сейчас `NULL`; attribute brand также отсутствует. Рекомендуется синхронно заполнить brand только после отдельного guarded core batch: `EUROMIX`, `Русеан`, `VERTEX`. В этом Stage 1 ничего не менялось. `Смеси / Кладочные Смеси` — текущая локальная классификация; первичные страницы используют более общий раздел сухих смесей и позиционирование «кладочная», но автоматическая смена category/subcategory не рекомендуется.

## Fact matrix

| MAT | READY | NEEDS_SOURCE | CONFLICT | ABSENT_BY_DESIGN |
|---|---|---|---|---|
| 067 | brand=EUROMIX, package_weight=40 кг (owner identity) | product type as publishable technical fact, base, purpose, area, method, substrates, color, layer, consumption, water, pot life, temperature, strength, adhesion, frost, shelf life, standard | none | none established |
| 068 | brand, product type, base, purpose, 40 кг, area, manual, substrates, color, layer 10–30 мм, consumption 19.5, water 4.4–5.6 л/40 кг, pot life 1 ч, temp +5…+25 °C, strength 23 MPa, adhesion 0.4 MPa, F35, shelf 6 мес., GOST | direct image dimensions/watermark; any field not listed as READY | none | none established |
| 069 | brand=VERTEX, product type, cement base, purpose, 40 кг, area, substrates | method, color, layer, consumption, water, pot life, temperature, strength, adhesion, frost, shelf, standard | none | none established |

## Reusable core schema proposal

Local DB has **11 definitions** and **0 template rows**. Reuse `brand`, `product_type`, `base`, `purpose`, `package_weight`, `application_temperature`, and `shelf_life`. Reuse numeric `consumption_10mm` only when the exact source gives one numeric value with that exact basis; do not force ranges or qualifiers into it. Existing plaster-only `coverage_30kg_10mm`, `wall_layer_thickness`, and `ceiling_layer_thickness` are not applicable here.

Recommended new definitions for a later reviewed batch: `application_area`, `application_method`, `substrates`, `color`, `layer_thickness` (text), `water_requirement` (text), `pot_life` (number/text), `compressive_strength` (text), `adhesion` (text), `frost_resistance` (text), `standard` (text), and `mortar_grade` (text). No definition or template is created in Stage 1.

## Exact image research

| MAT | Candidate | Status | Reason |
|---|---|---|---|
| 067 | Bobrёнок exact Euromix M-200 40 kg listing | IMAGE_PARTIAL | secondary context; direct clean asset/visual identity not verified |
| 068 | Rusean official exact product page | IMAGE_CONFIRMED_CANDIDATE | exact page/product context; direct asset and image QA pending |
| 069 | VERTEX official M-200 page section | IMAGE_PARTIAL | exact product context; direct clean asset/visual identity not verified |

No image is ready for import. No marketplace or lookalike image is accepted as a substitute.

## Next batch recommendation

Prepare a separate guarded core batch only after review. Lead with MAT-000068 primary facts. Add MAT-000069 with only the limited primary facts. Keep MAT-000067 technical fields blocked until an official EUROMIX/RU TDS, catalog, or manufacturer page identifies the exact M-200/40 kg product. Keep all image work separate and require direct-source dimensions, watermark check, exact pack proof, and importer preview QA.

## Final safety confirmation

- Production and production DB: untouched.
- Titles, slugs, descriptions, SEO, attributes, templates, images and imports: untouched.
- Files created: this Markdown review and the matching JSON review only.
- Tests: JSON parse and `git diff --check` run after creation.
