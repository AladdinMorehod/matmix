const DATA = {
  "CHECKED_AT": "2026-10-05",
  "CONFIRM_H1": "BOOTSTRAP_TILE_ADHESIVE_TEMPLATE_BATCH1",
  "CONFIRM_H2": "BACKFILL_TILE_ADHESIVE_CORE_BATCH1",
  "ALL_MATS": [
    "MAT-000127",
    "MAT-000128",
    "MAT-000129",
    "MAT-000130",
    "MAT-000131",
    "MAT-000132",
    "MAT-000133",
    "MAT-000134",
    "MAT-000135",
    "MAT-000136",
    "MAT-000137",
    "MAT-000138",
    "MAT-000139",
    "MAT-000140",
    "MAT-000141",
    "MAT-000142",
    "MAT-000143",
    "MAT-000144",
    "MAT-000145"
  ],
  "EXPECTED_CATEGORY": "Смеси",
  "EXPECTED_SUBCATEGORY": "Клей для Плитки",
  "EXPECTED_STRUCTURE_ID": 16,
  "SOURCES": {
    "knaufFlizen": {
      "url": "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen/",
      "owner": "КНАУФ",
      "domain": "knauf.ru",
      "sourceType": "manufacturer product page and linked product information sheet",
      "evidenceScope": "Exact Flizen product, 25 kg pack and listed technical characteristics."
    },
    "knaufFlizenPlus": {
      "url": "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-flizen-plyus/",
      "owner": "КНАУФ",
      "domain": "knauf.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact Flizen Plus identity and manufacturer catalogue characteristics; some detailed fields need an exact page/PDF review before use."
    },
    "knaufCatalog": {
      "url": "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/",
      "owner": "КНАУФ",
      "domain": "knauf.ru",
      "sourceType": "manufacturer catalog",
      "evidenceScope": "Confirms canonical product spelling and product family."
    },
    "vetonitEasyFix": {
      "url": "https://hub.vetonit.ru/products/sku-1024907",
      "owner": "ВЕТОНИТ",
      "domain": "hub.vetonit.ru",
      "sourceType": "manufacturer product card",
      "evidenceScope": "Exact Easy Fix product identity and published specifications."
    },
    "ceresitCatalog": {
      "url": "https://ceresit.ru/ru/products/tiling/tile-adhesives",
      "owner": "Ceresit / Henkel",
      "domain": "ceresit.ru",
      "sourceType": "manufacturer product catalog",
      "evidenceScope": "Current Russian range, product names and adhesive classes for CM11 PRO, CM14, CM16 and CM17; not a complete SKU datasheet."
    },
    "ceresitCm16": {
      "url": "https://ceresit.ru/ru/products/tiling/tile-adhesives/cm-16",
      "owner": "Ceresit / Henkel",
      "domain": "ceresit.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact CM16 identity and detailed application, substrates, format, time, temperature, consumption and bond data."
    },
    "ceresitCm17OldTds": {
      "url": "https://ceresit-spb.ru/sites/default/files/prodfiles/ru-ceresit-tds-cm17.pdf",
      "owner": "Ceresit / Henkel (document); hosted by distributor",
      "domain": "ceresit-spb.ru",
      "sourceType": "exact-product technical-sheet mirror",
      "evidenceScope": "Historic CM17 Super Flex formulation/class details. Host is not the manufacturer; version/date alignment needs confirmation."
    },
    "litokolK16": {
      "url": "https://www.litokol.ru/catalog/litolight-k16/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact K16 15 kg product and listed values."
    },
    "litokolK80": {
      "url": "https://www.litokol.ru/catalog/litoflex-k802/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact LITOKOL K80 page, 5 kg and 25 kg packs, C2 E; applications, substrates, application times, layer/consumption, heated floor and storage; do not transfer K80 ECO data."
    },
    "litokolK55": {
      "url": "https://www.litokol.ru/catalog/litoplus-k55/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact LITOPLUS K55 page, white product in 5 kg and 25 kg variants; water-only and LATEXKOL mixing modes separated; scope, substrates, layer/consumption and working-time specs."
    },
    "litokolK47": {
      "url": "https://www.litokol.ru/catalog/litokol-k47/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact LITOKOL K47 page, 25 kg; class C0, use, gray color, recommended/local layer, consumption, water, application/open/correction/working times and storage."
    },
    "litokolCatalog": {
      "url": "https://www.litokol.ru/catalog/kleevye-sostavy/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer catalog",
      "evidenceScope": "Current product family and current naming; does not prove identity of a specific older formulation by itself."
    },
    "unisDocs": {
      "url": "https://unistrom.ru/docs/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer document catalog",
      "evidenceScope": "Lists technical descriptions for named products including Plus, Granit, XXI, BelFix, 2000 and U-100 UniFlex."
    },
    "unisPlus": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-plyus/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact Plus product and published application/technical data."
    },
    "unisGranit": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-granit/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact Granit product and published application/technical data."
    },
    "unisXxi": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-plitochnyy-dlya-vnutrennikh-rabot/unis-xxi/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer product page and linked technical sheet",
      "evidenceScope": "Exact XXI product and product-specific specifications."
    },
    "unisBelFix": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/unis-belfiks/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact BelFix identity, color/use and published specifications."
    },
    "unis2000": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/unis-2000/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact 2000 identity and published specifications including 25 kg pack variant."
    },
    "unisU100Tds": {
      "url": "https://unistrom.ru/docs/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer document catalog with exact U-100 UniFlex technical-description entry",
      "evidenceScope": "Supports the historic UniFlex product line; download and revision match are required before importing detailed facts."
    },
    "unisCatalog": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer catalog",
      "evidenceScope": "Current portfolio context and product naming."
    },
    "volmaInterior": {
      "url": "https://www.volma.ru/production/catalog/tile-adhesive/volma-interior-cement-tile-glue-for-facing-ceramic-tiles/",
      "owner": "ВОЛМА",
      "domain": "volma.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact Interior product, 25 kg pack and technical specifications."
    },
    "volmaCeramic": {
      "url": "https://www.volma.ru/production/catalog/tile-adhesive/volma-ceramic-cement-tile-glue-for-facing-ceramic-tiles/",
      "owner": "ВОЛМА",
      "domain": "volma.ru",
      "sourceType": "manufacturer product page",
      "evidenceScope": "Exact Ceramic product and product information; current restyling/T14 relationship is corroborated separately."
    },
    "volmaRestyling": {
      "url": "https://www.volma.ru/press-center/news/restyling-of-the-line-of-tile-adhesives-volma/",
      "owner": "ВОЛМА",
      "domain": "volma.ru",
      "sourceType": "manufacturer news",
      "evidenceScope": "Manufacturer says Interior now carries T10 and Ceramic now carries T14; older packaging may remain in circulation."
    },
    "unisPlusTds": {
      "url": "https://unistrom.ru/upload/iblock/cf6/8fu2wqvm4syw5hce3ktszlmow85gps3b.pdf",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer technical sheet PDF",
      "evidenceScope": "Exact Plus and Granit product tables; Plus working time is stated as no less than 240 minutes."
    },
    "knaufFlizenPlusTds": {
      "url": "https://www.knauf.ru/upload/iblock/a6c/ew3uldd0dsgn02i6jssgcep8eo62nv10/30_IL_KNAUF_Flizen_Plyus_25_03_2025_v01_Preview.pdf",
      "owner": "КНАУФ",
      "domain": "knauf.ru",
      "sourceType": "manufacturer information sheet PDF, 04/2025",
      "evidenceScope": "Exact КНАУФ-Флизен Плюс, 25 kg, 04/2025: cementitious base, 2–6 mm, tile-size/trowel consumption table, open time ≥30 min, adjustment about 10 min, pot life about 3 h, grouting/walkability ≥24 h, +5…+25 °C, heated-floor use with restart delay, 7 L/25 kg water, 12-month shelf life, and substrate/preparation instructions."
    },
    "ceresitCm11Tds": {
      "url": "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm11-pro",
      "owner": "Ceresit / Henkel",
      "domain": "dm.henkel-dam.com",
      "sourceType": "manufacturer technical description (CM 11 PRO)",
      "evidenceScope": "Exact Ceresit CM 11 PRO manufacturer technical description: composition, 25 kg pack, substrate/application data, mixing water, open and correction time, temperature, shelf life, standard and consumption table by tile size/trowel. Pot life is approximately 2 h and remains NEEDS_MAPPING."
    },
    "ceresitCm14Tds": {
      "url": "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM14",
      "owner": "Ceresit / Henkel",
      "domain": "dm.henkel-dam.com",
      "sourceType": "manufacturer technical description (CM 14)",
      "evidenceScope": "Current manufacturer Ceresit CM 14 technical description, distinct from the older 2018 CM 14 Extra/C1 T sheet: current sheet shows CM 14 C2 T, 5/25 kg packs, ceramic/porcelain/artificial and natural stone except marble up to 90×90 cm, walls/floors indoors/outdoors, listed substrates, 10 mm max, 20-minute open/correction, water/consumption/storage and +5…+30 °C. This resolves the prior stone-purpose title conflict; about-2-hour pot life remains NEEDS_MAPPING."
    },
    "ceresitCm16Tds": {
      "url": "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-cm16",
      "owner": "Ceresit / Henkel",
      "domain": "dm.henkel-dam.com",
      "sourceType": "manufacturer technical description (CM 16)",
      "evidenceScope": "CM 16 exact product line and 25 kg/5 kg packs; application, scope, base, technical values and stated constraints."
    },
    "ceresitCm17Tds": {
      "url": "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CM17",
      "owner": "Ceresit / Henkel",
      "domain": "dm.henkel-dam.com",
      "sourceType": "manufacturer technical description (CM 17)",
      "evidenceScope": "Owner-confirmed exact Russian-market Ceresit CM 17 Super Flex 25 kg package revision. This official Russian CM 17 technical description is the sole source for MAT-000133 technical facts: cement composition, C2 TE S1 / ГОСТ Р 56387-2018, use and substrates, 10 mm maximum layer, consumption, water, pot life, +5…+30 °C, open/correction times, heated-floor use, and 12-month storage for the 25 kg paper sack."
    },
    "unisU100TdsPdf": {
      "url": "https://unistrom.ru/upload/iblock/516/ta04bu4al8c6js54qhnmpc1v4c2kyfzw.pdf",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer technical description PDF, U-100 UniFlex",
      "evidenceScope": "Exact historical manufacturer U-100 UNIFLEX technical description: C2 TE / ГОСТ Р 56387-2018, 5 and 25 kg options, cement/mineral/fractionated sand/modifier composition, intended tiles, application settings, substrates, layer/water/consumption/temperature, walkability and heated-floor restart. Current manufacturer page explicitly maps former U-100 UniFlex name and says formula unchanged; only this exact historic TDS supplies MAT-000143 facts."
    },
    "litokolK16News": {
      "url": "https://www.litokol.ru/press-center/news/novinka-v-assortimente-tsementnykh-kleevykh-sostavov/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer product launch notice",
      "evidenceScope": "Manufacturer uses commercial name LITOLIGHT K16, describes 15 kg pack, product class and application."
    },
    "litokolRegulatory": {
      "url": "https://www.litokol.ru/documents/regulatory-framework/",
      "owner": "LITOKOL",
      "domain": "litokol.ru",
      "sourceType": "manufacturer normative classification page",
      "evidenceScope": "Regulatory nomenclature/classification entries; page lists LITOLIGHT K16 C2 TE S1, while current commercial product page headline uses LITOKOL K16."
    },
    "ceresitSto2022": {
      "url": "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-sto-walls-89589540-002-2022",
      "owner": "ООО «Хенкель Рус» / Ceresit",
      "domain": "dm.henkel-dam.com",
      "sourceType": "manufacturer organization standard (СТО 89589540-002-2022)",
      "evidenceScope": "Table 6.8.2 names Ceresit CM 16: class C2 TE, gray color, 120-minute pot-life table entry, +5…+30 °C, 30-minute open time, grout readiness at least 24 h on absorbent substrates, and package 5/25 kg. Used for MAT-000132 color only; pot life remains mapped because product material separately describes it as approximately 2 hours and the numeric field cannot preserve that qualifier."
    },
    "unisXxiTds": {
      "url": "https://unistrom.ru/upload/iblock/4f2/rflcxgocubi1yyc96sp7jg2nl9dqhl6s.pdf",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "manufacturer technical description PDF (ЮНИС XXI)",
      "evidenceScope": "Exact ЮНИС XXI TDS: composition, purpose, substrates, C0 TE / ГОСТ Р 56387-2018, +5…+30 °C, water and consumption, layer, open/correction times, conditional walkability, packaging and 12-month storage. The 12-month TDS value conflicts with the current official product page value of 24 months; shelf_life is SOURCE_CONFLICT."
    },
    "unisU100Current": {
      "url": "https://unistrom.ru/catalog/klei/klei-dlya-plitki/kley-dlya-keramogranita/u-100-polymergel/",
      "owner": "ГК UNIS",
      "domain": "unistrom.ru",
      "sourceType": "current manufacturer product page with explicit former-name/formula continuity statement",
      "evidenceScope": "Official current U-100 page states this is the new version of UNIFLEX U-100, that it was formerly sold as U-100 PolymerGEL/U-100 Uniflex, and composition/formula is unchanged. It supplies current technical facts such as ≥4 h pot life, 30-minute tile-laying/open time and 30-minute adjustment. Used for continuity and these facts only; the exact historical UniFlex TDS remains the source for row-specific historic specification/pack details."
    }
  },
  "PRODUCTS": [
    {
      "externalId": "MAT-000127",
      "expectedTitle": "Клей для плитки Knauf Флизен, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "КНАУФ",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "КНАУФ-Флизен, cementitious tile adhesive, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "knaufFlizen"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "knaufFlizen"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "КНАУФ",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Плиточный клей",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементная клеевая смесь",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка на стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние помещения; без подогрева пола",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "knaufFlizen"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "knaufFlizen"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C0 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–6 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "knaufFlizen"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "water_requirement": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "knaufFlizen"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "pot_life": {
          "status": "READY",
          "value": "около 3 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+25 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "не менее 15 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "около 10 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "можно ходить через 24 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": false,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": "нет",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizen"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000128",
      "expectedTitle": "Клей для плитки Knauf Флизен ПЛЮС, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "КНАУФ",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "КНАУФ-Флизен Плюс, reinforced cementitious tile adhesive, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "knaufFlizenPlus",
        "knaufFlizenPlusTds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "knaufFlizenPlus",
          "knaufFlizenPlusTds"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "КНАУФ",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Усиленный плиточный клей",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементная клеевая смесь",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая/керамогранитная плитка и камень до 60×60 см",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние и наружные работы; стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "цементные и гипсовые штукатурки и стяжки, ГКЛ и ГВЛ; сильно впитывающие газобетонные и газосиликатные основания — с рекомендованной КНАУФ грунтовкой; в зонах прямого контакта с водой неводостойкие ГКЛ/ГВЛ и ПГП требуют гидроизоляции",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "knaufFlizenPlus",
            "knaufFlizenPlusTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1 TE",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–6 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,7 кг/м² для плитки до 10 см; 2,2 для 10–20 см; 2,9 для 20–30 см; 3,7 для 30–60 см; 4,7 для 60 см и более (без потерь)",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "7 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "около 3 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+25 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "не менее 30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "около 10 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "не ранее 24 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "knaufFlizenPlus"
          ],
          "sourceWording": "да",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C1 TE по ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "knaufFlizenPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000129",
      "expectedTitle": "Клей для плитки Vetonit Изи Фикс серый С0 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "Vetonit",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "Vetonit Easy Fix, gray, C0 T, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "vetonitEasyFix"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "vetonitEasyFix"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "Vetonit",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей для плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_MAPPING",
          "value": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "reason": "source gives 365 days; existing definition unit is months, so do not convert"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементное связующее",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка и камень, кроме мрамора; до 60×60 см; до 45 кг/м²",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри здания; любые уровни влажности; стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "бетон, ячеистый бетон, ГВЛ, гипсокартон, кирпич, цементная стяжка и цементная штукатурка",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C0 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "1–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,29 кг/м² на 1 мм слоя",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,21–0,24 л/кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "3 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": "3 ч",
          "evidenceNote": "Original exact 3 ч source value represented as text for production schema v11; magnitude and unit are unchanged."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "15 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "vetonitEasyFix"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000130",
      "expectedTitle": "Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "Ceresit",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "Ceresit CM 11 PRO New Formula, C1 T, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "ceresitCatalog",
        "ceresitCm11Tds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "ceresitCatalog",
          "ceresitCm11Tds"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "Ceresit",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCatalog"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей для керамической плитки и керамогранита для пола и стен",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCatalog"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цемент, минеральные заполнители, модифицирующие добавки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка, керамогранит и камень (кроме мрамора), до 60×60 см, пол/стена",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи зданий",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "бетон, цементные стяжки, цементная и цементно-известковая штукатурка; покрытие CR 65",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCatalog",
            "ceresitCm11Tds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCatalog"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "не более 10 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "Ориентировочно: плитка до 5 см — 1,7 кг/м² (зуб 3 мм); до 10 см — 2,0 (4 мм); до 15 см — 2,7 (6 мм); до 25 см — 3,6 (8 мм); до 30 см — 4,2 (10 мм); до 60 см — 5,5 (12 мм); либо около 1,2 кг/м² на 1 мм при 100% заполнении",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "около 5,75 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "около 2 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCatalog",
            "ceresitCm11Tds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCatalog",
            "ceresitCm11Tds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "READY",
          "value": "C1 T, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm11Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000131",
      "expectedTitle": "Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "Ceresit",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "Ceresit CM 14, C2 T, 25 кг; matching official current manufacturer TDS/package variant",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "ceresitCatalog",
        "ceresitCm14Tds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "ceresitCatalog",
          "ceresitCm14Tds"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "Ceresit",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCatalog"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей повышенной надежности для керамогранита и керамической плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цемент, минеральные заполнители, модифицирующие добавки и армирующие микроволокна",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "Керамическая плитка, керамогранит, искусственный камень на цементной основе и природный камень кроме мрамора; формат до 90×90 см",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "Стены и полы внутри и снаружи зданий, включая цоколи, входные группы, балконы и террасы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "Бетон, цементные штукатурки и стяжки; гидроизоляционные покрытия Ceresit CR 65, CR 166 и CL 51; внутри также ГКЛ и ГВЛ при подготовке по TDS",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCatalog",
            "ceresitCm14Tds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 T, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "не более 10 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "Ориентировочно: до 5 см — 1,7 кг/м² (зуб 3 мм); до 10 см — 2,0 (4 мм); до 15 см — 2,7 (6 мм); до 25 см — 3,6 (8 мм); до 30 см — 4,2 (10 мм); до 90 см — 6,0 (12 мм); либо около 1,3 кг/м² на 1 мм при 100% заполнении",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "около 5,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "около 2 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCatalog",
            "ceresitCm14Tds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": "да; допускается применение на стяжках с подогревом",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C2 T, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm14Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000132",
      "expectedTitle": "Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "Ceresit",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "Ceresit CM 16 Hit, C2 TE, 25 kg (local pack/title identity)",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "ceresitCm16",
        "ceresitCm16Tds",
        "ceresitSto2022"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "ceresitCm16",
          "ceresitCm16Tds"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "Ceresit",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Пластичный клей повышенной надежности",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "ceresitCm16Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "ceresitCm16Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цемент, минеральные заполнители, модифицирующие добавки и армирующие микроволокна",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамика, керамогранит, клинкер и природный камень кроме мрамора",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи; стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "бетон, цементная/цементно-известковая штукатурка, цементная стяжка, легкий/ячеистый бетон, specified Ceresit waterproofing; indoor additionally heated screeds, gypsum/anhydrite, old tile, DSP/OSB, drywall/GVL",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitSto2022"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 TE",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "до 10 мм maximum",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "примерно 2,0–4,2 кг/м² по размеру плитки и зубу шпателя",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCm16",
            "ceresitCm16Tds",
            "ceresitSto2022"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "pot_life": {
          "status": "READY",
          "value": "около 2 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "25 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "ceresitCm16",
            "ceresitCm16Tds",
            "ceresitSto2022"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "ceresitCm16"
          ],
          "sourceWording": "да; для стяжек с подогревом",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C2 TE по ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm16Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000133",
      "expectedTitle": "Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "Ceresit",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "Ceresit CM 17 Super Flex, gray Russian-market package, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "ceresitCm17Tds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "ceresitCm17Tds"
        ],
        "note": "Владелец подтвердил точную российскую упаковку CM 17 Super Flex 25 кг; официальный TDS CM 17 указывает бумажный мешок 25 кг."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "Ceresit",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm17Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей для плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "ceresitCm17Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sourceUnit": "месяцев",
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "не более 12 месяцев со дня изготовления в оригинальной неповреждённой бумажной упаковке",
          "evidenceNote": "Для подтверждённой фасовки 25 кг TDS указывает многослойный бумажный мешок."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "многослойные бумажные мешки по 25 кг",
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "Цементная",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "цемент, минеральные заполнители, модифицирующие добавки, армирующие микроволокна",
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "Для керамической плитки, керамогранита, клинкерной и каменной плитки, кроме мрамора, включая крупноформатные плиты",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "Внутренние и наружные работы; стены и полы; балконы, террасы, бассейны, стяжки с подогревом, печи, камины, бани и хаммамы",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": null,
          "evidenceNote": "Для печей, каминов, бань и хаммамов температура поверхности не должна превышать +80 °C."
        },
        "substrates": {
          "status": "READY",
          "value": "Бетон; цементные и цементно-известковые штукатурки; цементные стяжки; гипсовые и ангидритные основания; гипсокартон; ГВЛ; ДСП; OSB; лёгкий и ячеистый бетон; гидроизоляционные покрытия; существующая плиточная облицовка; прочные малярные покрытия",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": null,
          "evidenceNote": "TDS перечисляет условия подготовки для отдельных типов оснований; значения влажности/возраста здесь не обобщаются."
        },
        "color": {
          "status": "NOT_AVAILABLE",
          "value": null,
          "sources": ["ceresitCm17Tds"],
          "reason": "Не записывать: обозначение «сер.» есть в товарном названии, но цвет не подтверждён выбранным официальным техническим документом."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 TE S1",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "Смесь сухая строительная клеевая С2 ТЕ S1, ГОСТ Р 56387-2018",
          "evidenceNote": "Ранее зарегистрированный конфликт относился к неподтверждённой привязке редакции TDS к stock MAT; владелец подтвердил точную упаковку, и этот официальный TDS принят как приоритетный источник."
        },
        "layer_thickness": {
          "status": "READY",
          "value": "До 10 мм",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "максимальная толщина клеевого слоя не должна превышать 10 мм",
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "Около 1,1 кг/м² на 1 мм слоя",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "ок. 1,1 кг/м² на 1 мм толщины слоя (при 100%-ном заполнении пространства между плиткой и основанием)",
          "evidenceNote": "Табличный расход отдельно зависит от размера плитки и зубца шпателя."
        },
        "water_requirement": {
          "status": "READY",
          "value": "Около 6,75 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "на 25 кг сухой смеси — около 6,75 л",
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "Около 2 часов",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "около 2 часов",
          "evidenceNote": "Формулировка и единица времени сохранены как в TDS; значение хранится в текстовом поле схемы v11."
        },
        "application_temperature": {
          "status": "READY",
          "value": "От +5 до +30 °C",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "от +5 до +30°C",
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "30 минут",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "открытое время — 30 минут",
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "30 минут",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "положение плиток можно корректировать в течение 30 минут после укладки",
          "evidenceNote": null
        },
        "walkability": {
          "status": "NOT_AVAILABLE",
          "value": null,
          "sources": ["ceresitCm17Tds"],
          "reason": "Не записывать: срок до заполнения швов в TDS не равнозначен подтверждённому времени возможности хождения."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "стяжки с подогревом",
          "evidenceNote": "Запуск подогрева выполняется не ранее чем через 72 часа после завершения работ."
        },
        "standard": {
          "status": "READY",
          "value": "ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": ["ceresitCm17Tds"],
          "sourceWording": "С2 ТЕ S1, ГОСТ Р 56387-2018",
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000134",
      "expectedTitle": "Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 15,
      "expectedUnit": "шт",
      "expectedBrand": "LITOKOL",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "LITOLIGHT K16, fiber-reinforced lightweight flexible tile adhesive, C2 TE S1, 15 kg",
      "titleDecision": "DEFER_SOURCE_CONFLICT",
      "sourceKeys": [
        "litokolK16",
        "litokolK16News",
        "litokolRegulatory"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 15,
        "unit": "кг",
        "sourceIds": [
          "litokolK16",
          "litokolK16News",
          "litokolRegulatory"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "LITOKOL",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Легкий эластичный плиточный клей",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "package_weight": {
          "status": "READY",
          "value": 15,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементный состав с армирующими волокнами",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамика, керамогранит и камень",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 TE S1",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–5 мм; локально до 10 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "0,7 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,44–0,47 л/кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "до 4 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "35 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK16"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK16",
            "litokolK16News",
            "litokolRegulatory"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000135",
      "expectedTitle": "Клей для плитки Litokol К80, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "LITOKOL",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "LITOKOL K80, 25 kg (current manufacturer family page)",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "litokolK80"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "litokolK80"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "LITOKOL",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей плиточный",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементная смесь на портландцементе",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка, керамогранит и камень",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи; сухие/влажные и отапливаемые/неотапливаемые помещения; стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "бетон, цементные стяжки/штукатурки, цементные и полимерные гидроизоляции; внутри также гипсовые штукатурки, ГКЛ, газобетон и существующая плитка",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 E",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "рекомендуемый слой до 5 мм; локально до 15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,16 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,24–0,26 л/кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "до 9 часов",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "не менее 30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "не более 70 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK80"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": "да; производитель указывает применение в системе «тёплый пол»",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C2 E по ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK80"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000136",
      "expectedTitle": "Клей для плитки Litokol К55, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "LITOKOL",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "LITOPLUS K55, white fiber-reinforced adhesive, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "litokolK55"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "litokolK55"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "LITOKOL",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей для стеклянной мозаики и плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "белый цементный клеевой состав с фиброармированием",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "glass mosaic, marble, stone, ceramic and porcelain",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи; стены/полы; влажные помещения, балконы, террасы и другие зоны из перечня изготовителя",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "бетон, цементные стяжки/штукатурки, цементные/полимерные гидроизоляции; внутри — гипсовые основания, ГКЛ, газобетон и существующая плитка",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "READY",
          "value": "белый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 TE",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "рекомендуемый слой 2–5 мм; локально до 15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,12 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,26–0,28 л/кг for water-only mixing; additive mode is separate",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "до 6 часов",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "не менее 30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "не более 40 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK55"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": "да, для системы «тёплый пол»",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C2 TE по ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK55"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000137",
      "expectedTitle": "Клей для плитки Litokol К47, 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "LITOKOL",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "LITOKOL K47, C0, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "litokolK47"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "litokolK47"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "LITOKOL",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Клей плиточный",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цементная клеевая смесь на портландцементе",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка; изготовитель указывает формат до 60×60 см",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние работы, включая помещения повышенной влажности; стены и полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK47"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C0",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "рекомендуемый слой 2–5 мм; максимальная локальная толщина до 15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,14 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "5,0–5,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "до 8 часов",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "до 20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "litokolK47"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK47"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK47"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "litokolK47"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000138",
      "expectedTitle": "Клей для плитки Unis Плюс 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС Плюс, C1 TE, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unisPlus",
        "unisDocs",
        "unisPlusTds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unisPlus",
          "unisDocs",
          "unisPlusTds"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Усиленный армированный плиточный клей",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisPlus",
            "unisDocs",
            "unisPlusTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "purpose": {
          "status": "READY",
          "value": "ceramic, clinker, natural/artificial stone and porcelain to 90×90 cm",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи, включая влажные/сухие помещения; стены/полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisPlus",
            "unisDocs",
            "unisPlusTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisPlus",
            "unisDocs",
            "unisPlusTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1 TE",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,3 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "5–7,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "не менее 240 минут",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlusTds"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "20 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "не ранее 24 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "unisPlus"
          ],
          "sourceWording": "да",
          "evidenceNote": null
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisPlus",
            "unisDocs",
            "unisPlusTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000139",
      "expectedTitle": "Клей для плитки Unis Гранит 25кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС Гранит, C2 T, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unisGranit",
        "unisDocs"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unisGranit",
          "unisDocs"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Усиленный клей для плитки и керамогранита большого формата",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisGranit",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisGranit",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "purpose": {
          "status": "READY",
          "value": "наружная/внутренняя облицовка оснований с повышенной эксплуатационной нагрузкой; large/heavy tile formats",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние и наружные работы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "cement and polymer waterproofing are explicitly named; full substrate scope must be taken from exact TDS",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisGranit",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,3 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "6–7,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "не менее 4 часов",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisGranit",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adjustment_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "не менее 24 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "unisGranit"
          ],
          "sourceWording": "да",
          "evidenceNote": null
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisGranit",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000140",
      "expectedTitle": "Клей для плитки Unis XXI 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС XXI, C0 TE, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unisXxi",
        "unisDocs",
        "unisXxiTds"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unisXxi",
          "unisDocs"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Плиточный клей для внутренних работ",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "SOURCE_CONFLICT",
          "value": null,
          "sources": [
            "unisXxi",
            "unisXxiTds"
          ],
          "reason": "Официальная страница продукта указывает 24 мес., а текущий официальный TDS — 12 мес. Не выбирать один срок без подтверждения, какая документация относится к продаваемой упаковке."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цемент, минеральный наполнитель, модифицирующие добавки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "Керамическая плитка с водопоглощением более 5%; также кладочный раствор для блоков из ячеистого бетона (пено- и газобетон, газосиликат)",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "Стены и полы внутри сухих и влажных помещений",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "Недеформирующиеся основания: бетон (включая ячеистый бетон, шлакобетон и газобетон), цементные основания и штукатурка, кирпич, гипсовые основания ГКЛ/ГВЛ/ПГП",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisXxi",
            "unisDocs",
            "unisXxiTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C0 TE",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,25–1,35 кг/м² на слой 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "5–7,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "не менее 3 часов",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxi"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "10 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "24 ч для пола при толщине слоя до 6 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisXxi",
            "unisDocs",
            "unisXxiTds"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "READY",
          "value": "C0 TE, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisXxiTds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000141",
      "expectedTitle": "Клей для плитки и камня Unis Белфикс 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС Белфикс, white C1 T, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unisBelFix",
        "unisDocs"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unisBelFix",
          "unisDocs"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Белый клей для стеклянной и мозаичной плитки и мрамора",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "purpose": {
          "status": "READY",
          "value": "стеклянная/мозаичная плитка и мрамор",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "READY",
          "value": "белый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–10 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,3 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "pot_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "application_temperature": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "open_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adjustment_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "unisBelFix"
          ],
          "sourceWording": "да, manufacturer page indicates heated floor use",
          "evidenceNote": null
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisBelFix",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000142",
      "expectedTitle": "Клей для плитки, керамогранита и камня Unis 2000 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС 2000, C1 T, 25 kg",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unis2000",
        "unisDocs"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unis2000",
          "unisDocs"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Универсальный плиточный клей",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "READY",
          "value": 12,
          "dataType": "number",
          "unit": "месяцев",
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null,
          "sourceUnit": "мес"
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая/клинкерная плитка, природный/искусственный камень и керамогранит до 60×60 см",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутри и снаружи; подходит для теплого пола",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1 T",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,3 кг/м² на 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "pot_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "application_temperature": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "open_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adjustment_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "unis2000"
          ],
          "sourceWording": "да",
          "evidenceNote": null
        },
        "standard": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unis2000",
            "unisDocs"
          ],
          "reason": "No exact-SKU source-backed value is established."
        }
      }
    },
    {
      "externalId": "MAT-000143",
      "expectedTitle": "Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ЮНИС",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ЮНИС U-100 UniFlex, 25 кг, historical name/pack; current manufacturer page explicitly maps former name and unchanged formula",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "unisU100Tds",
        "unisDocs",
        "unisU100TdsPdf",
        "unisU100Current"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "unisU100TdsPdf",
          "unisU100Current"
        ],
        "note": "Exact historical U-100 UniFlex TDS lists 25 kg. Current official manufacturer page explicitly states the product was formerly sold as U-100 UniFlex and its composition/formula is unchanged."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ЮНИС",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100Tds"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Высокопластичный армированный клей для плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_MAPPING",
          "value": null,
          "sources": [
            "unisU100Tds",
            "unisDocs",
            "unisU100TdsPdf",
            "unisU100Current"
          ],
          "reason": "Точный старый TDS задает 12 месяцев в сухом неотапливаемом помещении и 18 месяцев в сухом отапливаемом. Числовое поле в месяцах не хранит условие хранения; не выбирать одно значение."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "цемент, минеральный наполнитель, фракционированный песок, модифицирующие добавки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "Керамогранит, керамическая плитка, натуральный и искусственный камень, клинкерная плитка",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "Внутренние и наружные работы: стены и полы, фасады, балконы, террасы, цоколи и бассейны; нагреваемые поверхности, включая теплые полы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "READY",
          "value": "Жесткие основания: цементно-песчаные и гипсовые штукатурки и стяжки, сборный и монолитный бетон возрастом не менее 2 месяцев, ячеистый бетон, газосиликат, ПГП, ГКЛ/ГВЛ, OSB, ЦСП, старые прочные облицовки и окрашенные поверхности; подготовка мембраной требуется для деформирующихся оснований по текущей инструкции производителя",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "color": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "unisU100Tds",
            "unisDocs",
            "unisU100TdsPdf",
            "unisU100Current"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C2 TE, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–15 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "READY",
          "value": "1,1–1,25 кг/м² на слой 1 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "water_requirement": {
          "status": "READY",
          "value": "5–7,5 л на 25 кг",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "не менее 4 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100Current"
          ],
          "sourceWording": null,
          "evidenceNote": "Exact manufacturer wording retained in production text definition pot_life (schema v11: text, no unit)."
        },
        "application_temperature": {
          "status": "READY",
          "value": "−15…+30 °C; во время работы и твердения температура основания и окружающей среды не ниже −15 °C; при прогнозе ниже — работы выполнять в тепловом контуре",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100Current"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "30 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100Current"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "READY",
          "value": "24 ч для полов при использовании шпателя 6×6 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": "да; эксплуатацию теплого пола начинать не ранее 28 суток после облицовки",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "C2 TE, ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "unisU100TdsPdf"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000144",
      "expectedTitle": "Клей для плитки Волма Интерьер серый 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ВОЛМА",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ВОЛМА-Интерьер, C0, 25 kg; restyled line marked T10",
      "titleDecision": "DEFER_OWNER_PACKAGE_CHECK",
      "sourceKeys": [
        "volmaInterior",
        "volmaRestyling"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "volmaInterior",
          "volmaRestyling"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ВОЛМА",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Экономичный клей для керамической и клинкерной плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaInterior",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "портландцементная сухая смесь",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая плитка внутри помещений",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние работы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaInterior",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C0",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–5 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaInterior",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,18–0,22 л/кг (4,5–5,5 л на 25 кг)",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "3 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": "3 ч",
          "evidenceNote": "Original exact 3 ч source value represented as text for production schema v11; magnitude and unit are unchanged."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "READY",
          "value": "10 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adjustment_time": {
          "status": "READY",
          "value": "10 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaInterior",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaInterior",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "standard": {
          "status": "READY",
          "value": "ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaInterior"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    },
    {
      "externalId": "MAT-000145",
      "expectedTitle": "Клей для плитки Волма Керамик Т14 25 кг",
      "expectedCategory": "Смеси",
      "expectedSubcategory": "Клей для Плитки",
      "expectedWeight": 25,
      "expectedUnit": "шт",
      "expectedBrand": "ВОЛМА",
      "identityStatus": "IDENTITY_CONFIRMED",
      "canonicalIdentity": "ВОЛМА-Керамик, 25 kg; restyled line marked T14",
      "titleDecision": "NO_CHANGE",
      "sourceKeys": [
        "volmaCeramic",
        "volmaRestyling"
      ],
      "manufacturerPackEvidence": {
        "status": "CONFIRMED",
        "value": 25,
        "unit": "кг",
        "sourceIds": [
          "volmaCeramic",
          "volmaRestyling"
        ],
        "note": "Exact manufacturer product page/TDS lists this package size, or exact product title variant is explicitly documented."
      },
      "core": {
        "brand": {
          "status": "READY",
          "value": "ВОЛМА",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "product_type": {
          "status": "READY",
          "value": "Цементный клей для керамической/клинкерной плитки",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "shelf_life": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaCeramic",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "package_weight": {
          "status": "READY",
          "value": 25,
          "dataType": "number",
          "unit": "кг",
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "base": {
          "status": "READY",
          "value": "портландцементная сухая смесь",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "purpose": {
          "status": "READY",
          "value": "керамическая и клинкерная плитка",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "application_area": {
          "status": "READY",
          "value": "внутренние и наружные работы",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "substrates": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaCeramic",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "color": {
          "status": "READY",
          "value": "серый",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "adhesive_class": {
          "status": "READY",
          "value": "C1",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "layer_thickness": {
          "status": "READY",
          "value": "2–5 мм",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "consumption": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaCeramic",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "water_requirement": {
          "status": "READY",
          "value": "0,18–0,22 л/кг (4,5–5,5 л на 25 кг)",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "pot_life": {
          "status": "READY",
          "value": "3 ч",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": "3 ч",
          "evidenceNote": "Original exact 3 ч source value represented as text for production schema v11; magnitude and unit are unchanged."
        },
        "application_temperature": {
          "status": "READY",
          "value": "+5…+30 °C",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "open_time": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaCeramic",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "adjustment_time": {
          "status": "READY",
          "value": "10–15 мин",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        },
        "walkability": {
          "status": "NEEDS_SOURCE",
          "value": null,
          "sources": [
            "volmaCeramic",
            "volmaRestyling"
          ],
          "reason": "No exact-SKU source-backed value is established."
        },
        "heated_floor_compatibility": {
          "status": "READY",
          "value": true,
          "dataType": "boolean",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": "manufacturer source indicates suitability for warm-floor applications",
          "evidenceNote": null
        },
        "standard": {
          "status": "READY",
          "value": "ГОСТ Р 56387-2018",
          "dataType": "text",
          "unit": null,
          "sources": [
            "volmaCeramic"
          ],
          "sourceWording": null,
          "evidenceNote": null
        }
      }
    }
  ],
  "TEMPLATE": {
    "structureId": 16,
    "externalCode": "SUB-000015",
    "name": "Клей для Плитки",
    "normalizedName": "клей для плитки",
    "parentId": 1,
    "parentName": "Смеси",
    "parentType": "category",
    "mainCodes": [
      "brand",
      "product_type",
      "shelf_life",
      "package_weight"
    ],
    "regularCodes": [
      "base",
      "purpose",
      "application_area",
      "substrates",
      "color",
      "adhesive_class",
      "layer_thickness",
      "consumption",
      "water_requirement",
      "pot_life",
      "application_temperature",
      "open_time",
      "adjustment_time",
      "walkability",
      "heated_floor_compatibility",
      "standard"
    ],
    "allCodes": [
      "brand",
      "product_type",
      "shelf_life",
      "package_weight",
      "base",
      "purpose",
      "application_area",
      "substrates",
      "color",
      "adhesive_class",
      "layer_thickness",
      "consumption",
      "water_requirement",
      "pot_life",
      "application_temperature",
      "open_time",
      "adjustment_time",
      "walkability",
      "heated_floor_compatibility",
      "standard"
    ]
  },
  "EXISTING_DEFINITIONS": [
    {
      "code": "brand",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "product_type",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "shelf_life",
      "dataType": "number",
      "unit": "месяцев"
    },
    {
      "code": "package_weight",
      "dataType": "number",
      "unit": "кг"
    },
    {
      "code": "base",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "purpose",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "application_area",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "substrates",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "color",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "layer_thickness",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "consumption",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "water_requirement",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "pot_life",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "application_temperature",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "walkability",
      "dataType": "text",
      "unit": null
    },
    {
      "code": "standard",
      "dataType": "text",
      "unit": null
    }
  ],
  "NEW_DEFINITIONS": [
    {
      "code": "adhesive_class",
      "label": "Класс клея",
      "dataType": "text",
      "defaultUnit": null,
      "defaultSection": "Характеристики"
    },
    {
      "code": "open_time",
      "label": "Открытое время",
      "dataType": "text",
      "defaultUnit": null,
      "defaultSection": "Характеристики"
    },
    {
      "code": "adjustment_time",
      "label": "Время корректировки",
      "dataType": "text",
      "defaultUnit": null,
      "defaultSection": "Характеристики"
    },
    {
      "code": "heated_floor_compatibility",
      "label": "Подходит для теплого пола",
      "dataType": "boolean",
      "defaultUnit": null,
      "defaultSection": "Характеристики"
    }
  ],
  "ALL_CODES": [
    "brand",
    "product_type",
    "shelf_life",
    "package_weight",
    "base",
    "purpose",
    "application_area",
    "substrates",
    "color",
    "adhesive_class",
    "layer_thickness",
    "consumption",
    "water_requirement",
    "pot_life",
    "application_temperature",
    "open_time",
    "adjustment_time",
    "walkability",
    "heated_floor_compatibility",
    "standard"
  ]
};
function deepFreeze(value){if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);}return value;}
module.exports=deepFreeze(DATA);
