# Смеси → Цемент — CORE batch 3 review

Дата проверки: 2026-10-03. Scope: MAT-000113, MAT-000114, MAT-000115. Выполнен production read-only preflight; Batch3 apply не выполнялся.

## Identity reconciliation

| MAT | Старый статус | Новый статус | Подтверждённая идентичность | Неразрешённое |
|---|---|---|---|---|
| MAT-000113 | PARTIAL | IDENTITY_CONFIRMED | ЦЕМЕНТУМ ЭКСТРАЦЕМ 500 / ExtraCEM 500, портландцемент, 40 кг | Завод ExtraCEM и соответствующая буква класса Н/Б не установлены. |
| MAT-000114 | BLOCKED | IDENTITY_CONFIRMED | РОСЦЕМЕНТ, портландцемент, 50 кг — identity на уровне марки/типа/упаковки | Класс, стандарт и завод не установлены; фото не даёт читаемого подтверждения микротекста, а каталог продавца охватывает несколько производителей/классов. |
| MAT-000115 | PARTIAL | IDENTITY_CONFIRMED | Русеан, портландцемент ЦЕМ I 42,5Н, 40 кг | Точный завод для этой упаковки не установлен. |

### MAT-000114 exact title guard

Production read-only preflight found the exact current title `Цемент "РосЦемент" 50кг`. Batch3 now guards this exact string. The previous capitalization `Цемент "Росцемент" 50кг` is intentionally rejected; the product title itself is not changed. A regression test covers both cases.

Owner предоставил названия/описания пакетов в текущем задании. Ожидаемые бинарные файлы `MAT-000113.webp`, `МЕШОК MAT-000114.png`, `MAT-000115.jpg` не найдены в Downloads, Desktop, локальном репозитории или доступной папке вложений; поэтому независимая проверка пикселей и SHA изображений не выполнена. Для source-backed identity использованы сообщённые владельцем видимые надписи, с этой оговоркой.

## Source-backed core slots

| MAT | READY | NEEDS_MAPPING | SOURCE_CONFLICT | NOT_AVAILABLE |
|---|---:|---:|---:|---:|
| MAT-000113 | 6: brand, product_type, base, purpose, package_weight, standard | 2: compressive_strength, shelf_life | 0 | 15 |
| MAT-000114 | 3: brand, product_type, package_weight | 2: standard, mortar_grade | 0 | 18 |
| MAT-000115 | 9: brand, product_type, base, purpose, package_weight, color, application_temperature, compressive_strength, standard | 0 | 0 | 14 |

Неопределённые слоты не получают значений. Для ExtraCEM 500 официальный TDS показывает заводские варианты ЦЕМ II/А-И 42,5Н и 42,5Б и различные возрастные показатели прочности; scalar `compressive_strength` не сохраняет завод/возраст. Срок 60 суток не преобразуется в месяцы. Для MAT-000114 не подставляется класс какого-либо похожего товара Росцемент. Для MAT-000115 используется точный ЦЕМ I 42,5Н; сведения о другом классе/фасовке не переносились.

## Sources

- MAT-000113: [официальная страница ЦЕМЕНТУМ ExtraCEM 500](https://cementum.ru/catalog/extracem-500-40/); [официальный TDS ExtraCEM 500](https://cementum.ru/upload/uf/ee3/ma0wdnwsqaa3xxdw0cd6dzn5c5wmkxb5/%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D0%B8%D1%81%D1%82%20%D0%A6%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%20ExtraCEM500.pdf).
- MAT-000114: [каталог продавца Росцемент](https://roscement.ru/cement/) использован только для подтверждения, что ассортимент включает разные заводы и марки; технические значения из него не переносились.
- MAT-000115: [официальная страница Русеан ЦЕМ I 42,5Н 40 кг](https://rusean.ru/catalog/tsement/tsement_tsem_i_42_5n_v_meshkakh_po_40kg/); [официальный прайс-лист Русеан](https://rusean.ru/pricelist/). Отдельный manufacturer TDS для именно этой фасовки не найден; доступная точная technical source — спецификация на официальной странице Русеан.

## Local validation

Изолированный schema-v11 fixture dry-run: `total=3`, `logicalSlots=69`, `ready=18`, `willAdd=18`, `existingOk=0`, `sourceConflict=0`, `needsMapping=4`, `notAvailable=47`, `plannedBrandUpdates=3`, blockers/errors=0, `definitionsToCreate=0`, `templateMembershipChanges=0`. Dry-run snapshot и SHA fixture DB unchanged. Disposable apply/rollback/idempotency прошли только в тестовой временной DB. Production preflight был SELECT/PRAGMA-only; Batch3 runner отсутствовал в проверенном active release, поэтому production dry-run не выполнялся.

Full per-slot source statuses are encoded in `backend/scripts/data/mix-cement-core-batch3.js` and emitted by the runner. Apply scope remains exactly these three MAT; no definitions/templates are created or modified.
