"use strict";

const CHECKED_AT = "2026-09-18";
const EXPECTED_CATEGORY = "Грунт / БетонКонтакт";
const EXPECTED_SUBCATEGORY = "Грунтовка";
const SOURCES = Object.freeze({
  knaufTiefengrund: { title: "KNAUF Tiefengrund — официальный сайт", url: "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/", owner: "KNAUF", evidence: "Official page lists 5 kg and 10 kg buckets." },
  knaufMultigrund: { title: "KNAUF Multigrund — официальный сайт", url: "https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/", owner: "KNAUF", evidence: "Official page lists 5 kg and 10 kg buckets." },
  litokolPrimerA: { title: "LITOKOL Primer A — официальный сайт", url: "https://www.litokol.ru/catalog/primer-a/", owner: "LITOKOL", evidence: "Official page lists the 10 kg package option." },
  oscarG: { title: "Oscar G os-10kg — brand support", url: "https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html", owner: "Oscar / Alaxar", evidence: "Brand support identifies article G os-10kg and net weight 10 kg." },
  oscarCatalog: { title: "Oscar — brand catalog PDF", url: "https://itelgroup-bucket.storage.yandexcloud.net/Production/exb_doc/2032/4956/%D0%9F%D1%80%D0%B0%D0%B9%D1%81-%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3_300425_preview2.pdf", owner: "Oscar / brand catalog", evidence: "Catalog identifies G os-10kg and a 10 kg plastic bucket." },
  knaufMittelgrund: { title: "KNAUF Mittelgrund — официальный сайт", url: "https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/", owner: "KNAUF", evidence: "Official KNAUF catalog lists a 10 kg plastic bucket." }
});

const PRODUCTS = Object.freeze([
  { externalId: "MAT-000227", oldTitle: "Грунтовка Knauf Тифенгрунд 5 л", newTitle: "Грунтовка Knauf Тифенгрунд 5 кг", officialName: "КНАУФ-Тифенгрунд", package: "5 кг", sourceKeys: ["knaufTiefengrund"] },
  { externalId: "MAT-000228", oldTitle: "Грунтовка Knauf Тифенгрунд 10 л", newTitle: "Грунтовка Knauf Тифенгрунд 10 кг", officialName: "КНАУФ-Тифенгрунд", package: "10 кг", sourceKeys: ["knaufTiefengrund"] },
  { externalId: "MAT-000230", oldTitle: "Грунтовка Knauf Мульти Грунд универсальный 10 л", newTitle: "Грунтовка Knauf Мульти Грунд универсальный 10 кг", officialName: "КНАУФ-Мультигрунд", package: "10 кг", sourceKeys: ["knaufMultigrund"] },
  { externalId: "MAT-000234", oldTitle: "Грунт Litokol PRIMER A универсальный укрепляющий 10 л", newTitle: "Грунт Litokol PRIMER A универсальный укрепляющий 10 кг", officialName: "LITOKOL Primer A", package: "10 кг", sourceKeys: ["litokolPrimerA"] },
  { externalId: "MAT-000237", oldTitle: "Грунтовка Oscar глубокого проникновения 10 л", newTitle: "Грунтовка Oscar глубокого проникновения 10 кг", officialName: "Oscar G os-10kg", package: "10 кг", sourceKeys: ["oscarG", "oscarCatalog"] },
  { externalId: "MAT-000240", oldTitle: "Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л", newTitle: "Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 кг", officialName: "КНАУФ-Миттельгрунд", package: "10 кг", sourceKeys: ["knaufMittelgrund"] }
]);

module.exports = { CHECKED_AT, EXPECTED_CATEGORY, EXPECTED_SUBCATEGORY, SOURCES, PRODUCTS, TARGET_MATS: Object.freeze(PRODUCTS.map(p => p.externalId)) };
