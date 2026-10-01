# Image re-audit: final mix batch 1

Дата: 2026-10-01
Ветка: `codex/mix-images-reaudit-final3-batch1`
База: `3d3dbccdc83422c1dc937c7dc7c673128234705f`

## Итог evidence gate

Аудит остановлен до подготовки изображений: `PRODUCTION_VISUAL_SOURCE_REQUIRED`. Для identity-first проверки нужен именно текущий production image binding и файл изображения. В разрешённых repository artifacts таких данных для этой партии нет. SSH и любой production access запрещены условиями задачи, поэтому подменять проверку локальными файлами нельзя.

Предыдущий [локальный image review](mix-products-image-batch1-review.md) прямо указывает, что production не использовался. Его `importedUrl` — результат локального импорта, а не подтверждённый production URL. Локальные source/preview файлы и local schema-v4 DB также не являются production truth.

Поэтому всем 18 MAT присвоен единственный безопасный текущий статус `RESEARCH_REQUIRED`: это означает отсутствие production evidence, а не найденное несоответствие товара. Identity mismatch count неизвестен, не равен нулю. До получения разрешённого read-only экспорта текущих production image bytes и binding metadata не выполнялись reframe, rebuild, image generation, contact sheets или package preparation.

## Кладочные Смеси

| MAT | Последний title в локальном review | Production image URL | Identity | Классификация | Исторический source/status |
|---|---|---|---|---|---|
| MAT-000067 | Кладочно - монтажная смесь цементная Евро М-200 40кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/); IMAGE_NEEDS_EXACT_SOURCE |
| MAT-000068 | Кладочно - монтажная смесь цементная Русеан М-200 40кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/); IMAGE_IMPORTED |
| MAT-000069 | Кладочно - монтажная смесь цементная Вертекс М-200 40кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://vertexproduction.ru/); IMAGE_NEEDS_EXACT_SOURCE |

## Наливной Пол

| MAT | Последний title в локальном review | Production image URL | Identity | Классификация | Исторический source/status |
|---|---|---|---|---|---|
| MAT-000075 | Наливной пол "Unis Горизонт" 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/); IMAGE_BLOCKED_IDENTITY |
| MAT-000076 | Наливной пол "Unis Горизонт" Армированный 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/); IMAGE_BLOCKED_VERSION_CONFLICT |
| MAT-000077 | Наливной пол "Старатели" Быстрый 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.starateli.ru/nalivnoy-pol/); IMAGE_BLOCKED_VERSION_CONFLICT |
| MAT-000078 | Наливной пол "Старатели" Толстый 25кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-tolstyj/); IMAGE_IMPORTED |
| MAT-000079 | Наливной пол финишный Weber Vetonit 3000 самовыравнивающийся 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://vetonit.com/product/vetonit_3000_20kg/); IMAGE_IMPORTED |
| MAT-000080 | Наливной пол универсальный Weber Vetonit fast 4000 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://vetonit.com/product/vetonit_fast_4000_20kg/); IMAGE_IMPORTED |
| MAT-000081 | Наливной пол финишный Vetonit 4100 высокопрочный 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://vetonit.com/product/vetonit_4100_20kg/); IMAGE_IMPORTED |
| MAT-000082 | Наливной пол первичный Weber Vetonit 5000 быстротвердеющий 25 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.vetonit.com/product/vetonit_5000_25kg/); IMAGE_IMPORTED |
| MAT-000083 | Наливной пол Litokol LitoLiv S10 Express 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.litokol.ru/catalog/litoliv-s10-express/); IMAGE_IMPORTED |
| MAT-000084 | Наливной пол универсальный Litokol Litoliv S50 самовыравнивающийся 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://litokol-market.ru/catalog/styazhki-i-nalivnye-poly/litoliv-s50-evo/?offer=1005); IMAGE_IMPORTED |
| MAT-000085 | Наливной пол Волма Нивелир Экспресс 25 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.volma.ru/production/catalog/mixtures-for-floor-leveling/volma-nivelir-ekspress-25kg/); IMAGE_IMPORTED |
| MAT-000086 | Наливной пол Основит Скорлайн FK45R самовыравнивающийся 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.osnovit.msk.ru/fk45r); IMAGE_NEEDS_EXACT_SOURCE |
| MAT-000087 | Наливной пол самовыравнивающийся Ceresit CN 175 20 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.ceresit.ru/ru/products/flooring/levelling-compounds/cn_175_super); IMAGE_NEEDS_EXACT_SOURCE |

## Стяжки Пола

| MAT | Последний title в локальном review | Production image URL | Identity | Классификация | Исторический source/status |
|---|---|---|---|---|---|
| MAT-000089 | Стяжка пола цементная, легкая Knauf Ubo 25 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://www.knauf.ru/upload/iblock/f60/j4nqjhxo0pt9w5ltxbu8104aoux6u8i3/34-IL-KNAUF_Ubo-_25_03_2025_-v01-Preview.pdf); IMAGE_NEEDS_EXACT_SOURCE |
| MAT-000090 | Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг | неизвестен | не проверяема без текущего production-файла | RESEARCH_REQUIRED | [source](https://osnovit.ru/catalog/styazhki/); IMAGE_NEEDS_EXACT_SOURCE |
## Summary

| Scope | Total | KEEP | REFRAME | REBUILD | RESEARCH_REQUIRED | OWNER_REVIEW_REQUIRED |
|---|---:|---:|---:|---:|---:|---:|
| Кладочные Смеси | 3 | 0 | 0 | 0 | 3 | 0 |
| Наливной Пол | 13 | 0 | 0 | 0 | 13 | 0 |
| Стяжки Пола | 2 | 0 | 0 | 0 | 2 | 0 |
| **Итого** | **18** | **0** | **0** | **0** | **18** | **0** |

### Следующий необходимый evidence

Для каждого MAT требуется разрешённый read-only экспорт текущих production image URL/binding, исходных байтов файла и проверяемого checksum (или эквивалентный сохранённый production snapshot). После этого можно сверить title/бренд/линейку/фасовку, формат, dimensions, SHA-256, bbox/fill, фон и кадрирование. До этого нельзя обоснованно выбирать KEEP/REFRAME/REBUILD или готовить preview.

## Ограничения и действия

- В область включены только MAT-000067–069, MAT-000075–087 и MAT-000089–090.
- Товарные данные не изменялись.
- Production DB/images, SSH и deploy не использовались.
- Production package и image artifacts для этой партии не создавались.
- Полные per-MAT поля, исторические references и null technical facts приведены в JSON: [mix-images-reaudit-final3-batch1.json](mix-images-reaudit-final3-batch1.json).

**FINAL3_IMAGE_AUDIT_COMPLETE = false**
**FINAL3_READY_FOR_VISUAL_REVIEW = false**
