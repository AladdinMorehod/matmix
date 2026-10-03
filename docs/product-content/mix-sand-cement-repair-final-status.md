# Пескобетон, цемент и ремонтные смеси — итоговый статус

## Live read-only verification

Проверка выполнена 2026-10-03 в 11:53 UTC через SSH alias `matmix-prod` на `matmix-prod-01` (UTC timestamp завершения проверки: `2026-10-03T11:53:45Z`). SQLite открыта от systemd service user `matmix` через URI `mode=ro`, с `PRAGMA query_only=ON`. Batch runner не запускался.

- Active release: `/opt/matmix/releases/85ea2834`; `/opt/matmix/app` разрешается в этот release, process cwd совпадает; `matmix.service` — `active/running`.
- DB: `/var/lib/matmix/matmix.db`; `user_version=11`, `integrity_check=ok`, `foreign_key_check=0`.
- Target products 109/117/118: title, category/subcategory, active/deleted state и brand совпали с guarded identities/dataset.
- READY tuples: **51/51 MATCH** по attribute code, storage value и effective unit; `MISSING=0`, value/unit mismatch `=0`, duplicate `=0`, additional attribute rows `=0`.
- Для всех документированных `SOURCE_CONFLICT`, `NEEDS_MAPPING`, `NOT_AVAILABLE` слотов production rows не обнаружены.
- Definitions текущего production состояния содержат ожидаемые canonical codes/types/units. Templates: total 96 (`main=24`, `regular=72`); у structures 11/12/13 memberships сейчас нет.
- Для всех трёх target products `short_description`, `full_description`, `seo_title`, `seo_description` равны NULL. Все три `product_images` указывают на общий `/uploads/products/MAT-000001-20260714153714969-3fb7fe.png`; файл существует, PNG 1254×1254. Это shared placeholder, не подтверждённое фото продукта.

**Ограничение исторических выводов:** текущий production snapshot подтверждает текущее содержимое, но сам по себе не доказывает, когда и каким процессом появились строки, какие записи были сделаны транзакцией apply, и что definitions/templates/images/unrelated products исторически не менялись. Для этих утверждений нужны сохранённые before/after snapshots или audit log; в репозитории они не найдены. Поэтому прежние утверждения `ATTRIBUTE_ROWS_INSERTED=51`, `PRODUCT_BRAND_UPDATES=3`, historical non-target unchanged и прежний runner idempotency output не считаются доказанными историческими фактами. Независимый SELECT-сравнитель подтверждает эквивалентное текущее состояние: 51 из 51 ожидаемых values уже присутствуют и совпадают.

## Итоговая таблица

| MAT | Подкатегория | Identity | Характеристики | Live production | Description / SEO / image |
|---|---|---|---|---|---|
| MAT-000109 | Пескобетон | IDENTITY_CONFIRMED | 18/18 READY совпали; gaps: 2 SOURCE_CONFLICT, 1 NEEDS_MAPPING, 2 NOT_AVAILABLE | Текущие значения и brand `Русеан` совпали; исторический apply delta не установлен | Description/SEO отсутствуют; общий placeholder |
| MAT-000117 | Смесь Ремонтная | IDENTITY_CONFIRMED | 16/16 READY совпали; gaps: 3 NEEDS_MAPPING, 4 NOT_AVAILABLE | Текущие значения и brand `Ceresit` совпали; исторический apply delta не установлен | Description/SEO отсутствуют; общий placeholder |
| MAT-000118 | Смесь Ремонтная | IDENTITY_CONFIRMED | 17/17 READY совпали; gaps: 3 NEEDS_MAPPING, 3 NOT_AVAILABLE | Текущие значения и brand `GLIMS` совпали; исторический apply delta не установлен | Description/SEO отсутствуют; общий placeholder |
| MAT-000110 | Пескобетон | OWNER_CONFIRMED | В этом batch не заполнялись; технические значения не выводятся из identity | В текущей live проверке не инспектировался; предыдущий отчёт заявляет UNTOUCHED | Требуются отдельные identity-grounded content/image stages |
| MAT-000111 | Пескобетон | OWNER_CONFIRMED | В этом batch не заполнялись; технические значения не выводятся из identity | В текущей live проверке не инспектировался; предыдущий отчёт заявляет UNTOUCHED | Требуются отдельные identity-grounded content/image stages |
| MAT-000113 | Цемент | PARTIAL | Не заполнялись | Не инспектировался live в этой проверке; предыдущий отчёт заявляет UNTOUCHED | Identity evidence, descriptions, SEO и image review остаются |
| MAT-000114 | Цемент | BLOCKED | Не заполнялись | Не инспектировался live в этой проверке; предыдущий отчёт заявляет UNTOUCHED | Identity evidence, descriptions, SEO и image review остаются |
| MAT-000115 | Цемент | PARTIAL | Не заполнялись | Не инспектировался live в этой проверке; предыдущий отчёт заявляет UNTOUCHED | Identity evidence, descriptions, SEO и image review остаются |

### Матрица gap-слотов production (текущий снимок)

- MAT-000109: `consumption_10mm`, `frost_resistance` — SOURCE_CONFLICT; `pot_life` — NEEDS_MAPPING; `consumption`, `flexural_strength` — NOT_AVAILABLE. Записей по этим ключам не найдено.
- MAT-000117: `pot_life`, `compressive_strength`, `adhesion` — NEEDS_MAPPING; `color`, `consumption_10mm`, `standard`, `mortar_grade` — NOT_AVAILABLE. Записей по этим ключам не найдено.
- MAT-000118: `pot_life`, `compressive_strength`, `adhesion` — NEEDS_MAPPING; `consumption_10mm`, `mortar_grade`, `walkability` — NOT_AVAILABLE. Записей по этим ключам не найдено.

Отсутствие текущих записей подтверждено live SELECT. Это не доказывает историческую дельту и не является основанием удалять возможные значения, появившиеся позднее.

## Identity и пределы переноса характеристик

- MAT-000110: владелец подтвердил идентичность **VERTEX М-300, 40 кг**.
- MAT-000111: владелец подтвердил идентичность **EUROMIX / EUROmix М-300, 40 кг**.

Эти подтверждения относятся только к указанным MAT. Они не разрешают автоматически переносить технические характеристики похожих VERTEX/EUROMIX SKU. Более ранние identity notes остаются историей исследования, но текущий владелецский статус для этих двух записей — OWNER_CONFIRMED.

Для MAT-000113/114/115 ранее recorded evidence недостаточно для точной линейки/класса/завода; статусы PARTIAL/BLOCKED сохраняются.

## Scope и завершённость

Scope этого отчёта — только MAT-000109, 110, 111, 113, 114, 115, 117 и 118. Три подтверждённые карточки имеют verified current core values, но подкатегории **не полностью закрыты по стандарту MatMix**: у трёх карточек отсутствуют descriptions и SEO, product images остаются shared placeholder; пять других карточек требуют дальнейшей обработки identity/content. Production writes/deploy в ходе этой read-only проверки не выполнялись.
