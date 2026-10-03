# Sand/cement/repair descriptions and SEO — Batch1 review

Mode: dry-run. Exact MAT scope: MAT-000109, MAT-000110, MAT-000111, MAT-000117, MAT-000118.
Content writable fields: short_description, full_description, seo_title, seo_description. Title corrections are limited to MAT-000110, MAT-000111 with exact old-title guards; slugs are immutable.

Summary: {"total":5,"ready":5,"existingOk":0,"wouldAdd":20,"wouldFix":0,"plannedTitleCorrections":2,"existingTitleCorrections":0,"blocked":0,"errors":0,"duplicateSeoTitles":0,"duplicateSeoDescriptions":0,"forbiddenPublicMarkers":0}

| MAT | Current title | Title correction | Status | Short / full chars | SEO title / description chars | Sources |
|---|---|---|---|---:|---:|---|
| MAT-000109 | Пескобетон (ЦПС) М300 Русеан 40 кг | NOT_IN_SCOPE | READY | 94 / 432 | 46 / 131 | ruseanM300 |
| MAT-000110 | Пескобетон Tex Pro М-300 ГОСТ 40 кг | WOULD_CORRECT → Пескобетон VERTEX М-300 ГОСТ 40 кг | READY | 80 / 270 | 47 / 120 | ownerMat110, vertexCatalog |
| MAT-000111 | Пескобетон Евро М-300 ГОСТ 40кг | WOULD_CORRECT → Пескобетон EUROMIX М-300 ГОСТ 40 кг | READY | 74 / 381 | 48 / 116 | ownerMat111, euromixCatalog |
| MAT-000117 | Цементная смесь ремонтная Ceresit CN 83 25 кг | NOT_IN_SCOPE | READY | 81 / 492 | 53 / 122 | ceresitCn83Catalog, ceresitCn83RuTds |
| MAT-000118 | Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг | NOT_IN_SCOPE | READY | 65 / 524 | 56 / 124 | glimsProCrt40, glimsProCrt40Tds |

## MAT-000109 — Пескобетон (ЦПС) М300 Русеан 40 кг

- Identity: IDENTITY_CONFIRMED; brand: Русеан
- Current content: {"short_description":null,"full_description":null,"seo_title":null,"seo_description":null}
- Short description: Русеан М300, 40 кг — пескобетон для устройства полов, фундаментов, отмосток и монтажных работ.
- Full description: Пескобетон Русеан М300 на основе портландцемента и песка фракцией до 5 мм предназначен для устройства полов, ленточных фундаментов в малоэтажном строительстве, отмосток и отливок, а также монтажных работ. Подходит для внутренних и наружных работ; наносится вручную по бетонному основанию. Толщина слоя — 50–150 мм. Для затворения требуется 0,13–0,15 л воды на килограмм смеси. Возможность хождения — через 48 часов. Фасовка — 40 кг.
- SEO title (46 chars): Пескобетон Русеан М300 40 кг — купить в Москве
- SEO description (131 chars): Пескобетон Русеан М300, 40 кг, для полов, фундаментов и монтажных работ. Ручное нанесение по бетону. Закажите в MatMix с доставкой.
- Title correction: none
- Sources: ruseanM300 (https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/)
- Facts used: brand, product_type, base, purpose, package_weight, application_area, application_method, substrates, layer_thickness, water_requirement, walkability
- Facts intentionally omitted: consumption_10mm=SOURCE_CONFLICT, consumption=NOT_AVAILABLE, pot_life=NEEDS_MAPPING, frost_resistance=SOURCE_CONFLICT, flexural_strength=NOT_AVAILABLE
- Status: **READY**

## MAT-000110 — Пескобетон Tex Pro М-300 ГОСТ 40 кг

