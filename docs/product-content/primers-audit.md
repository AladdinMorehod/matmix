# MatMix — audit категории «Грунтовки»

Дата аудита: 18.09.2026. Inventory взят из локальной `backend/database/matmix.db`; локальная БД не используется как production truth. Production, БД, titles, slugs и images не изменялись.

## A. Category

В БД найдены два активных сегмента:

1. `Грунт / БетонКонтакт` → `Грунтовка` (`CAT-000002` → `SUB-000029`), 18 товаров.
2. `ЛакоКрасочные` → `Грунты` (`CAT-000004` → `SUB-000032`), 2 товара.

## B. Inventory

Всего активных товаров: **20**. Список: `MAT-000227 … MAT-000244` и `MAT-000259 … MAT-000260`.

| MAT | Product ID | Current exact title | Slug | DB weight |
|---|---:|---|---|---:|
| MAT-000227 | 198 | Грунтовка Knauf Тифенгрунд 5 л | `грунтовка-knauf-тифенгрунд-5-л` | 5 |
| MAT-000228 | 199 | Грунтовка Knauf Тифенгрунд 10 л | `грунтовка-knauf-тифенгрунд-10-л` | 10 |
| MAT-000229 | 200 | Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л | `грунтовка-knauf-тифенгрунд-морозостойкая-до-40-10-л` | 10 |
| MAT-000230 | 201 | Грунтовка Knauf Мульти Грунд универсальный 10 л | `грунтовка-knauf-мульти-грунд-универсальный-10-л` | 10 |
| MAT-000231 | 202 | Грунтовка Ceresit CT-17 PRO, 5л | `грунтовка-ceresit-ct-17-pro-5л` | 5 |
| MAT-000232 | 203 | Грунтовка Ceresit CT-17 PRO, 10л | `грунтовка-ceresit-ct-17-pro-10л` | 10 |
| MAT-000233 | 204 | Грунтовка Ceresit CT16 под декоративную штукатурку 10 л | `грунтовка-ceresit-ct16-под-декоративную-штукатурку-10-л` | 10 |
| MAT-000234 | 205 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | `грунт-litokol-primer-a-универсальный-укрепляющий-10-л` | 10 |
| MAT-000235 | 206 | Грунтовка Старатели универсальная 10 л | `грунтовка-старатели-универсальная-10-л` | 10 |
| MAT-000236 | 207 | Грунтовка UNIS глубокого проникновения укрепляющий 10 л | `грунтовка-unis-глубокого-проникновения-укрепляющий-10-л` | 10 |
| MAT-000237 | 208 | Грунтовка Oscar глубокого проникновения 10 л | `грунтовка-oscar-глубокого-проникновения-10-л` | 10 |
| MAT-000238 | 209 | Грунтовка Акрил 5 л | `грунтовка-акрил-5-л` | 5 |
| MAT-000239 | 210 | Грунтовка Акрил 10 л | `грунтовка-акрил-10-л` | 10 |
| MAT-000240 | 211 | Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л | `грунтовка-knauf-миттельгрунд-для-впитывающих-оснований-концентрат-10-л` | 10 |
| MAT-000241 | 212 | Грунт Tikkurila Euro Primer концентрат 0,9 л | `грунт-tikkurila-euro-primer-концентрат-0-9-л` | 1 |
| MAT-000242 | 213 | Грунт Tikkurila Euro Primer концентрат 3 л | `грунт-tikkurila-euro-primer-концентрат-3-л` | 3 |
| MAT-000243 | 214 | Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг | `грунт-адгезионный-forbo-eurocol-044-концентрат-1-2-10-кг` | 3 |
| MAT-000244 | 215 | Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг | `грунтовка-forbo-041-europrimer-ec-для-укладки-токопроводящих-и-антистатических-покрытий-10-кг` | 3 |
| MAT-000259 | 225 | Грунт ГФ-021 по металлу и дереву серый 0,8 кг | `грунт-гф-021-по-металлу-и-дереву-серый-0-8-кг` | 1 |
| MAT-000260 | 226 | Грунт по металлу серый 1 л | `грунт-по-металлу-серый-1-л` | 1 |

