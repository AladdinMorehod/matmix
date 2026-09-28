# MAT-000076 — UNIS Горизонт Армированный corrective review

**Status:** READY_FOR_GUARDED_CORRECTION. This is a local preparation only; production was not accessed and no apply was run.

## Identity and source precedence

The owner confirmed the product identity from the MAT-000076 bag image: UNIS Горизонт Армированный, 25 kg. The [current UNIS product page](https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/) identifies the product as a high-strength reinforced base floor leveler, states 25 kg, and provides the current technical values. The [official technical sheet](https://unistrom.ru/upload/iblock/112/q1w1m0wsq0d9yzebod4boxlbzsayelji.pdf) is retained as secondary provenance.

The current page is canonical for identity and the confirmed current specification values. Application temperature (+5 to +30 °C) is sourced from the official TDS. The TDS gives compressive strength 25–30 MPa depending on production site and water up to 4 l per 25 kg; its intro bullet says 10–100 mm while its technical table says 10–200 mm. The current page gives 30 MPa, 2.75–3.75 l per 25 kg, and 10–200 mm. These differences are recorded and not averaged.

## Prepared changes

| Field | Expected current value | Proposed value |
|---|---|---|
| `products.title` | Наливной пол UNIS Горизонт Армированный 20 кг | Наливной пол UNIS Горизонт Армированный 25 кг |
| `products.weight` | 20 | 25 |
| `short_description` | Армированный базовый ровнитель UNIS Горизонт для пола. Фасовка — 20 кг. | UNIS Горизонт Армированный — высокопрочный базовый ровнитель для пола. Фасовка — 25 кг. |
| `full_description` | Previously prepared Thermofloor-derived 20 kg copy | UNIS Горизонт Армированный — высокопрочный армированный базовый ровнитель для пола в фасовке 25 кг. Материал предназначен для подготовки прочных ровных оснований под напольные покрытия и финишные ровнители. Толщина слоя — 10–200 мм, расход — 1,8 кг/м² на каждый миллиметр слоя. Возможность хождения — через 12 часов. |
| `seo_title` | UNIS Горизонт Армированный 20 кг — ровнитель купить в Москве | UNIS Горизонт Армированный 25 кг — ровнитель купить в Москве |
| `seo_description` | Previously prepared 20 kg / 30–300 mm / 3.8–4.8 l copy | Высокопрочный армированный базовый ровнитель UNIS Горизонт Армированный 25 кг. Слой 10–200 мм, расход 1,8 кг/м²/мм. Закажите с доставкой по Москве и МО. |

The allowlisted attribute correction is recorded in the adjacent JSON artifact. It changes only MAT-000076 values for the existing product definitions. The canonical 1.8 kg/m²/mm consumption is retained and normalized; shelf life 12 months and walkability 12 hours remain unchanged. No title migration or slug change is proposed.

## Guards and non-targets

The script requires the exact MAT-000076 allowlist, old-or-already-correct product state, exact old values for replaced attributes, active/non-deleted state, exact category/subcategory, and the preserved slug. Any other state blocks the entire correction. Apply requires the exact confirmation token plus explicit `--db` and `--backup-dir`; the backup is created before `BEGIN IMMEDIATE`. The script writes no definitions or templates and verifies immutable product fields, images, and other products after the transaction.

MAT-000075 and MAT-000077 remain unresolved blockers in source/core review and are not targets. MAT-000002 is out of scope and untouched.
