# MatMix — final3 production image re-audit

Branch: codex/mix-images-reaudit-final3-batch1
Previous feature HEAD: bf4945f457acb2482fbba984bb8989d1d78f5128
Base origin/main: 3d3dbccdc83422c1dc937c7dc7c673128234705f

## Current checkpoint

PRODUCTION_IMAGE_EVIDENCE_VERIFIED. Owner-supplied read-only archive SHA256: f8e275df5ab887d04f4247672806f798eaf2c17671bfdbd1634813bf3970c05b. Exact 18-MAT manifest, image hashes/formats/dimensions and bindings were checked. Captured DB integrity was ok, schema version 11, zero FK violations, one primary and zero gallery images per product. This task used the local archive only; no production or SSH connection.

## Preserved prior checkpoint

The prior 18 × RESEARCH_REQUIRED checkpoint remains preserved verbatim in JSON checkpoints[0].checkpoint and is marked SUPERSEDED_BY_PRODUCTION_IMAGE_EVIDENCE.

## Summary

| Subcategory | Total | KEEP | REFRAME | REBUILD | RESEARCH_REQUIRED |
|---|---:|---:|---:|---:|---:|
| Кладочные Смеси | 3 | 1 | 1 | 1 | 0 |
| Наливной Пол | 13 | 5 | 4 | 3 | 1 |
| Стяжки Пола | 2 | 0 | 2 | 0 | 0 |
| **Total** | **18** | **6** | **7** | **4** | **1** |

OWNER_REVIEW_REQUIRED: 0.

KEEP: MAT-000067, MAT-000078, MAT-000083, MAT-000084, MAT-000085, MAT-000086
REFRAME: MAT-000069, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000089, MAT-000090
REBUILD: MAT-000068, MAT-000075, MAT-000076, MAT-000087
RESEARCH_REQUIRED: MAT-000077
OWNER_REVIEW_REQUIRED: none

## Per-MAT review

### MAT-000067 — KEEP

- **Subcategory:** Кладочные Смеси
- **Title:** Кладочно-монтажная смесь EUROmix М-200 40 кг
- **Production image URL:** /uploads/products/MAT-000067-ab116f57fe81db95.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000067.webp; 1000×1000 webp; SHA256 be9f2fee3ded7c8061e041365dd32de41a713e441bb40fabd21f8b96459ee860
- **Identity:** CONFIRMED — EUROmix М-200, 40 кг
- **Source (secondary retailer):** [https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/](https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/) — Secondary exact listing; captured sack itself reads EUROmix, M-200, 40 кг.
- **Visual:** Matches card; white, centered, full, no overlay; 85.2% vertical fill. Bbox/fill {"left":181,"top":89,"width":650,"height":852,"fillWidthPercent":65,"fillHeightPercent":85.2,"limitingAxisFillPercent":85.2}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000068 — REBUILD

- **Subcategory:** Кладочные Смеси
- **Title:** Кладочно-монтажная смесь Русеан М-200 40 кг
- **Production image URL:** /uploads/products/MAT-000068-18791ad479824f81.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000068.webp; 1200×1200 webp; SHA256 cf238451107af3f83b1aa0ef0da80374c409690336c34204621768a0a7e746e5
- **Identity:** CONFIRMED — Русеан М-200 монтажно-кладочная, 40 кг
- **Source (manufacturer official):** [https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/](https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/) — Official Rusean listing confirms M-200 and 40 кг.
- **Visual:** Exact pack but large third-party shop watermark crosses sack and background; do not erase it. Bbox/fill {"left":247,"top":97,"width":709,"height":1020,"fillWidthPercent":59.1,"fillHeightPercent":85,"limitingAxisFillPercent":85}; background white with watermark; watermark/mark: third-party shop watermark; package fully visible with no clipping.
- **Action:** Clean exact image / rebuild brief.
- **Rebuild brief:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/rebuild/MAT-000068-brief.md — REBUILD_BRIEF_READY; no candidate generated.

### MAT-000069 — REFRAME