## C. Current state

| Metric | Count |
|---|---:|
| TOTAL_PRODUCTS | 20 |
| CORE_EMPTY | 20 |
| CORE_PARTIAL | 0 |
| CORE_FILLED | 0 |
| DESCRIPTION_EMPTY | 20 |
| SEO_EMPTY | 20 |
| IMAGE_PLACEHOLDER | 20 |
| IMAGE_REAL | 0 |
| IMAGE_PROTECTED | 0 |

Все 20 локальных `image_url` указывают на один shared placeholder `/uploads/products/MAT-000001-20260714153714969-3fb7fe.png`. У всех `gallery_count=0`. Это только local DB state.

## D. Schema audit

Существующие definitions: `brand`, `product_type`, `base`, `purpose`, `package_weight`, `consumption_10mm`, `coverage_30kg_10mm`, `wall_layer_thickness`, `ceiling_layer_thickness`, `application_temperature`, `shelf_life`.

Переиспользовать безопасно: `brand`, `product_type`, `base`, `purpose`, `shelf_life`. `package_weight` не заменяет объём: official sources для грунтовок часто различают кг и л.

`consumption_10mm`, `coverage_30kg_10mm` и толщины слоя относятся к штукатуркам и для грунтовок не подходят.

Предложены, но **не создавались**: `package_volume`, `primer_type`, `application_area`, `application_method`, `substrates`, `consumption` (TEXT), `drying_time` (TEXT), `dilution_ratio` (TEXT), `concentrate` (BOOLEAN). Перед созданием нужно проверить весь каталог на семантические дубли.

## E. Source coverage

### FULLY_SOURCED — 13

MAT-000227, MAT-000228, MAT-000230, MAT-000231, MAT-000232, MAT-000233, MAT-000235, MAT-000236, MAT-000240, MAT-000241, MAT-000242, MAT-000243, MAT-000244.

### PARTIALLY_SOURCED — 3

- MAT-000229: official KNAUF page подтверждает Тифенгрунд и optional морозостойкость, но не отдельный exact SKU «до -40, 10 л».
- MAT-000234: official LITOKOL page подтверждает Primer A, но указывает упаковку 10 кг, тогда как local title содержит 10 л.
- MAT-000237: brand support подтверждает Oscar G os-10kg, но local title содержит 10 л.

### IDENTITY_BLOCKED — 4

MAT-000238, MAT-000239 — generic «Акрил» без производителя; MAT-000259 — generic GF-021 без изготовителя; MAT-000260 — generic серый грунт по металлу без бренда/модели.

## F. Title discrepancies

Titles read-only; автоматических изменений нет.

| MAT | Status | Issue |
|---|---|---|
| MAT-000227 | MINOR_NAMING_DIFFERENCE | Local 5 л; official KNAUF page exposes 5 kg. |
| MAT-000228 | MINOR_NAMING_DIFFERENCE | Local 10 л; official KNAUF page exposes 10 kg. |
| MAT-000229 | POSSIBLE_ERROR | Separate frost-resistant «до -40» SKU не идентифицирован. |
| MAT-000230 | MINOR_NAMING_DIFFERENCE | Official «Мультигрунд»; local «Мульти Грунд», плюс l/kg discrepancy. |
| MAT-000234 | POSSIBLE_ERROR | Official LITOKOL: 10 кг; local title: 10 л. |
| MAT-000237 | POSSIBLE_ERROR | Brand support: G os-10kg; local title: 10 л. |
| MAT-000240 | MINOR_NAMING_DIFFERENCE | Official «Миттельгрунд», local descriptive wording and l/kg discrepancy. |
| MAT-000243 | MATCH / inventory discrepancy | Title/source 10 кг; local `products.weight=3`. |
| MAT-000244 | MATCH / inventory discrepancy | Title/source 10 кг; local `products.weight=3`. |

## G. Photo coverage

Local DB has no real image for any of the 20 products and no protected product in scope.

