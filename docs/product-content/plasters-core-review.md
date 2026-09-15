# Corrective backfill штукатурок — review

Режим: dry-run. БД рассматривается как локальный снимок, не production truth.

| MAT | Brand | Type | Base | Purpose | Package | Consumption 10mm | Wall layer | Ceiling layer | Temperature | Description | Status |
|---|---|---|---|---|---:|---:|---|---|---|---|---|
| MAT-000001 | KNAUF (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовая (WILL_ADD) | Ручное выравнивание стен и потолков внутри помещений (WILL_ADD) | 5 (WILL_ADD) | около 8,5 (WILL_ADD) | 5–50 мм; локально до 100 мм (WILL_ADD) | 5–15 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000002 | KNAUF (EXISTING_OK) | Универсальная гипсовая штукатурка (EXISTING_OK) | Гипсовое вяжущее с модифицирующими добавками (EXISTING_OK) | Ручное выравнивание стен и потолков внутри помещений (EXISTING_OK) | 30 (EXISTING_OK) | 8,5 (EXISTING_OK) | 5–50 мм; локально до 100 мм (EXISTING_OK) | 5–15 мм (EXISTING_OK) | +5…+30 °C (EXISTING_OK) | EXISTING_OK | READY |
| MAT-000003 | KNAUF (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовая (WILL_ADD) | Ручное выравнивание стен внутри помещений (WILL_ADD) | 30 (WILL_ADD) | около 8,5 (WILL_ADD) | 8–50 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000004 | KNAUF (WILL_ADD) | Гипсовая штукатурка машинного нанесения (WILL_ADD) | Гипсовая (WILL_ADD) | Механизированное выравнивание стен и потолков внутри помещений (WILL_ADD) | 30 (WILL_ADD) | около 8–9 (WILL_ADD) | 8–50 мм (WILL_ADD) | 8–15 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000005 | ВОЛМА (WILL_ADD) | Лёгкая гипсовая штукатурка ручного нанесения (WILL_ADD) | Гипсовое вяжущее (WILL_ADD) | Выравнивание стен и потолков внутри помещений (WILL_ADD) | 30 (WILL_ADD) | 9–10 (WILL_ADD) | 5–30 мм; максимум 50 мм (WILL_ADD) | 5–30 мм; максимум 50 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | EXISTING_OK | READY |
| MAT-000006 | ВОЛМА (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками (WILL_ADD) | Ручная внутренняя отделка стен и потолков (WILL_ADD) | 30 (WILL_ADD) | 8–9 (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000007 | ВОЛМА (WILL_ADD) | Гипсовая штукатурка машинного нанесения (WILL_ADD) | Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками (WILL_ADD) | Выравнивание стен и потолков внутри помещений с нормальной влажностью (WILL_ADD) | 30 (WILL_ADD) | 8–9 (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000008 | ВОЛМА (WILL_ADD) | Гипсовая штукатурка машинного нанесения (WILL_ADD) | Гипсовое вяжущее и лёгкий заполнитель с минеральными и химическими добавками (WILL_ADD) | Выравнивание стен и потолков внутри помещений с нормальной влажностью (WILL_ADD) | 30 (WILL_ADD) | 8–9 (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | 5–30 мм; максимум 60 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000009 | Русеан (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовая (WILL_ADD) | Ручное выравнивание стен внутри помещений с нормальной влажностью (WILL_ADD) | 30 (WILL_ADD) | 9,5 (WILL_ADD) | 5–50 мм (WILL_ADD) | до 15 мм (WILL_ADD) | от +5 до +25 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000010 | Русеан (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовая (WILL_ADD) | Черновая отделка внутри помещений под обои, краску или плитку (WILL_ADD) | 30 (WILL_ADD) | 10,5 (WILL_ADD) | 8–50 мм (WILL_ADD) | 8–15 мм (WILL_ADD) | от +5 до +25 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000011 | UNIS (WILL_ADD) | Облегчённая гипсовая штукатурка с перлитом (WILL_ADD) | Гипсовая (WILL_ADD) | Выравнивание стен и потолков внутри помещений (WILL_ADD) | 5 (WILL_ADD) | 8,5 (WILL_ADD) | 5–50 мм; локально до 100 мм (WILL_ADD) | До 20 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000012 | UNIS (WILL_ADD) | Облегчённая гипсовая штукатурка с перлитом (WILL_ADD) | Гипсовая (WILL_ADD) | Выравнивание стен и потолков внутри помещений (WILL_ADD) | 30 (WILL_ADD) | 8,5 (WILL_ADD) | 5–50 мм; локально до 100 мм (WILL_ADD) | До 20 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000013 | Старатели (WILL_ADD) | Гипсовая штукатурка (WILL_ADD) | Гипсовая (WILL_ADD) | Ручное выравнивание стен и потолков в помещениях с нормальной влажностью (WILL_ADD) | 30 (WILL_ADD) | около 9 (WILL_ADD) | 5–50 мм; локально до 100 мм (WILL_ADD) | 5–50 мм; локально до 100 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000014 | Старатели (WILL_ADD) | Штукатурная смесь (WILL_ADD) | Гипс и цемент (WILL_ADD) | Выравнивание стен и потолков в помещениях с нормальной и повышенной влажностью (WILL_ADD) | 30 (WILL_ADD) | 10–11 (WILL_ADD) | 5–60 мм; локально до 90 мм (WILL_ADD) | 5–60 мм; локально до 90 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000015 | ЦЕМЕНТУМ (WILL_ADD) | Цементная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Восстановление и выравнивание минеральных поверхностей внутри и снаружи зданий (WILL_ADD) | 25 (WILL_ADD) | 14 (WILL_ADD) | 5–30 мм; многослойно до 60 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000016 | KNAUF (WILL_ADD) | Цементная фасадная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание фасадов и стен в помещениях с высокой влажностью (WILL_ADD) | 25 (WILL_ADD) | 17 (WILL_ADD) | 10–35 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | Температура воздуха и основания не ниже +5 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000017 | KNAUF (WILL_ADD) | Лёгкая цементная фасадная штукатурка (WILL_ADD) | Цемент с лёгким заполнителем из гранул пенополистирола (WILL_ADD) | Выравнивание фасадов и стен во влажных помещениях (WILL_ADD) | 25 (WILL_ADD) | 12 (WILL_ADD) | 10–30 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | Температура воздуха и основания не ниже +5 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000018 | Vetonit (WILL_ADD) | Цементная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Базовое выравнивание стен и потолков в сухих, влажных и мокрых помещениях, а также фасадов (WILL_ADD) | 25 (WILL_ADD) | 17 (WILL_ADD) | 5–40 мм за одно нанесение; локально до 60 мм (WILL_ADD) | 5–40 мм; локально до 60 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000019 | MAPEI (WILL_ADD) | Цементная штукатурная смесь (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание стен, потолков и полов внутри и снаружи помещений (WILL_ADD) | 25 (WILL_ADD) | 16 (WILL_ADD) | 5–50 мм (WILL_ADD) | 5–50 мм (WILL_ADD) | От +5 °C до +30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000020 | Старатели (WILL_ADD) | Цементная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание стен внутри помещений и фасадов выше цоколя (WILL_ADD) | 25 (WILL_ADD) | 14–15 (WILL_ADD) | до 30 мм; многослойно до 60 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000021 | ВОЛМА (WILL_ADD) | Цементная штукатурка с армирующими волокнами (WILL_ADD) | Портландцемент (WILL_ADD) | Выравнивание наружных и внутренних стен, цоколей и фундаментов (WILL_ADD) | 25 (WILL_ADD) | 14–16 (WILL_ADD) | 10–30 мм; при заделке раковин и выбоин до 60 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000022 | ВОЛМА (WILL_ADD) | Цементная штукатурно-клеевая смесь (WILL_ADD) | Портландцемент (WILL_ADD) | Клеевой и базовый штукатурный слои фасадных теплоизоляционных систем (WILL_ADD) | 25 (WILL_ADD) | — (NEEDS_SOURCE) | 2–10 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | PARTIAL |
| MAT-000023 | UNIS (WILL_ADD) | Универсальная армированная цементная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание стен и потолков внутри и снаружи зданий (WILL_ADD) | 25 (WILL_ADD) | 14–16 (WILL_ADD) | 5–30 мм (WILL_ADD) | 5–30 мм (WILL_ADD) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000024 | Основит (WILL_ADD) | Цементная фасадная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание внутренних стен и фасадов выше цокольной части (WILL_ADD) | 25 (WILL_ADD) | 13 (WILL_ADD) | 5–30 мм; локально до 40 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000025 | Основит (WILL_ADD) | Фасадная штукатурка (WILL_ADD) | Цементная (WILL_ADD) | Выравнивание внутренних стен и фасадов выше цокольной части (WILL_ADD) | 25 (WILL_ADD) | 16–17 (WILL_ADD) | 5–30 мм; локально до 40 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+30 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000026 | Kreisel (WILL_ADD) | Цементная штукатурка машинного нанесения (WILL_ADD) | Портландцемент (WILL_ADD) | Штукатурные работы внутри и снаружи зданий выше цокольной части (WILL_ADD) | 30 (WILL_ADD) | 14–15 (WILL_ADD) | 5–30 мм (WILL_ADD) | — (ABSENT_BY_DESIGN) | +5…+25 °C (WILL_ADD) | WILL_ADD | READY |
| MAT-000027 | — (BLOCKED_IDENTITY) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | NEEDS_SOURCE | BLOCKED_IDENTITY |
| MAT-000028 | — (BLOCKED_IDENTITY) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | — (NEEDS_SOURCE) | NEEDS_SOURCE | BLOCKED_IDENTITY |

## Schema migration plan

- canonical **consumption_10mm**: number → **text**; unit: кг/м².
- Existing numeric values are copied to value_text with comma decimal display, value_number is cleared, and the canonical definition is changed to text during explicit apply.

## Consumption provenance

| MAT | exact display | source raw value | derived | formula | sources |
|---|---|---|---|---|---|
| MAT-000001 | около 8,5 | Около 8,5 кг/м² при слое 10 мм | no | Источник указывает значение при слое 10 мм; сохранены диапазон и qualifier без усреднения. | rotband |
| MAT-000002 | 8,5 | 8.5 | no | Источник указывает 8,5 кг/м² при слое 10 мм; text storage preserves display value. | rotband |
| MAT-000003 | около 8,5 | Около 8,5 кг/м² при слое 10 мм | no | Источник указывает значение при слое 10 мм; сохранены диапазон и qualifier без усреднения. | goldband |
| MAT-000004 | около 8–9 | Около 8–9 кг/м² при слое 10 мм | no | Источник указывает значение при слое 10 мм; сохранены диапазон и qualifier без усреднения. | mp75 |
| MAT-000005 | 9–10 | 9–10 кг на 1 кв.м при толщине 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | volmaHolst |
| MAT-000006 | 8–9 | 8–9 кг на 1 кв.м при толщине слоя 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | sloy |
| MAT-000007 | 8–9 | 8–9 кг на 1 кв.м при толщине слоя 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | aktiv |
| MAT-000008 | 8–9 | 8–9 кг на 1 кв.м при толщине слоя 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | aktiv |
| MAT-000009 | 9,5 | 9,5 кг/м² при толщине слоя 10 мм | no | Official current page table value at 10 mm preserved verbatim. | plaster |
| MAT-000010 | 10,5 | 10,5 кг/м² при толщине слоя 10 мм | no | Official source table value at 10 mm preserved verbatim. | termoplast |
| MAT-000011 | 8,5 | 0,85 кг/м² при толщине слоя 1 мм | yes | 0,85 × 10 мм = 8,5 кг/м² при слое 10 мм; conversion is arithmetic only and source wording is retained in rawSourceValue. | teplon |
| MAT-000012 | 8,5 | 0,85 кг/м² при толщине слоя 1 мм | yes | 0,85 × 10 мм = 8,5 кг/м² при слое 10 мм; conversion is arithmetic only and source wording is retained in rawSourceValue. | teplon |
| MAT-000013 | около 9 | около 9 кг/м² при слое 10 мм | no | Official source value at 10 mm preserved verbatim. | starGypsum |
| MAT-000014 | 10–11 | 10–11 кг/м² при слое 10 мм | no | Official manufacturer shop value at 10 mm preserved verbatim; midpoint is not calculated. | optimum |
| MAT-000015 | 14 | 14 кг/м² при слое 10 мм | no | Official source value at 10 mm preserved verbatim. | cementum |
| MAT-000016 | 17 | 1,7 кг/м² при толщине слоя 1 мм | yes | 1,7 × 10 мм = 17 кг/м² при слое 10 мм; conversion is arithmetic only. | unterputz |
| MAT-000017 | 12 | 12 кг/м² при слое 10 мм | no | Official source value at 10 mm preserved verbatim. | grunband |
| MAT-000018 | 17 | 1,7 кг/м² на 1 мм толщины слоя | yes | 1,7 × 10 мм = 17 кг/м² при слое 10 мм; conversion is arithmetic only. | tt40Tds |
| MAT-000019 | 16 | 16 | no | Источник указывает значение непосредственно на слое 10 мм; запись переведена в text для сохранения source-faithful display. | nivoplan |
| MAT-000020 | 14–15 | 14–15 кг/м² при слое 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | starCement |
| MAT-000021 | 14–16 | 14–16 кг/м² при слое 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | tsokol |
| MAT-000022 | — | — | no | — | termofasad |
| MAT-000023 | 14–16 | 14–16 кг/м² при толщине слоя 10 мм | no | Official technical sheet value at 10 mm preserved verbatim; midpoint is not calculated. | silin |
| MAT-000024 | 13 | 13 кг/м² при слое 10 мм | no | Official source value at 10 mm preserved verbatim. | techno |
| MAT-000025 | 16–17 | 16–17 кг/м² при слое 10 мм | no | Official source range at 10 mm preserved verbatim; midpoint is not calculated. | startwell |
| MAT-000026 | 14–15 | около 1,4–1,5 кг/м² на 1 мм толщины слоя | yes | 1,4–1,5 × 10 мм = около 14–15 кг/м² при слое 10 мм; range and approximate qualifier preserved. | kreiselTds |
| MAT-000027 | — | — | no | — | euroRs |
| MAT-000028 | — | — | no | — | ruseanM150, ruseanM150Standard, ruseanM150Modified |

## NEEDS_SOURCE / BLOCKED_IDENTITY

### MAT-000022

- Источники: termofasad (https://www.volma.ru/production/catalog/tile-adhesive/volma-termofasad/?ELEMENT_CODE=volma-termofasad&SECTION_CODE=tile-adhesive).
- consumption_10mm: Официальное значение расхода на слое 10 мм не подтверждено.
### MAT-000027

- Источники: euroRs (https://eurors.ru/catalog-cat/m-100-m-150-m-300-suhaya-smes).
- product_type: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- base: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- purpose: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- package_weight: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- consumption_10mm: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- wall_layer_thickness: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- ceiling_layer_thickness: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- application_temperature: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- Точная identity не доказана; запись запрещена.
### MAT-000028

- Источники: ruseanM150 (https://rusean.ru/pricelist/), ruseanM150Standard (https://rusean.ru/catalog/sukhie_smesi_/universalnaya_smes_m_150_standart_v_mesh_po_40_kg_rets_2/), ruseanM150Modified (https://rusean.ru/catalog/sukhie_smesi_/universalnaya_sukhaya_smes_m_150_modifitsirovannaya_v_mesh_po_40_kg/).
- product_type: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- base: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- purpose: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- package_weight: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- consumption_10mm: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- wall_layer_thickness: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- ceiling_layer_thickness: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- application_temperature: BLOCKED_IDENTITY: точная модификация и производитель не установлены.
- Точная identity не доказана; запись запрещена.

## Source registry

- **request**: Перечень товаров и фасовок в задании пользователя — Подтверждает идентичность, тип и фасовку из задания; не является техническим паспортом или production snapshot.
- **rotband**: [КНАУФ-Ротбанд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-rotband/)
- **goldband**: [КНАУФ-Гольдбанд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-goldband/)
- **mp75**: [КНАУФ-МП 75 (Россия)](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-mp-75/)
- **sloy**: [ВОЛМА-Слой](https://www.volma.ru/production/catalog/plaster/volma-sloy/)
- **aktiv**: [ВОЛМА-Гипс-Актив](https://www.volma.ru/production/catalog/plaster/volma-gypsum-is-an-asset/) — Общая карточка линейки; числовые параметры отдельно для серой и белой версий не подтверждены.
- **plaster**: [Русеан ПЛАСТЕР серый 30 кг](https://rusean.ru/catalog/shtukaturka_gipsovaya/gipsovaya_shtukaturka_plaster_serogo_tsveta_30_kg/) — Current official Rusean product page for the exact gray 30 kg SKU. Its explicitly labeled table row states 9,5 кг/м² at 10 mm; the page also states a 5–50 mm wall range, ceiling use up to 15 mm, and +5…+25 °C. A separate generic instruction line still says 30 kg for 2.7 m², so the canonical field uses only the explicitly labeled 10 mm table value and the residual discrepancy remains visible for review.
- **termoplast**: [Русеан ТЕРМОПЛАСТ белый 30 кг](https://rusean.ru/catalog/shtukaturka_gipsovaya/gipsovaya_shtukaturka_termoplast_po_30kg_belogo_tsveta/) — Current official Rusean product page for exact white 30 kg SKU; its explicitly labeled table row confirms 10,5 кг/м² at 10 mm, 8–50 mm wall layer, 8–15 mm ceiling layer, walls/ceilings and +5…+25 °C. A separate generic instruction line says 30 kg for 2.7 m²; it is not used for the canonical 10 mm table field.
- **teplon**: [UNIS Теплон Белый](https://unistrom.ru/catalog/otdelka-sten/shtukaturki/teplon-belyj/) — Страница явно перечисляет фасовки 5 и 30 кг. Использован блок самого товара, не соседние рекомендации.
- **starGypsum**: [Старатели: классическая гипсовая штукатурка](https://www.starateli.ru/shtukaturka/gipsovaya/)
- **optimum**: [Старатели Оптимум 30 кг](https://www.market.starateli.ru/products/shtukaturki/shtukaturka-optimum/) — Official manufacturer shop page for exact Optimum SKU; confirms gypsum-and-cement binder, manual/mechanized wall and ceiling use, 10–11 kg/m² at 10 mm, 5–60 mm layer (local 90 mm), +5…+30 °C.
- **cementum**: [ЦЕМЕНТУМ: цементная штукатурка](https://cementum.ru/catalog/shtukaturka-tsementnaya/)
- **unterputz**: [КНАУФ-Унтерпутц](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-unterputts/) — Official KNAUF page states 1.7 kg/m² per 1 mm; converted arithmetically to 17 kg/m² at 10 mm.
- **grunband**: [КНАУФ-Грюнбанд](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-gryunband/) — Official KNAUF page states 12 kg/m² at 10 mm, layer 10–30 mm, and positioning for facades and walls in high-humidity rooms.
- **tt40**: [Vetonit: система выравнивания стен под плитку](https://hub.vetonit.ru/product/19652/technical-sheet) — Страница 1, блок TT40: ручное/машинное нанесение, 5–40 мм, локально 60 мм. Документ системы не подтверждает все параметры отдельной фасадной карточки.
- **nivoplan**: [MAPEI Nivoplan Plus — русскоязычная техническая карта](https://cdnmedia.mapei.com/docs/librariesprovider50/products-documents/1_1_nivoplan-plus_rus_68c06741cc434fd6b06efa1a88ef35cc-%281%29-pdf_new_38b1d7bcbac141a3bd288183b8cb95b7.pdf?sfvrsn=97b9aa29_0) — Официальная русскоязычная техническая карта MAPEI: Nivoplan Plus как штукатурка/стяжка внутри и снаружи, фасовка серый мешок 25 кг. Все обновлённые предложения используют только этот источник; данные других регионов не смешиваются.
- **starCement**: [Старатели: цементная штукатурка](https://www.starateli.ru/cementnaya/)
- **tsokol**: [ВОЛМА-Цоколь](https://www.volma.ru/production/catalog/plaster/volma-cap-high-strength-cementitious-plaster-for-manual-appliance/)
- **termofasad**: [ВОЛМА-Термофасад](https://www.volma.ru/production/catalog/tile-adhesive/volma-termofasad/?ELEMENT_CODE=volma-termofasad&SECTION_CODE=tile-adhesive) — Official product page confirms exact 25 kg SKU, 2–10 mm layer and +5…+30 °C application conditions. The listed 5 кг/м² consumption is explicitly for creating the base plaster layer, not a 10 mm consumption value, so consumption_10mm remains NEEDS_SOURCE.
- **silin**: [UNIS Силин Универсальный Армированный](https://unistrom.ru/catalog/otdelka-sten/shtukaturki/silin-universalnyj-armirovannyj/)
- **techno**: [Основит Техно PC21 M 25 кг](https://osnovit.ru/catalog/plitochnye-klei/startvell-pc-21-m-shtukaturka-fasadnaya-osnovit-/) — Official ОСНОВИТ page for exact PC21 M 25 kg; values are limited to this modification.
- **startwell**: [Основит Стартвэлл PC21 25 кг](https://osnovit.ru/catalog/shtukaturki-tsementnye/osnovit-startvell-pc-21-shtukaturka-fasadnaya-mn-N/) — Official ОСНОВИТ page for exact PC21 (not PC21 M), 25 kg; cement base is stated in the application instructions.
- **kreisel**: [Kreisel OPTIMA-PUTZ 521 MH](https://kreisel.ru/products/optima-putz-521/)
- **ruseanM150**: [Русеан: номенклатура сухих смесей](https://rusean.ru/pricelist/) — Прайс Русеан показывает несколько разных позиций М-150 в мешках по 40 кг; точное соответствие MAT-000028 не установлено.
- **ruseanM150Standard**: [Русеан Универсальная смесь М-150 (СТАНДАРТ), 40 кг](https://rusean.ru/catalog/sukhie_smesi_/universalnaya_smes_m_150_standart_v_mesh_po_40_kg_rets_2/) — Точная официальная карточка одной из двух М-150 40 кг; локальный title MAT-000028 не содержит признака СТАНДАРТ/рецепт №2.
- **ruseanM150Modified**: [Русеан Универсальная смесь М-150 модифицированная, 40 кг](https://rusean.ru/catalog/sukhie_smesi_/universalnaya_sukhaya_smes_m_150_modifitsirovannaya_v_mesh_po_40_kg/) — Точная официальная карточка другой М-150 40 кг; локальный title MAT-000028 не содержит признака модифицированной версии.
- **euroRs**: [Euro RS — каталог М-100/М-150/М-300](https://eurors.ru/catalog-cat/m-100-m-150-m-300-suhaya-smes) — Каталог производителя Euro RS содержит М-150 универсальную 40 кг, но не доказывает, что локальное краткое название «Евро М-150» относится именно к Euro RS.
- **volmaHolst**: [ВОЛМА-Холст](https://www.volma.ru/production/catalog/plaster/volma-canvas-gypsum-plaster-for-manual-application/) — Exact product source for MAT-000005; values are limited to the exact product and are not copied from ВОЛМА-Слой.
- **tt40Tds**: [weber.vetonit TT40 technical card](https://vetonit.com/upload/iblock/3c9/r85rdb5ry9u3uxp8ghkeaemczeyk32ha.pdf) — Official manufacturer technical card for TT40: 1.7 kg/m² per 1 mm, 5–40 mm recommended layer (locally up to 60 mm), +5…+30 °C, 25 kg bag.
- **kreiselTds**: [Kreisel OPTIMA-PUTZ 521 MH technical card](https://kreisel.ru/app/uploads/2025/03/521-Optima-Putz_%D0%9C%D0%9D_2025.03.04.pdf) — Exact 521 MH technical card, current revision 04.03.2025; 1.4–1.5 kg/m² per 1 mm, 5–30 mm layer, +5…+25 °C.
