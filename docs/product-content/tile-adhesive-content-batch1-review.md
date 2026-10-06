# Смеси → Клей для Плитки — Content + SEO Batch1

Подготовлено для Tech Lead review. Production не открывался, content apply и template write не выполнялись.

- Дата проверки: 2026-10-06
- Exact scope: MAT-000127, MAT-000128, MAT-000129, MAT-000130, MAT-000131, MAT-000132, MAT-000134, MAT-000135, MAT-000136, MAT-000137, MAT-000138, MAT-000139, MAT-000140, MAT-000141, MAT-000142, MAT-000143, MAT-000144, MAT-000145
- MAT-000133 включен: IDENTITY_CONFIRMED, четыре согласованных Content + SEO поля.
- Единственные writable поля: short_description, full_description, seo_title, seo_description.
- План на чистом synthetic fixture: 19 × 4 = 76 теоретических записей.
- Synthetic fixture: total=19, ready=19, blocked=0, errors=0, plannedFieldWrites=76.
- SEO descriptions: unique, 135–159 characters (maximum 160).

Ожидаемое production-кандидатное изменение: MAT-000133 — 4 поля; остальные 18 карточек ожидаются как EXISTING_OK, subject to real production read-only dry-run. Production не проверялся.

## Canonical template registration

Structure 16 / SUB-000015: main = brand, product_type, shelf_life, package_weight; regular = base, purpose, application_area, substrates, color, adhesive_class, layer_thickness, consumption, water_requirement, pot_life, application_temperature, open_time, adjustment_time, walkability, heated_floor_compatibility, standard.
Это изменение repository canonical dataset. Production template write не выполнялся.

## Copy review

| MAT | Title guard | SEO title | SEO title chars | SEO description chars | Source-risk note |
|---|---|---|---:|---:|---|
| MAT-000127 | Клей для плитки Knauf Флизен, 25 кг | Клей КНАУФ-Флизен 25 кг — купить в Москве | 41 | 140 | — |
| MAT-000128 | Клей для плитки Knauf Флизен ПЛЮС, 25 кг | Клей КНАУФ-Флизен Плюс 25 кг — купить в Москве | 46 | 141 | — |
| MAT-000129 | Клей для плитки Vetonit Изи Фикс серый С0 25 кг | Клей Vetonit Изи Фикс серый 25 кг — купить в Москве | 51 | 152 | — |
| MAT-000130 | Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг | Клей Ceresit CM 11 PRO 25 кг — купить в Москве | 46 | 143 | — |
| MAT-000131 | Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг | Клей Ceresit CM 14 25 кг — купить в Москве | 42 | 145 | — |
| MAT-000132 | Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг | Клей Ceresit CM 16 серый 25 кг — купить в Москве | 48 | 159 | — |
| MAT-000133 | Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг | Клей Ceresit CM 17 Super Flex 25 кг — купить в Москве | 53 | 158 | No color claim; use READY CM 17 facts only. |
| MAT-000134 | Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг | Клей Litokol K16 15 кг — купить в Москве | 40 | 144 | Preserve current commercial identity Litokol K16; do not expand to LITOLIGHT K16. |
| MAT-000135 | Клей для плитки Litokol К80, 25 кг | Клей Litokol K80 25 кг — купить в Москве | 40 | 155 | — |
| MAT-000136 | Клей для плитки Litokol К55, 25 кг | Белый клей Litokol K55 25 кг — купить в Москве | 46 | 145 | — |
| MAT-000137 | Клей для плитки Litokol К47, 25 кг | Клей Litokol K47 серый 25 кг — купить в Москве | 46 | 144 | — |
| MAT-000138 | Клей для плитки Unis Плюс 25 кг | Клей ЮНИС Плюс 25 кг — купить в Москве | 38 | 151 | — |
| MAT-000139 | Клей для плитки Unis Гранит 25кг | Клей ЮНИС Гранит 25 кг — купить в Москве | 40 | 148 | — |
| MAT-000140 | Клей для плитки Unis XXI 25 кг | Клей ЮНИС XXI 25 кг — купить в Москве | 37 | 148 | Omit: reviewed source conflict remains unresolved. |
| MAT-000141 | Клей для плитки и камня Unis Белфикс 25 кг | Белый клей ЮНИС Белфикс 25 кг — купить в Москве | 47 | 145 | — |
| MAT-000142 | Клей для плитки, керамогранита и камня Unis 2000 25 кг | Клей ЮНИС 2000 25 кг — купить в Москве | 38 | 142 | — |
| MAT-000143 | Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг | Клей ЮНИС Uniflex U-100 25 кг — купить в Москве | 47 | 135 | Omit: source-conditioned values remain NEEDS_MAPPING. |
| MAT-000144 | Клей для плитки Волма Интерьер серый 25 кг | Клей ВОЛМА-Интерьер серый 25 кг — купить в Москве | 49 | 140 | Do not add T10 as definite product/package identity. |
| MAT-000145 | Клей для плитки Волма Керамик Т14 25 кг | Клей ВОЛМА-Керамик Т14 25 кг — купить в Москве | 46 | 143 | — |

