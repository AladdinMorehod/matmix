# Пескобетон, цемент и ремонтные смеси — итоговый статус

Финальный scope этого участка — восемь товаров в подкатегориях «Пескобетон», «Цемент» и «Смесь Ремонтная». MAT-000109, MAT-000117 и MAT-000118 применены и проверены в production. Для MAT-000110, MAT-000111, MAT-000113, MAT-000114 и MAT-000115 identity остаётся unresolved; характеристики и бренд для них не записывались.

## Итоговая таблица

| MAT | Подкатегория | Identity | Characteristics | Production | Final status | Причина / примечание |
|---|---|---|---|---|---|---|
| MAT-000109 | Пескобетон | IDENTITY_CONFIRMED | 18 READY/EXISTING_OK; SOURCE_CONFLICT: `consumption_10mm`, `frost_resistance`; NEEDS_MAPPING: `pot_life` | APPLIED_AND_VERIFIED | APPLIED_WITH_DOCUMENTED_GAPS | Расхождения официальной страницы сохранены без выбора неподтверждённого значения. |
| MAT-000117 | Смесь Ремонтная | IDENTITY_CONFIRMED | 16 READY/EXISTING_OK; NEEDS_MAPPING=3; NOT_AVAILABLE=4 | APPLIED_AND_VERIFIED | APPLIED_WITH_DOCUMENTED_GAPS | Неоднозначные характеристики оставлены без значения. |
| MAT-000118 | Смесь Ремонтная | IDENTITY_CONFIRMED | 17 READY/EXISTING_OK; NEEDS_MAPPING=3; NOT_AVAILABLE=3 | APPLIED_AND_VERIFIED | APPLIED_WITH_DOCUMENTED_GAPS | Подтверждена именно GLIMS PRO CRT-40; CRT-40 AF — отдельный продукт. |
| MAT-000110 | Пескобетон | BLOCKED | Не записывались | UNTOUCHED | IDENTITY_BLOCKED | Нет доказанного производителя/SKU/GTIN/source mapping для Tex Pro М-300 40 кг. |
| MAT-000111 | Пескобетон | PARTIAL | Не записывались | UNTOUCHED | IDENTITY_PARTIAL | Локальное «Евро» не устанавливает Euro-RS, EUROMIX или другой продукт. |
| MAT-000113 | Цемент | PARTIAL | Не записывались | UNTOUCHED | IDENTITY_PARTIAL | «Цементум» и 40 кг не устанавливают точную линейку, класс или завод. |
| MAT-000114 | Цемент | BLOCKED | Не записывались | UNTOUCHED | IDENTITY_BLOCKED | «РосЦемент» не устанавливает конкретный завод, марку или SKU. |
| MAT-000115 | Цемент | PARTIAL | Не записывались | UNTOUCHED | IDENTITY_PARTIAL | «Русеан» и 40 кг не связывают карточку с конкретным типом/классом цемента. |

## Подтверждённый production результат

- `ATTRIBUTE_ROWS_INSERTED=51`
- `PRODUCT_BRAND_UPDATES=3`
- `ALLOWED_APPLY_DELTA=PASS`
- `DEFINITIONS_UNCHANGED=true`
- `TEMPLATES_UNCHANGED=true`
- `IMAGES_UNCHANGED=true`
- `UNRELATED_PRODUCTS_UNCHANGED=true`
- `POST_APPLY_IDEMPOTENCY=PASS`
- `ACTIVE_RELEASE_UNCHANGED=true`
- `PRODUCT_APPLY_VERIFIED=true`
- DB `schemaVersion=11`, `integrity_check=ok`, FK violations `0`

## Identity-unresolved товары

Для MAT-000110/111/113/114/115 не добавляли характеристики, не назначали brand и не меняли title. Эти статусы — намеренный итог текущего scope, а не незавершённый apply.

Для будущей разблокировки запросить реальные supplier identifiers: фото упаковки с читаемой маркировкой, EAN/GTIN, manufacturer SKU, исходный supplier URL либо накладную/прайс с точной моделью. Для MAT-000111/113/115 это должно однозначно связать candidate product с локальной карточкой; для MAT-000110/114 дополнительно требуется установить фактического производителя/марку.

## Scope

В документ включены только MAT-000109, MAT-000110, MAT-000111, MAT-000113, MAT-000114, MAT-000115, MAT-000117 и MAT-000118. Другие товары и подкатегории этим closure report не затрагиваются.
