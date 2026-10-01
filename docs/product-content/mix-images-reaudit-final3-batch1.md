# MatMix — final3 production image re-audit

Branch: codex/mix-images-reaudit-final3-batch1
Previous feature HEAD: 38c426d613304e08bcee9d26239e73647c5a6312
Base origin/main: 3d3dbccdc83422c1dc937c7dc7c673128234705f

## Current checkpoint

PRODUCTION_IMAGE_EVIDENCE_VERIFIED. Owner-supplied read-only archive SHA256: f8e275df5ab887d04f4247672806f798eaf2c17671bfdbd1634813bf3970c05b. Exact 18-MAT manifest, image hashes/formats/dimensions and bindings were checked. Captured DB integrity was ok, schema version 11, zero FK violations, one primary and zero gallery images per product. This task used the local archive only; no production or SSH connection.

## Preserved prior checkpoint

The prior 18 × RESEARCH_REQUIRED checkpoint remains preserved verbatim in JSON checkpoints[0].checkpoint and is marked SUPERSEDED_BY_PRODUCTION_IMAGE_EVIDENCE.

## Summary

| Subcategory | Total | KEEP | REFRAME | REBUILD | RESEARCH_REQUIRED |
|---|---:|---:|---:|---:|---:|
| Кладочные Смеси | 3 | 1 | 1 | 1 | 0 |
| Наливной Пол | 13 | 6 | 4 | 3 | 0 |
| Стяжки Пола | 2 | 0 | 2 | 0 | 0 |
| **Total** | **18** | **7** | **7** | **4** | **0** |

OWNER_REVIEW_REQUIRED: 0.

KEEP: MAT-000067, MAT-000077, MAT-000078, MAT-000083, MAT-000084, MAT-000085, MAT-000086
REFRAME: MAT-000069, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000089, MAT-000090
REBUILD: MAT-000068, MAT-000075, MAT-000076, MAT-000087
RESEARCH_REQUIRED: none
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
- **Handoff:** product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff/MAT-000068/README.md; no candidate generated.

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
- **Evidence:** 1000×1000 WebP; SHA256 afc7f8282f7e6c088bc9d6c872162de7cf9f01e49fde08858945f7c4b95b0dd9
- **Target identity:** CONFIRMED by owner-provided MAT-specific exact package and identity decision: **UNIS Горизонт Универсальный М-45, 20 кг**. The official UNIS page corroborates the current M-45 identity and 20 kg option: [official page](https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/).
- **Current mismatch:** Production image shows the 30 kg pack. Do not crop/relabel or substitute Армированный/another variant.
- **Remaining point:** No identity/variant uncertainty remains. A verified exact 20 kg package image asset is still needed; the original owner package reference is not present in this batch directory.
- **Handoff:** [README](../../product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff/MAT-000075/README.md); candidate not created.

### MAT-000076 — REBUILD

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол UNIS Горизонт Армированный 25 кг
- **Production image URL:** /uploads/products/MAT-000076-321924509b42300f.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000076.webp; 1000×1000 webp; SHA256 af93d91aea5363720b15d62fe21c29bdaf3ad4cd6d1e4a274aa3c2ec6ca9b61e
- **Identity:** MISMATCH — UNIS Горизонт Армированный, target 25 кг
- **Source (manufacturer official):** [https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/](https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/) — Official page confirms armored 25 kg; package says 30 kg and evidence alt says 20 kg.
- **Visual:** Wrong package weight; exact 25 kg local reference sources exist. Bbox/fill {"left":254,"top":72,"width":492,"height":855,"fillWidthPercent":49.2,"fillHeightPercent":85.5,"limitingAxisFillPercent":85.5}; background white; watermark/mark: none observed; package fully visible with no clipping.
- **Action:** Rebuild from exact 25 kg reference.
- **Handoff:** product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff/MAT-000076/README.md; no candidate generated.

### MAT-000077 — KEEP