### MAT-000127 — Клей для плитки Knauf Флизен, 25 кг

- Brand / weight guard: КНАУФ / 25 шт
- Короткое описание: КНАУФ-Флизен, 25 кг — цементный клей для керамической плитки на стенах и полах внутри помещений.
- Полное описание: КНАУФ-Флизен — цементная клеевая смесь для керамической плитки на стенах и полах внутри помещений. Класс C0 T, слой 2–6 мм; время жизни раствора — около 3 ч.
- SEO title (41 chars): Клей КНАУФ-Флизен 25 кг — купить в Москве
- SEO description (140 chars): КНАУФ-Флизен 25 кг — для керамической плитки внутри помещений. Класс C0 T, слой 2–6 мм; время жизни раствора — около 3 ч. Закажите в MatMix.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, pot_life
- Sources: knaufFlizen (https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: substrates: NEEDS_SOURCE, color: NEEDS_SOURCE, consumption: NEEDS_SOURCE, water_requirement: NEEDS_SOURCE

### MAT-000128 — Клей для плитки Knauf Флизен ПЛЮС, 25 кг

- Brand / weight guard: КНАУФ / 25 шт
- Короткое описание: КНАУФ-Флизен Плюс, 25 кг, для плитки и камня до 60×60 см; подходит для внутренних и наружных работ.
- Полное описание: КНАУФ-Флизен Плюс — цементный усиленный клей для керамической плитки, керамогранита и камня до 60×60 см. Применяется на стенах и полах внутри и снаружи; допускается теплый пол. Слой — 2–6 мм, вода — 7 л на 25 кг.
- SEO title (46 chars): Клей КНАУФ-Флизен Плюс 25 кг — купить в Москве
- SEO description (141 chars): КНАУФ-Флизен Плюс 25 кг — для керамики, керамогранита и камня до 60×60 см. Слой 2–6 мм; воды — 7 л на упаковку. Доставка по Москве от MatMix.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, water_requirement, heated_floor_compatibility
- Sources: knaufFlizenPlus (https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/); knaufFlizenPlusTds (https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf)
- Source-risk notes: none
- Non-READY reviewed facts omitted: color: NEEDS_SOURCE

### MAT-000129 — Клей для плитки Vetonit Изи Фикс серый С0 25 кг

- Brand / weight guard: Vetonit / 25 шт
- Короткое описание: Vetonit Изи Фикс серый, 25 кг — клей для керамической плитки и камня внутри здания.
- Полное описание: Vetonit Изи Фикс — серый плиточный клей для керамической плитки и камня, кроме мрамора, внутри здания. Подходит для стен и полов при любом уровне влажности; слой — 1–15 мм. Расход — 1,29 кг/м² на 1 мм, время жизни — 3 ч.
- SEO title (51 chars): Клей Vetonit Изи Фикс серый 25 кг — купить в Москве
- SEO description (152 chars): Vetonit Изи Фикс серый 25 кг — для плитки и камня, кроме мрамора. Расход 1,29 кг/м² на 1 мм; время жизни — 3 ч. Закажите в MatMix с доставкой по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, color, adhesive_class, layer_thickness, consumption, pot_life
- Sources: vetonitEasyFix (https://hub.vetonit.ru/products/sku-1024907)
- Source-risk notes: none
- Non-READY reviewed facts omitted: shelf_life: NEEDS_MAPPING, adjustment_time: NEEDS_SOURCE, walkability: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000130 — Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг

- Brand / weight guard: Ceresit / 25 шт
- Короткое описание: Ceresit CM 11 PRO, 25 кг — клей для керамической плитки и керамогранита внутри и снаружи зданий.
- Полное описание: Ceresit CM 11 PRO — цементный клей для керамической плитки, керамогранита и камня, кроме мрамора, форматом до 60×60 см. Подходит для пола и стен внутри и снаружи зданий; класс C1 T, слой — не более 10 мм. Для упаковки 25 кг требуется около 5,75 л воды.
- SEO title (46 chars): Клей Ceresit CM 11 PRO 25 кг — купить в Москве
- SEO description (143 chars): Ceresit CM 11 PRO 25 кг — клей для плитки и керамогранита до 60×60 см. Класс C1 T; воды требуется около 5,75 л на упаковку. Доставка по Москве.
- READY facts used: product_type, package_weight, base, purpose, application_area, adhesive_class, layer_thickness, water_requirement
- Sources: ceresitCatalog (https://ceresit.ru/ru/products/tiling/tile-adhesives); ceresitCm11Tds (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro)
- Source-risk notes: none
- Non-READY reviewed facts omitted: color: NEEDS_SOURCE, walkability: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE

### MAT-000131 — Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг

- Brand / weight guard: Ceresit / 25 шт
- Короткое описание: Ceresit CM 14, 25 кг — клей для плитки, керамогранита и камня внутри и снаружи зданий.
- Полное описание: Ceresit CM 14 — клей повышенной надежности для керамической плитки, керамогранита и камня, кроме мрамора, форматом до 90×90 см. Применяется на стенах и полах внутри и снаружи зданий, включая балконы и террасы. Класс C2 T; максимальный слой — 10 мм; подходит для теплого пола.
- SEO title (42 chars): Клей Ceresit CM 14 25 кг — купить в Москве
- SEO description (145 chars): Ceresit CM 14 25 кг — для плитки, керамогранита и камня до 90×90 см. Класс C2 T, слой до 10 мм, внутри и снаружи. Закажите с доставкой по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, heated_floor_compatibility
- Sources: ceresitCm14Tds (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14)
- Source-risk notes: none
- Non-READY reviewed facts omitted: color: NEEDS_SOURCE, walkability: NEEDS_SOURCE

### MAT-000132 — Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг

- Brand / weight guard: Ceresit / 25 шт
- Короткое описание: Ceresit CM 16 серый, 25 кг — пластичный клей для керамики, керамогранита, клинкера и камня.
- Полное описание: Ceresit CM 16 — серый пластичный клей повышенной надежности для керамики, керамогранита, клинкера и природного камня, кроме мрамора. Применяется внутри и снаружи, на стенах и полах; класс C2 TE, слой — до 10 мм. Расход составляет примерно 2,0–4,2 кг/м² в зависимости от формата плитки и зуба шпателя; подходит для теплого пола.
- SEO title (48 chars): Клей Ceresit CM 16 серый 25 кг — купить в Москве
- SEO description (159 chars): Ceresit CM 16 серый 25 кг — для керамики, керамогранита, клинкера и камня. Класс C2 TE; расход примерно 2,0–4,2 кг/м² по формату и шпателю. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, color, adhesive_class, layer_thickness, consumption, heated_floor_compatibility
- Sources: ceresitCm16 (https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16); ceresitCm16Tds (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16); ceresitSto2022 (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-sto-walls-89589540-002-2022)
- Source-risk notes: none
- Non-READY reviewed facts omitted: water_requirement: NEEDS_SOURCE, walkability: NEEDS_SOURCE

### MAT-000133 — Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг

- Brand / weight guard: Ceresit / 25 шт
- Identity: IDENTITY_CONFIRMED
- Короткое описание: Ceresit CM 17 Super Flex, 25 кг — клей класса C2 TE S1 для плитки, керамогранита, клинкера и камня внутри и снаружи.
- Полное описание: Ceresit CM 17 Super Flex — клей класса C2 TE S1 для керамической плитки, керамогранита, клинкера и камня, кроме мрамора, включая крупноформатные плиты. Для стен и полов внутри и снаружи зданий; подходит для балконов, террас, бассейнов и стяжек с подогревом. Слой — до 10 мм, расход — около 1,1 кг/м² на 1 мм.
- SEO title (53 chars): Клей Ceresit CM 17 Super Flex 25 кг — купить в Москве
- SEO description (158 chars): Ceresit CM 17 Super Flex 25 кг — клей C2 TE S1 для плитки, керамогранита, клинкера и камня. Слой до 10 мм, расход около 1,1 кг/м² на 1 мм. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, consumption
- Sources: ceresitCm17Tds (https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM17)
- Source-risk notes: Do not claim gray color from «сер.» in catalog title; omit color, walkability, grouting_time, maximum_tile_size and adhesion.

### MAT-000134 — Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг

- Brand / weight guard: LITOKOL / 15 шт
- Короткое описание: Litokol K16, 15 кг — легкий эластичный серый клей для керамики, керамогранита и камня.
- Полное описание: Litokol K16 — легкий эластичный серый плиточный клей для керамики, керамогранита и камня. Класс C2 TE S1; рекомендуемый слой — 2–5 мм, локально — до 10 мм. Расход — 0,7 кг/м² на 1 мм, время жизни раствора — до 4 ч.
- SEO title (40 chars): Клей Litokol K16 15 кг — купить в Москве
- SEO description (144 chars): Litokol K16 15 кг — серый клей C2 TE S1 для керамики, керамогранита и камня. Расход 0,7 кг/м² на 1 мм; время жизни — до 4 ч. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, color, adhesive_class, layer_thickness, consumption, pot_life
- Sources: litokolK16 (https://www.litokol.ru/catalog/litolight-k16/)
- Source-risk notes: Preserve current commercial identity Litokol K16; do not expand to LITOLIGHT K16.
- Non-READY reviewed facts omitted: shelf_life: NEEDS_SOURCE, application_area: NEEDS_SOURCE, substrates: NEEDS_SOURCE, adjustment_time: NEEDS_SOURCE, walkability: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000135 — Клей для плитки Litokol К80, 25 кг

- Brand / weight guard: LITOKOL / 25 шт
- Короткое описание: Litokol K80, 25 кг — клей класса C2 E для керамической плитки, керамогранита и камня.
- Полное описание: Litokol K80 — цементная смесь для керамической плитки, керамогранита и камня. Применяется внутри и снаружи, на стенах и полах; класс C2 E. Рекомендуемый слой — до 5 мм, локально — до 15 мм; расход — 1,16 кг/м² на 1 мм. Подходит для теплого пола.
- SEO title (40 chars): Клей Litokol K80 25 кг — купить в Москве
- SEO description (155 chars): Litokol K80 25 кг — клей C2 E для плитки, керамогранита и камня внутри и снаружи. Расход 1,16 кг/м² на 1 мм; подходит для теплого пола. Доставка по Москве.
- READY facts used: product_type, package_weight, base, purpose, application_area, adhesive_class, layer_thickness, consumption, heated_floor_compatibility
- Sources: litokolK80 (https://www.litokol.ru/catalog/litoflex-k802/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: walkability: NEEDS_SOURCE

### MAT-000136 — Клей для плитки Litokol К55, 25 кг

- Brand / weight guard: LITOKOL / 25 шт
- Короткое описание: Litokol K55 белый, 25 кг — клей для стеклянной мозаики, плитки, мрамора и камня.
- Полное описание: Litokol K55 — белый цементный клей с фиброармированием для стеклянной мозаики, мрамора, камня, керамики и керамогранита. Применяется внутри и снаружи, на стенах и полах; класс C2 TE. Рекомендуемый слой — 2–5 мм, локально — до 15 мм.
- SEO title (46 chars): Белый клей Litokol K55 25 кг — купить в Москве
- SEO description (145 chars): Litokol K55 белый 25 кг — C2 TE для мозаики, мрамора, камня, керамики и керамогранита. Рекомендуемый слой 2–5 мм. Закажите с доставкой по Москве.
- READY facts used: product_type, package_weight, base, purpose, application_area, color, adhesive_class, layer_thickness
- Sources: litokolK55 (https://www.litokol.ru/catalog/litoplus-k55/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: walkability: NEEDS_SOURCE

### MAT-000137 — Клей для плитки Litokol К47, 25 кг

- Brand / weight guard: LITOKOL / 25 шт
- Короткое описание: Litokol K47 серый, 25 кг — клей класса C0 для керамической плитки внутри помещений.
- Полное описание: Litokol K47 — серая цементная клеевая смесь класса C0 для керамической плитки до 60×60 см. Предназначена для внутренних работ, включая помещения повышенной влажности; слой — 2–5 мм, локально — до 15 мм. Расход — 1,14 кг/м² на 1 мм.
- SEO title (46 chars): Клей Litokol K47 серый 25 кг — купить в Москве
- SEO description (144 chars): Litokol K47 серый 25 кг — клей C0 для керамической плитки до 60×60 см внутри помещений. Расход 1,14 кг/м² на 1 мм. Доставка по Москве от MatMix.
- READY facts used: product_type, package_weight, base, purpose, application_area, color, adhesive_class, layer_thickness, consumption
- Sources: litokolK47 (https://www.litokol.ru/catalog/litokol-k47/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: substrates: NEEDS_SOURCE, walkability: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000138 — Клей для плитки Unis Плюс 25 кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС Плюс, 25 кг — армированный клей для плитки и камня внутри и снаружи зданий.
- Полное описание: ЮНИС Плюс — усиленный армированный плиточный клей для керамической и клинкерной плитки, камня и керамогранита до 90×90 см. Подходит для внутренних и наружных работ, стен и полов; класс C1 TE, слой — 2–15 мм. Расход — 1,3 кг/м² на 1 мм; время жизни — не менее 240 минут.
- SEO title (38 chars): Клей ЮНИС Плюс 25 кг — купить в Москве
- SEO description (151 chars): ЮНИС Плюс 25 кг — C1 TE для плитки и камня до 90×90 см. Слой 2–15 мм; время жизни раствора — не менее 240 минут. Закажите в MatMix. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, consumption, pot_life, walkability
- Sources: unisPlus (https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/); unisPlusTds (https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf)
- Source-risk notes: none
- Non-READY reviewed facts omitted: base: NEEDS_SOURCE, substrates: NEEDS_SOURCE, color: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000139 — Клей для плитки Unis Гранит 25кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС Гранит, 25 кг — усиленный клей для плитки и керамогранита при повышенной нагрузке.
- Полное описание: ЮНИС Гранит — усиленный клей класса C2 T для облицовки внутри и снаружи зданий, в том числе при повышенной эксплуатационной нагрузке. Предназначен для крупного и тяжелого формата плитки; слой — 2–15 мм. Для затворения упаковки 25 кг требуется 6–7,5 л воды; ходить можно не ранее 24 ч.
- SEO title (40 chars): Клей ЮНИС Гранит 25 кг — купить в Москве
- SEO description (148 chars): ЮНИС Гранит 25 кг — C2 T для крупноформатной плитки при повышенной нагрузке. Слой 2–15 мм; вода — 6–7,5 л на упаковку. Доставка по Москве. Закажите.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, water_requirement, walkability
- Sources: unisGranit (https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: shelf_life: NEEDS_SOURCE, base: NEEDS_SOURCE, color: NEEDS_SOURCE, open_time: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000140 — Клей для плитки Unis XXI 25 кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС XXI, 25 кг — клей для керамической плитки и кладочный раствор для блоков внутри помещений.
- Полное описание: ЮНИС XXI — плиточный клей для керамической плитки с водопоглощением более 5%; также применяется как кладочный раствор для блоков из ячеистого бетона. Для стен и полов внутри сухих и влажных помещений. Класс C0 TE, слой — 2–15 мм; расход — 1,25–1,35 кг/м² на 1 мм.
- SEO title (37 chars): Клей ЮНИС XXI 25 кг — купить в Москве
- SEO description (148 chars): ЮНИС XXI 25 кг — для плитки и кладки блоков из ячеистого бетона. Класс C0 TE; расход 1,25–1,35 кг/м² на 1 мм. Доставка по Москве. Закажите в MatMix.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, consumption, water_requirement
- Sources: unisXxi (https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/); unisXxiTds (https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf)
- Source-risk notes: Omit: reviewed source conflict remains unresolved.
- Non-READY reviewed facts omitted: shelf_life: SOURCE_CONFLICT, color: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE

### MAT-000141 — Клей для плитки и камня Unis Белфикс 25 кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС Белфикс белый, 25 кг — клей для стеклянной мозаики и мрамора, подходит для теплого пола.
- Полное описание: ЮНИС Белфикс — белый клей класса C1 T для стеклянной и мозаичной плитки, а также мрамора. Наносится слоем 2–10 мм; производитель указывает совместимость с теплым полом.
- SEO title (47 chars): Белый клей ЮНИС Белфикс 25 кг — купить в Москве
- SEO description (145 chars): ЮНИС Белфикс белый 25 кг — C1 T для стеклянной и мозаичной плитки, мрамора. Слой 2–10 мм; совместим с теплым полом. Доставка по Москве. Закажите.
- READY facts used: product_type, package_weight, purpose, color, adhesive_class, layer_thickness, heated_floor_compatibility
- Sources: unisBelFix (https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: shelf_life: NEEDS_SOURCE, base: NEEDS_SOURCE, application_area: NEEDS_SOURCE, substrates: NEEDS_SOURCE, water_requirement: NEEDS_SOURCE, pot_life: NEEDS_SOURCE, application_temperature: NEEDS_SOURCE, open_time: NEEDS_SOURCE, adjustment_time: NEEDS_SOURCE, walkability: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000142 — Клей для плитки, керамогранита и камня Unis 2000 25 кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС 2000, 25 кг — универсальный клей класса C1 T для плитки, керамогранита и камня.
- Полное описание: ЮНИС 2000 — универсальный плиточный клей для керамической и клинкерной плитки, природного и искусственного камня и керамогранита до 60×60 см. Применяется внутри и снаружи зданий, подходит для теплого пола. Класс C1 T, слой — 2–15 мм; расход — 1,3 кг/м² на 1 мм.
- SEO title (38 chars): Клей ЮНИС 2000 25 кг — купить в Москве
- SEO description (142 chars): ЮНИС 2000 25 кг — C1 T для плитки, керамогранита и камня до 60×60 см. Расход 1,3 кг/м² на 1 мм; подходит для теплого пола. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, consumption, heated_floor_compatibility
- Sources: unis2000 (https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: base: NEEDS_SOURCE, substrates: NEEDS_SOURCE, color: NEEDS_SOURCE, water_requirement: NEEDS_SOURCE, pot_life: NEEDS_SOURCE, application_temperature: NEEDS_SOURCE, open_time: NEEDS_SOURCE, adjustment_time: NEEDS_SOURCE, walkability: NEEDS_SOURCE, standard: NEEDS_SOURCE

### MAT-000143 — Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг

- Brand / weight guard: ЮНИС / 25 шт
- Короткое описание: ЮНИС Uniflex U-100, 25 кг — высокопластичный армированный клей для плитки, керамогранита и камня.
- Полное описание: ЮНИС Uniflex U-100 — высокопластичный армированный клей для керамической плитки, керамогранита, клинкера и камня. Для внутренних и наружных работ, включая стены, полы, фасады, балконы, террасы и бассейны. Класс C2 TE, слой — 2–15 мм; расход — 1,1–1,25 кг/м² на 1 мм.
- SEO title (47 chars): Клей ЮНИС Uniflex U-100 25 кг — купить в Москве
- SEO description (135 chars): ЮНИС Uniflex U-100 25 кг — C2 TE для плитки, керамогранита и камня внутри и снаружи. Расход 1,1–1,25 кг/м² на 1 мм. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, adhesive_class, layer_thickness, consumption, water_requirement
- Sources: unisU100TdsPdf (https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf)
- Source-risk notes: Omit: source-conditioned values remain NEEDS_MAPPING.
- Non-READY reviewed facts omitted: shelf_life: NEEDS_MAPPING, color: NEEDS_SOURCE

### MAT-000144 — Клей для плитки Волма Интерьер серый 25 кг

- Brand / weight guard: ВОЛМА / 25 шт
- Короткое описание: ВОЛМА-Интерьер серый, 25 кг — экономичный клей для керамической и клинкерной плитки внутри помещений.
- Полное описание: ВОЛМА-Интерьер — серый экономичный клей для керамической и клинкерной плитки внутри помещений. Класс C0, слой — 2–5 мм. Для затворения упаковки 25 кг требуется 4,5–5,5 л воды.
- SEO title (49 chars): Клей ВОЛМА-Интерьер серый 25 кг — купить в Москве
- SEO description (140 chars): ВОЛМА-Интерьер серый 25 кг — клей C0 для керамической плитки внутри помещений. Слой 2–5 мм; затворение — 4,5–5,5 л воды. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, color, adhesive_class, layer_thickness, water_requirement
- Sources: volmaInterior (https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/)
- Source-risk notes: Do not add T10 as definite product/package identity.
- Non-READY reviewed facts omitted: shelf_life: NEEDS_SOURCE, substrates: NEEDS_SOURCE, consumption: NEEDS_SOURCE, walkability: NEEDS_SOURCE, heated_floor_compatibility: NEEDS_SOURCE

### MAT-000145 — Клей для плитки Волма Керамик Т14 25 кг

- Brand / weight guard: ВОЛМА / 25 шт
- Короткое описание: ВОЛМА-Керамик Т14, 25 кг — серый цементный клей класса C1 для керамической и клинкерной плитки.
- Полное описание: ВОЛМА-Керамик Т14 — серый цементный клей класса C1 для керамической и клинкерной плитки. Подходит для внутренних и наружных работ; рекомендуемый слой — 2–5 мм. Производитель указывает совместимость с теплым полом.
- SEO title (46 chars): Клей ВОЛМА-Керамик Т14 25 кг — купить в Москве
- SEO description (143 chars): ВОЛМА-Керамик Т14 25 кг — C1 для керамической и клинкерной плитки внутри и снаружи. Слой 2–5 мм; подходит для теплого пола. Доставка по Москве.
- READY facts used: product_type, package_weight, purpose, application_area, color, adhesive_class, layer_thickness, heated_floor_compatibility
- Sources: volmaCeramic (https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/)
- Source-risk notes: none
- Non-READY reviewed facts omitted: shelf_life: NEEDS_SOURCE, substrates: NEEDS_SOURCE, consumption: NEEDS_SOURCE, open_time: NEEDS_SOURCE, walkability: NEEDS_SOURCE

## Safety and gate

- Runner defaults to read-only dry-run and requires exact ordered --only scope, --apply, dedicated confirmation token, --db and --backup-dir for apply.
- Conflicting non-empty content, product identity/brand/package guards, duplicate SEO, and collisions with non-target products block the batch.
- Snapshot permits only the four content columns on exact targets; definitions, templates, attributes, images and all other product fields are protected.
- MAT-000131 color is omitted because core color remains NEEDS_SOURCE. MAT-000133 also has no color claim; «сер.» in its title is not evidence from the selected TDS.
- MAT-000134 remains Litokol K16; MAT-000140 shelf life omitted; MAT-000143 uses READY facts only; MAT-000144 does not claim T10; MAT-000145 uses T14 consistently.
- MAT-000133 is included with four fields based only on READY core facts; expected production state for the other 18 is subject to a future real read-only dry-run.
- Production apply and deploy were not performed; production state remains unverified pending a separate read-only dry-run.