- Identity: OWNER_CONFIRMED; brand: VERTEX
- Current content: {"short_description":null,"full_description":null,"seo_title":null,"seo_description":null}
- Short description: Пескобетон VERTEX М-300, 40 кг — для стяжек, фундаментов и бетонных конструкций.
- Full description: Пескобетон VERTEX М-300 в фасовке 40 кг применяют для устройства стяжек пола, фундаментов, отмосток и других бетонных конструкций. Производитель указывает возможность применения для внутренних и наружных работ. Марка — М-300; норматив — ГОСТ 31358-2007. Фасовка — 40 кг.
- SEO title (47 chars): Пескобетон VERTEX М-300 40 кг — купить в Москве
- SEO description (120 chars): Пескобетон VERTEX М-300, 40 кг, для стяжек, фундаментов, отмосток и бетонных конструкций. Закажите с доставкой в MatMix.
- Title correction: Пескобетон Tex Pro М-300 ГОСТ 40 кг → Пескобетон VERTEX М-300 ГОСТ 40 кг
- Sources: ownerMat110 (); vertexCatalog (https://vertexproduction.ru/)
- Facts used: brand, product_type, purpose, package_weight, application_area, standard, mortar_grade
- Facts intentionally omitted: base=NOT_AVAILABLE, application_method=NOT_AVAILABLE, substrates=NOT_AVAILABLE, color=NOT_AVAILABLE, layer_thickness=BLOCKED_BY_VARIANT, consumption_10mm=NOT_AVAILABLE, consumption=NOT_AVAILABLE, water_requirement=NOT_AVAILABLE, pot_life=NOT_AVAILABLE, application_temperature=NOT_AVAILABLE, compressive_strength=NOT_AVAILABLE, adhesion=NOT_AVAILABLE, frost_resistance=NOT_AVAILABLE, shelf_life=NOT_AVAILABLE, walkability=NOT_AVAILABLE, flexural_strength=NOT_AVAILABLE
- Status: **READY**

## MAT-000111 — Пескобетон Евро М-300 ГОСТ 40кг

- Identity: OWNER_CONFIRMED; brand: EUROMIX
- Current content: {"short_description":null,"full_description":null,"seo_title":null,"seo_description":null}
- Short description: Пескобетон EUROMIX М-300, 40 кг — для фундаментов, стяжек и бетонных стен.
- Full description: Пескобетон EUROMIX М-300 предназначен для заливки фундаментов, устройства бетонных стяжек и несущих слоёв полов, возведения и ремонта бетонных стен и оснований. Допускается слой 10–50 мм; для затворения требуется 0,17–0,20 л воды на килограмм смеси. Работы проводят при температуре от +5 до +30 °C. Цвет — серый. Марка раствора — М-300; норматив — ГОСТ 31357-2007. Фасовка — 40 кг.
- SEO title (48 chars): Пескобетон EUROMIX М-300 40 кг — купить в Москве
- SEO description (116 chars): Пескобетон EUROMIX М-300, 40 кг: слой 10–50 мм и затворение 0,17–0,20 л/кг. Закажите с доставкой по Москве в MatMix.
- Title correction: Пескобетон Евро М-300 ГОСТ 40кг → Пескобетон EUROMIX М-300 ГОСТ 40 кг
- Sources: ownerMat111 (); euromixCatalog (https://www.xn----ctbiokkmpo.xn--p1ai/%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3)
- Facts used: brand, product_type, purpose, package_weight, color, layer_thickness, water_requirement, application_temperature, standard, mortar_grade
- Facts intentionally omitted: base=NOT_AVAILABLE, application_area=NOT_AVAILABLE, application_method=NOT_AVAILABLE, substrates=NOT_AVAILABLE, consumption_10mm=SOURCE_CONFLICT, consumption=SOURCE_CONFLICT, pot_life=SOURCE_CONFLICT, frost_resistance=NOT_AVAILABLE, walkability=NOT_AVAILABLE, flexural_strength=NOT_AVAILABLE
- Status: **READY**

## MAT-000117 — Цементная смесь ремонтная Ceresit CN 83 25 кг

- Identity: IDENTITY_CONFIRMED; brand: Ceresit
- Current content: {"short_description":null,"full_description":null,"seo_title":null,"seo_description":null}
- Short description: Ceresit CN 83, 25 кг — ремонтная смесь для бетонных и железобетонных конструкций.
- Full description: Ceresit CN 83 — цементная ремонтная смесь для бетонных и железобетонных конструкций. Подходит для заполнения выбоин, каверн и дефектов глубиной от 5 мм, а также для изготовления стяжек. Смесь наносят шпателем или кельмой; при устройстве стяжек используют виброрейку. Толщина слоя — 5–35 мм, расход — около 2,0 кг/м² на каждый миллиметр слоя. Для затворения 25 кг требуется 3,0–3,2 л воды. Работы проводят при температуре от +5 до +30 °C; возможность хождения — через 6 часов. Фасовка — 25 кг.
- SEO title (53 chars): Ceresit CN 83 25 кг — купить ремонтную смесь в Москве
- SEO description (122 chars): Ceresit CN 83, 25 кг, для ремонта бетона и железобетона и устройства стяжек. Слой 5–35 мм. Закажите с доставкой по Москве.
- Title correction: none
- Sources: ceresitCn83Catalog (https://www.ceresit.ru/ru/products/flooring/levelling-compounds); ceresitCn83RuTds (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-)
- Facts used: brand, product_type, base, purpose, package_weight, application_area, application_method, substrates, layer_thickness, consumption, water_requirement, application_temperature, walkability
- Facts intentionally omitted: color=NOT_AVAILABLE, consumption_10mm=NOT_AVAILABLE, pot_life=NEEDS_MAPPING, compressive_strength=NEEDS_MAPPING, adhesion=NEEDS_MAPPING, standard=NOT_AVAILABLE, mortar_grade=NOT_AVAILABLE
- Status: **READY**

## MAT-000118 — Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг

- Identity: IDENTITY_CONFIRMED; brand: GLIMS
- Current content: {"short_description":null,"full_description":null,"seo_title":null,"seo_description":null}
- Short description: GLIMS PRO CRT-40, 25 кг — тиксотропная ремонтная смесь класса R3.
- Full description: GLIMS PRO CRT-40 — тиксотропная ремонтная смесь класса R3 для конструкционного ремонта бетонных и железобетонных конструкций. Её наносят вручную шпателем на бетон, железобетон и другие минеральные основания; материал предназначен для внутренних и наружных работ. Толщина слоя — 10–40 мм, расход — 1,8 кг/м² на каждый миллиметр слоя. Для затворения 25 кг требуется 4,0–4,25 л воды. Работы проводят при температуре от +5 до +35 °C. Соответствие: ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2. Фасовка — 25 кг.
- SEO title (56 chars): GLIMS PRO CRT-40 25 кг — купить ремонтную смесь в Москве
- SEO description (124 chars): GLIMS PRO CRT-40, 25 кг, тиксотропная ремонтная смесь класса R3 для бетонных конструкций. Слой 10–40 мм. Доставка по Москве.
- Title correction: none
- Sources: glimsProCrt40 (https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/); glimsProCrt40Tds (https://glims.ru/upload/iblock/269/6zxy9omk7p1uybqgmlb0upxynqo43qb7/GLIMS%C2%AE%20PRO%20CRT-40.pdf)
- Facts used: brand, product_type, purpose, package_weight, application_area, application_method, substrates, layer_thickness, consumption, water_requirement, application_temperature, standard
- Facts intentionally omitted: consumption_10mm=NOT_AVAILABLE, pot_life=NEEDS_MAPPING, compressive_strength=NEEDS_MAPPING, adhesion=NEEDS_MAPPING, mortar_grade=NOT_AVAILABLE, walkability=NOT_AVAILABLE
- Status: **READY**

## Guarded write boundary

- CONTENT_MUTABLE_FIELDS_EXACTLY = ["short_description","full_description","seo_title","seo_description"]
- TITLE_CORRECTION_MATS_EXACTLY = ["MAT-000110","MAT-000111"]
- Title writes require the exact expected historical title. Slugs, brands, core attributes, images, category, price, weight, stock and timestamps are immutable.
- CONFIRM = BACKFILL_MIX_SAND_CEMENT_REPAIR_CONTENT_BATCH1