- **Subcategory:** Наливной Пол
- **Title:** Наливной пол "Старатели" Быстрый 20 кг (title preserved; not treated as a technical source)
- **Production image URL:** /uploads/products/MAT-000077-a2ff7cd16c732bb5.webp
- **Evidence:** product-images-batch/mix-images-reaudit-final3-batch1/evidence/extracted/images/MAT-000077.webp; 1000×1000 WebP; SHA256 8bd4d3ef56aaa9e5f28c1963ac7a2cceef4c3d11615c58f06f43766109eac1cf
- **Identity:** IDENTITY_EQUIVALENT_CONFIRMED for the exact owner-bound MAT. Owner-provided package evidence explicitly reads Старатели / НАЛИВНОЙ ПОЛ / БЫСТРОТВЕРДЕЮЩИЙ / 20 кг and the existing MAT-specific identity review binds that package to MAT-000077. The current official manufacturer page corroborates the Быстротвердеющий product and 20 kg option: [product page](https://www.starateli.ru/nalivnoi_pol_bistrodeistvuyushiy/), [official shop](https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-bystrotverdeyushij-samoniveliruyushij/).
- **Identity boundary:** This evidence confirms the current package for this MAT; it does not prove that “Быстрый” was a formal historical alias/renamed SKU or that old/new formulas are continuous. No such claim is made. Owner identity record: [floor-075-077-identity-review.json](floor-075-077-identity-review.json).
- **Visual:** Full, white, clean, no watermark/overlay, no clipping; bbox/fill {"left":205,"top":73,"width":569,"height":852,"fillWidthPercent":56.9,"fillHeightPercent":85.2,"limitingAxisFillPercent":85.2}.
- **Action:** Keep current image; title and product data are unchanged.

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
- **Handoff:** product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff/MAT-000087/README.md; no candidate generated.

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

## Resolution pass and handoff readiness

### MAT-000077 identity resolution

The current image is **KEEP**. This is based on MAT-specific owner-provided package and identity evidence for the exact 20 kg package, corroborated by the current official manufacturer page. Similar wording alone was not used. The research does **not** establish “Быстрый” as a formal historical alias or prove formula continuity; local title/product data remain unchanged.

### Seven REFRAME artifacts — verification PASS

For every row, source PNG and preview WebP are 1200×1200; recorded SHA256 and bbox/fill matched; package is complete with no clipping; white canvas/corners verified. Each preview regenerated through the existing importer renderWebp() was byte-identical. Independent pixel-lineage comparison was consistent with proportional crop/resampling only (no redraw, inpainting, or edits to text, logos, colors, or package artwork).

| MAT | Source PNG SHA256 | Preview WebP SHA256 | Preview fill | Preview path |
|---|---|---|---:|---|
| MAT-000069 | b8befd9f343cbbeb49e7ee357456dc09606fee7d070a337cd63e53401ab4f2b4 | aacef16e3cbef44273d59047c7b502c62261a04848870af67eea8f228992ca59 | 84.7% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000069.webp |
| MAT-000079 | ecddfe7585729346b532574f0d6f71281d9d0ed6e0d07ebd91cfd727a078e812 | 863bb26c212b2eeeb647668c4ad35093a79ac677260fc9106de472ee2908bbf1 | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000079.webp |
| MAT-000080 | 130c5da3858b8115e6dfd1be485d5cd5a100d658172edb83ea37cc17763690ec | eac20fac2841135f439ac19758a7a9bc8bffb4b6f033ff575ff4208205130191 | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000080.webp |
| MAT-000081 | 3e8f085e77743cee845f8f0ebec6079c4d496cc750713772ed498affabf8470d | 28fe45a5369ccb2a878c36c6fb1681d56051814cac30ef013cc7bfd79584d27f | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000081.webp |
| MAT-000082 | cab9ca8cf9c7eaf47e8283d87a8c534057754827e9812f08776428ddae84cdb5 | 410a639d11681220e0734ca950a62bccf7266ad55958eba9f3c80f72bb1dbbc0 | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000082.webp |
| MAT-000089 | e5c69ea86340e869c124c046782e8f0478bc59c8fddc42cabf9d75eac1ca4ee0 | 197784d884e5419fcca5865cd96c571cab9f9eeb5e73bb20c8a5cf00aee2c98d | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000089.webp |
| MAT-000090 | 6def91e51d8f8b8624a7da64d7dac4446ebc3fa7fc1e648ba77ce20bb9c6ae9 | 1ffb471c9a2921434907f66a96af7bdc91e6dc98a926414e8341596f775755f9 | 84.8% | product-images-batch/mix-images-reaudit-final3-batch1/prepared/reframe-preview/MAT-000090.webp |

REFRAME_7_READY_FOR_OWNER_REVIEW=true.

### Four REBUILD handoffs

No fake final packshots were generated. Every directory contains an exact current-production image copy, a brief with target identity and visual requirements, and reference notes; available local reference files are copied separately. All four require exact target artwork before a replacement can be accepted.

| MAT | Exact target | Current issue / remaining point | Handoff |
|---|---|---|---|
| MAT-000068 | Русеан М-200 монтажно-кладочная смесь, 40 кг | Current exact pack is crossed by a third-party СТРОЙПЛАЗА.RU watermark. Do not remove/copy it; clean exact source or controlled exact catalog image still required. | product-images-batch/mix-images-reaudit-final3-batch1/rebuild-handoff/MAT-000068/ |
| MAT-000075 | UNIS Горизонт Универсальный М-45, 20 кг | Production is 30 kg and remains negative-only. Exact 20 kg legacy-facing UNIS Горизонт Универсальный visual is local and verified; the package does not visibly say M-45, so do not add that label to the artwork. | product-images-batch/mix-images-reaudit-final3-batch1/rebuild-handoff/MAT-000075/ |
| MAT-000076 | UNIS Горизонт Армированный, 25 кг | Production is 30 kg; local front/back 25 kg references support weight, but upstream provenance for alternate local refs is not recorded. Verify provenance/rights before production use. | product-images-batch/mix-images-reaudit-final3-batch1/rebuild-handoff/MAT-000076/ |
| MAT-000087 | Ceresit CN 175 Super, 20 кг | Production image is 25 kg and remains negative-only. Exact CN 175 SUPER 20 kg front visual is local and verified; do not use or relabel the 25 kg package. | product-images-batch/mix-images-reaudit-final3-batch1/rebuild-handoff/MAT-000087/ |

REBUILD_4_HANDOFF_READY=true for generation: all four exact-scope MATs have local, decoded and visually checked target references. No synthetic candidate has been generated; production rollout remains open.

### Owner contact sheets

- Reframe previews: product-images-batch/mix-images-reaudit-final3-batch1/review/final3-reframe-7-contact-sheet.jpg
- Current REBUILD production images: product-images-batch/mix-images-reaudit-final3-batch1/review/final3-rebuild-4-current-contact-sheet.jpg
- MAT-000077 identity evidence: product-images-batch/mix-images-reaudit-final3-batch1/review/MAT-000077-identity-review.jpg

These files are local untracked review artifacts.

## Package A — REFRAME_7

**Checkpoint:** PACKAGE_A_PREPARED
**Status:** READY_FOR_PRODUCTION_DRY_RUN
**Working directory:** product-images-batch/mix-images-reaudit-final3-batch1/production-package-a/
**Importer input directory:** production-package-a/images/ (contains exactly seven PNGs; manifest is outside this directory)
**Archive:** product-images-batch/mix-images-reaudit-final3-batch1/mix-images-final3-reframe-package-a.tar.gz
**Archive SHA256:** 104ddb3f1d484da22ccc8eecdd194e5cf9b7ce478cbcbeadf977907b438538e0
**Archive size:** 5,509,842 bytes; **files:** 8 (manifest + seven images).

| MAT | Package source | Source SHA256 | Canonical preview SHA256 | Preview fill |
|---|---|---|---|---:|
| MAT-000069 | production-package-a/images/MAT-000069.png | b8befd9f343cbbeb49e7ee357456dc09606fee7d070a337cd63e53401ab4f2b4 | aacef16e3cbef44273d59047c7b502c62261a04848870af67eea8f228992ca59 | 84.7% |
| MAT-000079 | production-package-a/images/MAT-000079.png | ecddfe7585729346b532574f0d6f71281d9d0ed6e0d07ebd91cfd727a078e812 | 863bb26c212b2eeeb647668c4ad35093a79ac677260fc9106de472ee2908bbf1 | 84.8% |
| MAT-000080 | production-package-a/images/MAT-000080.png | 130c5da3858b8115e6dfd1be485d5cd5a100d658172edb83ea37cc17763690ec | eac20fac2841135f439ac19758a7a9bc8bffb4b6f033ff575ff4208205130191 | 84.8% |
| MAT-000081 | production-package-a/images/MAT-000081.png | 3e8f085e77743cee845f8f0ebec6079c4d496cc750713772ed498affabf8470d | 28fe45a5369ccb2a878c36c6fb1681d56051814cac30ef013cc7bfd79584d27f | 84.8% |
| MAT-000082 | production-package-a/images/MAT-000082.png | cab9ca8cf9c7eaf47e8283d87a8c534057754827e9812f08776428ddae84cdb5 | 410a639d11681220e0734ca950a62bccf7266ad55958eba9f3c80f72bb1dbbc0 | 84.8% |
| MAT-000089 | production-package-a/images/MAT-000089.png | e5c69ea86340e869c124c046782e8f0478bc59c8fddc42cabf9d75eac1ca4ee0 | 197784d884e5419fcca5865cd96c571cab9f9eeb5e73bb20c8a5cf00aee2c98d | 84.8% |
| MAT-000090 | production-package-a/images/MAT-000090.png | 6def91e51d8f8b8624a7da64d7dac4446ebc3fa7fc1e648ba77ce20bb9c6ae9e | 1ffb471c9a2921434907f66a96af7bdc91e6dc98a926414e8341596f775755f9 | 84.8% |

Manifest validation passed: task/package name, exact ordered seven-MAT scope, source path/hash, PNG 1200×1200, REFRAME classification, pixel-preserving status, prior owner-review policy, production evidence verification, source visual verification, and canonical preview SHA are recorded. Package archive validation passed: safe relative paths, one manifest, exactly seven PNGs and no extra images. Re-running the existing importer renderWebp() against all seven package copies reproduced all expected preview SHA256 values.

Archive file list:

- production-package-a/manifest.json
- production-package-a/images/MAT-000069.png
- production-package-a/images/MAT-000079.png
- production-package-a/images/MAT-000080.png
- production-package-a/images/MAT-000081.png
- production-package-a/images/MAT-000082.png
- production-package-a/images/MAT-000089.png
- production-package-a/images/MAT-000090.png

KEEP remains untouched: MAT-000067, MAT-000077, MAT-000078, MAT-000083, MAT-000084, MAT-000085, MAT-000086. Package B now has a complete rebuild handoff for MAT-000068, MAT-000075, MAT-000076 and MAT-000087. This checkpoint does not close the overall final3 rollout. No production importer, dry-run, backup, upload, apply, SSH, or deploy was used.

## Validation and scope

- Exact MAT scope: MAT-000067, MAT-000068, MAT-000069, MAT-000075, MAT-000076, MAT-000077, MAT-000078, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000083, MAT-000084, MAT-000085, MAT-000086, MAT-000087, MAT-000089, MAT-000090 (18 total).
- Evidence archive SHA256 matches expected: f8e275df5ab887d04f4247672806f798eaf2c17671bfdbd1634813bf3970c05b.
- All evidence hashes, formats, dimensions and primary bindings match manifest.
- Generated PNG/WebPs decode; previews are 1200×1200 WebP with white corners; each reframe preview is 84.7–84.8% limiting-axis fill.
- Only the two review documents are commit candidates. Archive, extracted images, prepared files, handoff folders and contact sheets remain untracked.
- No product data, code, database, production uploads, SSH, deploy, importer apply or production package changed.


MAT_000077_IDENTITY_RESOLVED=true
REFRAME_7_READY_FOR_OWNER_REVIEW=true
REBUILD_4_HANDOFF_READY=true
FINAL3_READY_FOR_OWNER_VISUAL_REVIEW=true
NO_PRODUCTION_ACTIONS=true


## Package A — production verification checkpoint (owner-supplied evidence)

Package A (REFRAME_7) was applied and independently verified by the owner/operator. This documentation update records supplied verifier output; no production systems or files were accessed during this task. Final status: **PRODUCTION_APPLIED_AND_VERIFIED**.

- Exact MAT scope: MAT-000069, MAT-000079, MAT-000080, MAT-000081, MAT-000082, MAT-000089, MAT-000090.
- Verified backup: `/var/lib/matmix/matmix.db.backup-2026-10-01T10-32-55-743Z-2d1e6034e1eb`; 4,141,056 bytes; SHA256 `eac557891010a1774b16d156f34300cd103d71a90f9cb2dac74142d68465eb2c`; SQLite user_version 11.
- Binding manifest: `/var/lib/matmix/matmix.db.image-bindings-2026-10-01T10-32-55-743Z.json`. Apply audit: `/var/lib/matmix/matmix.db.image-import-audit-2026-10-01T10-32-55-743Z.json`.
- Verified database health: integrity `ok`, schema version 11, foreign-key violations 0; live and backup health PASS.
- Exact database scope: only `products.image_url` for these seven MAT rows and only the corresponding primary `product_images.image_url` bindings changed. No other product row or product_images row changed, according to supplied independent verifier.

| MAT | Final production image URL | WebP | SHA256 | Bytes |
|---|---|---|---|---:|
| MAT-000069 | /uploads/products/MAT-000069-b8befd9f343cbbeb.webp | 1200×1200 | aacef16e3cbef44273d59047c7b502c62261a04848870af67eea8f228992ca59 | 58644 |
| MAT-000079 | /uploads/products/MAT-000079-ecddfe7585729346.webp | 1200×1200 | 863bb26c212b2eeeb647668c4ad35093a79ac677260fc9106de472ee2908bbf1 | 44612 |
| MAT-000080 | /uploads/products/MAT-000080-130c5da3858b8115.webp | 1200×1200 | eac20fac2841135f439ac19758a7a9bc8bffb4b6f033ff575ff4208205130191 | 45064 |
| MAT-000081 | /uploads/products/MAT-000081-3e8f085e77743cee.webp | 1200×1200 | 28fe45a5369ccb2a878c36c6fb1681d56051814cac30ef013cc7bfd79584d27f | 42816 |
| MAT-000082 | /uploads/products/MAT-000082-cab9ca8cf9c7eaf4.webp | 1200×1200 | 410a639d11681220e0734ca950a62bccf7266ad55958eba9f3c80f72bb1dbbc0 | 40536 |
| MAT-000089 | /uploads/products/MAT-000089-e5c69ea86340e869.webp | 1200×1200 | 197784d884e5419fcca5865cd96c571cab9f9eeb5e73bb20c8a5cf00aee2c98d | 31482 |
| MAT-000090 | /uploads/products/MAT-000090-6def91e51d8f8b86.webp | 1200×1200 | 1ffb471c9a2921434907f66a96af7bdc91e6dc98a926414e8341596f775755f9 | 55716 |

Verifier PASS markers: `BACKUP_SHA_OK`, `LIVE_HEALTH_OK`, `integrity=ok`, `user_version=11`, `fk=0`, `BACKUP_HEALTH_OK`, `DATABASE_HEALTH_OK`, `PRODUCT_CHANGE_SCOPE_OK`, `BINDING_CHANGE_SCOPE_OK`, `IMPORTER_AUDIT_EVIDENCE_OK`, `FINAL3_PACKAGE_A_7_IMAGES_OK`, `FINAL3_PACKAGE_A_NO_OUT_OF_SCOPE_DB_CHANGES`, `FINAL3_PACKAGE_A_POST_APPLY_VERIFY_OK`, `READ_ONLY_POST_APPLY_VERIFICATION_COMPLETE`.

## Package B — ChatGPT rebuild handoff

Exact scope: MAT-000068, MAT-000075, MAT-000076, MAT-000087. Handoff root: `product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff/`; rebuilt archive: `product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff.tar.gz`.

Generation readiness: MAT-000068=true; MAT-000075=true; MAT-000076=true; MAT-000087=true. Both previously blocked target visuals are now local, decoded and visually inspected. Package A production verification above is unchanged. Package B remains a handoff for synthetic review candidates only; none were generated or applied, and the overall final3 rollout remains **NOT CLOSED**.

### Repaired references

| MAT | Exact local reference | Source page | Direct asset | Format / dimensions | SHA256 | Visual identity note |
|---|---|---|---|---|---|---|
| MAT-000075 | `MAT-000075/references/unis-horizon-universal-m45-20kg-mirax.jpg` | [Mirax 20 kg listing](https://www.miraxstroy.ru/bystrotverdeyushchiy-nalivnoy-pol-yunis-gorizont-universalnyy-meshok-20kg/) | [JPG](https://www.miraxstroy.ru/upload/iblock/705/705a66758af13cca2b64e76997a5d214.jpg) | JPEG, 800×800, 124033 bytes | `d84ac566d445db42fd6fbc8e6c925c25d3826c24db4d4f80f10c78ee6e8e9c57` | UNIS Горизонт Универсальный sack with visible 20 kg. Legacy-facing art does not show M-45; prompt forbids adding it. |
| MAT-000087 | `MAT-000087/references/ceresit-cn-175-super-20kg-psp.png` | [PSP exact 20 kg listing](https://psp-spb.ru/katalog-kompanii-psp/ceresit/nalivnyie-polyi/kopiya-nalivnoj-pol-universalnyij-ceresit-cn173-samovyiravnivayushhijsya-20-kg.html) | [PNG](https://psp-spb.ru/uploads/images/products/2518/big2/cn-175-20kg.png) | PNG, 500×500, 96335 bytes | `77de258ac1cc25c4bd90cc8204d620b7c46d920c727ba9bcca231a67e419596e` | Visible Церезит / CN 175 / SUPER / 20 kg. Official identity and pack sizes also supported by [Henkel TDS](https://dm.henkel-dam.com/is/content/henkel/tds-ru-ceresit-cn175pdf). |

The VseInstrumenti and Petrovich image candidates for MAT-000075 were rejected after download: both showed a UNIS 1 L container, not the required 20 kg sack. They are excluded from the handoff. The 30 kg production image for MAT-000075 and 25 kg production image for MAT-000087 remain negative-only references.

### Final markers

`FINAL3_PACKAGE_A_PRODUCTION_APPLIED_AND_VERIFIED=true`

`FINAL3_PACKAGE_B_MAT075_REFERENCE_READY=true`

`FINAL3_PACKAGE_B_MAT087_REFERENCE_READY=true`

`FINAL3_PACKAGE_B_HANDOFF_READY=true`

`FINAL3_PACKAGE_B_HANDOFF_ARCHIVE_VERIFY_OK=true`

`FINAL3_ROLLOUT_CLOSED=false`

### Archive validation

- Archive: `product-images-batch/mix-images-reaudit-final3-batch1/chatgpt-rebuild-handoff.tar.gz`
- Size: 2,988,225 bytes; SHA256: `fb71c199c9889744083aaf6488bf155133a39f24e52292eb2aa84183571b24a2`.
- Exactly 42 files, one manifest and exactly four MAT directories; no Package A files or unrelated MAT. All archive paths are relative and contain no parent traversal.
- All manifest-listed references exist in the archive. All 20 image files decode with Sharp; dimensions, format, byte size and SHA256 match the archive manifest.

Complete archive file list:

- `chatgpt-rebuild-handoff/MAT-000068/brief.md`
- `chatgpt-rebuild-handoff/MAT-000068/current-production.webp`
- `chatgpt-rebuild-handoff/MAT-000068/generation-prompt.txt`
- `chatgpt-rebuild-handoff/MAT-000068/reference-01-official-context-watermarked.jpg`
- `chatgpt-rebuild-handoff/MAT-000068/references.txt`
- `chatgpt-rebuild-handoff/MAT-000068/references/current-production-watermarked-identity-only.webp`
- `chatgpt-rebuild-handoff/MAT-000068/references/rusean-official-context-watermarked.jpg`
- `chatgpt-rebuild-handoff/MAT-000068/sources.md`
- `chatgpt-rebuild-handoff/MAT-000068/target.txt`
- `chatgpt-rebuild-handoff/MAT-000075/brief.md`
- `chatgpt-rebuild-handoff/MAT-000075/current-production.webp`
- `chatgpt-rebuild-handoff/MAT-000075/generation-prompt.txt`
- `chatgpt-rebuild-handoff/MAT-000075/reference-01-current-production-30kg-negative-reference.webp`
- `chatgpt-rebuild-handoff/MAT-000075/references.txt`
- `chatgpt-rebuild-handoff/MAT-000075/references/current-production-wrong-30kg-negative-reference.webp`
- `chatgpt-rebuild-handoff/MAT-000075/references/owner-mat-identity-excerpt.json`
- `chatgpt-rebuild-handoff/MAT-000075/references/unis-horizon-universal-m45-20kg-mirax.jpg`
- `chatgpt-rebuild-handoff/MAT-000075/sources.md`
- `chatgpt-rebuild-handoff/MAT-000075/target.txt`
- `chatgpt-rebuild-handoff/MAT-000076/brief.md`
- `chatgpt-rebuild-handoff/MAT-000076/current-production.webp`
- `chatgpt-rebuild-handoff/MAT-000076/generation-prompt.txt`
- `chatgpt-rebuild-handoff/MAT-000076/reference-01-front-25kg.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/reference-02-back-25kg.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/reference-03-official-small.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/references.txt`
- `chatgpt-rebuild-handoff/MAT-000076/references/current-production-wrong-30kg-negative-reference.webp`
- `chatgpt-rebuild-handoff/MAT-000076/references/unis-armirovannyi-back-25kg.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/references/unis-armirovannyi-front-25kg.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/references/unis-official-family-small.jpg`
- `chatgpt-rebuild-handoff/MAT-000076/sources.md`
- `chatgpt-rebuild-handoff/MAT-000076/target.txt`
- `chatgpt-rebuild-handoff/MAT-000087/brief.md`
- `chatgpt-rebuild-handoff/MAT-000087/current-production.webp`
- `chatgpt-rebuild-handoff/MAT-000087/generation-prompt.txt`
- `chatgpt-rebuild-handoff/MAT-000087/reference-01-current-production-25kg-negative-reference.webp`
- `chatgpt-rebuild-handoff/MAT-000087/references.txt`
- `chatgpt-rebuild-handoff/MAT-000087/references/ceresit-cn-175-super-20kg-psp.png`
- `chatgpt-rebuild-handoff/MAT-000087/references/current-production-wrong-25kg-negative-reference.webp`
- `chatgpt-rebuild-handoff/MAT-000087/sources.md`
- `chatgpt-rebuild-handoff/MAT-000087/target.txt`
- `chatgpt-rebuild-handoff/manifest.json`

No Package A production data was changed by this repair. No production access, SSH, deploy, image apply or candidate generation was performed.
