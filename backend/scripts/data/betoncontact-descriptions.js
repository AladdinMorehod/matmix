"use strict";

const CHECKED_AT = "2026-09-19";
const SOURCES = Object.freeze({
  knaufBetogrund: { title: "КНАУФ-Бетогрунд", owner: "KNAUF Russia", url: "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/" },
  ceresitCt19: { title: "Ceresit CT 19 Бетонконтакт", owner: "Ceresit Russia", url: "https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact" },
  starateliBeton: { title: "Грунтовка БЕТОН-КОНТАКТ", owner: "Старатели", url: "https://www.starateli.ru/po-betonu/" }
});
const expectedCategory = "Грунт / БетонКонтакт";
const expectedSubcategory = "БетонКонтакт";
const product = (externalId, expectedTitle, proposedDescription, sourceKeys) => ({ externalId, expectedTitle, expectedCategory, expectedSubcategory, proposedDescription, sourceKeys });
const PRODUCTS = Object.freeze([
  product("MAT-000217", "Бетонконтакт Knauf Бетогрунд 5 кг", "КНАУФ-Бетогрунд — готовая к применению адгезионная грунтовка на полимерной дисперсии с кварцевым песком. Предназначена для подготовки бетонных и гладких плотных оснований перед нанесением последующих покрытий во внутренних работах. Расход — около 0,25 кг/м², высыхание — 12 часов. Цвет — розовый. Фасовка — 5 кг.", ["knaufBetogrund"]),
  product("MAT-000218", "Бетонконтакт Knauf Бетогрунд 15 кг", "КНАУФ-Бетогрунд — готовая к применению адгезионная грунтовка на полимерной дисперсии с кварцевым песком. Предназначена для подготовки бетонных и гладких плотных оснований перед нанесением последующих покрытий во внутренних работах. Расход — около 0,25 кг/м², высыхание — 12 часов. Цвет — розовый. Фасовка — 15 кг.", ["knaufBetogrund"]),
  product("MAT-000219", "Бетонконтакт Ceresit CT 19, 5 кг", "Ceresit CT 19 — готовая к применению адгезионная грунтовка для гладких бетонных, монолитных и сборных железобетонных оснований. Предназначена для внутренних и наружных работ и повышения адгезии последующих покрытий. Расход — около 0,2 кг/м², высыхание — около 3 часов, температура применения — от +5 до +30 °C. Цвет — розовый. Фасовка — 5 кг.", ["ceresitCt19"]),
  product("MAT-000220", "Бетонконтакт Ceresit CT 19, 15 кг", "Ceresit CT 19 — готовая к применению адгезионная грунтовка для гладких бетонных, монолитных и сборных железобетонных оснований. Предназначена для внутренних и наружных работ и повышения адгезии последующих покрытий. Расход — около 0,2 кг/м², высыхание — около 3 часов, температура применения — от +5 до +30 °C. Цвет — розовый. Фасовка — 15 кг.", ["ceresitCt19"]),
  product("MAT-000221", "Бетонконтакт Cтаратели 20 кг", "Грунтовка «БЕТОН-КОНТАКТ» «Старатели» — готовый к применению состав на полимерной дисперсии с песком. Используется для подготовки бетонных, плиточных и окрашенных масляной краской оснований во внутренних работах. Наносится валиком или кистью. Расход — 0,2–0,3 кг/м², высыхание — 2–3 часа, температура применения — от +5 до +30 °C. Цвет плёнки — вишнёвый. Фасовка — 20 кг.", ["starateliBeton"])
]);
const TARGET_MATS = Object.freeze(PRODUCTS.map(item => item.externalId));
module.exports = { CHECKED_AT, SOURCES, PRODUCTS, TARGET_MATS };
