# Штукатурки: corrective pass MAT-000027 / MAT-000028

Статус: подготовлено для review; **ничего не применялось к production или БД**. Текущая production-identity ниже взята из решения и сведений владельца, а не из локального снимка БД.

## Scope и guards

- Точный порядок batch: `MAT-000027,MAT-000028`.
- Apply требует `--apply`, `--db`, exact `--only`, `--confirm FIX_PLASTERS_027_028_IDENTITY` и `--backup-dir`.
- Backup создаётся до `BEGIN IMMEDIATE`; любые расхождения блокируют весь batch; повторный запуск полного target state — `EXISTING_OK`, 0 writes.
- Writable products fields: `brand`, `short_description`, `full_description`, `seo_title`, `seo_description`.
- Writable attribute codes: `brand`, `product_type`, `base`, `purpose`, `package_weight`, `consumption_10mm`, `wall_layer_thickness`, `application_temperature`, `shelf_life`, `substrates`, `color`, `application_method`.
- Definitions/templates только читаются. Title, slug, external_id, price, weight/unit, category/subcategory, product_group, изображения, stock, sort_order, source/import metadata и `updated_at` неизменяемы.
- Старый общий plaster-core writer для этих двух записей возвращает `DELEGATED_TO_DEDICATED_CORRECTION` и пропускает их; он не может выполнить неполное изменение в обход exact batch.

## MAT-000027 — EUROmix М-150

Identity: owner-provided packaging image confirms EUROmix, “Сухая смесь М-150 высокопрочная” and ГОСТ 28013-98. Exact local title and slug remain guards only.

Техническая оговорка: verified official manufacturer product page не найден. Технические факты ниже основаны на вторичных торговых/дилерских карточках; упаковка подтверждена владельцем. Нельзя представлять источники как official.

### Product fields

| Field | Current guarded value | Proposed value |
|---|---|---|
| title | `Штукатурная смесь цементная Евро М-150 40кг` | unchanged |
| slug | `штукатурная-смесь-цементная-евро-м-150-40кг` | unchanged |
| brand | NULL | `EUROMIX` |
| short_description | `Универсальная цементная смесь (пескобетон), который используется и как штукатурка, и как кладочный раствор, и для стяжки пола. Для внутренних и наружных работ. Подходит для оштукатуривания стен, кладки, стяжки и ремонта бетонных поверхностей` | `Высокопрочная сухая смесь EUROmix М-150 40 кг для штукатурных, кладочных и ремонтных работ.` |
| full_description | NULL | `EUROmix М-150 — универсальная сухая смесь в фасовке 40 кг. Материал применяют для оштукатуривания стен и других поверхностей, кладочных работ, устройства полов, ремонта бетонных поверхностей и обработки швов. Рекомендуемая толщина слоя — 5–50 мм, температура проведения работ — от +5 до +30 °C.` |
| seo_title | NULL | `EUROmix М-150 40 кг — купить сухую смесь в Москве` |
| seo_description | NULL | `Высокопрочная сухая смесь EUROmix М-150 40 кг для штукатурных, кладочных и ремонтных работ. Слой 5–50 мм. Закажите с доставкой по Москве и МО.` |

### Attribute changes

| Code | Current | Proposed | Source |
|---|---|---|---|
| brand | `Euromix` | `EUROMIX` | owner image + exact EUROmix listing |
| product_type | absent | `Универсальная сухая смесь М-150` | owner image + secondary listing |
| base | `Цемент и речной песок мелкой фракции с добавлением полимерных добавок` | unchanged | secondary exact listing |
| purpose | Existing uses text | `Оштукатуривание стен и других поверхностей, кладочные работы, устройство полов, ремонт бетонных поверхностей, обработка и заделка швов` | secondary exact listing |
| package_weight | `40 кг` | unchanged | owner image + exact listing |
| consumption_10mm | `15-20 кг/м²` | `18 кг/м²` | exact secondary 40 kg listing; no averaging |
| wall_layer_thickness | `5–50 мм` | `5–50 мм` | secondary exact listing |
| application_temperature | `+5…+30 °C` | `от +5 до +30 °C` | secondary exact listing |
| shelf_life | `6 месяцев` | `6 месяцев` | secondary dealer exact product listing |
| substrates | absent | `Цементно-песчаные, кирпичные, цементно-известковые и бетонные основания` | secondary exact listing |
| color | absent | `Серый` | secondary exact listing |

Optional secondary-source facts water 0.16–0.17 l/kg, compressive strength 15 MPa, adhesion 0.3 MPa and F50 are retained as source notes only and are not added as attributes.

## MAT-000028 — Русеан, modified plaster 40 kg

Identity: owner-provided pack image states РУСЕАН, “Сухая смесь штукатурная”, 40 кг and ГОСТ 33083-2014; owner confirms manual wall application inside/outside. Current official Rusean page corroborates the modified plaster identity and exact 40 kg package. The retained local title is a guard only: **“М-150” in that title is not product evidence** and does not appear in any new attribute, visible copy or SEO.

### Product fields

