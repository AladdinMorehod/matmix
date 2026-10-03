# Пескобетон и цемент — core batch 2 review

Проверено 2026-10-03. Production, SSH, deploy и apply не использовались. Локальная БД schema v4 открывалась read-only; dry-run выполнялся на одноразовой копии, мигрированной до schema v11. Owner confirmation MAT-110/111 учитывается отдельно от технической верификации.

## Identity reconciliation

| MAT | Локальный title | Идентичность | Класс | Блокер / вывод |
|---|---|---|---|---|
| MAT-000110 | Пескобетон Tex Pro М-300 ГОСТ 40 кг | Пескобетон VERTEX М-300, 40 кг | OWNER_CONFIRMED | Official catalog has several M-300 variants; no SKU/GTIN/package mapping selects one technical version. |
| MAT-000111 | Пескобетон Евро М-300 ГОСТ 40кг | Пескобетон EUROMIX/EUROmix М-300, 40 кг | OWNER_CONFIRMED | Identity maps to official unqualified M-300 catalog entry; three slots remain SOURCE_CONFLICT where manufacturer publishes no value. |
| MAT-000113 | Цемент "Цементум" 40кг | Не установлена | IDENTITY_PARTIAL | No exact ExtraCEM model, plant, SKU or GTIN mapping. |
| MAT-000114 | Цемент "РосЦемент" 50кг | Не установлена | IDENTITY_BLOCKED | Roscement is a multi-source seller; factory and grade are unknown. |
| MAT-000115 | Цемент "Русеан" 40кг | Не установлена | IDENTITY_PARTIAL | Rusean candidate page lists two possible plants; no MAT-to-candidate mapping. |

## Локальное происхождение

- Import log: `MatMix_catalog.xlsx`, SHA-256 `c6cef3a4bd206521e79a10132160fde24f782711fe6019b292f85d331c161f60`; импортированный workbook и baseline содержат те же пять строк и package weights.
- В строках Excel нет supplier SKU, manufacturer article, GTIN/EAN, source URL или vendor mapping. Товарные записи отмечены `source=excel`.
- MAT-000108/112/116 отсутствуют в локальной таблице products; контекст соседней исходной партии по ним не восстановлен.
- По всем пяти: `brand=NULL`, 0 локальных attribute values, 0 product_images, `description/short/full/SEO=NULL`; один общий placeholder `/uploads/products/MAT-000001-20260714153714969-3fb7fe.png`.
- Git history показывает импортные артефакты и последующие batch/research документы, но не содержит индивидуального supplier/source mapping для этих MAT.

## Sources and conclusions

