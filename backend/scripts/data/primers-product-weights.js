"use strict";

const CONFIRM = "BACKFILL_PRIMER_PRODUCT_WEIGHTS";

const PRODUCTS = Object.freeze([
  Object.freeze({
    externalId: "MAT-000243",
    expectedTitle: "Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг",
    oldWeight: 3,
    newWeight: 10,
    expectedUnit: "шт",
    packageWeight: 10,
    sourceUrl: "https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw"
  }),
  Object.freeze({
    externalId: "MAT-000244",
    expectedTitle: "Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг",
    oldWeight: 3,
    newWeight: 10,
    expectedUnit: "шт",
    packageWeight: 10,
    sourceUrl: "https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag"
  })
]);

const TARGET_IDS = Object.freeze(PRODUCTS.map(item => item.externalId));

module.exports = { CONFIRM, PRODUCTS, TARGET_IDS };
