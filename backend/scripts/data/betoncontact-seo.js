"use strict";
const { CHECKED_AT, SOURCES } = require("./betoncontact-descriptions");
const expectedCategory = "Грунт / БетонКонтакт";
const expectedSubcategory = "БетонКонтакт";
const p = (externalId, expectedTitle, proposedSeoTitle, proposedSeoDescription, sourceKeys) => ({ externalId, expectedTitle, expectedCategory, expectedSubcategory, proposedSeoTitle, proposedSeoDescription, sourceKeys });
const PRODUCTS = Object.freeze([
  p("MAT-000217", "Бетонконтакт Knauf Бетогрунд 5 кг", "KNAUF Бетогрунд 5 кг — бетонконтакт | MatMix", "KNAUF Бетогрунд 5 кг — готовая адгезионная грунтовка для бетонных и гладких оснований. Расход около 0,25 кг/м², высыхание 12 часов.", ["knaufBetogrund"]),
  p("MAT-000218", "Бетонконтакт Knauf Бетогрунд 15 кг", "KNAUF Бетогрунд 15 кг — бетонконтакт | MatMix", "KNAUF Бетогрунд 15 кг — готовая адгезионная грунтовка для бетонных и гладких оснований. Расход около 0,25 кг/м², высыхание 12 часов.", ["knaufBetogrund"]),
  p("MAT-000219", "Бетонконтакт Ceresit CT 19, 5 кг", "Ceresit CT 19 5 кг — бетонконтакт | MatMix", "Ceresit CT 19 5 кг — готовая адгезионная грунтовка для гладкого бетона, внутренних и наружных работ. Расход около 0,2 кг/м², высыхание около 3 часов.", ["ceresitCt19"]),
  p("MAT-000220", "Бетонконтакт Ceresit CT 19, 15 кг", "Ceresit CT 19 15 кг — бетонконтакт | MatMix", "Ceresit CT 19 15 кг — готовая адгезионная грунтовка для гладкого бетона, внутренних и наружных работ. Расход около 0,2 кг/м², высыхание около 3 часов.", ["ceresitCt19"]),
  p("MAT-000221", "Бетонконтакт Cтаратели 20 кг", "Старатели Бетон-Контакт 20 кг | MatMix", "Старатели Бетон-Контакт 20 кг — готовая грунтовка для бетонных, плиточных и окрашенных масляной краской оснований. Наносится валиком или кистью; расход 0,2–0,3 кг/м².", ["starateliBeton"])
]);
const TARGET_MATS = Object.freeze(PRODUCTS.map(item => item.externalId));
module.exports = { CHECKED_AT, SOURCES, PRODUCTS, TARGET_MATS };