- MAT-000110: официальный [VERTEX.production catalog](https://vertexproduction.ru/) перечисляет обычный M-300, M-300 Крупнозернистый и M-300 Эконом как отдельные позиции по 40 кг. Для каждой строки повторены ГОСТ 31358-2007 и одинаковое назначение, включая применение внутри и снаружи; это позволяет безопасно заполнить `purpose`, `application_area` и `standard` без выбора технической разновидности. Источник не публикует точные основания и толщину слоя; `substrates` остаётся `NOT_AVAILABLE`, а `layer_thickness` — `BLOCKED_BY_VARIANT`. Прочие технические значения не переносятся с кандидатов.
- MAT-000111: официальный [EUROmix catalog](https://www.xn----ctbiokkmpo.xn--p1ai/%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3) указывает точную карточку пескобетона М-300, ГОСТ 31357-2007, 40 кг; значения 10–50 мм, сцепление 0,5 МПа и срок 6 месяцев также опубликованы производителем. Вторичные карточки [Бетоныч](https://betonych.com/product/peskobeton-m-300-euromix-40-kg-2), [Filtrakt](https://filtrakt.ru/catalog/peskobeton/76987/) и [Rem-Market](https://rem-market.ru/stroitelnie-smesi/peskobeton/peskobeton-m-300-evromiks-40kg) сообщают другие числа по части полей, но не дают SKU или признака другой редакции. По приоритету источников приняты exact values производителя для слоя, сцепления и срока хранения; расход и pot life остаются `SOURCE_CONFLICT`, так как официальный каталог их не публикует, а вторичные данные расходятся.
- MAT-000113: [официальная карточка Цементум ExtraCEM 500](https://cementum.ru/catalog/extracem-500-40/) и [TDS](https://cementum.ru/upload/uf/fb3/6vjoxdd41fy2rdjqk9y2g05kpkzp5bu2/%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D0%B8%D1%81%D1%82%20%D0%A6%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%20ExtraCEM500.pdf) описывают candidate ExtraCEM 500, но местная строка не задаёт эту модель или завод.
- MAT-000114: [каталог Росцемент](https://roscement.ru/cement/) и [информация о заказе](https://roscement.ru/kak-zakazat/) подтверждают роль продавца с разными заводами/марками, но не идентичность мешка MAT-000114. Оставлен `IDENTITY_BLOCKED`.
- MAT-000115: [официальная карточка Русеан ЦЕМ I 42,5Н 40 кг](https://rusean.ru/catalog/tsement/tsement_tsem_i_42_5n_v_meshkakh_po_40kg/) и [прайс-лист](https://rusean.ru/pricelist/) дают exact candidate; карточка перечисляет два завода. Без GTIN/мешка/plant mapping остаётся `IDENTITY_PARTIAL`.

## Batch2 — exact core write scope

Allowlist: `MAT-000110,MAT-000111`. Existing canonical definitions only; no definitions or memberships are created. Writable surface: `products.brand` plus listed core attribute values for those two MATs. Titles, slugs, weight, price, stock, descriptions, SEO, images, definitions/templates and all other MATs remain outside the writable surface.

Dry-run on a disposable schema-v11 copy: `total=2 logicalSlots=46 ready=20 willAdd=20 existingOk=0 sourceConflict=3 needsMapping=0 notAvailable=22 blockedByVariant=1 plannedBrandUpdates=2 schemaBlocked=0 valueConflict=0 brandConflict=0 titleGuardBlocked=0 blockedProducts=0 errors=0 definitionsToCreate=0 templateMembershipChanges=0`.

Per MAT:

- MAT-000110: 7 READY/willAdd, 1 BLOCKED_BY_VARIANT, 15 NOT_AVAILABLE, 0 conflicts/blockers/errors; status PARTIAL. One of the 7 READY values is a planned product brand update.
- MAT-000111: 13 READY/willAdd, 3 SOURCE_CONFLICT, 7 NOT_AVAILABLE, 0 blockers/errors; status PARTIAL. One of the 13 READY values is a planned product brand update.

MAT-000110 per-field matrix:
- `brand`: **READY** — "VERTEX"
- `product_type`: **READY** — "Пескобетон"
- `base`: **NOT_AVAILABLE** — No exact-version composition is assigned without a SKU/package mapping.
- `purpose`: **READY** — "Устройство стяжек пола (в том числе плавающих и тёплых), фундаментов, отмосток и других бетонных конструкций в жилых и общественных зданиях"; the official catalog repeats this purpose for the listed M-300 variants.
- `package_weight`: **READY** — 40
- `application_area`: **READY** — "Внутренние и наружные работы"; explicitly stated for the listed M-300 variants.
- `application_method`: **NOT_AVAILABLE** — No exact-version application method is confirmed for this local MAT.
- `substrates`: **NOT_AVAILABLE** — The official catalog lists purposes but does not publish a distinct compatible-substrate list.
- `color`: **NOT_AVAILABLE** — No exact-version color is confirmed for this local MAT.
- `layer_thickness`: **BLOCKED_BY_VARIANT** — The catalog lists multiple M-300 variants but publishes no layer value; do not assign a technical value without exact-version documentation.
- `consumption_10mm`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `consumption`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `water_requirement`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `pot_life`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `application_temperature`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `compressive_strength`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `adhesion`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `frost_resistance`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `shelf_life`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `standard`: **READY** — "ГОСТ 31358-2007"; the manufacturer publishes the same standard for its separately listed M-300 variants.
- `mortar_grade`: **READY** — "М-300"
- `walkability`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.
- `flexural_strength`: **NOT_AVAILABLE** — No value is proposed without exact-version mapping.

MAT-000111 per-field matrix:
- `brand`: **READY** — "EUROMIX"
- `product_type`: **READY** — "Пескобетон"
- `base`: **NOT_AVAILABLE** — The reviewed official M-300 page does not state the composition.
- `purpose`: **READY** — "Заливка фундаментов; устройство бетонных стяжек и несущих слоев полов; возведение и ремонт бетонных стен и оснований"
- `package_weight`: **READY** — 40
- `application_area`: **NOT_AVAILABLE** — The official page does not explicitly identify indoor/outdoor application for this product.
- `application_method`: **NOT_AVAILABLE** — No manual/mechanical method is stated in the reviewed official product page.
- `substrates`: **NOT_AVAILABLE** — The page describes applications but does not define an exact substrate list.
- `color`: **READY** — "Серый"
- `layer_thickness`: **READY** — "10–50 мм" from the exact manufacturer M-300/40 kg listing. Secondary listings report 10–100 mm and 30–200 mm but provide no SKU/revision discriminator; the official value takes precedence.
- `consumption_10mm`: **SOURCE_CONFLICT** — Secondary exact-name listings report 18 and 22–25 kg/m² at 10 mm; official catalog does not publish a consumption value. No value selected.
- `consumption`: **SOURCE_CONFLICT** — Secondary exact-name listings report different consumption ranges; official catalog does not publish consumption. No value selected.
- `water_requirement`: **READY** — "0,17–0,20 л/кг"
- `pot_life`: **SOURCE_CONFLICT** — Secondary exact-name listings report 120 and 120–180 minutes; the official catalog does not state pot life. No value selected.
- `application_temperature`: **READY** — "от +5 до +30 °C"
- `compressive_strength`: **READY** — 30
- `adhesion`: **READY** — 0.5 МПа from the exact manufacturer M-300 listing. The secondary 0.3 MPa listing has no SKU/revision discriminator; the official value takes precedence.
- `frost_resistance`: **NOT_AVAILABLE** — The reviewed official M-300 catalog does not publish a frost-resistance value; secondary candidate value was not promoted.
- `shelf_life`: **READY** — 6 months from the exact manufacturer M-300 listing. The secondary 12-month listing has no SKU/revision discriminator; the official value takes precedence.
- `standard`: **READY** — "ГОСТ 31357-2007"
- `mortar_grade`: **READY** — "М-300"
- `walkability`: **NOT_AVAILABLE** — No walkability time is stated in the reviewed official M-300 catalog.
- `flexural_strength`: **NOT_AVAILABLE** — No flexural-strength value is stated in the reviewed official M-300 catalog.

## Verification and limits

- Batch2 synthetic test: exact scope, title guard, existing value/brand conflict, protected tables, transactional rollback, verified backup, idempotency and dry-run immutability.
- Disposable local DB rehearsal: copied schema v4 and migrated only the copy to v11; on that copy only, two stale definitions were aligned to the already verified text contract (`consumption_10mm` text/кг/м²; `pot_life` text/no unit). Initial dry-run: `willAdd=20`, `plannedBrandUpdates=2`, with zero blockers/errors. Disposable apply wrote 22 total rows/columns; backup verified and definitions, templates, images and unrelated products stayed unchanged. Second dry-run: `willAdd=0`, `existingOk=20`, `plannedBrandUpdates=0`; idempotency PASS. Original DB SHA before/after remained `77c7d13dc6898e20f8b08af955f44b21d523bdc53e649ba8d1dd5a20093add33`.
- No production access or mutation. Existing verified MAT-000109/117/118 batch data untouched.
- The previous batch2 research report preceded owner confirmation and remains a historical snapshot; this file is the current reconciliation.