| Field | Current guarded value | Proposed value |
|---|---|---|
| title | `Штукатурная смесь цементная Русеан М-150 40кг` | unchanged |
| slug | `штукатурная-смесь-цементная-русеан-м-150-40кг` | unchanged |
| brand | NULL | `Русеан` |
| short_description | `Это цементная выравнивающая штукатурка для черновой отделки стен и потолков.` | `Штукатурная сухая смесь Русеан 40 кг для ручного нанесения на стены внутри и снаружи зданий.` |
| full_description | `Это цементная штукатурка. Она прочная и влагостойкая, но требует обязательного грунтования основания перед нанесением и защиты от сквозняков и быстрого высыхания в первые сутки . При толщине слоя более 20 мм наносить в несколько приёмов с полным высыханием предыдущего слоя` | `Сухая штукатурная смесь Русеан в фасовке 40 кг предназначена для ручного оштукатуривания стен внутри и снаружи зданий. Подходит для бетонных оснований, кирпича, керамических блоков, цементных штукатурок и ячеистого бетона. Рекомендуемая толщина слоя — 10–20 мм, локально до 50 мм. Средний расход — 15–17 кг/м² при слое 10 мм.` |
| seo_title | NULL | `Штукатурная смесь Русеан 40 кг — купить в Москве` |
| seo_description | NULL | `Штукатурная сухая смесь Русеан 40 кг для ручного нанесения внутри и снаружи зданий. Слой 10–20 мм. Закажите с доставкой по Москве и МО.` |

### Attribute changes

| Code | Current | Proposed | Source |
|---|---|---|---|
| brand | `Русеан` | `Русеан` | owner image + official product page |
| product_type | absent | `Сухая штукатурная смесь модифицированная` | official Rusean page |
| application_temperature | `+5…+30 °C` | `от +5 до +25 °C` | official page |
| base | `Портландцемент М-400, фракционный песок, известь и модифицирующие добавки` | `Портландцемент, известь, фракционный песок и модифицирующие добавки` | official page; unsupported M-400 grade removed |
| consumption_10mm | `17-18 кг/м²` | `15–17 кг/м²` | official page prose says average 15–17; its separate nominal table value is 17. Prose range retained as written; not averaged. |
| package_weight | `40 кг` | unchanged | owner pack + official page |
| purpose | Existing text says walls and ceilings | `Ручное оштукатуривание стен внутри и снаружи зданий, включая бетон, кирпич, керамические блоки и ячеистый бетон; заделка и обработка швов` | official page + owner pack context |
| shelf_life | `6 месяцев` | `6 месяцев` | official page |
| wall_layer_thickness | `10-20 мм за проход` | `10–20 мм; локально до 50 мм` | official page, application section |
| application_method | absent | `Ручное нанесение` | owner pack + official page |
| substrates | absent | `Бетон, кирпич, керамические блоки, цементные штукатурки, ячеистый бетон` | official page |
| color | absent | `Серый` | official page |

No `ceiling_layer_thickness` is proposed. The official product page names walls and provides no ceiling-specific range.

## Source registry

- Owner-provided identity evidence (both MATs): supplied in task context; used only for packaging identity and visible markings.
- EUROmix exact secondary product page: [Russ-Kirpich — EUROmix M-150 40 kg](https://russ-kirpich.ru/sukhie-smesi/tsementno-peschanye-smesi/sukhaya-smes-universalnaya-m-150-40-kg-euromix/). Confirms brand/model/weight, gray color, layer 5–50 mm, +5…+30 °C, base, applications and substrates.
- EUROmix shelf life cross-check: [Laterus — EUROmix M-150 40 kg](https://laterus.ru/catalog/sukhaya-smes-euromix-peskobeton-m-150-vysokoprochnaya/). Secondary dealer source; used for six-month shelf life and corroboration only.
- EUROmix consumption: [Filtrakt — EUROmix M150 universal 40 kg](https://filtrakt.ru/catalog/tsementno-peschanye-smesi/78660/). Secondary retailer; exact listing states 18 kg/m² at 10 mm.
- Official source: [Русеан — модифицированная штукатурная смесь 40 кг](https://rusean.ru/catalog/shtukaturka_tsementnaya/shtukaturnaya_sukhaya_smes_modifitsirovannaya_po_40_kg/). Composition and application: lines 188–196; layer/manual process: 203–205; average and nominal consumption: 216–225; shelf life/color/weight/temperature/strength: 218–238.

## QA and expected audit result

- The dedicated script enforces exactly the ordered MAT-000027/MAT-000028 batch, exact title/slug and all supplied current-state guards. A mismatch blocks both products.
- It only updates the five allowlisted product fields and target attribute values. It does not create or change definitions/templates.
- Backup precedes transaction; postcheck compares immutable product/table snapshots; failure rolls back; second apply is zero-write idempotent.
- Synthetic SQLite test uses the unchanged `c330cf1` audit helpers. After proposed values, both MATs have no canonical brand anomaly, are `SEO_OK` in the readiness fixture, and are not `SOURCE_BLOCKED`. MAT-000075 and MAT-000077 remain source-blocked under unchanged floor-mix data.
- The current accepted audit checkpoint identified MAT-000027/028 as the only remaining plaster blockers. Resolving these two rows yields the expected plaster fixture result: 0 blockers / `DATA_CLOSED`; no audit rule is weakened.
- Production apply, production DB access, deploy, commit/push of production data, images and title/slug edits were not performed.