- **Subcategory:** Кладочные Смеси
- **Title:** Кладочно-монтажная смесь VERTEX М-200 40 кг
- **Production image URL:** /uploads/products/MAT-000069-b8b92a4712674f83.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000069.webp; 1000×1000 webp; SHA256 891cf7e3c1a80d7069d6127b4deb7fce62335f290367967f993f4562904fdf12
- **Identity:** CONFIRMED — VERTEX PRO M-200, 40 кг
- **Source (manufacturer official):** [https://vertexproduction.ru/](https://vertexproduction.ru/) — Manufacturer corroboration; captured pack reads VERTEX PRO, M-200, 40 кг.
- **Visual:** Full/white/no overlay; 94.2% vertical fill; reframe preview 84.7%. Bbox/fill {"left":191,"top":24,"width":613,"height":942,"fillWidthPercent":61.3,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000069.png; 1200×1200; SHA256 b8befd9f343cbbeb49e7ee357456dc09606fee7d070a337cd63e53401ab4f2b4; bbox/fill {"left":233,"top":35,"width":735,"height":1130,"fillWidthPercent":61.3,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000069.webp; 1200 1200 webp; SHA256 aacef16e3cbef44273d59047c7b502c62261a04848870af67eea8f228992ca59; bbox/fill {"left":270,"top":92,"width":661,"height":1016,"fillWidthPercent":55.1,"fillHeightPercent":84.7,"limitingAxisFillPercent":84.7}

### MAT-000075 — REBUILD

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол "Unis Горизонт" 20 кг
- **Production image URL:** /uploads/products/MAT-000075-7584c202645c34c1.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000075.webp; 1000×1000 webp; SHA256 afc7f8282f7e6c088bc9d6c872162de7cf9f01e49fde08858945f7c4b95b0dd9
- **Identity:** MISMATCH — Package: UNIS Горизонт Универсальный М-45, 30 кг; local title: Горизонт, 20 кг
- **Source (manufacturer official):** [https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/](https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/) — Official page identifies Universal M-45 and current 20/25 kg variants; package says 30 kg.
- **Visual:** Weight mismatch; generic local title does not prove exact variant. Confirm intended 20 kg variant before replacement. Bbox/fill {"left":244,"top":60,"width":510,"height":877,"fillWidthPercent":51,"fillHeightPercent":87.7,"limitingAxisFillPercent":87.7}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Rebuild brief ready; bind exact variant first.
- **Rebuild brief:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/rebuild/MAT-000075-brief.md — REBUILD_BRIEF_READY; no candidate generated.

### MAT-000076 — REBUILD

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол UNIS Горизонт Армированный 25 кг
- **Production image URL:** /uploads/products/MAT-000076-321924509b42300f.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000076.webp; 1000×1000 webp; SHA256 af93d91aea5363720b15d62fe21c29bdaf3ad4cd6d1e4a274aa3c2ec6ca9b61e
- **Identity:** MISMATCH — UNIS Горизонт Армированный, target 25 кг
- **Source (manufacturer official):** [https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/](https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/) — Official page confirms armored 25 kg; package says 30 kg and evidence alt says 20 kg.
- **Visual:** Wrong package weight; exact 25 kg local reference sources exist. Bbox/fill {"left":254,"top":72,"width":492,"height":855,"fillWidthPercent":49.2,"fillHeightPercent":85.5,"limitingAxisFillPercent":85.5}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Rebuild from exact 25 kg reference.
- **Rebuild brief:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/rebuild/MAT-000076-brief.md — REBUILD_BRIEF_READY; no candidate generated.

### MAT-000077 — RESEARCH_REQUIRED

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол "Старатели" Быстрый 20 кг
- **Production image URL:** /uploads/products/MAT-000077-a2ff7cd16c732bb5.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000077.webp; 1000×1000 webp; SHA256 8bd4d3ef56aaa9e5f28c1963ac7a2cceef4c3d11615c58f06f43766109eac1cf
- **Identity:** RESEARCH_REQUIRED — Local title Быстрый, 20 кг; package Быстротвердеющий, 20 кг
- **Source (manufacturer official shop):** [https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-bystrotverdeyushij-samoniveliruyushij/](https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-bystrotverdeyushij-samoniveliruyushij/) — Official store lists Быстротвердеющий 20 kg but does not document Быстрый as same SKU.
- **Visual:** Brand/weight match; exact name/version equivalence unresolved. Bbox/fill {"left":205,"top":73,"width":569,"height":852,"fillWidthPercent":56.9,"fillHeightPercent":85.2,"limitingAxisFillPercent":85.2}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Wait for SKU/alias evidence.

### MAT-000078 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Старатели Толстый 25 кг
- **Production image URL:** /uploads/products/MAT-000078-2bc0525cc149295d.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000078.webp; 1200×1200 webp; SHA256 db2ea938b07876f1156b3ba314243ada92ff8e25a24d2d5db030a387b712b10a
- **Identity:** CONFIRMED — Старатели Толстый, 25 кг
- **Source (manufacturer official shop):** [https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-tolstyj/](https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-tolstyj/) — Official manufacturer shop exact product.
- **Visual:** Full/centered/white, 85.1%. Bbox/fill {"left":258,"top":62,"width":670,"height":1021,"fillWidthPercent":55.8,"fillHeightPercent":85.1,"limitingAxisFillPercent":85.1}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000079 — REFRAME

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Weber Vetonit 3000 20 кг
- **Production image URL:** /uploads/products/MAT-000079-ec61b1ee064e4891.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000079.webp; 1200×1200 webp; SHA256 c874cb10d5b95bb5b14343efdd2e78146f14316a8d2d24c681584fed0570c784
- **Identity:** CONFIRMED — Vetonit 3000, 20 кг
- **Source (manufacturer official):** [https://vetonit.com/product/vetonit_3000_20kg/](https://vetonit.com/product/vetonit_3000_20kg/) — Official Vetonit page confirms name and 20 kg.
- **Visual:** Full/clean, current 74.1%; preview 84.8%. Bbox/fill {"left":405,"top":183,"width":455,"height":888,"fillWidthPercent":37.9,"fillHeightPercent":74,"limitingAxisFillPercent":74}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000079.png; 1200×1200; SHA256 ecddfe7585729346b532574f0d6f71281d9d0ed6e0d07ebd91cfd727a078e812; bbox/fill {"left":311,"top":35,"width":579,"height":1130,"fillWidthPercent":48.3,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000079.webp; 1200 1200 webp; SHA256 863bb26c212b2eeeb647668c4ad35093a79ac677260fc9106de472ee2908bbf1; bbox/fill {"left":340,"top":92,"width":521,"height":1017,"fillWidthPercent":43.4,"fillHeightPercent":84.8,"limitingAxisFillPercent":84.8}

### MAT-000080 — REFRAME

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Weber Vetonit fast 4000 20 кг
- **Production image URL:** /uploads/products/MAT-000080-1bdd0d69bad4afdf.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000080.webp; 1200×1200 webp; SHA256 ef7536919615162f1c90b3ccb14af5390f2e1550813610e51b4e9e46748b32ed
- **Identity:** CONFIRMED — Vetonit fast 4000, 20 кг
- **Source (manufacturer official):** [https://vetonit.com/product/vetonit_fast_4000_20kg/](https://vetonit.com/product/vetonit_fast_4000_20kg/) — Official Vetonit page confirms model and 20 kg.
- **Visual:** Full/clean, current 74.1%; preview 84.8%. Bbox/fill {"left":405,"top":183,"width":455,"height":888,"fillWidthPercent":37.9,"fillHeightPercent":74,"limitingAxisFillPercent":74}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000080.png; 1200×1200; SHA256 130c5da3858b8115e6dfd1be485d5cd5a100d658172edb83ea37cc17763690ec; bbox/fill {"left":311,"top":35,"width":579,"height":1130,"fillWidthPercent":48.3,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000080.webp; 1200 1200 webp; SHA256 eac20fac2841135f439ac19758a7a9bc8bffb4b6f033ff575ff4208205130191; bbox/fill {"left":340,"top":92,"width":521,"height":1017,"fillWidthPercent":43.4,"fillHeightPercent":84.8,"limitingAxisFillPercent":84.8}

### MAT-000081 — REFRAME

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Weber Vetonit 4100 20 кг
- **Production image URL:** /uploads/products/MAT-000081-11f05a89cce5a535.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000081.webp; 1200×1200 webp; SHA256 17224461956aeeb3aa540cd5e27c7a868e2b5846b16145257505f23d0a80f737
- **Identity:** CONFIRMED — Vetonit 4100, 20 кг
- **Source (manufacturer official):** [https://vetonit.com/product/vetonit_4100_20kg/](https://vetonit.com/product/vetonit_4100_20kg/) — Official Vetonit page confirms model and 20 kg.
- **Visual:** Full/clean, current 74.1%; preview 84.8%. Bbox/fill {"left":405,"top":183,"width":455,"height":888,"fillWidthPercent":37.9,"fillHeightPercent":74,"limitingAxisFillPercent":74}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000081.png; 1200×1200; SHA256 3e8f085e77743cee845f8f0ebec6079c4d496cc750713772ed498affabf8470d; bbox/fill {"left":311,"top":35,"width":579,"height":1130,"fillWidthPercent":48.3,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000081.webp; 1200 1200 webp; SHA256 28fe45a5369ccb2a878c36c6fb1681d56051814cac30ef013cc7bfd79584d27f; bbox/fill {"left":340,"top":92,"width":521,"height":1017,"fillWidthPercent":43.4,"fillHeightPercent":84.8,"limitingAxisFillPercent":84.8}

### MAT-000082 — REFRAME

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Weber Vetonit 5000 25 кг
- **Production image URL:** /uploads/products/MAT-000082-d53ca909a64885ca.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000082.webp; 1200×1200 webp; SHA256 4b14c4c2e4cfa1807b90cccf9a3e936628740684bdf286e65f547e504b9bba69
- **Identity:** CONFIRMED — Vetonit 5000, 25 кг
- **Source (manufacturer official):** [https://www.vetonit.com/product/vetonit_5000_25kg/](https://www.vetonit.com/product/vetonit_5000_25kg/) — Official Vetonit page confirms model and 25 kg.
- **Visual:** Full/clean, current 78.5%; preview 84.8%. Bbox/fill {"left":405,"top":130,"width":454,"height":940,"fillWidthPercent":37.8,"fillHeightPercent":78.3,"limitingAxisFillPercent":78.3}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000082.png; 1200×1200; SHA256 cab9ca8cf9c7eaf47e8283d87a8c534057754827e9812f08776428ddae84cdb5; bbox/fill {"left":326,"top":35,"width":547,"height":1131,"fillWidthPercent":45.6,"fillHeightPercent":94.3,"limitingAxisFillPercent":94.3}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000082.webp; 1200 1200 webp; SHA256 410a639d11681220e0734ca950a62bccf7266ad55958eba9f3c80f72bb1dbbc0; bbox/fill {"left":354,"top":91,"width":493,"height":1018,"fillWidthPercent":41.1,"fillHeightPercent":84.8,"limitingAxisFillPercent":84.8}

### MAT-000083 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг
- **Production image URL:** /uploads/products/MAT-000083-9e454ab67e2e9c49.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000083.webp; 1200×1200 webp; SHA256 3156e2a6cb425495a10c2b4275dca9d590b40ca52312d1295e68364b8f5d8017
- **Identity:** CONFIRMED — LITOLIV S10 EXPRESS, 20 кг
- **Source (manufacturer official):** [https://www.litokol.ru/catalog/litoliv-s10-express/](https://www.litokol.ru/catalog/litoliv-s10-express/) — Official Litokol catalog and media.
- **Visual:** Exact carton, full/clean, 87.8%. Bbox/fill {"left":264,"top":75,"width":690,"height":1053,"fillWidthPercent":57.5,"fillHeightPercent":87.8,"limitingAxisFillPercent":87.8}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000084 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Litokol LITOLIV S50 EVO 20 кг
- **Production image URL:** /uploads/products/MAT-000084-0484b3e59dbe222e.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000084.webp; 1200×1200 webp; SHA256 7eacee2e479bfedab954c82cea7684b6ab0b3768de4991934de05449e0bb95dc
- **Identity:** CONFIRMED — LITOLIV S50 EVO, 20 кг
- **Source (manufacturer official shop):** [https://litokol-market.ru/catalog/styazhki-i-nalivnye-poly/litoliv-s50-evo/?offer=1005](https://litokol-market.ru/catalog/styazhki-i-nalivnye-poly/litoliv-s50-evo/?offer=1005) — Manufacturer-operated official shop exact offer.
- **Visual:** Exact carton, full/clean, 87.8%. Bbox/fill {"left":255,"top":74,"width":690,"height":1053,"fillWidthPercent":57.5,"fillHeightPercent":87.8,"limitingAxisFillPercent":87.8}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000085 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол ВОЛМА-Нивелир Экспресс 25 кг
- **Production image URL:** /uploads/products/MAT-000085-6f272833fe7b7600.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000085.webp; 1200×1200 webp; SHA256 4eb681b2c55272c3d7897b34ee38af6d89b46826b57f83f99316848b709fea38
- **Identity:** CONFIRMED — ВОЛМА-Нивелир Экспресс, 25 кг
- **Source (manufacturer official):** [https://www.volma.ru/production/catalog/mixtures-for-floor-leveling/volma-nivelir-ekspress-25kg/](https://www.volma.ru/production/catalog/mixtures-for-floor-leveling/volma-nivelir-ekspress-25kg/) — Official page confirms exact item and 25 kg.
- **Visual:** Full/clean, 87.3%. Bbox/fill {"left":247,"top":79,"width":691,"height":1047,"fillWidthPercent":57.6,"fillHeightPercent":87.3,"limitingAxisFillPercent":87.3}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000086 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Основит Скорлайн FK45 R 20 кг
- **Production image URL:** /uploads/products/MAT-000086-1e87031c75cddabb.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000086.webp; 1000×1000 webp; SHA256 b7c292a8a412b6b12b729c27057bbf13f93ac7f48cb4b3ec135b25098d517253
- **Identity:** CONFIRMED — Основит СКОРЛАЙН FK45 R, 20 кг
- **Source (manufacturer official):** [https://osnovit.ru/catalog/nalivnye-poly/skorlayn-fk45r/](https://osnovit.ru/catalog/nalivnye-poly/skorlayn-fk45r/) — Official page/media confirm exact model and 20 kg; red slogan is package art.
- **Visual:** Full/clean, 84.5%. Red БОЛЬШЕ ПРОЧНОСТИ mark is printed package art, not shop overlay. Bbox/fill {"left":259,"top":89,"width":482,"height":844,"fillWidthPercent":48.2,"fillHeightPercent":84.4,"limitingAxisFillPercent":84.4}; background white; watermark/mark: no foreign watermark; mark is package art; package fully visible with no clipping.
- **Action:** Keep.

### MAT-000087 — REBUILD

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол Ceresit CN 175 Super 20 кг
- **Production image URL:** /uploads/products/MAT-000087-7a16e32aaf4c137c.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000087.webp; 1000×1000 webp; SHA256 2e801d952dcfd0ac81b1d82b48a27f1dbe504c6b77a4c8071b4ae088ae6a3c78
- **Identity:** MISMATCH — Ceresit CN 175 Super; target 20 кг, package 25 кг
- **Source (manufacturer official):** [https://www.ceresit.ru/ru/products/flooring/levelling-compounds/cn_175_super](https://www.ceresit.ru/ru/products/flooring/levelling-compounds/cn_175_super) — Official page confirms both 20 and 25 kg; package reads 25 kg.
- **Visual:** Exact model, wrong weight; do not crop/relabel. Bbox/fill {"left":220,"top":28,"width":561,"height":939,"fillWidthPercent":56.1,"fillHeightPercent":93.9,"limitingAxisFillPercent":93.9}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Exact 20 kg rebuild brief.
- **Rebuild brief:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/rebuild/MAT-000087-brief.md — REBUILD_BRIEF_READY; no candidate generated.

### MAT-000089 — REFRAME

- **Subcategory:** Стяжки Пола
- **Title:** Легкая стяжка пола KNAUF Ubo 25 кг
- **Production image URL:** /uploads/products/MAT-000089-87cb5131957b411d.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000089.webp; 1000×1000 webp; SHA256 f31a6a5ab9a996e1a6cb252fc5fdcb96a92931600dc8436cc54015e3dbf2db83
- **Identity:** CONFIRMED — КНАУФ-Убо, 25 кг
- **Source (manufacturer official):** [https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/nalivnoy-pol-i-rovniteli/knauf-ubo/](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/nalivnoy-pol-i-rovniteli/knauf-ubo/) — Official Knauf page confirms Ubo 25 kg paper sack.
- **Visual:** Clean/full; current 93.9% width; preview 84.8%. Bbox/fill {"left":33,"top":245,"width":935,"height":507,"fillWidthPercent":93.5,"fillHeightPercent":50.7,"limitingAxisFillPercent":93.5}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000089.png; 1200×1200; SHA256 e5c69ea86340e869c124c046782e8f0478bc59c8fddc42cabf9d75eac1ca4ee0; bbox/fill {"left":35,"top":294,"width":1130,"height":613,"fillWidthPercent":94.2,"fillHeightPercent":51.1,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000089.webp; 1200 1200 webp; SHA256 197784d884e5419fcca5865cd96c571cab9f9eeb5e73bb20c8a5cf00aee2c98d; bbox/fill {"left":91,"top":324,"width":1017,"height":552,"fillWidthPercent":84.8,"fillHeightPercent":46,"limitingAxisFillPercent":84.8}

### MAT-000090 — REFRAME

- **Subcategory:** Стяжки Пола
- **Title:** Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг
- **Production image URL:** /uploads/products/MAT-000090-cb8956483c1321ae.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000090.webp; 1000×1000 webp; SHA256 6faff78e5aa3003baa421fd5efcc6310cedfa6b872709bba1b6533199d5b52f3
- **Identity:** CONFIRMED — Основит СТАРТОЛАЙН FC41 H, 25 кг
- **Source (manufacturer official shop):** [https://osnovit.market/product/ocnovit_startolayn_fc41_h_25_kg/](https://osnovit.market/product/ocnovit_startolayn_fc41_h_25_kg/) — Official shop confirms FC41 H/25 kg/article 72105; other packshots show same red ХИТ ПРОДАЖ! graphic on sack.
- **Visual:** Full/white; mark is integrated package art, not external overlay. Current 83.5%; preview 84.8%. Bbox/fill {"left":254,"top":97,"width":487,"height":833,"fillWidthPercent":48.7,"fillHeightPercent":83.3,"limitingAxisFillPercent":83.3}; background white; watermark/mark: no foreign watermark; mark is package art; package fully visible with no clipping.
- **Action:** Use pixel-preserving reframe.
- **Prepared source PNG:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe/MAT-000090.png; 1200×1200; SHA256 6def91e51d8f8b8624a7da64d7dac4446ebc3fa7fc1e648ba77ce20bb9c6ae9e; bbox/fill {"left":270,"top":35,"width":661,"height":1130,"fillWidthPercent":55.1,"fillHeightPercent":94.2,"limitingAxisFillPercent":94.2}
- **Canonical preview:** product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000090.webp; 1200 1200 webp; SHA256 1ffb471c9a2921434907f66a96af7bdc91e6dc98a926414e8341596f775755f9; bbox/fill {"left":303,"top":91,"width":595,"height":1017,"fillWidthPercent":49.6,"fillHeightPercent":84.8,"limitingAxisFillPercent":84.8}

## Reframe preparation

Seven PNG sources use only verified production pixels: crop outer white whitespace, proportional rescale, and center on a white 1200×1200 canvas. No redraw, inpainting, color edits, or package/logo/text edits. Previews use the existing importer renderWebp() (contain 1080, extend 60 px, white canvas, WebP quality 82). Per-file SHA256, dimensions, and bbox/fill are recorded above and in JSON.

Local contact sheets (untracked):

- product-images-batch/mix-images-reaudit-final3-batch1/review/01-current-production-contact-sheet.jpg
- product-images-batch/mix-images-reaudit-final3-batch1/review/02-reframe-preview-contact-sheet.jpg
- product-images-batch/mix-images-reaudit-final3-batch1/review/03-rebuild-review-contact-sheet.jpg (current references; no generated candidates)

## Rebuild briefs and unresolved identity

Four briefs are ready under product-images-batch/mix-images-reaudit-final3-batch1/prepared/rebuild/. No synthetic candidate was generated because this local workflow cannot guarantee exact model/weight typography and package details. MAT-000090's red ХИТ ПРОДАЖ! mark is integrated package artwork, confirmed by independent packshot references; it is REFRAME only.

MAT-000077 is the only unresolved case: the local title says Быстрый while the package and manufacturer listing say Быстротвердеющий, 20 kg. No exact SKU/alias equivalence was established. Keep the current image until product article/SKU evidence or manufacturer confirmation resolves the name.

## Validation and scope

- Exact MAT scope: MAT-000067, MAT-000068, MAT-000069, MAT-000075, MAT-000076, MAT-000077, MAT-000078, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000083, MAT-000084, MAT-000085, MAT-000086, MAT-000087, MAT-000089, MAT-000090 (18 total).
- Evidence archive SHA256 matches expected: f8e275df5ab887d04f4247672806f798eaf2c17671bfdbd1634813bf3970c05b.
- All evidence hashes, formats, dimensions and primary bindings match manifest.
- Generated PNG/WebPs decode; previews are 1200×1200 WebP with white corners; each reframe preview is 84.7–84.8% limiting-axis fill.
- Only the two review documents are commit candidates. Archive, extracted images, prepared files, briefs and contact sheets remain untracked.
- No product data, code, database, production uploads, SSH, deploy or production package changed.