- `READY_SOURCE` — MAT-000227, 228, 230, 231, 232, 233, 234, 235, 240, 241, 242, 243, 244 (13).
- `READY_SOURCE_SECONDARY` — MAT-000236, MAT-000237 (2).
- `VARIANT_UNCLEAR` — MAT-000229, 238, 239, 259, 260 (5).
- `LOW_QUALITY=0`, `WRONG_VARIANT=0`, `NOT_FOUND=0`, `PROTECTED_EXISTING_REAL=0`.

`READY_SOURCE` означает найденный exact candidate, но dimensions/watermark byte-level check ещё не выполнялся. Ни один файл не скачивался и не готовился к импорту.

## H. Proposed batches

### CORE batch 1 — exact, low-risk identities

MAT-000227, 228, 230, 231, 232, 233, 235, 236, 240, 241, 242.

### CORE batch 2 — unit/inventory review

MAT-000234, 237. Перед записью разрешить kg/l semantics. Exact current title использовать как guard.

MAT-000243 и MAT-000244 имеют подтверждённую identity и официальную фасовку 10 кг, но локальное `products.weight=3` остаётся отдельным inventory discrepancy. Поле weight не изменялось и не должно использоваться как источник identity.

### Identity resolution batch

MAT-000229, 238, 239, 259, 260.

## J. Resolution pass

Итог отдельного read-only прохода: `IDENTITY_RESOLVED=2` (`MAT-000243`, `MAT-000244`), `PARTIALLY_RESOLVED=2` (`MAT-000234`, `MAT-000237`), `IDENTITY_BLOCKED=5` (`MAT-000229`, `MAT-000238`, `MAT-000239`, `MAT-000259`, `MAT-000260`).

- `MAT-000234`: LITOKOL Primer A подтверждён официальной страницей, но официальный источник указывает 10 кг, а local title — 10 л; unit guard остаётся открытым.
- `MAT-000237`: Oscar G os-10kg подтверждён brand support, но официальный package unit 10 кг конфликтует с local title 10 л.
- `MAT-000243`: Forbo Eurocol 044 и 10 кг подтверждены официальной страницей; `products.weight=3` классифицировано как stale/corrupted inventory discrepancy, без изменения поля.
- `MAT-000244`: Forbo Eurocol 041 и 10 кг подтверждены официальной страницей; `products.weight=3` классифицировано как stale/corrupted inventory discrepancy, без изменения поля.
- `MAT-000229`: семейство KNAUF Tiefengrund подтверждено, но отдельный exact SKU «морозостойкая до -40» не найден.
- `MAT-000238`, `MAT-000239`, `MAT-000259`, `MAT-000260`: локальные title/slug/category и исторические файлы не дали производителя или модели; технические значения и изображения заблокированы.

Полная таблица: [primers-resolution-review.md](C:/Users/Aladd/Desktop/MatMix/docs/product-content/primers-resolution-review.md), [primers-resolution-review.json](C:/Users/Aladd/Desktop/MatMix/docs/product-content/primers-resolution-review.json).

### Later phases

1. Schema decision и primer-specific core corrective с write-only-empty поведением.
2. Full descriptions из тех же source facts.
3. SEO metadata.
4. Dedicated photo source download/normalization/import batch.

## I. Next action

Начать с review и отдельного approval для CORE batch 1. Первый corrective script должен проверять exact `external_id + current title + category/subcategory`, писать только разрешённые core fields и не менять title, slug, price или image. `MAT-000229`, `MAT-000234`, `MAT-000237`, `MAT-000238`, `MAT-000239`, `MAT-000259` и `MAT-000260` не включать в write batch до снятия причин; `MAT-000243` и `MAT-000244` можно рассматривать отдельно от inventory correction.

Полные per-MAT canonical facts, URLs, photo candidates и statuses находятся в [primers-audit.json](C:/Users/Aladd/Desktop/MatMix/docs/product-content/primers-audit.json). Source registry находится в [primers-sources.md](C:/Users/Aladd/Desktop/MatMix/docs/product-content/primers-sources.md) и [primers-sources.json](C:/Users/Aladd/Desktop/MatMix/docs/product-content/primers-sources.json).
