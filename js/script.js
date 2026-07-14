const synonyms = {
    "штукт": ["штукатурка", "штукатур"],
    "штукатур": ["штукатурка", "штукт"],
    "гипс": ["гипсовая", "гипсовый", "гипсокартон", "гкл"],
    "цем": ["цемент", "цементная", "цементный"],
    "плитка": ["керамогранит", "керамическая", "кафель"],
    "клей": ["клеевой", "плиточный"],
    "грунт": ["грунтовка", "грунтовки", "тифенгрунд"],
    "блок": ["газобетон", "газоблок"],
    "проф": ["профиль", "профили"],
    "труб": ["труба", "трубы"],
    "фит": ["фитинг", "фитинги"],
    "розет": ["розетка", "розетки"],
    "автомат": ["автоматика", "автоматы"],
    "узо": ["автоматика"],
    "лам": ["ламинат"],
    "лин": ["линолеум"]
};
let products = [
    {
        "name": "Штукатурка гипсовая Knauf Ротбанд 5 кг",
        "price": 242,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Knauf Ротбанд 30 кг",
        "price": 528,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Knauf Гольдбанд 30 кг",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Knauf МП-75 маш. 30 кг",
        "price": 462,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг",
        "price": 426,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Слой Бел. 30 кг",
        "price": 492,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Гипс Актив мех. Сер. 30 кг",
        "price": 418,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Гипс Актив мех. Бел. 30 кг",
        "price": 437,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Русеан Plaster Сер. 30кг",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Русеан Termoplast Бел. 30кг",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая UNIS Теплон белая 5 кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая UNIS Теплон белая 30 кг",
        "price": 440,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Старатели 30 кг",
        "price": 437,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсово-цементная Старатели Оптимум серая универсальная мех. 30 кг",
        "price": 467,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Цементум 25 кг",
        "price": 379,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Knauf Унтерпутц 25 кг",
        "price": 396,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Knauf Грюнбанд трещиностойкая 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Weber Vetonit ТТ40 фасадная 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Mapei Nivoplan Plus 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Старатели 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Волма Цоколь 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная клеевая ВОЛМА Термофасад 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Unis Силин армированная универсальная 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная ручного и машинного нанесения Основит Техно PC 21 M (25кг)",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементно - известковая фасадная Основит стартвэлл PC21 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Kreisel 521 MH OPTIMA-PUTZ мех. Сер. 30 кг",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка короед акриловая Ceresit CT 63, 3 мм 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Короед",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Штукатурка короед минеральная Ceresit СТ 35, 2,5 мм 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Короед",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурная смесь цементная Евро М-150 40кг",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурная смесь цементная Русеан М-150 40кг",
        "price": 385,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Штукатурка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кладочно - монтажная смесь цементная Евро М-200 40кг",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Кладочная",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кладочно - монтажная смесь цементная Русеан М-200 40кг",
        "price": 363,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Кладочная",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кладочно - монтажная смесь цементная Вертекс М-200 40кг",
        "price": 253,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Кладочная",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг",
        "price": 638,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг",
        "price": 2585,
        "unit": "шт",
        "weight": 28,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг",
        "price": 781,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг",
        "price": 1628,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка финишная готовая универсальная SEMIN CE 78 белая крышка 20кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка готовая VGT акриловая универсальная для наружных и внутренних работ 18кг",
        "price": null,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Готов",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit LR+ 5 кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit LR+ 20 кг",
        "price": 935,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit KR финиш белая 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit VH для влажных помещений белая 20 кг",
        "price": 786,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная финишная Vetonit JS Plus 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг",
        "price": 693,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Унифлот 5 кг",
        "price": 1760,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Унифлот 25 кг",
        "price": 5170,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Фуген 25 кг",
        "price": 704,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Фуген 5 кг",
        "price": 275,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг",
        "price": 1375,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная финишная Knauf Polymer finish 20 кг",
        "price": 803,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная финишная Основит Элисилк РА39 W 28 кг",
        "price": null,
        "unit": "шт",
        "weight": 28,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная Danogips Dano Jet 5 выравнивающая 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг",
        "price": null,
        "unit": "шт",
        "weight": 19,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Полимер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Старатели базовая 20 кг",
        "price": 418,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Старатели финишная 20 кг",
        "price": 517,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Волма Финиш 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклёвка гипсовая финишная Волма Шелк 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая финишная Волма Arctic 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая универсальная Glatt Und Full Pufas / Пуфас 25кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг",
        "price": 880,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг",
        "price": 2695,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Гипс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка цементная базовая Старатели 20 кг",
        "price": 418,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка цементная фасадно финишная Старатели 20 кг",
        "price": 654,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка по дереву VGT Белая 1 кг",
        "price": 418,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Смеси",
            "section": "Шпаклевка Акрил",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзит фр. 5-20 (0,02 куб.м) 20л",
        "price": 121,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Смеси",
            "section": "Керамзит",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзит фр. 10-30 (0,03 куб.м) 30л",
        "price": 132,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Смеси",
            "section": "Керамзит",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзитовая засыпка фракция до 5 мм (0,04 куб.м) 40л",
        "price": 214,
        "unit": "шт",
        "weight": 17,
        "category": {
            "main": "Смеси",
            "section": "Керамзит",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Клей для плитки Knauf Флизен, 25 кг",
        "price": 415,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Knauf Флизен ПЛЮС, 25 кг",
        "price": 561,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Vetonit Изи Фикс серый С0 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг",
        "price": 577,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг",
        "price": 759,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг",
        "price": 1320,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки высокоэластичный Ceresit CM 17 Super Flex сер., 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol K16, эластичный с уменьшенным расходом, керамогранита и камня, класс С2 TЕ S1 15 кг",
        "price": null,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К80, 25 кг",
        "price": 1078,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К55, 25 кг",
        "price": 1375,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К47, 25 кг",
        "price": 429,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Unis Плюс 25 кг",
        "price": 495,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Unis Гранит 25кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Unis XXI 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки и камня Unis Белфикс 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки, керамогранита и камня Unis 2000 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки и керамогранита Unis Uniflex U-100 C2ТЕ 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Волма Интерьер серый 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Волма Керамик Т14 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Плитки",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для теплоизоляции Knauf Севенер 25 кг",
        "price": 935,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Теплоиз",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей монтажный Knauf Перлфикс 30 кг",
        "price": 561,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Клей для ПГП",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей Волма Монтаж для ПГП 30кг",
        "price": 506,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Клей для ПГП",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Русеан 25кг",
        "price": 308,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Блока",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Волма 25кг",
        "price": 451,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Блока",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Евро 25кг",
        "price": 275,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Блока",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для блоков Ceresit СТ 21 25кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Блока",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Цементум 25кг Зимний",
        "price": 363,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Блока",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стеклохолста СТК 10кг",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стеклохолста Pufas 10кг",
        "price": 1980,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стеклохолста Oscar 10кг",
        "price": 2774,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для фанеры и линолеума КС 7кг",
        "price": 0,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Смеси",
            "section": "Клей для Фанеры",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для фанеры и линолеума КС 15кг",
        "price": 1375,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Смеси",
            "section": "Клей для Фанеры",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для швов линолеума холодная сварка  Sintex H-4",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Смеси",
            "section": "Клей для Швов",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для паркета Bostik Tarbicol PU 2K 10 кг",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей для Паркета",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для паркета и фанеры Artelit RB-110 21 кг",
        "price": null,
        "unit": "шт",
        "weight": 21,
        "category": {
            "main": "Смеси",
            "section": "Клей для Паркета",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей Homakoll водно-дисперсионный для паркета 14 кг",
        "price": null,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Смеси",
            "section": "Клей для Паркета",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для звукоизоляции контактный Composite-470 универсальный 10л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей Контактный",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер Момент Столяр 0,75 л",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер СТК 1 л",
        "price": 217,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер СТК 2,4 л",
        "price": null,
        "unit": "шт",
        "weight": 2.4,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер Новгородский 2,8 л",
        "price": 891,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 1 л",
        "price": 217,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 5 л",
        "price": 495,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 10 л",
        "price": 946,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Клей ПВА",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для флизелиновых обоев IRFix 250г",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для флизелиновых обоев Kleo 250г",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стекло и флизелиновых обоев Kleo Ultra 50 500г",
        "price": 1210,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для всех видов флизелиновых обоев Kleo Extra, 240 г (35м2)",
        "price": 495,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для виниловых обоев Quelyd Спец-винил 450 гр (40м2)",
        "price": 638,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для флизелиновых обоев Quelyd Спец-флизелин 300 гр (40м2)",
        "price": 539,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Смеси",
            "section": "Клей для Обоев",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Наливной пол \"Unis Горизонт\" 20 кг",
        "price": 363,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол \"Unis Горизонт\" Армированный 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол \"Старатели\" Быстрый 20 кг",
        "price": 396,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол \"Старатели\" Толстый 25кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол Волма Нивелир Экспресс 25 кг",
        "price": 418,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол финишный Weber Vetonit 3000 самовыравнивающийся 20 кг",
        "price": 1089,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол универсальный Weber Vetonit fast 4000 20 кг",
        "price": 528,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол финишный Vetonit 4100 высокопрочный 20 кг",
        "price": 1067,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол первичный Weber Vetonit 5000 быстротвердеющий 25 кг",
        "price": 1078,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол Litokol LitoLiv S10 Express 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол универсальный Litokol Litoliv S50 самовыравнивающийся 20 кг",
        "price": 429,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол Основит Скорлайн FK45R самовыравнивающийся 20 кг",
        "price": 517,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол самовыравнивающийся Ceresit CN 175 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Наливной Пол",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Стяжка пола цементная, легкая Knauf Ubo 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Стяжка Пола",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Стяжка Пола",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Огнебиозащита СЕНЕЖ для дерева 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Огнебиозащита СТК для дерева 10 л",
        "price": 495,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Смеси",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция Knauf Флэхендихт 5 кг",
        "price": 2090,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция полимерная СТК 5кг",
        "price": 1485,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция универсальная МК 5кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция универсальная PROFI 5 кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция Ceresit CR 65 20 кг",
        "price": 1595,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гидроизоляция Mapei Mapelastic двухкомп. компл. (А+Б) 32 кг",
        "price": null,
        "unit": "шт",
        "weight": 32,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гидроизоляция цементная Ceresit CR 166 двухкомп. компл. (А+Б) 32 кг",
        "price": null,
        "unit": "шт",
        "weight": 32,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гидроизоляция минерально химическая восстановительная НЦ Русеан 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гидроизоляция обмазочная Глимс (Glims) водостоп 18 кг",
        "price": 1452,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Смеси",
            "section": "Гидроизоляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон (ЦПС) М300 Русеан 40 кг",
        "price": 368,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Пескобетон",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон Tex Pro М-300 ГОСТ 40 кг",
        "price": 236,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Пескобетон",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон Евро М-300 ГОСТ 40кг",
        "price": 258,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Пескобетон",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цементная смесь ремонтная Ceresit CN 83 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Смесь Ремонтная",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "Смесь Ремонтная",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цемент \"Цементум\" 40кг",
        "price": 522,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Цемент",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цемент \"РосЦемент\" 50кг",
        "price": 539,
        "unit": "шт",
        "weight": 50,
        "category": {
            "main": "Смеси",
            "section": "Цемент",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цемент \"Русеан\" 40кг",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Цемент",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Песок в мешке 40 кг",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "Песок - Цебень",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Щебень гранитный фр. 5 - 20 мм 30л (30кг)",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "Песок - Цебень",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Алебастр 5 кг",
        "price": 165,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "Гипс / Алебастр",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Алебастр 20 кг",
        "price": 308,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Гипс / Алебастр",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Мастика битумная 3кг",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Смеси",
            "section": "Мастика",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Мастика битумная гидроизоляционная Технониколь №24 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "Мастика",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Мастика приклеивающая Технониколь №27 22 кг",
        "price": null,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Смеси",
            "section": "Мастика",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Мастика гидроизоляционная Ceresit CL 51, 15 кг",
        "price": null,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Смеси",
            "section": "Мастика",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Жидкое стекло 5 л",
        "price": 539,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Смеси",
            "section": "Жидкое Стекло",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Затирка цементная Ceresit CE 33 «Comfort» 2 кг, № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка цементная Mapei Keracolor 2 кг, № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка цементная Mapei Ultracolor Plus 2 кг № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка цементная Litokol Litochrom 1-6 С.00 2 кг Цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка цементная Litokol Litochrom 1-6 Evo LE.000 2 кг Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Цем",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка герметик силиконовая Mapei Mapesil AC 310 мл № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.32,
        "category": {
            "main": "Смеси",
            "section": "Затирка Силик",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Затирка эпоксидная Mapei Kerapoxy 2 кг № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Смеси",
            "section": "Затирка Эпокс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Затирка эпоксидная Litokol Starlike EVO 2,5 кг № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Смеси",
            "section": "Затирка Эпокс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Затирка эпоксидная Litokol Starlike EVO 2,5 кг Цвет Черный",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Смеси",
            "section": "Затирка Эпокс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Затирка эпоксидная Litokol Starlike EVO 2,5 кг Цвет Белый",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Смеси",
            "section": "Затирка Эпокс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Затирка эпоксидная Ceresit CE 89 двухкомпонентная 2,5 кг, № Цвет",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Смеси",
            "section": "Затирка Эпокс",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Антиплесень СТК 1л",
        "price": 352,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Антиплесень СТК 5л",
        "price": 605,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Антиплесень Ceresit СТ 99 1 л",
        "price": 715,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Антисептик пропитка для дерева СТК 10л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Защита Дерева",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Добавка противоморозная СТК Профи 10 л",
        "price": 423,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Добавки",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Knauf Бетогрунд 5 кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Knauf Бетогрунд 15 кг",
        "price": 2068,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Ceresit CT 19, 5 кг",
        "price": 825,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Ceresit CT 19, 15 кг",
        "price": 2310,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Cтаратели 20 кг",
        "price": 2640,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Евро (5 кг)",
        "price": 715,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Евро (10 кг)",
        "price": 1320,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт Евро (20 кг)",
        "price": 2178,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Бетонконтакт REAL (20 кг)",
        "price": 1595,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Краска Грунт",
            "section": "БетонКонтакт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд 5 л",
        "price": 803,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд 10 л",
        "price": 1155,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Knauf Мульти Грунд универсальный 10 л",
        "price": 1815,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л",
        "price": 3520,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунт Litokol PRIMER A универсальный укрепляющий 10 л",
        "price": 825,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Старатели универсальная 10 л",
        "price": 715,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка UNIS глубокого проникновения укрепляющий 10 л",
        "price": 935,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Oscar глубокого проникновения 10 л",
        "price": 1111,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Ceresit CT-17 PRO, 5л",
        "price": 759,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Ceresit CT-17 PRO, 10л",
        "price": 1155,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Ceresit CT16 под декоративную штукатурку 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Акрил 5 л",
        "price": 330,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунтовка Акрил 10 л",
        "price": 528,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунтовка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пластификатор для цементных растворов и бетона, 5 л",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Добавки",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пластификатор для цементных растворов и бетона, 10 л",
        "price": 418,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Добавки",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Ацетон 1 л",
        "price": 209,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Растворители",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Уайт - спирит 1 л",
        "price": 242,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Растворители",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Обезжириватель 1л",
        "price": 390,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Растворители",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Расстворитель 646, 1 л",
        "price": 253,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Растворители",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунт ГФ-021 по металлу и дереву серый 0,8 кг",
        "price": 423,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунт по металлу серый 1 л",
        "price": 935,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунт Tikkurila Euro Primer концентрат 0,9 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Грунт Tikkurila Euro Primer концентрат 3 л",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска Грунт",
            "section": "Грунт",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Краска по дереву белая 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Дер",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска по металлу белая 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска по металлу черная 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска по металлу огнезащитная 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска - Грунт 3 в 1 по металлу белая 1 л",
        "price": 825,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска - Грунт Slaven 3 в 1 по металлу светло-серый 1 л",
        "price": 935,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Антикоррозионная защитная, Серебрянка 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная без запаха 1 л",
        "price": 1210,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная Аэрозоль баллон белая мат. 330 мл",
        "price": 385,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная Аэрозоль баллон черная мат. 330 мл",
        "price": 434,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска по Мет",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль алкидная Tikkurila Pesto 10 база A матовая 0,9 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль ПФ-115 белая глянцевая 1,8 кг",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль ПФ-115 КМ серая глянцевая 1,9 кг",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль Farbox ПФ - 115, белая 20 кг",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль МультиПротект - ПУ универс. глянцевая, База С, 10 л цвет RAL",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Symphony Cabinet Royal латекс. мат. для сухих пом. 9 л, супербел. RAL",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль акриловая Dufa Profilux Professional для всех поверхностей (универсальная) глянцевая белая 2,4 кг",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Эмаль акриловая Dufa Profilux Professional для всех поверхностей (универсальная) глянцевая белая 10 кг",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Эмаль",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD интерьерная Tikkurila Euro Smart 2 белая осн. А 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD интерьерная Tikkurila Euro Smart 2 9 л, RAL",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD для стен и потолка Tikkurila Euro 7 база А белая 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD для стен и потолка Tikkurila Euro 7 база А белая 2.7 л",
        "price": null,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD для стен и потолка Tikkurila Luja Extra 7 база А мат. 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска WD для обоев Tikkurila Euro Trend моющаяся матовая цвет белый база А 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска моющаяся Dulux Ultra Resist кухня и ванная база BW белая 2,5 л",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД Dulux 3D White Ослепительно белая интерьерная матовая 5 л",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД Dulux Bindo 7 экстрапрочная моющаяся белая основа BW 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД Dulux Bindo 7 экстрапрочная моющаяся белая основа BW 4,5 л",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД Dulux Bindo 7 экстрапрочная моющаяся белая основа BW 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска моющаяся Dulux Diamond Extra Matt база BW белая 9 л",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка СТК Белоснежная латексная, моющаяся и износостойкая 10 л, шелковисто-матовая",
        "price": 2860,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска фасадная акриловая FASSADENFARBE супербелая 14 кг",
        "price": 2860,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска фасадная акриловая Colorika Aqua белая мат. 14 кг",
        "price": 4950,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска акриловая для стен и потолка Colorika (влажная уборка), супербелая 3 л",
        "price": 1430,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска акриловая для стен и потолка Colorika (влажная уборка), супербелая 10 л",
        "price": 4180,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Colorika моющаяся, супербелая 3 л",
        "price": 1870,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Colorika моющаяся, супербелая 10 л",
        "price": 4950,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Акриловая для стен и потолка Colorika Elegant Mat 10 моющаяся, супербелая мат. 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска Акриловая для стен и потолка Colorika Elegant Mat 10 моющаяся, супербелая мат. 2.7 л",
        "price": null,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска - Грунт ВД Dufa Су Куш 9 л белая - Вес 14кг",
        "price": null,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска Акрил",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Dufa Premium KeraLine 3, прозрачная 0,9 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Dufa Premium KeraLine 3, прозрачная 2,5 л",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Dufa Premium KeraLine 3, прозрачная 9 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка моющаяся Dufa Premium KeraLine Keramik Paint 7 база А матовая белая 2,5 л",
        "price": 2057,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка моющаяся Dufa Premium KeraLine Keramik Paint 7 база А матовая белая 9 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) белая основа BW 4,5 л, глубокоматовая",
        "price": 3025,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) белая основа BW 9 л, глубокоматовая",
        "price": 4290,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) бесцветная основа BC 4,5 л, глубокоматовая",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) бесцветная основа BC 9 л, глубокоматовая",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 7 моющаяся бесцветная основа BC 9 л, матовая",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 7 моющаяся белая основа BW 9 л, матовая",
        "price": 5335,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 7 моющаяся белая основа BW 4,5 л, матовая",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска моющаяся Finncolor Oasis Hall&Office база С бесцветная 9 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая  0,75 л (10м2)",
        "price": null,
        "unit": "шт",
        "weight": 0.75,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая  2,5 л (32м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая  9 л (115м2)",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EXTRA KIVI Шелковисто-матовая высокоэффективная (А) 0,75 л (9м2)",
        "price": null,
        "unit": "шт",
        "weight": 0.75,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EXTRA KIVI Шелковисто-матовая высокоэффективная (А) 2,5 л (31м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EXTRA KIVI Шелковисто-матовая высокоэффективная (А) 9 л (112м2)",
        "price": 13365,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая  0,75 л (10м2)",
        "price": null,
        "unit": "шт",
        "weight": 0.75,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая  2,5 л (32м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая  9 л (115м2)",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска Грунт",
            "section": "Краска ВД",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Блок D500 50х250х600 мм",
        "price": 77,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 75х250х600 мм",
        "price": 88,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 100х250х600 мм",
        "price": 107,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 120х250х600 мм",
        "price": 159,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 150х250х600 мм",
        "price": 165,
        "unit": "шт",
        "weight": 15.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 200х250х600 мм",
        "price": 220,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 200х300х600 мм",
        "price": 269,
        "unit": "шт",
        "weight": 23,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 300х250х600 мм",
        "price": 324,
        "unit": "шт",
        "weight": 32,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 400х250х600 мм",
        "price": null,
        "unit": "шт",
        "weight": 41,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Керамзитобетонный блок 390 х 188 х 90 2-х щелевой",
        "price": null,
        "unit": "шт",
        "weight": 5.6,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Керамзитобетонный блок 390 х 190 х 190 4-х щелевой",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Блоки Стены",
            "section": "Блок",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Кирпич рядовой полнотелый 250х120х65 мм М150 А",
        "price": 26,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Кирпич",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Кирпич рядовой ЛСР (НКЗ) поризованный М150 250х120х140 мм",
        "price": null,
        "unit": "шт",
        "weight": 3.7,
        "category": {
            "main": "Блоки Стены",
            "section": "Кирпич",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая Knauf 667х500х 80 мм",
        "price": 385,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая 667х500х 80 мм",
        "price": 382,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая Knauf 667х500х 80 мм",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП пустотелая 667х500х 80 мм",
        "price": null,
        "unit": "шт",
        "weight": 24,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая 667х500х 80 мм",
        "price": 352,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая Knauf 667х500х 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая 667х500х 100 мм",
        "price": 451,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая Knauf 667х500х100 мм",
        "price": null,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая 667х500х100 мм",
        "price": 495,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Панель Ruspanel Руспанель РПГ BASIC односторонняя 2500х600х10 мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Панель Ruspanel Руспанель РПГ BASIC односторонняя 2500х600х15 мм",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Панель Ruspanel Руспанель РПГ BASIC односторонняя 2500х600х20 мм",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Панель Ruspanel Руспанель РПГ двухсторонняя 2500х600х10мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Панель Ruspanel Руспанель РПГ двухсторонняя 2500х600х20мм",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Суперпол Knauf 1200х600х20 мм",
        "price": null,
        "unit": "шт",
        "weight": 18.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГВЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Аквапанель Knauf цементная 8 мм универсальная 800x1200 мм",
        "price": null,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Аквапанель Knauf 900х1200х12,5 мм, наружняя",
        "price": null,
        "unit": "шт",
        "weight": 16.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Аквапанель Knauf 900х1200х12,5 мм, внутренняя",
        "price": null,
        "unit": "шт",
        "weight": 16.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Аквапанель Knauf 1200х2400х12,5 мм, внутренняя",
        "price": null,
        "unit": "шт",
        "weight": 43,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Аквапанель Knauf 900х1200х8мм, универсальная",
        "price": null,
        "unit": "шт",
        "weight": 8.7,
        "category": {
            "main": "Блоки Стены",
            "section": "Панель",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГВЛ Knauf 2500х1200х10 мм",
        "price": 841,
        "unit": "шт",
        "weight": 37.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГВЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГВЛ Knauf 2500х1200х12,5 мм",
        "price": 968,
        "unit": "шт",
        "weight": 44,
        "category": {
            "main": "Блоки Стены",
            "section": "ГВЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2500х1200х8 мм",
        "price": null,
        "unit": "шт",
        "weight": 19,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2000х1200х9,5 мм",
        "price": 357,
        "unit": "шт",
        "weight": 15.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2500х1200х9,5 мм",
        "price": 385,
        "unit": "шт",
        "weight": 19.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2000х1200х12,5 мм",
        "price": 363,
        "unit": "шт",
        "weight": 20.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2500х1200х12,5 мм",
        "price": 429,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 3000х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2500х1200х9,5 мм",
        "price": 514,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2000х1200х12,5 мм",
        "price": 478,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2500х1200х12,5 мм",
        "price": 572,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 3000х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 32.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Огнестойкий Knauf 2500х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 33.3,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛО",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир Хоум 2000х1200х10 мм",
        "price": null,
        "unit": "шт",
        "weight": 24.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛЗ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир 2000х1200х12,5 мм",
        "price": 764,
        "unit": "шт",
        "weight": 29,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛЗ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир 2500х1200х12,5 мм",
        "price": 891,
        "unit": "шт",
        "weight": 37.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛЗ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf арочный (ремонтный) 2500х1200х6,5 мм",
        "price": 698,
        "unit": "шт",
        "weight": 18.9,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Профиль арочный гибкий 60х27x1000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.62,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 27х28 мм 3 м",
        "price": 214,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 60х27 мм 3 м",
        "price": 297,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 60х27 мм 4 м",
        "price": 0,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 50х40 мм 3м",
        "price": 379,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 50х50 мм 3м",
        "price": 404,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 50х50 мм 4м",
        "price": null,
        "unit": "шт",
        "weight": 2.2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 75х40 мм 3м",
        "price": 437,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 75х50 мм 3м",
        "price": 456,
        "unit": "шт",
        "weight": 2.2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 75х50 мм 4м",
        "price": null,
        "unit": "шт",
        "weight": 2.6,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 100х40 мм 3м",
        "price": 511,
        "unit": "шт",
        "weight": 2.9,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 100х50 мм 3м",
        "price": 533,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 100х50 мм 4м",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль UA Knauf 75х40 мм 3м, для проемов",
        "price": null,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Траверса монтажная 38х40 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес прямой Knauf",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес прямой Knauf, удлиненный 460мм",
        "price": 41,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес Вибро прямой",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 0,35 м",
        "price": 42,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 0,5 м",
        "price": 51,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 1 м",
        "price": 79,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель - удлинитель Knauf 60х27",
        "price": 18,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель одноур. Краб Knauf 60х27 0.9 мм",
        "price": 36,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель двухуровневый Knauf 60х27 0.9 мм",
        "price": 27,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скоба для ПГП",
        "price": 25,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Блоки Стены",
            "section": "ПГП",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "ГКЛ Gyproc 1950х1200х9,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 17.5,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Gyproc 1950х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Gyproc 2500х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Gyproc Аква Лайт 1950х1200х9,5 мм для потолка влагостойкий",
        "price": null,
        "unit": "шт",
        "weight": 16,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Gyproc Аква Лайт 2500х1200х9,5 мм для потолка влагостойкий",
        "price": null,
        "unit": "шт",
        "weight": 20.6,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Gyproc Аква Оптима 1950х1200х12,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Gyproc Аква Оптима 2500х1200х12,5 мм влагостойкий",
        "price": null,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Gyproc Аква Оптима Лонг 3000х1200х12,5 мм влагостойкий",
        "price": null,
        "unit": "шт",
        "weight": 31.2,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛВ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Gyproc Стронг Акустик 2500х1200х15 мм звуко - высокопрочный",
        "price": null,
        "unit": "шт",
        "weight": 35,
        "category": {
            "main": "Блоки Стены",
            "section": "ГКЛЗ",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Профиль ПН Евро 27х28 мм 3 м",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Евро 60х27 мм 3 м",
        "price": null,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Евро 50х50 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 2.1,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Евро 50х40 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Евро 75х50 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Евро 75х40 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 2.2,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Евро 100х50 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 2.9,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Евро 100х40 мм 3м",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Блоки Стены",
            "section": "Профиль",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Геотекстиль плотность 80, 40 м2",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Изоляция",
            "section": "Геотекстиль",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидростеклоизол ХПП-2.1 нижний слой стеклохолст 9 м2",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидростеклоизол ХКП-3.5 верхний слой стеклохолст 9 м2",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция Унифлекс ЭПП Технониколь 2,8 мм черный 10 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 38.5,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция Техноэласт ЭПП Технониколь 4 мм черный 10 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 49.5,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция Оргкровля ЭПП Рубитэкс 10 кв.м (4 кг/кв.м)",
        "price": null,
        "unit": "шт",
        "weight": 42,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция пола рулонная Технониколь Master 0,75х10м (7.5 м2)",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция фундамента Технониколь Master 1х10 м",
        "price": null,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Изоляция",
            "section": "Гидроизол",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Звукоизоляция Шуманет Комби 5 мм 1х10 м",
        "price": 5335,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звуко - Гидроизоляция Шуманет 100 Гидро 5 мм 1х10 м",
        "price": 6930,
        "unit": "шт",
        "weight": 34,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционный мат ТермоЗвукоИзол ТЗИ 14 мм 1,5х10 м",
        "price": null,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционный мат TechnoSonus ТермоЗвукоИзол ТЗИ Стандарт 15 мм 1,5х10 м",
        "price": null,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель Кнауф Акуборд ГКЛ 1500х1200х20мм",
        "price": null,
        "unit": "шт",
        "weight": 30.6,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель SoundGuard ЭкоЗвукоИзол 1200х800х13 мм",
        "price": null,
        "unit": "шт",
        "weight": 18.5,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель SoundGuard ШумоЩит ПП18 600х800х18 мм",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель ЗИПС-Вектор 1200х600х40 мм с комплектом крепежа",
        "price": null,
        "unit": "шт",
        "weight": 19.5,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель ЗИПС-III Ультра 43x600х1200 мм",
        "price": null,
        "unit": "шт",
        "weight": 18.4,
        "category": {
            "main": "Изоляция",
            "section": "Звукоизол",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Шумоизоляция АкустиKnauf Cлим Плита 27х600х920 мм (22 кг/м3) 11 м2",
        "price": null,
        "unit": "шт",
        "weight": 6.6,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Шумоизоляция АкустиKnauf Плита 50х610х1230 мм (15 кг/м3) 12 м2",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Шумоизоляция АкустиKnauf Плита 75х610х1230 мм (15 кг/м3) 9 м2",
        "price": null,
        "unit": "шт",
        "weight": 9.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Шумоизоляция АкустиKnauf Плита 100х610х1230 мм (15 кг/м3) 6 м2",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ТеплоKnauf рулонный 50х1220х7380 мм (2шт в уп) (12 кг/м3) 18 м2",
        "price": null,
        "unit": "шт",
        "weight": 10.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ТеплоKnauf рулонный 100х1220х7380 мм (12 кг/м3) 9 м2",
        "price": null,
        "unit": "шт",
        "weight": 10.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ТеплоKnauf рулонный 150х1220х5500 мм (14,5 кг/м3) 6,71 м2",
        "price": null,
        "unit": "шт",
        "weight": 16.3,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ТеплоКнауф TS 037 Aquastatik 1230х610х50 мм 16 шт (14,5 кг/м3) 12 м2",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ТеплоКнауф TS 037 Aquastatik 1230х610х100 мм 8 шт (14,5 кг/м3) 6 м2",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Лайт Баттс Скандик 50х600х800 мм 5,76 кв.м",
        "price": 1210,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Лайт Баттс Скандик 100х600х800 мм 2,88 кв.м",
        "price": 1265,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс 50х600х1000 мм 6 кв.м",
        "price": 2299,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс 75х600х1000 мм 4,8 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс 100х600х1000 мм 3 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Рокфасад 50х600х1000 мм 2,4 кв.м (115 кг/м3)",
        "price": null,
        "unit": "шт",
        "weight": 13.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Рокфасад 100х600х1000 мм 1,2 кв.м (100 кг/м3)",
        "price": null,
        "unit": "шт",
        "weight": 13.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Фасад Баттс Экстра 50х600х1000 мм 2,4 кв.м (145 кг/м3)",
        "price": null,
        "unit": "шт",
        "weight": 15.6,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Фасад Баттс Экстра 100х600х1000 мм 1,8 кв.м (145 кг/м3)",
        "price": null,
        "unit": "шт",
        "weight": 20.9,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Звукоизоляционный Роквул Флор Баттс 25х600х1000 мм 4,8 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 13.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Звукоизоляционный Роквул Флор Баттс 50х600х1000 мм 3,6 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 19.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Звукоизоляционный Роквул Флор Баттс 100х600х1000 мм 1,8 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 19.8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс ПРО Ультратонкий 27х600х1000 мм 7,2 м2",
        "price": 2530,
        "unit": "шт",
        "weight": 12,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Технониколь ТехноАкустик Плита 1200*600*50мм, 8л. (5.76 м2)",
        "price": null,
        "unit": "шт",
        "weight": 12.3,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Технониколь РОКЛАЙТ Плита 1200*600*50мм, 8л. (5.76 м2)",
        "price": null,
        "unit": "шт",
        "weight": 10.1,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Технониколь РОКЛАЙТ Плита 1200*600*100мм, 4л. (2.88 м2)",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Технониколь РОКЛАЙТ Плита 1200*600*100мм, 6л. (4.32 м2)",
        "price": null,
        "unit": "шт",
        "weight": 15.2,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Технониколь MASTER, под сайдинг 1200*600*50мм, 8л. (5.76 м2)",
        "price": null,
        "unit": "шт",
        "weight": 13,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Звукоизоляция Технониколь Master Звукозащита 50 мм 5.76 м2",
        "price": null,
        "unit": "шт",
        "weight": 12,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ISOVER Плита 1200*600*50мм, 8л. 28 кг/м3 (5.76 м2)",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель ISOVER Плита 1200*600*100мм, 4л. 28 кг/м3 (2.88 м2)",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель минв. Ursa / Урса Geo Лайт 50х1200х6250 мм 15 кв.м",
        "price": null,
        "unit": "шт",
        "weight": 7.6,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Ursa / Урса GEO Теплостандарт рулон 50х1220х6250 16 м2",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель для систем кондиционирования и вентиляции Магнофлекс Тип С 5 мм 0,6х30 м (18м2), самоклеящаяся",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 3мм 0,6 х 30 м (18 м2), клеевой",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 3мм 1,2 х 22 м (26.4 м2)",
        "price": 1320,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 5мм 1,2 х 22 м (26.4 м2)",
        "price": 1430,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 10мм 1,2 х 12 м (14.4 м2)",
        "price": 1595,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель экструдия Ursa 50х600х1250 мм 7л. (5.25 м2)",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 20x600x1200 мм 1л. (0.72 м2)",
        "price": 170,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 20x600x1200 мм 20л. (13.8 м2)",
        "price": 3289,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 30x600x1200 мм 1л. (0.72 м2)",
        "price": 253,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 30x600x1200 мм 13л. (9 м2)",
        "price": 3135,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 50х585х1185 мм 1л. (0.69м2)",
        "price": 379,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 50х585х1185 мм 7л. (4.85 м2)",
        "price": 2618,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 100х585х1185 мм 1л. (0.69 м2)",
        "price": 786,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 100х585х1185 мм 4л. (2.76 м2)",
        "price": 2970,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пенополистирол пенопласт ППТ-25-А, 50х1000х1000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Изоляция",
            "section": "Теплоизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка под ПГП Knauf полимерная 100х6 мм 20 м",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка под ПГП Knauf полимерная 80х6 мм 20 м",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка вспененная 3мм, (рул ? м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка вспененная 5мм, (рул ? м2)",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка пробковая 1000х100х3 мм (10 м2)",
        "price": null,
        "unit": "шт",
        "weight": 5.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка под ламинат 3мм, листовая (5.25м2 \\ уп. 10л)",
        "price": null,
        "unit": "м2",
        "weight": 0.05,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка хвойная толщина 790х590х3мм 15л. (уп. 7 м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка хвойная толщина 790х590х5мм 15л. (уп. 7 м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка отражающая фольгированная, 5мм, 30 м²",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Изоляция",
            "section": "Подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пароизоляция TEHNOVEK А 30 70 кв.м",
        "price": 1760,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Изоляция",
            "section": "Пароизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пароизоляция TEHNOVEK B 30 70 кв.м",
        "price": 1320,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Изоляция",
            "section": "Пароизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пароизоляция теплоотражающая Juta (180 г/м2) 75 м2",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Изоляция",
            "section": "Пароизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Гидро - Пароизоляция Изоспан D, 1.6 х 43.75 м, 70 м2",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Изоляция",
            "section": "Пароизол",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пробковый компенсатор 12х90 х 4мм",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Изоляция",
            "section": "Пробка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пробковый компенсатор 15х90 х 4мм",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Изоляция",
            "section": "Пробка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пергамин 15м2",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Изоляция",
            "section": "Пергамин",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пистолет для герметика 1. Эконом",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для герметика 2. Премиум",
        "price": 1100,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 1. Эконом",
        "price": 418,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 2.",
        "price": 660,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 3. Премиум",
        "price": 1980,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пена монтажная профессиональная Sila Pro TopGun70, летняя",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная Tytan Uni 65",
        "price": 715,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная 750, летняя",
        "price": 605,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная 750, зимняя",
        "price": 638,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная 750, с трубочкой всесезонная -10\\+35",
        "price": 495,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная, Огнеупорная",
        "price": 825,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена Kudo для блоков под пистолет PROF 28+",
        "price": 693,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена универсальная проф. Tytan Professional 60 секунд 750 мл",
        "price": 858,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена универсальная REFIT 14 профессиональная всесезонная",
        "price": 715,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Пена",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный DecoFix для полиуретана, 80 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Гермет",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей стыковочный DecoFix для полиуретана, 80 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Гермет",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный Orac DecoFix Pro FDP500 акриловый на водной основе 310 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Герметики",
            "section": "Гермет",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей стыковочный Orac DecoFix Extra Plus FX250 полиуретановый 310 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Герметики",
            "section": "Гермет",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель монтажной пены",
        "price": 187,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Очиститель",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Средство очиститель цемента Prosept Cement Cleaner 5 л",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Герметики",
            "section": "Очиститель",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Средство очиститель Антискотч Grass Antigraffiti 600 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Герметики",
            "section": "Очиститель",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель силиконового герметика Kudo аэрозоль 150 мл",
        "price": 715,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Герметики",
            "section": "Очиститель",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель эпоксидной затирки Litokol Litonet Gel Evo 0,75л",
        "price": 1815,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Герметики",
            "section": "Очиститель",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка для канализационных труб",
        "price": 275,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Герметики",
            "section": "Смазка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка для канализационных труб Ostendorf 500 г",
        "price": 654,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Герметики",
            "section": "Смазка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка - паста для Электроинструмента",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Смазка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка для буров Практика (241-196) 125 г",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Герметики",
            "section": "Смазка",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Герметик акриловый санитарный Irfix белый 280 мл",
        "price": 495,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный AVG белый 280 мл",
        "price": 770,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный Kim Tech белый 280 мл",
        "price": 605,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный Kim Tech прозрачный 280 мл",
        "price": 605,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик акриловый морозостойкий Kim Tech белый 420 мл",
        "price": 495,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый затирка Ceresit CS 25 № 01 белый 280 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик кровельный битумно-каучуковый Irfix 310 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик звукоизоляционный Вибросил 290мл",
        "price": 748,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик акриловый звукоизоляционный SoundGuard Seal белый 310 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик кровельный каучуковый Tytan Professional прозрачный 310 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик Жидкий пластик Cosmofen (Космофен) 345 белый 305 г",
        "price": null,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Герметики",
            "section": "Герметик",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный каучуковый Titebond Heavy Duty Сверхсильный светло-коричневый 296 мл",
        "price": 605,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный каучуковый Tytan Classic Fix прозрачный 310 мл",
        "price": 605,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный гибрид. Tytan Professional Fix2 GT, 290 мл, белый",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный полиуретановый Tytan 290 мл (Черн, Прозр, Коричн)",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей Суперклей универсальный Akfix 705 двухкомпонентный, цианакрилатный с активатором, прозрачный 200 мл + 50 г",
        "price": 385,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей Суперклей универсальный Akfix 705 двухкомпонентный, цианакрилатный с активатором, прозрачный 400 мл + 100 г",
        "price": 583,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей Суперклей Cosmofen (Космофен) CA 12 цианакрилатный, прозрачный 50 г",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент, прозрачный 270мл",
        "price": 517,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент, белый 290мл",
        "price": 418,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент акрил. Монтаж Экспресс MB-50, белый 290мл",
        "price": 407,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент акрил. Монтаж Суперсильный Плюс MB-100, белый 310мл",
        "price": 418,
        "unit": "шт",
        "weight": 0.32,
        "category": {
            "main": "Герметики",
            "section": "Клей Монтажный",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Арматура гладкая 8мм А240 А1 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 6мм А500С А3 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 8мм А500С А3 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 10мм А500С А3 ПИЛИТЬ",
        "price": 52,
        "unit": "м",
        "weight": 0.8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 12мм А500С А3 ПИЛИТЬ",
        "price": 71,
        "unit": "м",
        "weight": 1.13,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 14мм А500С А3 ПИЛИТЬ",
        "price": 94,
        "unit": "м",
        "weight": 1.6,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 16мм А500С А3 ПИЛИТЬ",
        "price": 126,
        "unit": "м",
        "weight": 1.85,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 20мм А500С А3 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 2.47,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура композитная стеклопластиковая 8 мм 100 м",
        "price": null,
        "unit": "шт",
        "weight": 7.4,
        "category": {
            "main": "Металл",
            "section": "Композ",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Балка двутавровая H 200х150х6х9 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 30,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 6 мм 3 м",
        "price": 60,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный Knauf 6 мм 3 м",
        "price": 181,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 6 мм 3 м усиленный",
        "price": 104,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк пластиковый 6 мм 3 м",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк пластиковый 10 мм 3 м",
        "price": 66,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 10 мм 3 м",
        "price": 77,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный Knauf 10 мм 3 м",
        "price": 203,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 10 мм 3 м усиленный",
        "price": 121,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк реперный пластиковый для наливного пола, 50 шт.",
        "price": 605,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Крепления для маячков 6 мм и 10 мм универс. (100 шт.) Металл",
        "price": 407,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Крепления для маячков 6 мм и 10 мм универс. (100 шт.) Пластик",
        "price": 407,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лист гладкий 4 мм 2500х1250 мм оцинкованный",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лист рифленый алюминиевый 1000х1200х1,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 4.6,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лист рифленый алюминиевый 2400х1200х1,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лист рифленый алюминиевый 3000х1200х1,5 мм",
        "price": null,
        "unit": "шт",
        "weight": 13.8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Металлочерепица классик 0,5 Satin RAL",
        "price": null,
        "unit": "шт",
        "weight": 12,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пластина соединительная 100х200х2мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профнастил С-8, оцинкованный, 1200х2000х0,4 мм",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профнастил С-8, крашенный 1 сторона, 1200х2000х0,4 мм",
        "price": null,
        "unit": "шт",
        "weight": 7.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профнастил оцинкованный HC-35, 0.5x1000x6000мм (31кг)",
        "price": null,
        "unit": "шт",
        "weight": 31,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профнастил оцинкованный H75 750 х 6000 х 1 мм (62кг)",
        "price": null,
        "unit": "шт",
        "weight": 62,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Проволка катанка 6 мм 1м",
        "price": null,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Проволока вязальная 1.2 мм",
        "price": 154,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Полоса стальная г/к 50х5 мм",
        "price": null,
        "unit": "м",
        "weight": 1.97,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Полоса оцинкованная 50х5 мм",
        "price": null,
        "unit": "м",
        "weight": 1.9,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка штукатурная сварная оцинкованная 10х10 мм d0,6 мм 1х15 м рул",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка штукатурная сварная оцинкованная 20х20 мм d0,8 мм 1х25 м рул",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка кладочная сварная в рулонах 25х25х1,3 мм 0,25х50 м, оцинкованная",
        "price": 3135,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка кладочная базальтовая 25х25х1,3 мм 0,25х50 м",
        "price": 1650,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 2,5 мм 0,5 х 2,0м, 50х50мм",
        "price": 137,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3 мм 0,5 х 2,0м, 50х50мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.9,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3,5 мм 0,5 х 2,0м, 50х50мм",
        "price": 214,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 4 мм 0,5 х 2,0м, 50х50мм",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 2,5 мм 1,5 х 2,0м, 100х100мм",
        "price": 236,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3 мм 1,5 х 2,0м, 100х100мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3,5 мм 1,5 х 2,0м, 100х100мм",
        "price": null,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 4 мм 1,5 х 2,0м, 100х100мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 4 мм 1,5 х 2,0м, 150х150мм",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 40х20х2,5 мм",
        "price": null,
        "unit": "м",
        "weight": 2.07,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 40х40х2,5 мм",
        "price": null,
        "unit": "м",
        "weight": 2.85,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 60х60х1,5 мм",
        "price": null,
        "unit": "м",
        "weight": 2.73,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 80х40х2 мм",
        "price": null,
        "unit": "м",
        "weight": 3.6,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 80х60х1,5 мм",
        "price": null,
        "unit": "м",
        "weight": 3.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба профильная 100х100х3мм",
        "price": null,
        "unit": "м",
        "weight": 9.1,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d15 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 2.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d20 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 2.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d25 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 2.8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d32 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 3.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d40 х 3,5",
        "price": null,
        "unit": "м",
        "weight": 3.8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d50 х 3,0",
        "price": null,
        "unit": "м",
        "weight": 4.3,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная черная ВГП d57 х 3,0",
        "price": null,
        "unit": "м",
        "weight": 4.7,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d15 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 1.28,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d20 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 1.66,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d25 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 2.12,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d32 х 2,8",
        "price": null,
        "unit": "м",
        "weight": 2.73,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d40 х 3,5",
        "price": null,
        "unit": "м",
        "weight": 3.84,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d50 х 3,0",
        "price": null,
        "unit": "м",
        "weight": 4.22,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Труба стальная оцинкованная ВГП d57 х 3,0",
        "price": null,
        "unit": "м",
        "weight": 4.82,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок алюминиевый малярный 20х20 3 м",
        "price": 84,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок оцинкованный перфорированный 22х22",
        "price": 60,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок оцинкованный перфорированный Knauf 31х31 мм 3 м 0,60 мм",
        "price": 341,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок оцинкованный (ПУ) с сеткой 35x35x3000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 32х32х3мм ПИЛИТЬ",
        "price": 165,
        "unit": "м",
        "weight": 3,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 40х40х3мм ПИЛИТЬ",
        "price": 203,
        "unit": "м",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 45х45х4мм ПИЛИТЬ",
        "price": 239,
        "unit": "м",
        "weight": 4.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 50х50х4мм ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 50х50х5мм ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 5.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 75х75х5мм ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 75х75х6мм ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 8,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 125х125х8мм ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 15.5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 32*32*35 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*35 мм",
        "price": 19,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*50 мм",
        "price": 19,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 70*70*55*2,2 мм",
        "price": 49,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 75*75*40*2 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 40*40*40 мм, усиленный",
        "price": 49,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*50 мм, усиленный",
        "price": 55,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 90х90х60 мм, усиленный",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 105х105х90 мм, усиленный",
        "price": 88,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Фольга отражатель 10 м2, рулон",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Швеллер № 8 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 7.1,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Швеллер № 10 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 9,
        "category": {
            "main": "Металл",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Поддон (палет) деревянный",
        "price": 495,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Дерево",
            "section": "Поддон",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Вагонка штиль Оптима 14x146x4000 мм хвоя (6,72 м2)",
        "price": null,
        "unit": "шт",
        "weight": 18.4,
        "category": {
            "main": "Дерево",
            "section": "Вагонка",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Планкен прямой 20*146*6000",
        "price": null,
        "unit": "шт",
        "weight": 9.5,
        "category": {
            "main": "Дерево",
            "section": "Планкен",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска строганная 100х20 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска строганная 100х25 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска строганная 100х40 (3м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 100х25 (6м) ПИЛИТЬ",
        "price": 489,
        "unit": "шт",
        "weight": 13,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 100х50 (6м) ПИЛИТЬ",
        "price": 935,
        "unit": "шт",
        "weight": 24,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 150х25 (6м) ПИЛИТЬ",
        "price": 616,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 150х40 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 150х50 (6м) ПИЛИТЬ",
        "price": 1320,
        "unit": "шт",
        "weight": 29,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 200х50 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 41,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 250х50 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 45,
        "category": {
            "main": "Дерево",
            "section": "Доска",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 50х150 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 50х50 (3м)",
        "price": null,
        "unit": "шт",
        "weight": 3.3,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 45х45 (3м)",
        "price": 324,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 40х20 (3м)",
        "price": 132,
        "unit": "шт",
        "weight": 1.1,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 40х40 (3м)",
        "price": 253,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 40х60 (3м)",
        "price": null,
        "unit": "шт",
        "weight": 3.3,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 50х70 (3м)",
        "price": null,
        "unit": "шт",
        "weight": 3.8,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 75х75 (3м)",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х50 (3м)",
        "price": 242,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х40 (3м)",
        "price": 187,
        "unit": "шт",
        "weight": 5.5,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х25 (3м)",
        "price": 132,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 30х30 (3м)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 100х100 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 45,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 100х150 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 60,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 150х150 (6м) ПИЛИТЬ",
        "price": null,
        "unit": "шт",
        "weight": 81,
        "category": {
            "main": "Дерево",
            "section": "Брус",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Рейка строганная 30х10х3000",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Дерево",
            "section": "Рейка",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Рейка строганная 30х20х3000",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Дерево",
            "section": "Рейка",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Рейка строганная 25х40х3000",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Дерево",
            "section": "Рейка",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Рейка строганная 30х40х3000",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Дерево",
            "section": "Рейка",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Оргалит ДВП 3х1220х2140",
        "price": 242,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Дерево",
            "section": "Оргулит",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 9х1220х2440 мм",
        "price": null,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Дерево",
            "section": "ОСБ",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 12х1220х2440 мм",
        "price": null,
        "unit": "шт",
        "weight": 22.6,
        "category": {
            "main": "Дерево",
            "section": "ОСБ",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 15х1220х2440 мм",
        "price": null,
        "unit": "шт",
        "weight": 27.8,
        "category": {
            "main": "Дерево",
            "section": "ОСБ",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 18х1220х2440 мм",
        "price": null,
        "unit": "шт",
        "weight": 33.4,
        "category": {
            "main": "Дерево",
            "section": "ОСБ",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 22х1220х2440 мм",
        "price": null,
        "unit": "шт",
        "weight": 44,
        "category": {
            "main": "Дерево",
            "section": "ОСБ",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 4мм",
        "price": null,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 6мм",
        "price": null,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 8мм",
        "price": 786,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 9мм",
        "price": null,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 10мм",
        "price": null,
        "unit": "шт",
        "weight": 17,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 12мм",
        "price": 1155,
        "unit": "шт",
        "weight": 21,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 15мм",
        "price": null,
        "unit": "шт",
        "weight": 26.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 18мм",
        "price": null,
        "unit": "шт",
        "weight": 29.2,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 20мм",
        "price": 1705,
        "unit": "шт",
        "weight": 34,
        "category": {
            "main": "Дерево",
            "section": "Фанера 4/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 4мм",
        "price": null,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 6мм",
        "price": null,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 8мм",
        "price": null,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 9мм",
        "price": null,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 10мм",
        "price": null,
        "unit": "шт",
        "weight": 17,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 12мм",
        "price": null,
        "unit": "шт",
        "weight": 21,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 15мм",
        "price": null,
        "unit": "шт",
        "weight": 26.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 18мм",
        "price": null,
        "unit": "шт",
        "weight": 29.2,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера шлифованная 1.5х1.5м, сорт 3\\4, 20мм",
        "price": null,
        "unit": "шт",
        "weight": 34,
        "category": {
            "main": "Дерево",
            "section": "Фанера 3/4",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера ламинированная 2.44х1.22 м, сорт 1\\2, 18мм",
        "price": null,
        "unit": "шт",
        "weight": 37.5,
        "category": {
            "main": "Дерево",
            "section": "Фанера Ламинир",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера ламинированная 2.44х1.22 м, сорт 1\\2, 21мм",
        "price": null,
        "unit": "шт",
        "weight": 43.6,
        "category": {
            "main": "Дерево",
            "section": "Фанера Ламинир",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Набор для Козлика 1шт (Брус 50х50х2000 мм - 4шт; Доска 100х25х2000 мм 6шт; Саморез 50мм 0,5кг)",
        "price": 1870,
        "unit": "шт",
        "weight": 30.5,
        "category": {
            "main": "Дерево",
            "section": "Набор для Козлика",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Обои Флизелиновые под покраску 1х25 м",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Обои",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Обои под покраску Ремонтный флизелин 1,05х25 м Эконом (110/130/150 г)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Обои",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Обои KLEO флизелиновые без фактурные под покраску 1,06х25 м (110 г/м2)",
        "price": 3410,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Обои",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Pufas (50м2) (25 г/м2)",
        "price": 1870,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Стеклохолст",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Pufas (50м2) (40 г/м2)",
        "price": 1980,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Стеклохолст",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Oscar Паутинка (1х50 м) 25 г/м2",
        "price": 2860,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Стеклохолст",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Oscar Wellton W40 (50м2) 40 г/м2",
        "price": 3080,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Стеклохолст",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая малярная 2х2 (1х20м)",
        "price": 715,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая малярная 2х2 (1х50м)",
        "price": 1980,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х18 м",
        "price": 715,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х25 м",
        "price": 935,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х50 м",
        "price": 1815,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 10х10 мм рулон 1х50 м",
        "price": 3080,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х30 м 145 г/м.кв., желтая",
        "price": 1650,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х50 м 160 г/м.кв., синяя",
        "price": 2420,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х50 м 160 г/м.кв., прозр.",
        "price": 2860,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Малярка",
            "section": "Сетка Стеклоткань",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч двухсторонний 45мм",
        "price": 253,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный 50 мм х 50 м",
        "price": 143,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Kraft 50 мм х 50 м",
        "price": 253,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Unibob 50 мм х 50 м белый",
        "price": 363,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный 50 мм х 100 м",
        "price": 242,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный для деликатной окраски розовый 25 мм 25 м",
        "price": 275,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный белый для деликатных поверхностей 30 мм 25 м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Unibob для наружных работ синий 50 мм 25 м",
        "price": 418,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Tesa для деликатных поверхностей розовый 30 мм 50 м",
        "price": 1045,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Tesa для деликатных поверхностей синий УФ стойкий 30 мм 50 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный синий Unibob для деликатных поверхностей 50 мм 25 м",
        "price": 324,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный синий Howard для деликатных поверхностей 50 мм 25 м",
        "price": 418,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч полиэтиленовый 50 мм",
        "price": 132,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч полиэтиленовый 50 мм, синий",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч полиэтиленовый 50 мм, красный",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч армированный 50 мм х 50 м",
        "price": 275,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч монтажный алюминиевый 50 мм 50 м",
        "price": 385,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Скотч",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 50 мм x 90 м",
        "price": 198,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Серпянка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 100 мм x 45 м",
        "price": 220,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Серпянка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 150 мм x 20 м",
        "price": 275,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Серпянка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента тканевая монтажная 25 мм х 50 м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента бумажная Knauf для швов ГКЛ 50 мм 150 м",
        "price": 495,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента разделительная Кнауф Треннфикс самоклеящаяся 65мм 50м",
        "price": null,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента армирующая для швов Knauf Kurt 50 мм х 25 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента армирующая для швов Knauf Kurt 50 мм х 75 м",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента кромочная демпферная 100 мм 20 м для полов",
        "price": 275,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента вибродемпфирующая SoundGuard самоклеящаяся 50х4 мм 12 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента гидроизоляционная Ceresit CL 152 12 см 10 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента гидроизоляционная Knauf Флэхендихтбанд 12 см 10 м",
        "price": 1485,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента углозащитная с металличесскими вставками КМ 50мм х 30м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента металлизированная защитная углоформирующая Psm-Pro 50 мм х 30 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента малярная 3M ScotchBlue синяя 36 мм 54,8 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента малярная Tesa желтая 50 мм 50 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 30х3 мм 30 м",
        "price": 198,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 50х3 мм 30 м",
        "price": 319,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 95х3 мм 30 м",
        "price": 605,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 30х3 мм 30 м",
        "price": 264,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 50х3 мм 30 м",
        "price": 363,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 75х3 мм 30 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 95х3 мм 30 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента для звукоизоляции Вибростек М-100 0,1х30 м",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Лента",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка армированная сеткой 5 х 5 мм 2м х 12,5м (25м2)",
        "price": 1870,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка защитная с клейким краем 10 мкм 1,4х33 м (46,2 кв.м)",
        "price": 385,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка защитная с клейким краем 10 мкм 2,7х20 м (54 кв.м)",
        "price": 418,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка черная 100 мкр полиэтиленовая, рук. 1,5 м",
        "price": 49,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка черная 200 мкр полиэтиленовая, рук. 1,5 м",
        "price": 88,
        "unit": "м",
        "weight": 0.16,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 80 мкр полиэтиленовая, рук. 1.5 м",
        "price": 44,
        "unit": "м",
        "weight": 0.05,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 100 мкр полиэтиленовая, рук. 1.5 м",
        "price": 55,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 150 мкр полиэтиленовая, рук. 1.5 м",
        "price": 66,
        "unit": "м",
        "weight": 0.09,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 180 мкр полиэтиленовая, рук. 1.5 м",
        "price": 71,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 200 мкр полиэтиленовая, рук. 1.5 м",
        "price": 82,
        "unit": "м",
        "weight": 0.16,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка Стрэйч 500 мм 300 м",
        "price": 605,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Малярка",
            "section": "Пленка",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Болгарка 125мм",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструмент",
            "section": "Электроинструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Болгарка 230мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Инструмент",
            "section": "Электроинструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ключ Газовый №",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ключ Разводной ? мм",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ключ гаечный рожковый 22\\24",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Крюк для вязки арматуры",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Гвоздодер 500мм",
        "price": 495,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лом гвоздодер усиленный 600 мм (монтировка)",
        "price": 1210,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лом строительный 25х1300",
        "price": 1595,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лопата совковая с черенком",
        "price": 495,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лопата штыковая с черенком",
        "price": 495,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Черенок для совка 600 мм",
        "price": 253,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Черенок - ручка для лопаты метлы",
        "price": 330,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Линейка металлическая 50см",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 200 гр",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 300 гр",
        "price": 423,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 400 гр",
        "price": null,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 500 гр",
        "price": 440,
        "unit": "шт",
        "weight": 0.55,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 600 гр",
        "price": 544,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 800 гр",
        "price": 605,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 1000 гр",
        "price": 715,
        "unit": "шт",
        "weight": 1.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток Киянка резиновая 300 г",
        "price": 275,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток Киянка резиновая 600 г",
        "price": 495,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Набор для укладки ламината",
        "price": 654,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для укладки ламината 20 шт",
        "price": 418,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы по металлу 1. Эконом",
        "price": 495,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы по металлу 2.",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы по металлу 3. Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы для зачистки/обжима проводов Стриппер",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы для резки пластиковых труб Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы для резки пластиковых труб Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по ГКЛ прокалывающая 150мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 500мм Эконом",
        "price": 990,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 500мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 700мм Эконом",
        "price": 1210,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 700мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по дереву Эконом",
        "price": 434,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по дереву Премиум",
        "price": 654,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по металлу Эконом",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по металлу Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Отвертка плюс",
        "price": 308,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Отвертка минус",
        "price": 308,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Отвертка индикаторная",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Просекатель для профиля, работа одной рукой",
        "price": 2145,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок для ПГП",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок кромочный по ГКЛ",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок обдирочный по ГКЛ",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок штукатурный 450х90 Дерево",
        "price": 1430,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок штукатурный 450х90 Металл",
        "price": 2420,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рулетка магнитная 5м 1. Эконом",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рулетка магнитная 5м 3. Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рулетка магнитная 10м 1. Эконом",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Сварочный аппарат для ПП труб",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Инструмент",
            "section": "Электроинструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для очистки межплиточных швов",
        "price": 313,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 100мм",
        "price": 330,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 100мм, удлиненная ручка",
        "price": 385,
        "unit": "шт",
        "weight": 0.85,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 200мм Эконом",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 200мм",
        "price": 825,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 300мм",
        "price": 1485,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стол малярный 500х950х800",
        "price": 4180,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 4 ступ.",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 5 ступ.",
        "price": 3278,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 6 ступ.",
        "price": 3905,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 8 ступ.",
        "price": 4235,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Степлер строительный 1. Эконом",
        "price": 638,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Степлер строительный 2.",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Степлер строительный 3. Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стусло коробчатое 11*120",
        "price": 478,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стусло пластмассовое 320*120*75",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стусло пластмассовое 350*120*110",
        "price": null,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стамеска 32 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стамеска 50 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стержень клеевой",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет под клеевой стержень",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Тачка строительная (1 колесо)",
        "price": 4180,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Тачка строительная (2 колеса)",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Топор 200 г",
        "price": 544,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Топор 300 г",
        "price": 605,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Присоска Вакуумная (стеклодомкрат), пластик",
        "price": 825,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Присоска Вакуумная (стеклодомкрат), металл",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный 400 х 600 мм, оц.",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный 400 х 600 мм, Черн",
        "price": 385,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный с рукояткой 300 мм, Желтый",
        "price": 253,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный с рукояткой 400 мм, Желтый",
        "price": 275,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Щетка по металлу с деревянной ручкой 245 мм Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Щетка по металлу с пластиковой ручкой 245 мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструмент",
            "section": "Инструмент",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Тепловая пушка электрическая 2000 Вт (20 м2)",
        "price": 3630,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструмент",
            "section": "Электроинструмент",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Батарейка Duracell АА пальчиковая 1шт",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x110 мм SDS+",
        "price": 88,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x160 мм SDS+",
        "price": 121,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x210 мм SDS+",
        "price": 187,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x310 мм SDS+",
        "price": 214,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x110 мм SDS+",
        "price": 143,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x160 мм SDS+",
        "price": 165,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x210 мм SDS+",
        "price": 214,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x250 мм SDS+",
        "price": 231,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x110 мм SDS+",
        "price": 165,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x160 мм SDS+",
        "price": 192,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x210 мм SDS+",
        "price": 214,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x250 мм SDS+",
        "price": 324,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x310 мм SDS+",
        "price": 341,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x600 мм SDS+",
        "price": 715,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x800 мм SDS+",
        "price": 935,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x1000 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x110 мм SDS+",
        "price": 231,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x160 мм SDS+",
        "price": 253,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x210 мм SDS+",
        "price": 275,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x250 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x310 мм SDS+",
        "price": 308,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 14x210 мм SDS+",
        "price": 429,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 16х310 мм SDS+",
        "price": 385,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 16х460 мм SDS+",
        "price": 935,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 20x250 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 0.19,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 30x460 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 32x460 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 32x600 мм SDS+",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 25 мм",
        "price": 66,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 50 мм",
        "price": 88,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 70 мм",
        "price": 99,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 100 мм",
        "price": 143,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 150 мм",
        "price": 187,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 25 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 50 мм Премиум",
        "price": 137,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 70 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 100 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 150 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита Ударная PH2 магнитная 50 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита Ударная PH2 магнитная 50 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита с ограничителем, PH2 магнитная 50 мм",
        "price": 143,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита с ограничителем, PH2 магнитная 50 мм, Премиум",
        "price": 275,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 6мм для кровельных саморезов",
        "price": 137,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 8мм для кровельных саморезов",
        "price": 159,
        "unit": "шт",
        "weight": 0.012,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 10мм для кровельных саморезов",
        "price": 176,
        "unit": "шт",
        "weight": 0.013,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 12мм для кровельных саморезов",
        "price": 198,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 13мм для кровельных саморезов",
        "price": 209,
        "unit": "шт",
        "weight": 0.017,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка - адаптер для шуруповерта угловой 60мм",
        "price": 528,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило плоское SDS+ 20х250 мм",
        "price": 275,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило плоское SDS+ 40х250 мм",
        "price": 352,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило канальное SDS+ 22х250 мм",
        "price": 308,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило пикообразное SDS-plus 250 мм Эконом",
        "price": 275,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило пикообразное SDS-plus 250 мм Премиум",
        "price": 434,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик обойный для стыков (бочка) 45 мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик для нанесения шпаклевки 230 мм",
        "price": 1650,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик 100 мм для грунтовки и покраски, Matrix",
        "price": 198,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 12мм, для грунтовки и покраски в сборе",
        "price": 242,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 12мм, для грунтовки и покраски, Matrix в сборе",
        "price": 352,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 18мм, для грунтовки и покраски, Matrix в сборе",
        "price": 352,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик микрофибра 100 мм ворс 10мм, для покраски в сборе",
        "price": 385,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик микрофибра 250 мм ворс 10мм, для покраски в сборе",
        "price": 682,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик 350 мм для грунтовки и покраски",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 350 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 100 мм для покраски, Matrix",
        "price": 143,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА полиакрил 250 мм ворс 12мм для покраски, Matrix",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА полиакрил 250 мм ворс 18мм для покраски, Matrix",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА микрофибра 100 мм ворс 10мм, для покраски",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА микрофибра 250 мм ворс 10мм, для покраски",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 50 мм для покраски, Анза (уп 2шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 100 мм для покраски, Анза",
        "price": 550,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 250 мм для покраски, Анза",
        "price": 1650,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 50х6 мм для покраски, Matrix",
        "price": 77,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 100х6 мм для покраски, Matrix",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 250х6 мм для покраски, Matrix",
        "price": 165,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 50 мм для покраски, Анза",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 100 мм для покраски, Анза",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 250 мм для покраски, Анза",
        "price": 935,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (300 мм, игла 14 мм)",
        "price": 495,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (400 мм, игла 14 мм)",
        "price": 605,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (600 мм)",
        "price": 825,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (300 мм, игла 14 мм)",
        "price": 715,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (400 мм, игла 14 мм)",
        "price": 825,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (600 мм)",
        "price": 1045,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для сгибания гипсокартона 150мм",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ванночка малярная 285*155 мм",
        "price": 110,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ванночка малярная 330*350 мм",
        "price": 121,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ванночка для краски 440х320 мм",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро строительное 10 л, оцинкованное",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро строительное 12 л",
        "price": 187,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро строительное 20 л",
        "price": 203,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 45 л",
        "price": 418,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 65 л",
        "price": 495,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 95 л",
        "price": 638,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Бак пластиковый усиленный на 100 л",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовая горелка, кровельная",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовая горелка, пьеза",
        "price": 715,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовый баллон 0,5 л",
        "price": 165,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка для влажной уборки 1шт",
        "price": 77,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Тряпка микрофибра 1шт",
        "price": 143,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №60",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №80",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №100",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №120",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №150",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №180",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №220",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №240",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №320",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка для затирки швов плитки 1шт",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка для затирки эпоксидных швов плитки 1шт",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка целлюлозная для удаления остатков затирки жёсткая",
        "price": 825,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка целлюлозная для удаления остатков затирки жёсткая LITOKOL",
        "price": 935,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Рукав для расшивки швов затирки 5 - 25 мм (Камень, Клинкер, Бусчатка)",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Пилки для лобзика по дереву набор (5 шт)",
        "price": 187,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Пилки для лобзика по металлу набор (5 шт)",
        "price": 385,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Пилки для лобзика по кварцвинилу набор (5 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Подошва тапочки для наливного пола",
        "price": 935,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1 м",
        "price": 385,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1,5 м",
        "price": 577,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2 м",
        "price": 770,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2,5 м",
        "price": 962,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 3 м",
        "price": 1045,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1 м ЗУБР, усиленное",
        "price": 550,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1,5 м ЗУБР, усиленное",
        "price": 770,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2 м ЗУБР, усиленное",
        "price": 1045,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2,5 м ЗУБР, усиленное",
        "price": 1485,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 3 м ЗУБР, усиленное",
        "price": 1705,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило прямоугольное ? м",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило h-образное ? м",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 2м, 2 ручки",
        "price": 1760,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 2.5м, 2 ручки",
        "price": 2310,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 3м, 2 ручки",
        "price": 2530,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Крестики для плитки 1,5 мм (уп 200 шт)",
        "price": 165,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Малые (уп 50 шт)",
        "price": 132,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Средние (уп 50 шт)",
        "price": 132,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Большие (уп 50 шт)",
        "price": 132,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП для плитки многоразовая, зажим 1 мм (20 шт/уп)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП для плитки многоразовая, зажим 1,5 мм (20 шт/уп)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 1мм, Зажим (уп 100 и 500шт)",
        "price": 3,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 1,5мм, Зажим (уп 100 и 500шт)",
        "price": 3,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 2мм, Зажим (уп 100 и 500шт)",
        "price": 3,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D Клин (уп 50 и 200шт)",
        "price": 7,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 1мм, Зажим (уп 100 шт)",
        "price": 385,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 1,5мм, Зажим (уп 100 шт)",
        "price": 385,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 2мм, Зажим (уп 100 шт)",
        "price": 385,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS Клин (уп 100шт)",
        "price": 715,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Щипцы для монтажа СВП",
        "price": 1430,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Кисть макловица",
        "price": 275,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть радиаторная 25мм",
        "price": 137,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть радиаторная 50мм",
        "price": 143,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть для красок круглая 35 мм",
        "price": 143,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм натуральная щетина",
        "price": 38,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 38 мм натуральная щетина",
        "price": 77,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм натуральная щетина",
        "price": 88,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 75 мм натуральная щетина",
        "price": 132,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм натуральная щетина",
        "price": 165,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм искусственная щетина ЗУБР",
        "price": 77,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 38 мм искусственная щетина ЗУБР",
        "price": 104,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм искусственная щетина ЗУБР",
        "price": 143,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 75 мм искусственная щетина ЗУБР",
        "price": 176,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм искусственная щетина ЗУБР",
        "price": 275,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм, Анза",
        "price": 352,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм, Анза",
        "price": 528,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 70 мм, Анза",
        "price": 825,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм, Анза",
        "price": 935,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма штукатурная дер. ручка 200х180 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма для декоративных работ дер. ручка 190х70 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма для декоративных работ дер. ручка 240х100 мм Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма для декоративных работ дер. ручка 240х100 мм Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма - Гладилка для штукатурных работ пластик. ручка 270х130 мм",
        "price": 385,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма - Гладилка для штукатурных работ дер. ручка 270х130 мм",
        "price": 517,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ковш штукатурный",
        "price": 385,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по бетону d-68мм, с центрирующим сверлом",
        "price": 935,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по бетону d-70мм, с центрирующим сверлом",
        "price": 968,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка \"Зубр\" по бетону d-68 мм, с центрирующим сверлом",
        "price": 1265,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка MD Star по бетону d-72 мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-10мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-16мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-20мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-25мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-30мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-32мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-35мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-40мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-50мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.14,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-60мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-63мм, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-68мм, с центрирующим сверлом",
        "price": 423,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-70мм, с центрирующим сверлом",
        "price": 434,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-100мм, с центрирующим сверлом",
        "price": 473,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по металлу биметаллическая d-33мм",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка хвостовик шестигранный для биметалл коронок 14-30 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Набор Коронок алмазных по керамограниту, с центрирующим сверлом",
        "price": null,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Набор Коронок по дереву 19-64 мм, с центрирующим сверлом и переходником",
        "price": null,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-10мм, с центрирующим сверлом",
        "price": 324,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-16мм, с центрирующим сверлом",
        "price": 385,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-20мм, с центрирующим сверлом",
        "price": 605,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-25мм, с центрирующим сверлом",
        "price": 880,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-30мм, с центрирующим сверлом",
        "price": 1210,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-32мм, с центрирующим сверлом",
        "price": 1320,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-35мм, с центрирующим сверлом",
        "price": 1485,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-40мм, с центрирующим сверлом",
        "price": 1650,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-50мм, с центрирующим сверлом",
        "price": 1870,
        "unit": "шт",
        "weight": 0.14,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-60мм, с центрирующим сверлом",
        "price": 1980,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-63мм, с центрирующим сверлом",
        "price": 2145,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-68мм, с центрирующим сверлом",
        "price": 2420,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-70мм, с центрирующим сверлом",
        "price": 2585,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-100мм, с центрирующим сверлом",
        "price": 2750,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-10мм",
        "price": 858,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-16мм",
        "price": null,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-20мм",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-25мм",
        "price": null,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-30мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-32мм",
        "price": 1210,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-35мм",
        "price": null,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-40мм",
        "price": null,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-50мм",
        "price": null,
        "unit": "шт",
        "weight": 0.14,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-60мм",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-63мм",
        "price": null,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-68мм",
        "price": null,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-70мм",
        "price": 2970,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-100мм",
        "price": 5335,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Фреза - Пирамидка алмазная для УШМ конусная по плитке 2-38 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Опрыскиватель - пульверизатор, пластик 2 л",
        "price": 495,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Опрыскиватель - пульверизатор, пластик 5 л",
        "price": 1980,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 4",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 6",
        "price": null,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 8",
        "price": null,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 10",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 12",
        "price": 77,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 16",
        "price": 143,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 4",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 6",
        "price": 308,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 8",
        "price": 330,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 10",
        "price": 396,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 12",
        "price": 528,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 16",
        "price": null,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Карандаш строительный",
        "price": 16,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер чёрный",
        "price": 27,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер перманентный двусторонний грифель 0,7-1мм черный",
        "price": 132,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер лаковый для промышленной графики грифель 2мм белый",
        "price": 143,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвия к рубанку торцевому (10шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвие малярного ножа 25 мм (10шт)",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный 25 мм",
        "price": 220,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвие малярного ножа 18 мм (10шт)",
        "price": 165,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный 18 мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвия Olfa для малярного ножа 18мм (10шт)",
        "price": 528,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный Olfa 18 мм",
        "price": 1045,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож кровельный",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож для резки ГВЛ",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скребок для снятия шпаклевки",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвия для скребка по шпаклевки",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лента тарная оцинкованная 20x0.55 мм 25 м без отверстий",
        "price": null,
        "unit": "шт",
        "weight": 1.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перфолента оцинкованная 10мм х 20м",
        "price": 253,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перфолента оцинкованная 20мм х 20м",
        "price": 385,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 115",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 125",
        "price": 49,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 125 DeWALT",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 180",
        "price": 82,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 230",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 115 Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 115 Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 125 Эконом",
        "price": 715,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 125 Премиум",
        "price": 935,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для циркулярной пилы d125 Эконом",
        "price": 825,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для циркулярной пилы d125 Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск лепестковый шлифовальный УШМ P-120 125х22 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка для УШМ (болгарки) для резки плитки под углом 45 градусов",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка чашка для УШМ 100 мм, мягкая пушистая",
        "price": 275,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка чашка для УШМ 125 мм, жесткая",
        "price": 605,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по камню Triodiamant 125 1.1 мм",
        "price": 1045,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Triodiamant 125 1.1 мм",
        "price": 1045,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar TURBO UNIVERSAL 115 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Esthete 7D 125x22,2x1,1 мм , сух. Рез",
        "price": 4730,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Distance 7D 125 1 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Hard Ceramics 5D 125 1,4 мм",
        "price": 3080,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по граниту Distar Granite 150 1.4 мм, сплошной рез",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar 7D 250x25,4x1,8 мм сплошной мокрый рез",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Hard Advanced 300x10x25,4х1,8 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту для заусовки 125 мм Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту для заусовки Katana 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту для заусовки Hilberg 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 125 Эконом",
        "price": 770,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 125 Премиум",
        "price": 1980,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 125 Distar",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 230 Эконом",
        "price": 825,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 230 Премиум",
        "price": 2750,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск чашка шлифовальный по бетону 125, №2",
        "price": 715,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный гибкий (черепашка) 100 мм P-",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка липучка для диска алмазный гибкий (черепашка) 100 мм",
        "price": 308,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки диаметром 125мм P-",
        "price": 88,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки 6 отверстий диаметром 125мм P-",
        "price": 93,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 125 мм",
        "price": 275,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки диаметром 180мм P-",
        "price": 93,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 180 мм",
        "price": 308,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки 6 отверстий диаметром 225мм P-",
        "price": null,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 225 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки диаметром 240мм P-",
        "price": null,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 240 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Держатель для наджачной сетки",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Терка полиуретановая для шлифовки штукатурки 280x140 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Терка полиуретановая для шлифовки штукатурки 600x110 мм",
        "price": 528,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Напильник - Набор надфилей алмазных ЗУБР (5шт)",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нить капроновая",
        "price": 88,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нить отбивочная с колером 1. Эконом",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нить отбивочная с колером 2. Премиум",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Колер для нити отбивочной",
        "price": 143,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"40\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"60\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"80\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"100\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"120\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"150\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"180\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"220\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"240\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"320\"",
        "price": 38,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-60 (25-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-80 (20-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-100 (12-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-120 (10-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-150 (8-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-180 (6-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-240 (5-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-280 (4-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-400 (3-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-1500 (0-Н) (ширина 80см) 1м",
        "price": 605,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка шлифовальная в рулоне на тканевой основе 2500x115 мм P-",
        "price": 495,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Отвес строительный 300 г",
        "price": 308,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Респиратор - маска KN95 3-сл.",
        "price": 143,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Респиратор - полумаска фильтрующая без клапана",
        "price": 55,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Респиратор - полумаска FFP1 с фильтрами в комплекте (2 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 2,5мм",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 3мм",
        "price": null,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 4мм",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 6мм",
        "price": 93,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 8мм",
        "price": 104,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 10мм",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 12мм",
        "price": 308,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 2,5 мм, Кобальтовое",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 3 мм, Кобальтовое",
        "price": 66,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 4 мм, Кобальтовое",
        "price": 77,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 5 мм, Кобальтовое",
        "price": 104,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 6 мм, Кобальтовое",
        "price": 165,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 8 мм, Кобальтовое",
        "price": 198,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 10 мм, Кобальтовое",
        "price": 253,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 8 мм, Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 10х100 мм, Эконом",
        "price": 33,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло ступенчатое пирамида 4 - 22",
        "price": 825,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло ступенчатое пирамида 4 - 39",
        "price": 1045,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скобы для степлера строительного 10 мм, (1000 шт)",
        "price": 165,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скобы для степлера строительного 12 мм, (1000 шт)",
        "price": 165,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Очки защитные",
        "price": 198,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наколенники",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки х/б",
        "price": 27,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки с 2-м обливом",
        "price": 38,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки с 2-м обливом Утепленные",
        "price": 143,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки защитные с латексным покрытием",
        "price": 104,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Комбинезон одноразовый Каспер",
        "price": 385,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. пластиковый 2 м",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. стальной 2 м",
        "price": 605,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. стальной 3 м",
        "price": 935,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. алюминиевый 2 м",
        "price": 935,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мастерок лепесток плиточника",
        "price": 275,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мастерок трапециевидный каменщика",
        "price": 275,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 1 м Эконом",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 1.5 м Капро Изр.",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 1.5 м Эконом",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 2 м Капро Изр.",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 2 м Эконом",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 800 мм Капро",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 800 мм Эконом",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 600 мм Капро",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Уровень 600 мм Эконом",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 60 мм",
        "price": 66,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 100 мм",
        "price": 66,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 150 мм",
        "price": 132,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 200 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 250 мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 350 мм",
        "price": 242,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 450 мм",
        "price": 330,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 600 мм",
        "price": 495,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 450 мм СибрТех",
        "price": 715,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 40 мм Matrix",
        "price": 132,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 60 мм Matrix",
        "price": 159,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 80 мм Matrix",
        "price": 231,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 100 мм Matrix",
        "price": 275,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 150 мм Matrix",
        "price": 297,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 200 мм Matrix",
        "price": 495,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 250 мм Matrix",
        "price": 605,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 300 мм Matrix",
        "price": 660,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 350 мм Matrix",
        "price": 858,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 475 мм Matrix",
        "price": 1089,
        "unit": "шт",
        "weight": 0.58,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 600 мм Matrix",
        "price": 1375,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 400 мм Kraftool",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Набор шпателей сталь 50/80/100/120 мм, 4 шт.",
        "price": 198,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Скребок изогнутый 75 мм",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Скребок Matrix 253 мм, нержавеющая сталь",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 8мм",
        "price": 253,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Эконом Зуб 8мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 12мм Эконом",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 12мм Премиум",
        "price": 1595,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Правило, 600 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Правило, 800 мм",
        "price": 2750,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - фасадный 450мм с широким полотном",
        "price": 935,
        "unit": "шт",
        "weight": 0.55,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 150мм, Зуб 10мм",
        "price": 104,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 250мм, Зуб 10мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 350мм, Зуб 10мм",
        "price": 330,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 180 мм, Зуб 4х4 мм нерж.",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 230 мм, Зуб 2х2 мм, пластик",
        "price": 198,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 250 мм, Зуб треугольный 5х4 мм нерж.",
        "price": 313,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для обоев универсальный 280 мм пластиковый",
        "price": 220,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель резиновый 126 мм пластиковая ручка",
        "price": 187,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для затирки резиновый, набор (3 шт.) белый",
        "price": 198,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для выравнивания затирки резиновый, набор геометрия (4 шт.)",
        "price": 418,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель резиновый для нанесения эпоксидной затирки с ручкой 115х250, Эконом",
        "price": 715,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель резиновый для нанесения эпоксидной затирки LITOKOL 110х260 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.9,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка метла с ручкой",
        "price": 605,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Веник + Совок",
        "price": 407,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Совок металл",
        "price": 209,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Совок пластик",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Веник",
        "price": 198,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под резьбу 120мм",
        "price": 825,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под резьбу 140мм",
        "price": 935,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под дрель",
        "price": 495,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под перфоратор, SDS+ 100 мм",
        "price": 605,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под перфоратор, SDS+ 120 мм",
        "price": 715,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под перфоратор, SDS+ 130 мм",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок под мусор Белый, прочный 56х105см",
        "price": 19,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки под мусор в рулоне 280л. черные",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки для пылесоса Dexter 5шт",
        "price": 935,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки одноразовые для пылесоса Dexter 20л 4 шт",
        "price": 1210,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок для пылесоса Tools Master WD 3 (5 шт)",
        "price": 1265,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок для пылесоса универсальный Bayrtools Master Professional UM 20, 36 л (5 шт.)",
        "price": 935,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок для пылесоса Karcher (2.863-006.0) 30 л к моделям WD 4/5/6 флис (4 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ветош половая",
        "price": 44,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ветош полотенце",
        "price": 60,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Раскладушка Матрас Подушка Одеяло - Комплект",
        "price": null,
        "unit": "шт",
        "weight": 13,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Матрас Подушка Одеяло - Комплект",
        "price": 1485,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Раскладушка без матраса",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Фиброволокно HOWARD полипропиленовое 12 мм, 0.6кг",
        "price": 308,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Фиксатор арматуры горизонтальный (стульчик)",
        "price": 4,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Электроды 3мм, 1кг",
        "price": 605,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Электроды 3мм, 2.5кг",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кислота для пайки",
        "price": null,
        "unit": "шт",
        "weight": 0,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Неодимовый магнит круглый для люков и креплений 20х3 мм",
        "price": 308,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Неодимовый магнит прямоугольный для люков и креплений 35х15х3 мм",
        "price": 385,
        "unit": "шт",
        "weight": 0.008,
        "category": {
            "main": "Расходник",
            "section": "Расходник",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Анкерный болт для бетона 8х60 мм (1 шт.)",
        "price": 27,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 10х100 мм (1 шт.)",
        "price": 33,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 10х150 мм (1 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 12х120 мм (1 шт.)",
        "price": 38,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 12х140 мм (1 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 12х160 мм (1 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 8х30 (1 шт.)",
        "price": 38,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 10х30 (1 шт.)",
        "price": 36,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 10х35 (1 шт.)",
        "price": 38,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 12х50 (1 шт.)",
        "price": 55,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер химический Tytan Professional EV-I, серый 300 мл",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер - Клин 6*37\\40, 1шт",
        "price": 8,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер - Клин 6*57\\60, 1шт",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х70 мм пластиковый гвоздь",
        "price": 6,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х90 мм пластиковый гвоздь",
        "price": 7,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х90 мм металлический гвоздь",
        "price": 16,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х150 мм металлический гвоздь",
        "price": 18,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х200 мм металлический гвоздь",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х40 (200 шт), Гриб",
        "price": 528,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х60 (200 шт), Гриб",
        "price": 528,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х80 (100 шт), Гриб",
        "price": null,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x40 мм (200 шт), Гриб",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x60 мм (100 шт), Гриб",
        "price": 638,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x80 мм (100 шт), Гриб",
        "price": 660,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x100 мм (100 шт), Гриб",
        "price": 660,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x120 мм (1 шт), Гриб",
        "price": 14,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х40 (200 шт), Потай",
        "price": 528,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х60 (200 шт), Потай",
        "price": 528,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х80 (100 шт), Потай",
        "price": null,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x40 мм (200 шт), Потай",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x60 мм (100 шт), Потай",
        "price": 638,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x80 мм (100 шт), Потай",
        "price": 660,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x100 мм (100 шт), Потай",
        "price": 660,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x120 мм (1 шт), Потай",
        "price": 14,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 10x100 мм (глухарь) (1 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель пластиковый 6x50 мм (1 шт)",
        "price": 1,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель пластиковый Бабочка 6х40 (1 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель пластиковый Бабочка 10х50 (1 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 5-10мм Белый (100 шт)",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 11-19мм Белый (100 шт)",
        "price": 214,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 19-25мм Белый (100 шт)",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 5-10 мм белый (100 шт)",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 6-12 мм белый (100 шт)",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 9-16 мм белый (100 шт)",
        "price": 214,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 19-25 мм белый (100 шт)",
        "price": 231,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель нейлоновый бабочка для листовых материалов 8х50 мм (1шт)",
        "price": 14,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x30 мм нейлон (1 шт)",
        "price": 1,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x32 мм полипропилен (100 шт)",
        "price": 132,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x60 мм полипропилен (500 шт)",
        "price": 434,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x60 мм полипропилен (1000 шт)",
        "price": 935,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель морковка оранжевый 6x40 мм (1 шт)",
        "price": 1,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель морковка оранжевый 6x40 мм (500 шт)",
        "price": 605,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы Spax для массивных деревянных полов, 3,5х35 (500шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый 25 мм по металлу",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый 25 мм по дереву",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый универсальный 51 мм",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 25 мм по металлу",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 35 мм по металлу",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 50 мм по металлу",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 70 мм по металлу",
        "price": 418,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 25 мм по дереву",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 35 мм по дереву",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 50 мм по дереву",
        "price": 385,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 70 мм по дереву",
        "price": 418,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 75 мм по дереву",
        "price": 418,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 100 мм по дереву",
        "price": 418,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 150 мм по дереву",
        "price": 418,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 13мм острый",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 13мм с буром",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 16мм острый",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 16мм с буром",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 19мм острый",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 19мм с буром",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 50мм острый",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 50мм с буром",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный без шайбы 19мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный без шайбы 25мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный без шайбы 35мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный с шайбой 19мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный с шайбой 25мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез кровельный с шайбой 35мм с буром RAL",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез конструкционный потайной под Торкс 6х100 мм по дереву, желтый (1 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.016,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы черные клопы 9,5x2,5 острый",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы черные клопы 9,5x3,5 с буром",
        "price": 605,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 4,5х50 мм с дюбелем F8",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез с L-образным крюком, костыль 4х40",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 25 мм",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 35 мм",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 45 мм",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по ГВЛ 25 мм (500 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 25 мм (1000 шт.)",
        "price": 1485,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 35 мм (1000 шт.)",
        "price": 1485,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 45 мм (1000 шт.)",
        "price": 1650,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез в ленте Knauf по гипсокартону 25 мм (1000 шт.)",
        "price": 1925,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез в ленте Knauf по гипсокартону 35 мм (1000 шт.)",
        "price": 1925,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез в ленте Knauf по гипсокартону 45 мм (1000 шт.)",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы TehnoSonus 25x3,9 мм C-XTN (500 шт.)",
        "price": null,
        "unit": "кг",
        "weight": 0.7,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы TehnoSonus 41x3,9 мм C-XTN (500 шт.)",
        "price": null,
        "unit": "кг",
        "weight": 1.2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы универсальные для аквапанелей 25мм, с буром",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы универсальные для аквапанелей 35мм, с буром",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез для подрозетника 10 / 20 мм",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 16 мм усиленные 1000 шт.",
        "price": 1958,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 19 мм усиленные 1000 шт.",
        "price": 2178,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 22 мм усиленные 1000 шт.",
        "price": 2310,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 25 мм усиленные 1000 шт.",
        "price": 2420,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовый баллон для монтажных пистолетов 165 мм 80мл",
        "price": 825,
        "unit": "шт",
        "weight": 0.9,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Саморез кровельный по профлисту гарпун 5,5х38",
        "price": 715,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди 70 мм",
        "price": 198,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 75 мм",
        "price": 198,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 80 мм",
        "price": 198,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 100 мм",
        "price": 198,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 120 мм",
        "price": 198,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 150 мм",
        "price": 220,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди финишные 60 мм",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди винтовые оцинкованные 60 мм",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Соединитель для шпильки М8, 24мм",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба - Гриб, Рондоль под саморез d60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М8 х 2000 мм",
        "price": 275,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М8 х 1000 мм",
        "price": 143,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М8 х 500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М8",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М8",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М8, самоконтрящаяся",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Соединитель для шпильки М10, 30мм",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М10 х 2000 мм",
        "price": 385,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М10 х 1000 мм",
        "price": 198,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М10 х 500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М10",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М10",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М10, самоконтрящаяся",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М12 х 2000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М12 х 1000 мм",
        "price": 231,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М12 х 500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М12",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М12",
        "price": 528,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М12, самоконтрящаяся",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М14 х 2000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М14 х 1000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М14 х 500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М14",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М14",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М14, самоконтрящаяся",
        "price": null,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Крепеж",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Изолента",
        "price": 104,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Изолента Желто - Зеленая",
        "price": 121,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Подрозетник по ГКЛ",
        "price": 20,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по ГКЛ глубокий",
        "price": 38,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по бетону",
        "price": 15,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по бетону глубокий",
        "price": 19,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Вилка каучуковая с заземлением",
        "price": 198,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 2-е розетки",
        "price": 275,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 3-и розетки",
        "price": 495,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 4-е розетки",
        "price": 462,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. влагозащищенная (тройник) 3-и розетки, каучук",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 2x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 2x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 3x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 3x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 3x4 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 3x6 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 5x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 5x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.24,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 5x4 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 5x6 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.42,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский  ВВГнг LS 5x10 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.75,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 2x1,5 ГОСТ",
        "price": 47,
        "unit": "м",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 2x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x1,5 ГОСТ",
        "price": 73,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x2,5 ГОСТ",
        "price": 88,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x4 ГОСТ",
        "price": 187,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x6 ГОСТ",
        "price": 253,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x10 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 4x5 ГОСТ",
        "price": 275,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.24,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x4 ГОСТ",
        "price": 302,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x6 ГОСТ",
        "price": 371,
        "unit": "м",
        "weight": 0.42,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x10 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.75,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x25 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x35 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 2.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 2x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 2x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x1,5 ГОСТ",
        "price": 95,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x2,5 ГОСТ",
        "price": 121,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x4 ГОСТ",
        "price": 209,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x6 ГОСТ",
        "price": 319,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x10 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 4x5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.24,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.42,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x10 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.75,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x25 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 5x35 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 2.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 3х1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 3х2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 3х6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 4х5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 5х4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.48,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель NUM Конкорд 5х6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.55,
        "category": {
            "main": "Электрика",
            "section": "Кабель НУМ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 3x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 3x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 3x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 4x5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 5x4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.48,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский Конкорд ВВГнг LS 5x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.55,
        "category": {
            "main": "Электрика",
            "section": "Кабель Плоский",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 3x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 3x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 3x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 5x4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.48,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 4x5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 5x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.55,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 3x1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 3x2,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 3x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 4x5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 5x4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.48,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг FRLS 5x6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.55,
        "category": {
            "main": "Электрика",
            "section": "Кабель Круглый",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х0,75 ГОСТ",
        "price": 28,
        "unit": "м",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х1,5 ГОСТ",
        "price": 51,
        "unit": "м",
        "weight": 0.07,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х2,5 ГОСТ",
        "price": 77,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х0,75 ГОСТ",
        "price": 57,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х1.5 ГОСТ",
        "price": 82,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х2.5 ГОСТ",
        "price": 104,
        "unit": "м",
        "weight": 0.13,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х2.5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х3 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.13,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х6 ГОСТ",
        "price": 286,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 4х1,5 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.11,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 4х4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.18,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 5х4 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.38,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 5х6 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.43,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПВС",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ШВВП 2х0,75",
        "price": 28,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Кабель ШВВП",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ШВВП 2х0,5",
        "price": null,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Кабель ШВВП",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ШВВП 2х1.5",
        "price": null,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Кабель ШВВП",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 1,5 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 2,5 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.27,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 4,0 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 6,0 цвет ?",
        "price": 93,
        "unit": "м",
        "weight": 0.07,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 10,0 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 16,0 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.19,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 26,0 цвет ?",
        "price": null,
        "unit": "м",
        "weight": 0.31,
        "category": {
            "main": "Электрика",
            "section": "Кабель ПУГВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ТВ РЖ6",
        "price": 38,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Кабель ТВ",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 10х15, 2м белый",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 16х16, 2м белый",
        "price": 77,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 20х10, 2м белый",
        "price": 55,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 25х16, 2м белый",
        "price": 66,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 25х25, 2м белый",
        "price": 96,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - Канал 40х20, 2м белый",
        "price": 148,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - Канал 40х40, 2м белый",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Кабель Канал",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель тройник (5м)",
        "price": 748,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Удлинитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель тройник (10м)",
        "price": 990,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Удлинитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель четверной (5м)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Удлинитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель четверной (10м)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Удлинитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Интернет кабель UTP",
        "price": 38,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Кабель Интерн",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Интернет кабель FTP 5cat - 4е пары",
        "price": 41,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Кабель Интерн",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Интернет кабель FTP 6cat - 4е пары",
        "price": null,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Кабель Интерн",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая Металлорукав IEK РЗ-ЦХ-16 мм 50 м",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая Металлорукав IEK РЗ-ЦХ-20 мм 50 м",
        "price": null,
        "unit": "шт",
        "weight": 7.8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая Промрукав 16 мм (уп. 100м) Черная",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая Промрукав 20 мм (уп. 100м) Черная",
        "price": null,
        "unit": "шт",
        "weight": 7.8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 16 мм с зондом (уп. 100м) Серая",
        "price": 1320,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 20 мм с зондом (уп. 1м) Серая",
        "price": 18,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 20 мм с зондом (уп. 100м) Серая",
        "price": 1430,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 25 мм с зондом (50м) Серая",
        "price": 1045,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 32 мм с зондом (25м) Серая",
        "price": 935,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПВХ 16 мм с зондом (уп. 100м) Серая",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПВХ 20 мм с зондом (уп. 100м) Серая",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПВХ 25 мм с зондом (50м) Серая",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПВХ 32 мм с зондом (25м) Серая",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 16 мм с зондом (уп. 100м), черная",
        "price": 1540,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 20 мм с зондом (уп. 100м), черная",
        "price": 1650,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 25 мм с зондом (50м), черная",
        "price": 1100,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 32 мм с зондом (25м), черная",
        "price": 990,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПНД 16 мм с зондом (уп. 100м), черная",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПНД 20 мм с зондом (уп. 100м), черная",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПНД 25 мм с зондом (50м), черная",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПНД 32 мм с зондом (25м), черная",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Бирка кабельная (250 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 4 мм",
        "price": 27,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 6 мм",
        "price": 33,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 8 мм",
        "price": 38,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 10 мм",
        "price": 44,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 12 мм",
        "price": 49,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 1,5 мм (100 шт)",
        "price": 214,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 2,5 мм (100 шт)",
        "price": 253,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 6 мм (1 шт)",
        "price": 3,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник кабельный луженый на кабель ? кВт",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка, Набор (20шт)",
        "price": 275,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка 20/10 мм черная (1 м)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка клеевая 5мм, Желтый",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка клеевая 8мм, Желтый",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка клеевая 9/3 х 100 мм, черная (20шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка клеевая 6/2 х 100 мм, черная (20шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электро Расход",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распределительная коробка уравнивания потенциалов IP55 100х100х50 мм 7 вводов (КУП)",
        "price": 429,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электро Защита",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D16 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D20 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D25 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1.4,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D32 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1.6,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D40 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D50 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D16 мм 2 м цвет черный",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D20 мм 2 м цвет черный",
        "price": 126,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D25 мм 2 м цвет черный",
        "price": null,
        "unit": "шт",
        "weight": 1.4,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D32 мм 2 м цвет черный",
        "price": null,
        "unit": "шт",
        "weight": 1.6,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D40 мм 2 м цвет черный",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D50 мм 2 м цвет черный",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лоток под кабель перфорированный 70х70х3000, оцинкованный",
        "price": null,
        "unit": "шт",
        "weight": 4.6,
        "category": {
            "main": "Электрика",
            "section": "Лоток под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Профиль перф. П-образный 1,5х3000 мм, для монтажа металлических лотков",
        "price": 1100,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Электрика",
            "section": "Лоток под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 70х70х40",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 85х85х40",
        "price": 66,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 100х100х50",
        "price": 82,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 150х110х70",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 100х100 под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка круглая скрытая 100х31.5х30мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Крышка для распаячной коробки d70мм, белый",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Распайки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 2-я Защелка",
        "price": 20,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 3-я Защелка",
        "price": 27,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 5-я Защелка",
        "price": 35,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 2-я Защелка Wago 221",
        "price": null,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 3-я Защелка Wago 221",
        "price": null,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 4-я Защелка Wago 221",
        "price": null,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 5-я Защелка Wago 221",
        "price": null,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-203 самозажимная для жёсткого кабеля Без пасты",
        "price": 22,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-204 самозажимная для жёсткого кабеля Без пасты",
        "price": 27,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-205 самозажимная для жёсткого кабеля Без пасты",
        "price": 30,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 2-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 3-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": null,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 4-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": null,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 5-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": null,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 6-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": null,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 2-проводная плоская с пастой",
        "price": 30,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 3-проводная плоская с пастой",
        "price": 30,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 4-проводная плоская с пастой",
        "price": 35,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 5-проводная плоская с пастой",
        "price": 39,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 6-проводная плоская с пастой",
        "price": 49,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 1,5 мм, 12 пар",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 2,5 мм, 12 пар",
        "price": 132,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 4 мм, 12 пар",
        "price": null,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 6 мм, 10 пар",
        "price": null,
        "unit": "шт",
        "weight": 0.007,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 10 мм, 10 пар",
        "price": null,
        "unit": "шт",
        "weight": 0.009,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 25 мм, 6 пар",
        "price": null,
        "unit": "шт",
        "weight": 0.011,
        "category": {
            "main": "Электрика",
            "section": "Клемма",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 16 мм (100 шт)",
        "price": 385,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 20 мм (100 шт)",
        "price": 418,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 25 мм (100 шт)",
        "price": 418,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 32 мм (50 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 40 мм (10 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 50 мм (10 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 16 мм (100 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 20 мм (100 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 25 мм (100 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 32 мм (50 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 40 мм (10 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры DKC 50 мм (10 шт) под пистолет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Гофра под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 16 мм (100 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 20 мм (100 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 25 мм (100 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 32 мм (50 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 50 мм (50 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Труба под Кабель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа электрическая Е27 200 Вт",
        "price": 77,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа электрическая Е27 300 Вт",
        "price": 115,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа светодиодная E27 30 Вт",
        "price": 385,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа светодиодная E27 50 Вт",
        "price": 544,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная электрическая Е27 60 Вт 6500К",
        "price": 825,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная груша электрическая Е27 25 Вт 6500К",
        "price": 165,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная груша электрическая Е27 40 Вт 6500К",
        "price": 418,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная цилиндр электрическая Е27 40 Вт 4000К Т100 матовая",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная цилиндр электрическая Е27 50 Вт 6400К Т100 матовая",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Патрон электрический Е27",
        "price": 99,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 50 Вт",
        "price": 935,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 100 Вт",
        "price": 1320,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 100 Вт, на треноге",
        "price": 3080,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Лампа",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Разветвитель 3-й для Интернет кабеля",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Разветвитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Разветвитель 3-й для ТВ кабеля",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Разветвитель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 1-я белая, Эконом",
        "price": 187,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 2-я белая, Эконом",
        "price": 297,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 3-я белая, Эконом",
        "price": 385,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 4-я белая, Эконом",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 3-я белая, влагостойкая",
        "price": 528,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка щитовая модульная на дин рейку 220 В 16 А тип AC 2Р+N",
        "price": 308,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Комплект розетка с вилкой для электроплиты накладная с заземлением 2Р 32 А 250 В IP20, Белая, квадратная форма",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Комплект розетка с вилкой для электроплиты накладная с заземлением 2Р 32 А 250 В IP20, Белая, круглая форма",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Розетка",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель встраиваемый 1-кл, Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Выключатель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель накладной 1-кл белый, Эконом",
        "price": 187,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Выключатель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель накладной 2-кл белый, Эконом",
        "price": 253,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Выключатель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель проходной белый, Эконом",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Выключатель",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная под саморез 3х100 мм (100шт.)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 100х3,5 мм нейлон белая (100 шт.)",
        "price": 198,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 150х3,5 мм нейлон белая (100 шт.)",
        "price": 198,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 200х3,5 мм нейлон белая (100 шт.)",
        "price": 198,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 250х3,5 мм нейлон белая (100 шт.)",
        "price": 214,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 300х3,6 мм с 3м замком нейлон черная (100 шт.)",
        "price": 253,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 350х3,6 мм с 3м замком нейлон белая (100 шт.)",
        "price": 220,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 500х8 мм с 3м замком нейлон черная (100 шт.)",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Стяжки",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 4 модуля ABB",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 6 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 8 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 12 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 16 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 18 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 24 модуля ABB",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 36 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 48 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 54 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 4 модуля ABB",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 6 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 8 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 12 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 16 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 18 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 24 модуля ABB",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 36 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 48 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (скрытого монтажа) 54 модулей ABB",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 4 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 6 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 8 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 12 модулей Текфор",
        "price": 1760,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 16 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 18 модулей Текфор",
        "price": 2530,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 24 модуля Текфор",
        "price": 3850,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 36 модулей Текфор",
        "price": 4950,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 48 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 54 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 4 модуля",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 6 модулей",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 8 модулей",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 12 модулей",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 16 модулей",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 18 модулей",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 24 модулей",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 36 модулей",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 48 модулей",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 54 модулей",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 4 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 6 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 8 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 12 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 16 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 18 модулей Текфор",
        "price": 2750,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 24 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 36 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 48 модулей Текфор",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 54 модуля Текфор",
        "price": null,
        "unit": "шт",
        "weight": 9,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 4 модуля",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 6 модулей",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 8 модулей",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 12 модулей",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 16 модулей",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 18 модулей",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 24 модулей",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 36 модулей",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 48 модулей",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский белый (накладной) 54 модулей",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит слаботочный электричесский встраиваемый 390х340х120 мм IP31 сталь",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит слаботочный электричесский встраиваемый 420х320х120 мм IP31 пластик",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит распределительный накладной ЩРН-1 12 модулей IP31 металл белый",
        "price": null,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Контактор мод. ABB ESB (ESB20-20N-06) 230 В 20 А тип AC/DС 2НО",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Реле контроля напряжения 63A (1 фазный RE V)",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Реле контроля напряжения СР-723 / 63А 3 фазы",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Реле контроля напряжения Welrok D2-63",
        "price": null,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 6А",
        "price": 544,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 10А",
        "price": 407,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 16А",
        "price": 418,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 20А",
        "price": 517,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 25А",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 32А",
        "price": 533,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 40А",
        "price": 561,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 50А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 63А",
        "price": 1045,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 6А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 10А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 16А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 20А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 25А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 32А",
        "price": 1815,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 40А",
        "price": 2090,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 50А",
        "price": 2530,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 63А",
        "price": 2530,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 6А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 10А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 16А",
        "price": 1815,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 20А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 25А",
        "price": 1925,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 32А",
        "price": 2035,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 40А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 50А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 63А",
        "price": 3410,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 6А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 10А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 16А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 20А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 25А",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 32А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 40А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 50А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 4-пол. SH204 63А",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 6А AC 30mA",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 10А AC 30mA",
        "price": 5170,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 16А AC 10mA",
        "price": 4345,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 16А AC 30mA",
        "price": 4510,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 20А AC 30mA",
        "price": 4730,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 25А AC 30mA",
        "price": 5170,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 32А AC 30mA",
        "price": 5720,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 40А AC 30mA",
        "price": 6930,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-16A/0,01мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-25A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-25A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-40A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-40A/0,3мА",
        "price": 4510,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-63A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-63A/0,3мА",
        "price": 8360,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH202 AC-25A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH202 AC-40A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH202 AC-63A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-100A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-25A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-25A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-40A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-40A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-63A/0,1мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-63A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F204 AC-80A/0,3мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH204 AC-25A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH204 AC-40A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB FH204 AC-63A/0,03мА",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Дин - рейка для монтажа автоматов 1000 мм",
        "price": 385,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина нулевая (N)",
        "price": 165,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина заземления (PE)",
        "price": 275,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соединительная тип PIN однорядная",
        "price": 506,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 1 пол. на 30 постов 1м",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 2 пол. на 30 постов 1м",
        "price": 957,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 3 пол. на 30 постов 1м",
        "price": 1045,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина на DIN-рейку в корпусе кросс-модуль 2x7",
        "price": 506,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина на DIN-рейку в корпусе кросс-модуль 4x7",
        "price": 825,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Щитовая Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Теплый пол Warmstad м2",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Электрика",
            "section": "Теплый Пол",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Терморегулятор теплого пола цифровой SE",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Теплый Пол",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Терморегулятор теплого пола механический",
        "price": 1045,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Теплый Пол",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Светильник светодиодный ДВО/ДПО 36W 595х595х19 6500К 3Лм матовый IP40",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Светильник",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Светильник светодиодный ДВО/ДПО 36W 595х595х19 4000К 3Лм матовый IP40",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Светильник",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Унитаз Черновой без Бачка",
        "price": 2585,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Сантехника",
            "section": "Унитаз",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унитаз Черновой с Бачком",
        "price": 5445,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Сантехника",
            "section": "Унитаз",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сливная арматура для бачка унитаза универсальная",
        "price": 1980,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Сантехника",
            "section": "Унитаз",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гофра для унитаза",
        "price": 407,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Унитаз",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 16 мм цвет синий (50м)",
        "price": 1089,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 16 мм цвет красный (50м)",
        "price": 1089,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 20 мм цвет синий (50м)",
        "price": 1210,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 20 мм цвет красный (50м)",
        "price": 1210,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 25 мм цвет синий (50м)",
        "price": 1320,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 25 мм цвет красный (50м)",
        "price": 1320,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "Гофра для Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Поддон душевой Черновой 90х90х13 см",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сантехника",
            "section": "Поддон",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Раковина Умывальник Черновой",
        "price": 1870,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Сантехника",
            "section": "Раковина",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гофра для сифона",
        "price": 198,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Раковина",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сифон с гофрой в комплекте",
        "price": 517,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Раковина",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сифон для ванны с выпуском и ревизией полуавтомат хром",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Ванна",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Смеситель Черновой",
        "price": 1760,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Раковина",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 0,6м",
        "price": 187,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Подводка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 1м",
        "price": 385,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Подводка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 1,5м",
        "price": 385,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Подводка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 2м",
        "price": 418,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Подводка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 3м",
        "price": 495,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Подводка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унипак 75г",
        "price": 423,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унипак 250г",
        "price": 715,
        "unit": "шт",
        "weight": 0.28,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Лен сантехнический",
        "price": 143,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект сантехнический Лен + Unipak 75 г",
        "price": 715,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Лента ФУМ 12 мм 15 м",
        "price": 165,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тангит унилок 20м",
        "price": 660,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тангит унилок 80м",
        "price": 1485,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тангит унилок 160м",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Инсталляция для подвесного унитаза",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Сантехника",
            "section": "Инсталляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Крепление одинарное для монтажа инсталяции Tece 9030002",
        "price": 825,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Сантехника",
            "section": "Инсталляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Уголок  для монтажа инсталяции Tece",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сантехника",
            "section": "Инсталляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Профиль для монтажа инсталяции Tece 4,5 м",
        "price": 4180,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сантехника",
            "section": "Инсталляция",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Душевой трап с прямым отводом 100х100, нерж.",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Трап",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Душевой трап с боковым отводом 100х100, нерж",
        "price": 715,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Трап",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Трап Лоток душевой TIM с гидрозатвором 600 мм d50 мм решетка из нержавеющей стали",
        "price": 4290,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Сантехника",
            "section": "Трап",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шаблон для монтажа водорозеток",
        "price": 462,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сантехника",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подоконник ПВХ белый матовый *150мм",
        "price": 330,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *200мм",
        "price": 418,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *250мм",
        "price": 506,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *300мм",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *350мм",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *400мм",
        "price": null,
        "unit": "шт",
        "weight": 5.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *450мм",
        "price": null,
        "unit": "шт",
        "weight": 5.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *500мм",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *600мм",
        "price": null,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *700мм",
        "price": null,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *800мм",
        "price": null,
        "unit": "шт",
        "weight": 7.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка для подоконника ПВХ матовая белая",
        "price": 110,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель подоконника ПВХ, белый матовый",
        "price": 198,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Маяк пластиковый ПВХ 6 мм 3 м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Маяк пластиковый ПВХ 10 мм 3 м",
        "price": null,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок пластиковый перфорированный ПВХ 25х25х2700мм",
        "price": 88,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок арочный перфорированный ПВХ 25х25х3000мм",
        "price": 77,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 10х10х1.8х2700 мм, белый",
        "price": 49,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 15х15х1.8х2700 мм, белый",
        "price": 55,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 20х20х1.8х2700 мм, белый",
        "price": 60,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 25х25х1.8х2700 мм, белый",
        "price": 66,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 30х30х1.8х2700 мм, белый",
        "price": 93,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 40х40х1.8х2700 мм, белый",
        "price": 137,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 50х30х1.8х2700 мм, белый",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 50х50х1.8х2700 мм, белый",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок перфорированный ПВХ 25х25х2500мм, с арм. сеткой",
        "price": 143,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль примыкания оконный самоклеящийся с сеткой 6 мм 2.4 м, пласт.",
        "price": 214,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ Moeller белый матовый *150мм",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ Moeller белый матовый *200мм",
        "price": null,
        "unit": "шт",
        "weight": 4.8,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ Moeller белый матовый *300мм",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ Moeller белый матовый *350мм",
        "price": null,
        "unit": "шт",
        "weight": 4.8,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка для подоконника ПВХ Moeller матовая белая",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель подоконника ПВХ Moeller, белый матовый",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Панель ПВХ Белая матовая 3000х250х8 мм",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Панель ПВХ Белая матовая 3000х375х8 мм",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ стартовый для панелей 5х3000 мм, цвет белый",
        "price": 148,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ F-образный 30х3000х10 мм, цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ U-образный 18x10x1x1000 мм, цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ П-образный стартовый 30х3000х10 мм, цвет белый",
        "price": 148,
        "unit": "шт",
        "weight": 0.19,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ручка оконная ПВХ, белый",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Сэндвич панель ПВХ белый матовый 3 x 1,5 х 9 мм",
        "price": 3712,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плинтус ПВХ 55 мм, 2,2 м, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 55 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 55 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 55 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 55 мм лев/прав 2шт  Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плинтус ПВХ 70 мм, 2,2 м, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 70 мм лев/прав 2шт  Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плинтус ПВХ 85 мм, 2,2 м, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 85 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 85 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 85 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 85 мм лев/прав 2шт  Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Кран Бугатти  1/2  г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1/2  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  3/4  г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  3/4  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1\"   г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1\"   г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1 1/4\"  г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1 1/4\"  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1\" 1/2  г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти  1\" 1/2  г-ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 2\"  г-г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 2\"  г-ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1/2",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 3/4",
        "price": 1397,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1\"",
        "price": 1815,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1\" 1/4",
        "price": 3410,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1\" 1/2",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с полусгоном Бугатти  1/2  г/ш бабочка",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с полусгоном Бугатти  3/4  г/ш бабочка",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти Орегон с накидной гайкой 3/4  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой латунный Бугатти 3/4 ВР(г) х 3/4 НР(ш) бабочка с полусгоном прямой",
        "price": 1265,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 883 угловой 1/2\"-3/4\" с отражателем для стиральной машины",
        "price": 825,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой 1/2\"-3/4\" с отражателем для стиральной машины",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой бабочка 1/2  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой ручка 1/2  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка  1/2  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка  3/4  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка  1\"  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка  1/2  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка  3/4  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка  1\"  г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Маевского 1\\2\"",
        "price": 74,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Маевского 3\\4\"",
        "price": 104,
        "unit": "шт",
        "weight": 0.035,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран для радиатора Oventrop 1/2\" осевой для терморегулятора",
        "price": 3168,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран для радиатора Oventrop 1/2\" угловой нижний",
        "price": 2420,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой с полусгоном 1/2\"",
        "price": 902,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой с полусгоном 3/4\"",
        "price": 1210,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Краны",
            "section": "Кран",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба 20пп",
        "price": 79,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20пп  90",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20пп  45",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 20пп",
        "price": 22,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Обвод 20пп",
        "price": 33,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20пп",
        "price": 22,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  20х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  20х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  20х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  20х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 20х1/2в пп",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Планка 20х1/2в пп  2-й",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Накидная гайка 20х1/2в пп",
        "price": 121,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Накидная гайка угловая 20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 20х1/2н пп",
        "price": 108,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 20х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 20пп",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Кран шаровой 20пп полнопроходной",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Труба 20пп",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 25пп",
        "price": 121,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25пп  90",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25пп  45",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25пп",
        "price": 19,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х20х25пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х20х20пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х20пп",
        "price": 27,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Обвод 25пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 25пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  25х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  25х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  25х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 25х3/4в пп",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 25х3/4н пп",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  25х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  25х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  25х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 25х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 25х1/2н пп",
        "price": 126,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Планка 25х1/2в пп  2-й",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Накидная 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Накидная гайка угловая 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 25х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Кран шаровой 25пп полнопроходной",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Труба 25пп",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32пп",
        "price": 172,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32пп  90",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32пп  45",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32пп",
        "price": 44,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х20пп",
        "price": 44,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х25пп",
        "price": 44,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32пп",
        "price": 33,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  32х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 32х1в пп",
        "price": 363,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  32х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  32х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  32х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  32х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 32х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 32х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Обвод 32пп",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Кран шаровой 32пп полнопроходной",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Труба 32пп",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40пп",
        "price": 272,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40пп  90",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40пп  45",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х20пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х25пп",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40пп",
        "price": 38,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта  40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  40х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  40х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок  40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Обвод 40пп",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Труба 40пп",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 20пп стекловолокно FV-plast",
        "price": null,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 25пп стекловолокно FV-plast",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 32пп стекловолокно FV-plast",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20пп  90 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20пп  45 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25пп  90 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25пп  45 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32пп  90 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32пп  45 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 20пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 32пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х20пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 32х20пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 32х25пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 20пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 32пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 20х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 20х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25х3/4н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 32х1н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 32х1в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Накидная 20х1/2пп FV-plast пластиковая ставка",
        "price": null,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Накидная 20х1/2пп FV-plast металическая ставка",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20х3/4н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25х3/4н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32х1н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32х1в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок установочный 20х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок установочный 25х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Планка 2-й 20пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 20х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 20х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х3/4н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 32х1в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 20х1/2н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 20х1/2в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 25х3/4н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 25х3/4в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 32х1н пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 32х1в пп FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба FV-plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 110  3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  2м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  1,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  1м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  0,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  0,3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  67 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 110 Политек",
        "price": 308,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 110 Политек",
        "price": 88,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 110 Политек",
        "price": 209,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Патрубок компенсационный 110 мм Политэк",
        "price": 187,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 110 Политек",
        "price": 44,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 110 Политек",
        "price": 38,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х50 Политек",
        "price": 77,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход чугун/пласт тапер с манжетой 110 Политэк",
        "price": 385,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  2м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  1,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  1м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  0,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  0,3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50х40  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50х40  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 50 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 50 Политек",
        "price": 66,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 50 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 50 Политек",
        "price": 19,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 50 Политек",
        "price": 24,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х40 Политек",
        "price": 71,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х32 Политек",
        "price": 66,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  2м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  1,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  1м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  0,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  0,3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 40 Политек",
        "price": 16,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 40 Политек",
        "price": 22,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 40х32 Политек",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  2м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  1м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  1,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  0,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  0,3м Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32  45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32  90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 32 Политек",
        "price": 16,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 32 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 123х110 чугун/пласт Политек",
        "price": 93,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 73х50 чугун/пласт Политек",
        "price": 77,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х40 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х32 Политек",
        "price": 66,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х25 Политек",
        "price": 38,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х32 Политек",
        "price": 33,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х25 Политек",
        "price": 33,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х20 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 32х20 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 50х50х50х50 / 45 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 50х50х50х50 / 87 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х50х50 / 45 одноплоскостная Политек",
        "price": 286,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х50х50 / 87 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 45 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 87 одноплоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 87 2х-плоскостная Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 левая 2х-плоскостная Политек",
        "price": 357,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 правая 2х-плоскостная Политек",
        "price": 357,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  1м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  0,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110  0,15м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  67 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 110 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 110 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 110 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 110 Ostendorf",
        "price": 148,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 110 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х50 Ostendorf",
        "price": 181,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х90 Ostendorf",
        "price": 303,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  1м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  0,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90  0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90  30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 90  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 90  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 90х50 Ostendorf",
        "price": 286,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 90х40 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 90х32 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  1м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  0,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50  0,15м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  15 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 50 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 50 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 50 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 50 Ostendorf",
        "price": 27,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 50 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х40 Ostendorf",
        "price": 121,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х32 Ostendorf",
        "price": 104,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  1м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  0,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40  0,15м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  15 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 40 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 40 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 40х32 Ostendorf",
        "price": 99,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  1м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  0,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32  0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32  45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32  90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 32 Ostendorf",
        "price": 27,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 32 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 123х110 чугун/пласт Ostendorf",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 73х50 чугун/пласт Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х40 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х32 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х32 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х20 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 32х20 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 50х50х50х50 / 45 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 50х50х50х50 / 87 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х50х50 / 45 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х50х50 / 87 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 одноплоскостная Ostendorf",
        "price": 478,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 45 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 87 одноплоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х110 / 87 2х-плоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 левая 2х-плоскостная Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 правая 2х-плоскостная Ostendorf",
        "price": 638,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Труба Ostendorf",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 18  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 22  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 28  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 35  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 42  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 54  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 110  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1/2  (20-25мм)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3/4 (25-32мм)",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 (32-36мм)",
        "price": 71,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/4 (38-43мм)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/2 (47-52мм)",
        "price": 88,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 2 (60-64мм)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3 (87-92мм)",
        "price": 121,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 110 (107-112мм)",
        "price": 143,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1/2 с дюбелем   (20-25мм)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3/4 с дюбелем (25-32мм)",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 с дюбелем (32-36мм)",
        "price": 66,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/4 с дюбелем (38-43мм)",
        "price": 66,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/2 с дюбелем (47-52мм)",
        "price": 71,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 2 с дюбелем (60-64мм)",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 110 с дюбелем (107-112мм)",
        "price": 143,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут заземления для труб ТХЗ 1\" (32-35мм)",
        "price": 49,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут заземления для труб ТХЗ 1 1/4\" (39-46мм)",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Труба FV Plast",
            "section": "Хомут для Труб",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0922-000002) 1 ВР(г) х 2 выхода 3/4 НР(ш) ЕК х 1 ВР(г) (БЕЗ Расходом.)и нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0922-000003) 1 ВР(г) х 3 выходов 3/4 НР(ш) ЕК х 1 ВР(г) (БЕЗ Расходом.) нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0922-000004) 1 ВР(г) х 4 выходов 3/4 НР(ш) ЕК х 1 ВР(г) (БЕЗ Расходом.) нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 3.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0922-000005) 1 ВР(г) х 5 выходов 3/4 НР(ш) ЕК х 1 ВР(г) (БЕЗ Расходом.) нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0922-000006) 1 ВР(г) х 6 выходов 3/4 НР(ш) ЕК х 1 ВР(г) (БЕЗ Расходом.) нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 5.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000002) 1 ВР(г) х 2 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000003) 1 ВР(г) х 3 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000004) 1 ВР(г) х 4 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 3.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000005) 1 ВР(г) х 5 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000006) 1 ВР(г) х 6 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": null,
        "unit": "шт",
        "weight": 5.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 2 вых.",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 3 вых.",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 4 вых.",
        "price": null,
        "unit": "шт",
        "weight": 2.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 5 вых.",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 6 вых.",
        "price": null,
        "unit": "шт",
        "weight": 3.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 7 вых.",
        "price": null,
        "unit": "шт",
        "weight": 4.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 8 вых.",
        "price": null,
        "unit": "шт",
        "weight": 4.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 9 вых.",
        "price": null,
        "unit": "шт",
        "weight": 5.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 10 вых.",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 11 вых.",
        "price": null,
        "unit": "шт",
        "weight": 6.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали с расходомерами 12 вых.",
        "price": null,
        "unit": "шт",
        "weight": 7.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 2 вых.",
        "price": null,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 3 вых.",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 4 вых.",
        "price": null,
        "unit": "шт",
        "weight": 2.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 5 вых.",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 6 вых.",
        "price": null,
        "unit": "шт",
        "weight": 3.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 7 вых.",
        "price": null,
        "unit": "шт",
        "weight": 4.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 8 вых.",
        "price": null,
        "unit": "шт",
        "weight": 4.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 9 вых.",
        "price": null,
        "unit": "шт",
        "weight": 5.4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 10 вых.",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 11 вых.",
        "price": null,
        "unit": "шт",
        "weight": 6.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "STOUT Коллектор из нержавеющей стали без расходомеров 12 вых.",
        "price": null,
        "unit": "шт",
        "weight": 7.2,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллектор Stout 3/4 ВР(г) х 2 выхода 3/4(ЕК) х 3/4 НР(ш) регулирующий (SMB 6851 343402)",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллектор Stout 3/4 ВР(г) х 3 выхода 3/4(ЕК) х 3/4 НР(ш) регулирующий (SMB 6851 341203)",
        "price": null,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллектор Stout 34 ВР(г) х 4 выхода 34(ЕК) х 34 НР(ш) регулирующий (SMB 6851 343404)",
        "price": null,
        "unit": "шт",
        "weight": 3.6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор Stout",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  3/4\", проходной, хромированный, 2 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  3/4\", проходной, хромированный, 3 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  3/4\", проходной, хромированный, 4 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 2 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 3 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 4 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 2 отвода 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 3 отвода 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор  1\", проходной, хромированный, 4 отвода 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Крепление колектора FAR пара (комплект на 2 колектора)",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Коллектор FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кронштейн для радиатора, настенный К17 500, (комлект 2 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1/2 н",
        "price": 72,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1/2 в",
        "price": 72,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 3/4 н",
        "price": 137,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 3/4 в",
        "price": 137,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1\" н",
        "price": 253,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1\" в",
        "price": 253,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка для радиатора 1\\2\"н",
        "price": 143,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Футорка 1/2в х 3/4н",
        "price": 187,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Футорка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ниппель 1/2н х 3/4н",
        "price": 198,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Ниппель",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2н х 3/4в",
        "price": 187,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Переход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2в х 3/4н",
        "price": 165,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Переход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2в х 3/4в",
        "price": 214,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Переход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2н х 3/4н",
        "price": 198,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Переход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-0 (670мм-125мм-406мм) (1-3 конт.)",
        "price": 4180,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-1 (670мм-125мм-494мм) (4-5 конт.)",
        "price": 4510,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-2 (670мм-125мм-594мм) (6-7 конт.)",
        "price": 3685,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-3 (670мм-125мм-744мм) (8-10 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-4 (670мм-125мм-894мм) (11-12 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 3.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-5 (670мм-125мм-1044мм) (13-16 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-6 (670мм-125мм-1194мм) (17-18 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-7 (670мм-125мм-1344мм) (19-20 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРВ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-0 (651мм-120мм-366мм) (1-3 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-1 (651мм-120мм-453мм) (4-5 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-2 (651мм-120мм-553мм) (6-7 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-3 (651мм-120мм-703мм) (8-10 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-4 (651мм-120мм-853мм) (11-12 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 3.8,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-5 (651мм-120мм-1003мм) (13-16 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-6 (651мм-120мм-1153мм) (17-18 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф накладной ШРН-7 (651мм-120мм-1303мм) (19-20 конт.)",
        "price": null,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Колектора / Шкафы",
            "section": "Шкаф ШРН",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ниппель  1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель    3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель   1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель 11/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель 11/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель 2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  ш/ш стальной оц.",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2   60мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2   70мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  120мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  140мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  150мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  160мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  180мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   1/2  200мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4   60мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  120мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  140мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  150мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  160мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  180мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок   3/4  200мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''   60мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''  120мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''  150мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок  1''  200мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок переходной 1/2\" 3/4\" ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Бочонок Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина   1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Крестовина Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина   3/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Крестовина Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина  1г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Крестовина Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1/2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   3/4 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   3/4 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1\" г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1\" г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   1\" ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/4 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/4 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   11/2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта   2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    1/2г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    1/2ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    3/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    3/4г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка    3/4ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка   11/4''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка   11/4''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка   1''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка   1''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка   1''ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка  11/2''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка  11/2''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка  2''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка  2''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка прямая  1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка угловая 1/2г/ш бронза Stout",
        "price": 308,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка угловая 3/4г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход.  1-1/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход.  1-3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 11/4- 3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 11/4-1 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 11/2- 3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 11/2-1 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 11/2-11/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 2- 11/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 2-11/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход  3/4 х 1/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход  3/4 х 1/2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход  3/4 х 1/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход  3/4 х 1/2 ш/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 3/8-1/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1/2-1/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1/2-3/8  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 3/4-1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1- 1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/4- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/4-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/2-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/2-11/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 2- 11/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 2- 11/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель переходной  1/2 х 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0,
        "category": {
            "main": "Stout Фитинги",
            "section": "Ниппель пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  1/2-3/8  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  3/4-1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  1-1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  1-3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  11/4- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  в/н  11/4-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник  1/2 г/г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник  3/4 г/г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник  1'' г/г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник  11/4' г/'г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  3/4-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  1-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  11/2-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  11/4-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  11/4-3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  1-3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной  2\"-1\" бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    1/2г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    1/2ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    3/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    3/4г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок    3/4ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок   1г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок   1г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок   1ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок   2\" г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок  11/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок  11/4г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 11/2г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 2г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход.  3/4-1/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход.  3/4-1/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход.  3/4-1/2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход. 1-3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Угол пер. Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   12,5 мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   15 мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   17,5мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   20мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   25мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   30мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   50мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   65мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш  120мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   1/2\" ш/ш  150мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   12,5мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   15мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   20мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   25мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   30мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   50мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   65мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель   3/4\" ш/ш  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш  15мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   20мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   25мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   30мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   40мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   50мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   65мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш   80мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель  1\" ш/ш  100мм  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1/2-1/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1/2-3/8  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 3/4-1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 3/8-1/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1- 1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4- 1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2- 1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2-11/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2- 1/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2- 3/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-1  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-1 1/4  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-11/2  бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Фитинги",
            "section": "Футорка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Кран шаровой угловой Stout 3/4 г/ш с американкой",
        "price": 1595,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Stout Фитинги",
            "section": "Кран Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 16мм металлопласт Valtec",
        "price": null,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Valtec",
            "type": ""
        },
        "image": "V"
    },
    {
        "name": "Труба 20мм металлопласт Valtec",
        "price": 187,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Valtec",
            "type": ""
        },
        "image": "V"
    },
    {
        "name": "Труба 25мм металлопласт Valtec",
        "price": null,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Valtec",
            "type": ""
        },
        "image": "V"
    },
    {
        "name": "Труба 16мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 154,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 20мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 214,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 25мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 330,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 16мм Stout для теплого пола из сшитого полиэтилена",
        "price": null,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 20мм Stout для теплого пола из сшитого полиэтилена",
        "price": null,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 25мм Stout для теплого пола из сшитого полиэтилена",
        "price": null,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Stout Труба",
            "section": "Труба Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 16 Stout",
        "price": 88,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Труба",
            "section": "Гильза Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 20 Stout",
        "price": 107,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Труба",
            "section": "Гильза Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 25 Stout",
        "price": 154,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout Труба",
            "section": "Гильза Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Заглушка ВР никелированная 1\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Заглушка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Заглушка НР 3/4 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Заглушка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 16х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 16х1\\2н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 16х3\\4н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 20х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 20х1\\2н Stout",
        "price": 308,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 20х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 20х3\\4н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 25х1\\2н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 25х1н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 25х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 25х3\\4н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 16х1\\2в Stout",
        "price": 429,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 16х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 20х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 20х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 25х1в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 25х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединитель переходная 20х16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединитель переходная 25х16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединитель переходная 25х20 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединительная 16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединительная 20 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта соединительная 25 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Муфта Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Планка 2-й Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Планка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 16х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 20 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 20х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 20х16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 25 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 25х16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 25х20 Stout",
        "price": 748,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 25х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 32х1\"в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Тройник Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 16х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 16х1\\2н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 16х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20 Stout",
        "price": 473,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20х1\\2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20х1\\2н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20х3\\4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20х3\\4н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 25 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 25х1в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 25х3\\4н Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Угол Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок установочный 16х1/2в Stout",
        "price": 500,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Водорозетка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок установочный 20х1/2в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Водорозетка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок установочный 20х3/4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Водорозетка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок установочный 25х3/4в Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Водорозетка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фиксатор поворота без пружины 16 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фиксатор Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фиксатор поворота без пружины 20 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фиксатор Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фиксатор поворота без пружины 25 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фиксатор Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина ВВ никелированная 3/4 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Крестовина Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель НН 3/4\"x100 Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Удлинитель Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Американка ВН, никелированное, уплотнение под гайкой по плоскости, 3/4” Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Американка Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 1 1/4\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Клапан Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 1\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Клапан Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 1/2\" Stout",
        "price": 1430,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Клапан Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 3/4\" Stout",
        "price": 1485,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Клапан Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Манометр Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Манометр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, прямой 1 1/4\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, прямой 1\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, прямой 1/2\" Stout",
        "price": 500,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, прямой 3/4\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 1/2\" Stout",
        "price": 500,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 3/4\" Stout",
        "price": 715,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 1\" Stout",
        "price": 1012,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 1 1/4\" Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Stout Труба",
            "section": "Фильтр Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник  Stout с накидной гайкой (евроконус) 16 x 3/4\" для труб из с/п SFA-0034-001634",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout Труба",
            "section": "Переход Stout",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 16 stabil Rehau",
        "price": 305,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 20 stabil Rehau",
        "price": 484,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 25 stabil Rehau",
        "price": 748,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 16 flex Rehau",
        "price": null,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 20 flex Rehau",
        "price": null,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 25 flex Rehau",
        "price": null,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 16 pink Rehau",
        "price": 203,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 20 pink Rehau",
        "price": 308,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 25 pink Rehau",
        "price": 511,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Rehau",
            "section": "Труба Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 16 Rehau PVDF",
        "price": 121,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Гильза Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 20 Rehau PVDF",
        "price": 176,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Гильза Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 25 Rehau PVDF",
        "price": 181,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Гильза Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 16 Rehau PVDF",
        "price": 649,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 20 Rehau PVDF",
        "price": 858,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25 Rehau PVDF",
        "price": 1078,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 20х16 Rehau PVDF",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х16 Rehau PVDF",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х20 Rehau PVDF",
        "price": 1001,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 20 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 20х16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х20 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х3/4в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 32х3/4в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник настенный 16х1/2в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник настенный 20х1/2в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Тройник Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16 Rehau PVDF",
        "price": 506,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20 Rehau PVDF",
        "price": 671,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25 Rehau PVDF",
        "price": 1012,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х16 Rehau PVDF",
        "price": 660,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х16 Rehau PVDF",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х20 Rehau PVDF",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х20 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х1/2н Rehau бронза",
        "price": 605,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х3/4н Rehau бронза",
        "price": 638,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х1/2н Rehau бронза",
        "price": 638,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х3/4н Rehau бронза",
        "price": 825,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1/2н Rehau бронза",
        "price": 1045,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х3/4н Rehau бронза",
        "price": 836,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1н Rehau бронза",
        "price": 957,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х1/2в Rehau бронза",
        "price": 715,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х1/2в Rehau бронза",
        "price": 968,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х3/4в Rehau бронза",
        "price": 803,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1/2в Rehau бронза",
        "price": 1045,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х3/4в Rehau бронза",
        "price": 935,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта надвижная 20х3/4н Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 16х1/2в Rehau бронза",
        "price": 715,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 16х3/4в Rehau бронза",
        "price": 715,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 20х1/2в Rehau бронза",
        "price": 957,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 20х3/4в Rehau бронза",
        "price": 968,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 25х3/4в Rehau бронза",
        "price": 935,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 25х1в Rehau бронза",
        "price": 1265,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта переходник на евроконус 16-G 3/4\" Rehau",
        "price": 748,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Муфта Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16 Rehau PVDF",
        "price": 528,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20 Rehau PVDF",
        "price": 748,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25 Rehau PVDF",
        "price": 968,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20 Rehau бронза",
        "price": 935,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25 Rehau бронза",
        "price": 1045,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х1/2н Rehau бронза",
        "price": 682,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х1/2н Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х3/4н Rehau бронза",
        "price": 748,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25х3/4н Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х1/2в Rehau бронза",
        "price": 682,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х3/4в Rehau бронза",
        "price": 605,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х1/2в Rehau бронза",
        "price": 968,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х3/4в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25х1в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Угол Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 16х1/2в Rehau бронза",
        "price": 726,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х1/2в Rehau бронза",
        "price": 792,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х3/4в Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 25х3/4в Rehau бронза",
        "price": 1210,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 16х1/2н Rehau бронза",
        "price": 726,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х1/2н Rehau бронза",
        "price": 935,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х3/4н Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 25х3/4н Rehau бронза",
        "price": 1023,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Угольник настенный для гипсокартонных плит  16-Rp1/2x28 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Угольник настенный для гипсокартонных плит  20-Rp1/2x28 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Водорозетка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Планка 2-й Rehau тип О 75/150 длинный",
        "price": 605,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Планка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Планка 1-й Rehau тип Z 30 короткий",
        "price": 297,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Планка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Планка 1-й Rehau тип Е короткий",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Планка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали  для подкл. радиатора, Г-образная 16/250",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Трубка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали  для подкл. радиатора, Г-образная 16/500",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Трубка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали  для подкл. радиатора, Г-образная 20/250",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Трубка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали  для подкл. радиатора, Г-образная 20/500",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Трубка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) для металлической трубки G 3/4 -15",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) flex/pink 16х2,2xG3/4",
        "price": 616,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) flex/pink 20х2,8xG3/4",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) stabil 16,2x2,6xG3/4",
        "price": 385,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) stabil 20x2,9xG3/4",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Фиксатор поворота без пружины 16 Rehau",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Фиксатор Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Фиксатор поворота без пружины 20 Rehau",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Фиксатор Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Фиксатор поворота без пружины 25 Rehau",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Фиксатор Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Крюк с дюбелем для 1 трубы",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Сервопривод Rehau UNI  230В нормально закрытый",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Привод Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Клеммная колодка Nea H Rehau 230В, 6 каналов",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Колодка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Терморегулятор Nea H Rehau 230B",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Терморег. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка для радиатора Rehau 20 х 15 х 20 х 250 мм Т-образная нерж. Сталь",
        "price": 2035,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau",
            "section": "Трубка Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) Rehau 15 мм х 3/4 ЕК для стальных трубок",
        "price": 605,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Евроконус Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Коллекторная группа REHAU HKV-D на 6 выходов 1\"x3/4\"ЕК из нержавеющей стали (БЕЗ Расходом.)",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau",
            "section": "Коллектор Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Коллекторная группа REHAU HKV-D на 6 выходов (12080611002) 1\"x3/4\"ЕК из нержавеющей стали с регулирующими и термостатическими вентилями и расходомерами",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau",
            "section": "Коллектор Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 18  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 18  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 22  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 22  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 28  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 28  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Rehau",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Узел нижнего подключения (мультифлекс) прямой для радиатора Rehau 1/2 НР(ш) х 3/4 ЕК НР(ш) с шаровыми кранами и накидными гайками",
        "price": 2695,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau",
            "section": "Мультифлекс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Узел нижнего подключения (мультифлекс) угловой для радиатора Rehau 1/2 НР(ш) х 3/4 ЕК НР(ш) с шаровыми кранами и накидными гайками",
        "price": 2530,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau",
            "section": "Мультифлекс",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Двухраструбная муфта Rehau Raupiano 110, L=128 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Двухраструбная муфта Rehau Raupiano 50, L=103 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/1000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/1500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/2000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/250 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/3000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 110/750 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/1000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/1500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/2000 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/250 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/500 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба канализационная Rehau Raupiano 50/750 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Крестовина Rehau Raupiano 110/110/110/45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Крестовина Rehau Raupiano 110/110/110/87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Крестовина Rehau Raupiano двухплоскостная 110/110/110/87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Надвижная муфта Rehau Raupiano 110, L=128 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Надвижная муфта Rehau Raupiano 50, L=103 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupian 90 90°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 110х15°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 110х30°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 110х45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 110х67°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 110х87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 50х30°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 50х45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 50х67°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Отвод Rehau Raupiano 50х87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 110/110х45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 110/110х87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 110/50х45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 110/50х87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 50/50х45°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник Rehau Raupiano 50/50х87°",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau Канализация",
            "section": "Канализац. Rehau",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 20*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 20*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 20*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 20*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 30*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 40*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 50*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 60*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  алюм. 80*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк алюм.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 20*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 20*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 20*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 20*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 30*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 40*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 50*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 60*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной  металл 80*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк металл",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк - дверца ревизионный металл с ручкой 40х60",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Rehau Канализация",
            "section": "Люк Ревиз.",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Вентилятор электрический вытяжной d100",
        "price": 1430,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вентиляция",
            "section": "Вентилятор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Вентилятор накладной круглый электрический вытяжной d100",
        "price": 1870,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вентиляция",
            "section": "Вентилятор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  110*55 мм х 3м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  120*60 мм х 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  120*60 мм х 1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 120*60 мм х 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  120*60 мм х 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  120*60 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  204*60 мм х 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  204*60 мм х 1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  204*60 мм х 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  204*60 мм х 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский  204*60 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Плоск",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских  110*55",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских 120*60",
        "price": 104,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских 204*60",
        "price": 198,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских  с обратным клапаном 110*55",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских с обратным клапаном 120*60",
        "price": 132,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских с обратным клапаном 204*60",
        "price": 209,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное  110*55 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное  120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное  204*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное  110*55 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное  120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное  204*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное разноугловое 110*55 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное разноугловое 204*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 110*55 мм",
        "price": 209,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 204*60 мм",
        "price": 385,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 110*55/100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 110*55 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 204*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 110*55 мм",
        "price": 60,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 120*60 мм",
        "price": 71,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 204*60 мм",
        "price": 93,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор прямоугольный 110*55 мм х 204*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРедуктор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель 110*55 х 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель 120*60 х 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель 204*60 х 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель 120*60 х 100 мм симметричный",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 110*55 х 100 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 120*60 х 100 мм",
        "price": 187,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 204*60 х 100 мм",
        "price": 357,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 204*60 х 125 мм",
        "price": 379,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено (кобра) 204*60 х 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм  0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм  1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм  1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм  2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм  0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм  1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм  1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм  2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм  0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм  1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм  1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм  2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм  1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм  2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "Воздуховод Кругл",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов  100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов  125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов  150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов  200 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых  воздуховодов с обратным клапаном 100",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых  воздуховодов с обратным клапаном 125",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых  воздуховодов с обратным клапаном 150",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной  100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной  125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной  150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентСоединитель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина с обратным клапаном 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина с обратным клапаном 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина с обратным клапаном 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина  100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина  125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина  150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентПластина",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 200 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентДержатель",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено круглое 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено круглое 125 мм",
        "price": 272,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено круглое 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентКолено",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник плоский (по центру круглый) 100х55х100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник плоский (по центру круглый) 120х60х100 мм",
        "price": 429,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "ВентТройник",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор 100/125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРедуктор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор 125/150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРедуктор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор 200/150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРедуктор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор 150/125/120/100/80 мм",
        "price": 181,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРедуктор",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Решетка вентиляционная 200х200 мм, белый",
        "price": 242,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "ВентРешетка",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Прокладка резиновая 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка резиновая 3/4\"",
        "price": 6,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка паронитовая 1/2\"",
        "price": 6,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка паронитовая 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка силиконоваяая 1/2\"",
        "price": 11,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка силиконоваяая 3/4\"",
        "price": 13,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Прокладка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Втулка защитная 16-20 мм синяя",
        "price": 66,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Втулка защитная 16-20 мм красная",
        "price": 66,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Колпачок монтажный 1/2 синий",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Колпачок монтажный 1/2 красный",
        "price": null,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 1/2 синяя",
        "price": 60,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 1/2 красная",
        "price": 60,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 3/4 синяя",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 3/4 красная",
        "price": null,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Вентиляция",
            "section": "Заглушка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Компенсатор гидроудара Far (FA 2895 12) 1/2 НР 10-50 бар",
        "price": 3190,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Компенсатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Набор наклеек маркировочных",
        "price": 517,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Клей - герметик анаэробный, для резьбовых соединений 100 г",
        "price": 1320,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Герметик Анаэр.",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления 1/2",
        "price": 2035,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Редуктор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления 3/4",
        "price": 2365,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Редуктор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ругулятор давления 1/2",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Редуктор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ругулятор давления 3/4",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Редуктор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сгон 3/4 НР 300мм, стальной оцинкованный",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вентиляция",
            "section": "Сгон",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Neptun Bugatti Base (NEPBugBase12) 1/2\"",
        "price": 20350,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Neptun Bugatti Base (NEPBugBase12) 3/4\"",
        "price": 22550,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Wi-Fi Neptun Bugatti Smart Tuya (2264869) 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Wi-Fi Neptun Bugatti Smart Tuya (2264869) 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый с электроприводом Neptun PROFI 220В 1/2\"",
        "price": 7480,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый с электроприводом Neptun PROFI 220В 3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Датчик контроля протечки воды Neptun SW005 12-24 В",
        "price": 1540,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Нептун",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб синяя 18  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Вентиляция",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб краснаяя 18  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Вентиляция",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб синяя 22  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Вентиляция",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб краснаяя 22  2м",
        "price": null,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Вентиляция",
            "section": "Теплоизоляция Труб",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк одинарный, для труб 16х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк одинарный, для труб 20х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк одинарный, для труб 25х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк одинарный, для труб 32х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк двойной, для труб 16х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.006,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк двойной, для труб 20х80 мм",
        "price": 44,
        "unit": "шт",
        "weight": 0.006,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк двойной, для труб 25х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.008,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк двойной, для труб 32х80 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.008,
        "category": {
            "main": "Вентиляция",
            "section": "Сантех Расход",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Удлинитель латунный 1/2\" НР-ВР 15 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Удлиннитель",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Удлинитель латунный 1/2\" НР-ВР 20 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Удлиннитель",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шина монтажная для труб 50х3х2000 мм",
        "price": 1320,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вентиляция",
            "section": "Шина",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект Адаптер для подключения слива с двумя отводами 14 мм-50 мм (Шланги, Хомуты, Адаптер)",
        "price": 605,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вентиляция",
            "section": "Адаптер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Адаптер для подключения слива с двумя отводами 14 мм-50 мм",
        "price": 275,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Адаптер",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Муфта переходная FAR 1\" х 1/2\" г/г латунная",
        "price": 715,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Муфта FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Муфта американка прямая FAR 1/2\" ш/ш латунь",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Муфта FAR",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Американка угловая Valtec 1/2\" г/ш латунная",
        "price": 363,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Американка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Американка угловая Valtec 3/4 ВР(г) х 3/4 НР(ш) латунная",
        "price": 649,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Вентиляция",
            "section": "Американка",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сифон для ванны Mcalpine 1 1/2 х 40 мм с выпуском и ревизией полуавтомат хром",
        "price": 5280,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вентиляция",
            "section": "Ванна",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Розетка Legrand Valena Classic белый 1-ая с/з 774420",
        "price": 198,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка Legrand Valena белый 1-ая с/з с крышкой 774422",
        "price": 308,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель Legrand Valena Classic белый 1-клавишный 774401",
        "price": 198,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель Legrand Valena Classic белый 2-х клавишный 774405",
        "price": 275,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Переключатель Legrand Valena Classic белый 1-клавишный 774406",
        "price": 253,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Переключатель Legrand Valena Classic белый 2-х клавишный 774408",
        "price": 319,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 1-я Legrand Valena Classic, белая",
        "price": 66,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 2-я Legrand Valena Classic, белая",
        "price": 82,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 3-я Legrand Valena Classic, белая",
        "price": 104,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 4-я Legrand Valena Classic, белая",
        "price": 154,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 5-я Legrand Valena Classic, белая",
        "price": 198,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Вентиляция",
            "section": "Valena",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 1/2\", с манометром",
        "price": 2970,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 1/2\", с манометром",
        "price": 3520,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 1/2\", без манометра",
        "price": 4180,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 1/2\", без манометра",
        "price": 3740,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 3/4\", с манометром",
        "price": 4070,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 3/4\", с манометром",
        "price": 4345,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 3/4\", без манометра",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 3/4\", без манометра",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр грубой очистки универсальный Valtec 1/2 г х 1/2 г",
        "price": 770,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр грубой очистки универсальный Valtec 3/4 г х 3/4 г",
        "price": 1925,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр промывной Far с манометром 1/2 НР(ш) х 1/2 НР(ш) (FA 3944 12100)",
        "price": 8580,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр промывной Far с манометром 3/4 НР(ш) х 3/4 НР(ш) (FA 39A4 34100)",
        "price": 10450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления FAR 3/4 н мембранный с манометром",
        "price": 11550,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантех Арматура",
            "section": "Редуктор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр колбовый 1\" (ввод)",
        "price": 1540,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун  1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун  3/4\"",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун  1\"",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Картридж в фильтр магистральный ПФМ-Г 20/10 10SL механической очистки для холодной и горячей воды",
        "price": 253,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантех Арматура",
            "section": "Фильтр",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Счетчик холодной воды ВСХ-15",
        "price": 1485,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантех Арматура",
            "section": "Счетчик",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Счетчик универсальный Valtec DN15 80 мм со сгонами с импульсным выходом",
        "price": 2145,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Сантех Арматура",
            "section": "Счетчик",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кронштейн для радиатора Rifar (пара)",
        "price": 946,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кронштейн для радиатора Эконом (пара)",
        "price": 165,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Радиатор Rifar Base 500 СКОЛЬКО секций КАКОЕ подключение биметалл",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Радиатор Royal Thermo 500 СКОЛЬКО секций КАКОЕ подключение биметалл",
        "price": null,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект монтажный переходной Rifar 1 НР х 1/2 ВР для радиатора белый",
        "price": 495,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект звукоизоляционный для канализационных труб 110 мм 3 м",
        "price": 2530,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка для радиатора Rifar 3\\4\"н",
        "price": 93,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Радиаторы",
            "section": "Радиатор",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Плита потолочная Armstrong 600х600 Tegular, сталь (1шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плита потолочная Armstrong Ангара 600х600х6мм (24 шт)",
        "price": 176,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плита потолочная Armstrong Енисей Board 600х600х7мм (24шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плита потолочная Armstrong Байкал 600х600х12мм (1шт)",
        "price": 249,
        "unit": "шт",
        "weight": 1.15,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль угловой универсальный Armstrong PL 19х24х3000 мм оцинкованный белый",
        "price": 151,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль несущий Armstrong 3700 мм",
        "price": 181,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль поперечный Armstrong 1200 мм",
        "price": 71,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль поперечный Armstrong 600 мм",
        "price": 41,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подвес Armstrong АП 0,5м",
        "price": 16,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подвес Armstrong АП 1м",
        "price": 27,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Потолочные системы",
            "section": "Армстронг",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Керамическая плитка",
        "price": null,
        "unit": "м2",
        "weight": 16.5,
        "category": {
            "main": "Отделка",
            "section": "Керамика",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Керамогранит",
        "price": null,
        "unit": "м2",
        "weight": 19.5,
        "category": {
            "main": "Отделка",
            "section": "Керамогранит",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Кварцвинил ПВХ плитка",
        "price": null,
        "unit": "м2",
        "weight": 4.9,
        "category": {
            "main": "Отделка",
            "section": "Кварцввинил",
            "type": ""
        },
        "image": "П"
    }
];

const grid = document.getElementById("productGrid");
const featuredCatalog = document.getElementById("featuredCatalog");
const featuredCatalogGrid = document.getElementById("featuredCatalogGrid");
const popularGrid = document.getElementById("popularGrid");
const popularArrowLeft = document.querySelector(".popular-arrow-left");
const popularArrowRight = document.querySelector(".popular-arrow-right");
const categoryControls = document.getElementById("categoryControls");
const catalogBreadcrumbCategory = document.getElementById("catalogBreadcrumbCategory");
const catalogBreadcrumbSubcategory = document.getElementById("catalogBreadcrumbSubcategory");
const catalogBreadcrumbSubcategorySeparator = document.getElementById("catalogBreadcrumbSubcategorySeparator");
const catalogBreadcrumbGroup = document.getElementById("catalogBreadcrumbGroup");
const catalogBreadcrumbGroupSeparator = document.getElementById("catalogBreadcrumbGroupSeparator");
const copyManagerPhoneBtn = document.getElementById("copyManagerPhone");
const managerPhoneAction = copyManagerPhoneBtn?.closest(".catalog-help-action");
const downloadPublicPriceBtn = document.getElementById("downloadPublicPrice");
const catalogMessage = document.getElementById("catalogMessage");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartContainer = cartBtn?.closest(".cart");
const cartPreview = document.getElementById("cartPreview");
const cartPreviewTotal = document.getElementById("cartPreviewTotal");
const cartPreviewWeight = document.getElementById("cartPreviewWeight");
const closeCartPreviewBtn = document.getElementById("closeCartPreview");
const checkoutFromPreviewBtn = document.getElementById("checkoutFromPreview");
const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");
const closeCartBtn = document.getElementById("closeCart");
const clearCartBtn = document.getElementById("clearCartBtn");
const clearCartConfirm = document.getElementById("clearCartConfirm");
const confirmClearCartBtn = document.getElementById("confirmClearCart");
const cancelClearCartBtn = document.getElementById("cancelClearCart");
const cartTotalEl = document.getElementById("cartTotal");
const cartView = document.getElementById("cartView");
const openCheckoutBtn = document.getElementById("openCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const cancelCheckoutBtn = document.getElementById("cancelCheckout");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutNameInput = checkoutForm?.querySelector("input[name='customerName']");
const checkoutPhoneInput = checkoutForm?.querySelector("input[name='customerPhone']");
const preferredContactMethodInput = checkoutForm?.querySelector("select[name='preferredContactMethod']");
const checkoutAddressInput = checkoutForm?.querySelector("input[name='deliveryAddress']");
const checkoutCommentInput = checkoutForm?.querySelector("textarea[name='orderComment']");
const checkoutPaymentMethodInput = checkoutForm?.querySelector("select[name='paymentMethod']");
const nameSuggestionsEl = document.getElementById("nameSuggestions");
const phoneSuggestionsEl = document.getElementById("phoneSuggestions");
const addressSuggestionsEl = document.getElementById("addressSuggestions");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const searchInput = document.getElementById("searchInput");
const headerSearch = searchInput?.closest(".header-search");
const searchDropdown = document.createElement("div");

let cart = [];
let searchQuery = "";
let activeCategoryPath = "";
let showAllCatalogProducts = false;
let showAllSubcategories = false;
let showAllGroups = false;
let productsById = new Map();
let catalogLoadError = "";
let publicCatalogStructure = [];
let popularProducts = [];
let publicProductsPagination = { page: 1, limit: 50, total: 0, totalPages: 1, hasNext: false, hasPrevious: false };
let publicProductsLoadingMore = false;
let publicProductsRequestId = 0;
let publicSearchTimer = null;
let searchSuggestions = [];
let searchSuggestionsLoading = false;
let searchSuggestionsRequestId = 0;
let activeSearchSuggestionIndex = -1;
let documentMouseDownStartedInsideCheckout = false;
let cartPreviewWasOpenOnPointerDown = false;
const MAX_PRODUCT_QTY = 100000;
const SEARCH_SUGGESTION_MIN_LENGTH = 2;
const SEARCH_SUGGESTION_LIMIT = 10;
const PAYMENT_METHODS = [
    { value: "cash", label: "Наличные" },
    { value: "card_transfer", label: "Перевод на карту" },
    { value: "terminal", label: "Терминал" },
    { value: "bank_vat", label: "Безнал — с НДС" },
    { value: "bank_no_vat", label: "Безнал — без НДС" }
];
const NUMBER_EPSILON = 1e-9;

searchDropdown.className = "search-dropdown hidden";
searchDropdown.setAttribute("aria-live", "polite");
searchDropdown.setAttribute("role", "listbox");
headerSearch?.appendChild(searchDropdown);

function normalizeProductForSite(product, index) {
    const category = product.category && typeof product.category === "object"
        ? product.category
        : {
            main: product.category || "",
            section: product.subcategory || "",
            type: product.productGroup || product.product_group || ""
        };
    const id = Number(product.id ?? product.productId ?? index);
    const title = cleanDisplayText(product.title || product.name);

    return {
        id,
        productId: id,
        externalId: product.externalId || product.external_id || "",
        name: title,
        title,
        slug: product.slug || "",
        price: product.price === null || product.price === undefined ? null : Number(product.price) || 0,
        unit: cleanDisplayText(product.unit) || "шт",
        weight: Number(product.weight) || 0,
        category: {
            main: cleanDisplayText(category.main),
            section: cleanDisplayText(category.section),
            type: cleanDisplayText(product.productGroup || product.product_group || category.type)
        },
        image: cleanDisplayText(product.image),
        imageUrl: cleanDisplayText(product.imageUrl || product.image_url),
        description: cleanDisplayText(product.description)
    };
}

function getProductImageUrl(product = {}) {
    const value = cleanDisplayText(product.imageUrl || product.image_url);
    return value.startsWith("/uploads/products/") && !value.includes("..") && !value.includes("\\") ? value : "";
}

function renderProductThumb(product = {}) {
    const imageUrl = getProductImageUrl(product);
    if (imageUrl) return `<img src="${escapeHtml(imageUrl)}" alt="" onerror="this.replaceWith(document.createTextNode('Т'))">`;

    return escapeHtml(cleanDisplayText(product.image) || "Т");
}

function rebuildProductsIndex() {
    productsById = new Map(products.map(product => [Number(product.id), product]));
}

function normalizePublicCatalogStructure(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => {
            const name = cleanDisplayText(item?.name || item?.title);
            if (!name) return null;

            return {
                id: item?.id || null,
                code: item?.code || item?.externalCode || item?.external_code || "",
                name,
                sortOrder: Number(item?.sortOrder ?? item?.sort_order) || 0,
                productCount: Number(item?.productCount ?? item?.product_count) || 0,
                subcategories: Array.isArray(item.subcategories)
                    ? item.subcategories
                        .map(subcategory => ({
                            id: subcategory?.id || null,
                            code: subcategory?.code || subcategory?.externalCode || subcategory?.external_code || "",
                            name: cleanDisplayText(subcategory?.name || subcategory?.title),
                            sortOrder: Number(subcategory?.sortOrder ?? subcategory?.sort_order) || 0,
                            productCount: Number(subcategory?.productCount ?? subcategory?.product_count) || 0
                        }))
                        .filter(subcategory => subcategory.name)
                    : []
            };
        })
        .filter(Boolean);
}

async function loadPublicCatalogStructure() {
    try {
        const structureResponse = await fetch("/api/public/products/structure");
        const structureResult = await structureResponse.json().catch(() => ({}));

        publicCatalogStructure = structureResponse.ok && structureResult.success
            ? normalizePublicCatalogStructure(structureResult.categories)
            : [];
    } catch (structureError) {
        console.warn("Public catalog structure load error:", structureError);
        publicCatalogStructure = [];
    }
}

function getProductById(id) {
    const numericId = Number(id);
    return productsById.get(numericId)
        || searchSuggestions.find(product => Number(product.id) === numericId)
        || popularProducts.find(product => Number(product.id) === numericId)
        || null;
}

function copyTextToClipboard(value) {
    const copyWithInput = () => {
        const input = document.createElement("input");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    };

    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(value).catch(copyWithInput);
    }

    copyWithInput();
    return Promise.resolve();
}

const checkoutStorage = {
    names: "matmix_checkout_names",
    phones: "matmix_checkout_phones",
    addresses: "matmix_checkout_addresses"
};

const popularProductNames = [
    "Штукатурка гипсовая Knauf Ротбанд 30 кг",
    "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг",
    "Грунтовка Knauf Тифенгрунд 10 л",
    "Грунтовка Ceresit CT-17 PRO, 10л",
    "Блок D500 100х250х600 мм"
];

const featuredCatalogProductNames = [
    "Штукатурка гипсовая Knauf Ротбанд 30 кг",
    "Штукатурка гипсовая Knauf Гольдбанд 30 кг",
    "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг",
    "Штукатурка гипсовая ВОЛМА Слой Бел. 30 кг",
    "Штукатурка гипсовая UNIS Теплон белая 30 кг",
    "ГКЛ Knauf 2500х1200х9,5 мм",
    "ГКЛ Knauf 2500х1200х12,5 мм",
    "ГКЛВ Knauf 2500х1200х9,5 мм",
    "ГКЛВ Knauf 2500х1200х12,5 мм",
    "ГВЛ Knauf 2500х1200х10 мм",
    "Профиль ПН Knauf 27х28 мм 3 м",
    "Профиль ПС Knauf 60х27 мм 3 м",
    "Профиль ПН Knauf 50х40 мм 3м",
    "Профиль ПС Knauf 50х50 мм 3м",
    "Подвес прямой Knauf"
];

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("matmix_cart") || "[]");
        if (!Array.isArray(saved)) return [];

        const normalizedItems = new Map();

        saved.forEach(item => {
            const id = Number(item?.productId ?? item?.id);
            const qty = Math.floor(Number(item?.quantity ?? item?.qty));
            const product = getProductById(id);

            if (Number.isInteger(id) && product && qty > 0) {
                normalizedItems.set(id, (normalizedItems.get(id) || 0) + qty);
            }
        });

        return Array.from(normalizedItems, ([productId, quantity]) => {
            const product = getProductById(productId);
            return {
                productId,
                title: product.name,
                price: Number(product.price) || 0,
                weight: Number(product.weight) || 0,
                unit: product.unit || "шт",
                quantity
            };
        });
    } catch {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("matmix_cart", JSON.stringify(cart.map(item => {
            const product = getProductById(item.productId);
            return {
                productId: item.productId,
                title: product?.name || item.title,
                price: Number(product?.price ?? item.price) || 0,
                weight: Number(product?.weight ?? item.weight) || 0,
                unit: product?.unit || item.unit || "шт",
                quantity: Number(item.quantity) || 0
            };
        })));
    } catch {
        // Cart still works during the session if browser storage is unavailable.
    }
}

function getCartItem(productId) {
    return cart.find(item => Number(item.productId) === Number(productId));
}

function getCartItemQty(productId) {
    return Number(getCartItem(productId)?.quantity) || 0;
}

function showCatalogMessage(message, type = "error") {
    if (!catalogMessage) return;

    catalogMessage.textContent = message || "";
    catalogMessage.classList.toggle("error", type === "error");
    catalogMessage.classList.toggle("success", type === "success");
}

function getDownloadFileName(response, fallback) {
    const disposition = response.headers.get("Content-Disposition") || "";
    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (encodedMatch) {
        try {
            return decodeURIComponent(encodedMatch[1]);
        } catch {
            return fallback;
        }
    }

    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    return plainMatch?.[1] || fallback;
}

async function downloadPublicPrice() {
    if (!downloadPublicPriceBtn) return;

    downloadPublicPriceBtn.disabled = true;
    showCatalogMessage("");

    try {
        const response = await fetch("/api/public/products/export/excel");
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.message || "Не удалось скачать прайс.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = getDownloadFileName(response, "MatMix-прайс.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.warn("Public price download error:", error);
        showCatalogMessage("Не удалось скачать прайс. Попробуйте позже.");
    } finally {
        downloadPublicPriceBtn.disabled = false;
    }
}

function getCatalogFilterValues(groups = getCategoryFilterGroups()) {
    const trail = getActiveCategoryTrail(groups);
    const filters = {};

    if (!activeCategoryPath) return filters;
    if (trail.categoryPath) filters.category = trail.category;
    if (trail.subcategoryPath && !activeCategoryPath.startsWith("category:")) filters.subcategory = trail.subcategory;
    if (trail.group && activeCategoryPath.startsWith("group:")) filters.productGroup = trail.group;

    return filters;
}

function getPublicSearchQuery() {
    return searchQuery.trim();
}

function resetSearchSuggestions() {
    searchSuggestions = [];
    searchSuggestionsLoading = false;
    activeSearchSuggestionIndex = -1;
}

function closeSearchSuggestions(options = {}) {
    const { clearQuery = false, cancelRequest = true } = options;
    window.clearTimeout(publicSearchTimer);
    if (cancelRequest) searchSuggestionsRequestId += 1;
    if (clearQuery) {
        searchQuery = "";
        if (searchInput) searchInput.value = "";
    }
    resetSearchSuggestions();
    hideSearchDropdown();
}

function clearPublicSearchQuery() {
    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });
}

async function loadPublicProducts(options = {}) {
    const { append = false } = options;
    const requestId = ++publicProductsRequestId;
    try {
        const params = new URLSearchParams();
        params.set("page", append ? (Number(publicProductsPagination.page) || 1) + 1 : 1);
        params.set("limit", 50);
        const filters = getCatalogFilterValues();
        if (filters.category) params.set("category", filters.category);
        if (filters.subcategory) params.set("subcategory", filters.subcategory);
        if (filters.productGroup) params.set("productGroup", filters.productGroup);
        const response = await fetch(`/api/public/products?${params.toString()}`);
        const result = await response.json().catch(() => ({}));

        if (requestId !== publicProductsRequestId) return false;
        if (!response.ok || !result.success || !Array.isArray(result.products)) {
            throw new Error(result.message || "Не удалось загрузить каталог.");
        }

        const nextProducts = result.products.map(normalizeProductForSite);
        products = append
            ? [...products, ...nextProducts.filter(product => !products.some(existing => Number(existing.id) === Number(product.id)))].slice(-200)
            : nextProducts;
        publicProductsPagination = result.pagination || publicProductsPagination;
        rebuildProductsIndex();
        cart = loadCart();
        saveCart();
        catalogLoadError = "";
        showCatalogMessage("");
        return true;
    } catch (error) {
        if (requestId !== publicProductsRequestId) return false;
        console.warn("Public catalog load error:", error);
        products = [];
        rebuildProductsIndex();
        cart = loadCart();
        catalogLoadError = "Не удалось загрузить каталог. Проверьте подключение к серверу.";
        showCatalogMessage(catalogLoadError);
        return false;
    }
}

async function loadPopularProducts() {
    if (!popularGrid || !popularProductNames.length) return [];

    const loadedProducts = [];
    for (const name of popularProductNames) {
        try {
            const params = new URLSearchParams();
            params.set("search", name);
            params.set("limit", 10);
            const response = await fetch(`/api/public/products?${params.toString()}`);
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success || !Array.isArray(result.products)) continue;

            const normalizedProducts = result.products.map(normalizeProductForSite);
            const exactProduct = normalizedProducts.find(product => cleanDisplayText(product.name) === cleanDisplayText(name));
            const product = exactProduct || normalizedProducts[0] || null;
            if (product && !loadedProducts.some(item => Number(item.id) === Number(product.id))) {
                loadedProducts.push(product);
            }
        } catch (error) {
            console.warn("Popular product load error:", error);
        }
    }

    popularProducts = loadedProducts;
    return popularProducts;
}

async function replacePublicProductsAndRender() {
    publicProductsLoadingMore = false;
    await loadPublicProducts();
    renderCategoryControls();
    renderProducts();
    renderSearchDropdown();
}

function getStoredCheckoutValues(key) {
    try {
        const values = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(values) ? values.filter(Boolean) : [];
    } catch {
        return [];
    }
}

function saveCheckoutValue(key, value, normalizeValue = cleanDisplayText) {
    const cleanValue = cleanDisplayText(value);
    if (!cleanValue) return;

    const normalizedValue = normalizeValue(cleanValue);
    if (!normalizedValue) return;

    const existingValues = getStoredCheckoutValues(key)
        .filter(item => normalizeValue(item) !== normalizedValue);

    localStorage.setItem(key, JSON.stringify([cleanValue, ...existingValues].slice(0, 10)));
}

function renderCheckoutSuggestions(datalist, values) {
    if (!datalist) return;
    datalist.innerHTML = "";

    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        datalist.appendChild(option);
    });
}

function showInputSuggestions(input) {
    try {
        input?.showPicker?.();
    } catch {
        // Some browsers block programmatic datalist opening; autocomplete still works.
    }
}

function getRussianPhoneDigits(value) {
    let digits = String(value || "").replace(/\D/g, "");

    if (digits.startsWith("7") || digits.startsWith("8")) {
        digits = digits.slice(1);
    }

    return digits.slice(0, 10);
}

function formatRussianPhone(value) {
    const digits = getRussianPhoneDigits(value);
    let formatted = "+7";

    if (!digits) return formatted;

    formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ")";
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;

    return formatted;
}

function normalizePhoneHistoryValue(value) {
    return getRussianPhoneDigits(value);
}

function normalizeAddressHistoryValue(value) {
    return cleanDisplayText(value).toLowerCase();
}

function updateCheckoutSuggestions() {
    renderCheckoutSuggestions(nameSuggestionsEl, getStoredCheckoutValues(checkoutStorage.names));
    renderCheckoutSuggestions(phoneSuggestionsEl, getStoredCheckoutValues(checkoutStorage.phones));
    renderCheckoutSuggestions(addressSuggestionsEl, getStoredCheckoutValues(checkoutStorage.addresses));
}

function clearCheckoutMessage() {
    if (checkoutMessage) {
        checkoutMessage.classList.remove("success", "error");
        checkoutMessage.textContent = "";
    }
}

function setCheckoutSubmitDisabled(isDisabled) {
    checkoutForm?.querySelector("button[type='submit']")?.toggleAttribute("disabled", isDisabled);
}

function resizeCheckoutComment() {
    if (!checkoutCommentInput) return;

    checkoutCommentInput.style.height = "auto";
    const maxHeight = 150;
    const nextHeight = Math.min(checkoutCommentInput.scrollHeight, maxHeight);
    checkoutCommentInput.style.height = `${nextHeight}px`;
    checkoutCommentInput.classList.toggle("is-scrollable", checkoutCommentInput.scrollHeight > maxHeight);
}

function setupCheckoutFormFields() {
    setupPaymentMethodSelect();
    updateCheckoutSuggestions();

    if (checkoutNameInput) {
        const lastName = getStoredCheckoutValues(checkoutStorage.names)[0];
        if (lastName && !checkoutNameInput.value) {
            checkoutNameInput.value = lastName;
        }

        checkoutNameInput.addEventListener("focus", () => {
            updateCheckoutSuggestions();
            showInputSuggestions(checkoutNameInput);
        });

        checkoutNameInput.addEventListener("input", updateCheckoutSuggestions);
    }

    if (checkoutPhoneInput) {
        checkoutPhoneInput.value = formatRussianPhone(checkoutPhoneInput.value);

        checkoutPhoneInput.addEventListener("focus", () => {
            checkoutPhoneInput.value = formatRussianPhone(checkoutPhoneInput.value);
            updateCheckoutSuggestions();
            showInputSuggestions(checkoutPhoneInput);
        });

        checkoutPhoneInput.addEventListener("keydown", event => {
            const isPrefixEdit = ["Backspace", "Delete"].includes(event.key)
                && checkoutPhoneInput.selectionStart <= 2;

            if (isPrefixEdit) {
                event.preventDefault();
            }
        });

        checkoutPhoneInput.addEventListener("input", () => {
            checkoutPhoneInput.value = formatRussianPhone(checkoutPhoneInput.value);
        });
    }

    if (checkoutAddressInput) {
        checkoutAddressInput.addEventListener("focus", () => {
            updateCheckoutSuggestions();
            showInputSuggestions(checkoutAddressInput);
        });

        checkoutAddressInput.addEventListener("input", updateCheckoutSuggestions);
    }

    if (checkoutCommentInput) {
        resizeCheckoutComment();
        checkoutCommentInput.addEventListener("input", resizeCheckoutComment);
    }
}

function formatPrice(value) {
    if (value === null || value === undefined) return "Цена по запросу";
    return `${formatMoneyValue(value)} ₽`;
}

function toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function ceilNumber(value, precision) {
    const factor = 10 ** precision;
    const result = Math.ceil((toFiniteNumber(value) - NUMBER_EPSILON) * factor) / factor;
    return Object.is(result, -0) ? 0 : result;
}

function ceilMoney(value) {
    return ceilNumber(value, 2);
}

function ceilWeight(value) {
    return ceilNumber(value, 3);
}

function formatMoneyValue(value) {
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(ceilMoney(value));
}

function formatWeightValue(value) {
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(ceilWeight(value));
}

function formatWeight(value) {
    return `${formatWeightValue(value)} кг`;
}

function renderPaymentMethodOptions(selectedValue = "") {
    return PAYMENT_METHODS
        .map(method => `<option value="${method.value}"${method.value === selectedValue ? " selected" : ""}>${method.label}</option>`)
        .join("");
}

function setupPaymentMethodSelect() {
    if (!checkoutPaymentMethodInput) return;

    const selectedValue = PAYMENT_METHODS.some(method => method.value === checkoutPaymentMethodInput.value)
        ? checkoutPaymentMethodInput.value
        : "";
    checkoutPaymentMethodInput.innerHTML = renderPaymentMethodOptions(selectedValue || PAYMENT_METHODS[0].value);
}

function getUnloadingLabel(value) {
    return value === "yes" ? "Да" : "Нет";
}

function cleanDisplayText(value) {
    return String(value || "").replace(/\?/g, "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCartOrderItems() {
    return cart
        .map(item => {
            const product = getProductById(item.productId);
            if (!product) return null;

            const price = ceilMoney(product.price);
            const qty = Number(item.quantity) || 0;
            const weight = ceilWeight(product.weight);

            return {
                productId: product.id,
                externalId: product.externalId || "",
                name: cleanDisplayText(product.name),
                title: cleanDisplayText(product.name),
                price,
                qty,
                unit: product.unit || "шт",
                weight,
                lineTotal: ceilMoney(price * qty),
                lineWeight: ceilWeight(weight * qty)
            };
        })
        .filter(Boolean);
}

function showCheckoutError(message) {
    if (!checkoutMessage) return;

    checkoutMessage.classList.remove("success");
    checkoutMessage.classList.add("error");
    checkoutMessage.textContent = message;
}

function getCheckoutErrorMessage(error) {
    return window.MatMixErrors?.getMessage(error, {
        fallback: "Произошла непредвиденная ошибка.",
        networkFallback: "Не удалось соединиться с сервером."
    }) || "Произошла непредвиденная ошибка.";
}

function showCheckoutSuccess() {
    if (!checkoutMessage) return;

    checkoutMessage.classList.remove("error");
    checkoutMessage.classList.add("success");
    checkoutMessage.innerHTML = `
        <span class="checkout-success-icon" aria-hidden="true">✓</span>
        <span class="checkout-success-text">
            <strong class="checkout-success-title">Спасибо!</strong>
            <span>Ваша заявка успешно оформлена.</span>
            <span>Менеджер свяжется с вами в ближайшее время.</span>
        </span>
    `;
}

function normalizeSearchText(value) {
    return cleanDisplayText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[-.,;:()[\]{}_/\\]+/g, " ")
        .replace(/[^a-zа-я0-9\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSearchTokens(value) {
    const normalized = normalizeSearchText(value);
    return normalized ? normalized.split(" ").filter(Boolean) : [];
}

function expandSearchToken(token) {
    const normalizedToken = normalizeSearchText(token);
    const expanded = new Set([normalizedToken]);

    Object.entries(synonyms).forEach(([key, values]) => {
        const normalizedKey = normalizeSearchText(key);
        const normalizedValues = values.map(normalizeSearchText);
        const isMatch = normalizedToken.includes(normalizedKey)
            || normalizedKey.includes(normalizedToken)
            || normalizedValues.some(value => normalizedToken.includes(value) || value.includes(normalizedToken));

        if (!isMatch) return;
        expanded.add(normalizedKey);
        normalizedValues.forEach(value => expanded.add(value));
    });

    return Array.from(expanded).filter(Boolean);
}

function getSharedPrefixLength(first, second) {
    const maxLength = Math.min(first.length, second.length);
    let length = 0;

    while (length < maxLength && first[length] === second[length]) {
        length += 1;
    }

    return length;
}

function getSoftTokenMatchScore(token, variant) {
    if (token.length < 4 || variant.length < 4) return 0;

    const prefixLength = getSharedPrefixLength(token, variant);
    const requiredPrefixLength = Math.min(5, Math.max(3, Math.ceil(Math.min(token.length, variant.length) * 0.72)));

    if (prefixLength >= requiredPrefixLength) {
        return 5 + prefixLength;
    }

    return 0;
}

function getProductSearchText(product) {
    return normalizeSearchText([
        product.name,
        product.title,
        product.category?.main,
        product.category?.section,
        product.category?.type,
        product.description,
        product.externalId,
        product.slug,
        product.unit,
        product.price,
        product.weight
    ].filter(value => value !== null && value !== undefined).join(" "));
}

function getProductSearchScore(product, query) {
    const queryText = normalizeSearchText(query);
    if (!queryText) return { score: 1, matchedTokens: 0 };

    const productText = getProductSearchText(product);
    const queryTokens = getSearchTokens(queryText);
    if (!queryTokens.length) return { score: 1, matchedTokens: 0 };

    if (queryTokens.every(token => productText.includes(token))) {
        return {
            score: (productText.includes(queryText) ? 160 : 90) + queryTokens.length * 25,
            matchedTokens: queryTokens.length
        };
    }

    let score = productText.includes(queryText) ? 100 : 0;
    let matchedTokens = 0;
    const productTokens = productText.split(" ").filter(Boolean);

    queryTokens.forEach(token => {
        const variants = expandSearchToken(token);
        const bestVariantScore = variants.reduce((best, variant) => {
            if (productText.includes(variant)) {
                const exactWordScore = productTokens.includes(variant) ? 12 : 8;
                return Math.max(best, exactWordScore + Math.min(variant.length, 12));
            }

            const softMatchScore = productTokens.reduce((tokenBest, productToken) => {
                return Math.max(tokenBest, getSoftTokenMatchScore(token, productToken), getSoftTokenMatchScore(variant, productToken));
            }, 0);

            if (softMatchScore) {
                return Math.max(best, softMatchScore);
            }

            return best;
        }, 0);

        if (bestVariantScore > 0) {
            matchedTokens += 1;
            score += bestVariantScore;
        }
    });

    if (!matchedTokens) return { score: 0, matchedTokens: 0 };
    if (matchedTokens > 1) score += matchedTokens * 20;
    if (matchedTokens === queryTokens.length) score += 30;

    return { score, matchedTokens };
}

function smartSearch(query, productList) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
        return productList.map((item, order) => ({ ...item, searchScore: 1, order }));
    }

    const rankedProducts = productList
        .map((item, order) => {
            const match = getProductSearchScore(item.product, normalizedQuery);
            return {
                ...item,
                searchScore: match.score,
                matchedTokens: match.matchedTokens,
                order
            };
        })
        .filter(item => item.searchScore > 0);

    const strongMatches = rankedProducts.filter(item => item.matchedTokens >= 2);
    const weakMatches = rankedProducts.filter(item => item.matchedTokens < 2);
    const visibleMatches = strongMatches.length ? strongMatches : weakMatches;

    return visibleMatches.sort((first, second) => second.searchScore - first.searchScore || first.order - second.order);
}

function getSearchDropdownLimit(query) {
    const queryTokens = getSearchTokens(query);
    const queryLength = normalizeSearchText(query).replace(/\s/g, "").length;

    if (queryLength <= 4) return 30;
    if (queryTokens.length === 1 && queryLength <= 8) return 24;
    if (queryTokens.length <= 2 && queryLength <= 14) return 18;
    return 10;
}

function getProductCatalogCategory(product) {
    return [
        product.category?.main,
        product.category?.section,
        product.category?.type
    ].filter(Boolean);
}

function serializeCategoryFilterGroup(category, subcategories = Array.from(category.subcategories.values())) {
    return {
        label: category.label,
        path: category.path,
        subcategories: subcategories.map(subcategory => ({
            label: subcategory.label,
            path: subcategory.path,
            groups: Array.from(subcategory.groups.values())
        }))
    };
}

function getCategoryFilterGroups() {
    const categories = new Map();

    publicCatalogStructure.forEach(structureCategory => {
        const main = cleanDisplayText(structureCategory.name);
        const normalizedMain = normalizeSearchText(main);
        if (!normalizedMain || categories.has(normalizedMain)) return;

        categories.set(normalizedMain, {
            label: main,
            path: `category:${normalizedMain}`,
            subcategories: new Map()
        });

        const category = categories.get(normalizedMain);
        structureCategory.subcategories.forEach(structureSubcategory => {
            const subcategory = cleanDisplayText(structureSubcategory.name);
            const normalizedSubcategory = normalizeSearchText(subcategory);
            if (!normalizedSubcategory || category.subcategories.has(normalizedSubcategory)) return;

            category.subcategories.set(normalizedSubcategory, {
                label: subcategory,
                path: `subcategory:${normalizedMain}:${normalizedSubcategory}`,
                groups: new Map()
            });
        });
    });

    products.forEach(product => {
        const [main, subcategory, productGroup] = getProductCatalogCategory(product);
        if (!main) return;

        const normalizedMain = normalizeSearchText(main);
        if (!categories.has(normalizedMain)) {
            categories.set(normalizedMain, {
                label: main,
                path: `category:${normalizedMain}`,
                subcategories: new Map()
            });
        }

        if (!subcategory || normalizeSearchText(subcategory) === normalizedMain) return;
        if (/^подкатегория\s*-/i.test(subcategory)) return;

        const category = categories.get(normalizedMain);
        const normalizedSubcategory = normalizeSearchText(subcategory);
        if (!normalizedSubcategory) return;

        if (!category.subcategories.has(normalizedSubcategory)) {
            category.subcategories.set(normalizedSubcategory, {
                label: subcategory,
                path: `subcategory:${normalizedMain}:${normalizedSubcategory}`,
                groups: new Map()
            });
        }

        const subcategoryItem = category.subcategories.get(normalizedSubcategory);
        const normalizedGroup = normalizeSearchText(productGroup);
        if (!productGroup || !normalizedGroup || normalizedGroup === normalizedSubcategory) return;

        if (!subcategoryItem.groups.has(normalizedGroup)) {
            subcategoryItem.groups.set(normalizedGroup, {
                label: productGroup,
                path: `group:${normalizedMain}:${normalizedSubcategory}:${normalizedGroup}`
            });
        }
    });

    if (publicCatalogStructure.length) {
        const groups = [];
        const usedCategories = new Set();

        publicCatalogStructure.forEach(structureCategory => {
            const normalizedMain = normalizeSearchText(structureCategory.name);
            const category = categories.get(normalizedMain);
            if (!category) return;

            const usedSubcategories = new Set();
            const orderedSubcategories = [];
            usedCategories.add(normalizedMain);

            structureCategory.subcategories.forEach(structureSubcategory => {
                const normalizedSubcategory = normalizeSearchText(structureSubcategory.name);
                const subcategory = category.subcategories.get(normalizedSubcategory);
                if (!subcategory) return;

                usedSubcategories.add(normalizedSubcategory);
                orderedSubcategories.push(subcategory);
            });

            category.subcategories.forEach((subcategory, normalizedSubcategory) => {
                if (!usedSubcategories.has(normalizedSubcategory)) {
                    orderedSubcategories.push(subcategory);
                }
            });

            groups.push(serializeCategoryFilterGroup(category, orderedSubcategories));
        });

        categories.forEach((category, normalizedMain) => {
            if (!usedCategories.has(normalizedMain)) {
                groups.push(serializeCategoryFilterGroup(category));
            }
        });

        return groups;
    }

    const groups = [];
    categories.forEach(category => {
        groups.push(serializeCategoryFilterGroup(category));
    });

    return groups;
}

function getActiveCategoryTrail(groups = getCategoryFilterGroups()) {
    if (!activeCategoryPath) {
        return {
            category: "Все товары",
            categoryPath: "",
            subcategory: "",
            subcategoryPath: "",
            group: ""
        };
    }

    for (const group of groups) {
        if (group.path === activeCategoryPath) {
            return {
                category: group.label,
                categoryPath: group.path,
                subcategory: "",
                subcategoryPath: "",
                group: ""
            };
        }

        const subcategory = group.subcategories.find(item => item.path === activeCategoryPath);
        if (subcategory) {
            return {
                category: group.label,
                categoryPath: group.path,
                subcategory: subcategory.label,
                subcategoryPath: subcategory.path,
                group: ""
            };
        }

        for (const subcategoryItem of group.subcategories) {
            if (getSubcategoryAllPath(subcategoryItem.path) === activeCategoryPath) {
                return {
                    category: group.label,
                    categoryPath: group.path,
                    subcategory: subcategoryItem.label,
                    subcategoryPath: subcategoryItem.path,
                    group: ""
                };
            }

            const productGroup = subcategoryItem.groups.find(item => item.path === activeCategoryPath);
            if (productGroup) {
                return {
                    category: group.label,
                    categoryPath: group.path,
                    subcategory: subcategoryItem.label,
                    subcategoryPath: subcategoryItem.path,
                    group: productGroup.label
                };
            }
        }
    }

    return {
        category: "Все товары",
        categoryPath: "",
        subcategory: "",
        subcategoryPath: "",
        group: ""
    };
}

function updateCatalogBreadcrumbs(groups) {
    if (!catalogBreadcrumbCategory) return;

    const trail = getActiveCategoryTrail(groups);
    catalogBreadcrumbCategory.textContent = trail.category;
    catalogBreadcrumbCategory.dataset.path = trail.categoryPath;
    catalogBreadcrumbCategory.classList.toggle("current", !trail.subcategory && !trail.group);
    catalogBreadcrumbCategory.setAttribute("aria-disabled", String((!trail.subcategory && !trail.group) || !trail.categoryPath));

    catalogBreadcrumbSubcategorySeparator?.classList.toggle("hidden", !trail.subcategory);

    if (catalogBreadcrumbSubcategory) {
        catalogBreadcrumbSubcategory.textContent = trail.subcategory;
        catalogBreadcrumbSubcategory.dataset.path = trail.subcategoryPath;
        catalogBreadcrumbSubcategory.classList.toggle("hidden", !trail.subcategory);
        catalogBreadcrumbSubcategory.classList.toggle("current", !trail.group);
        catalogBreadcrumbSubcategory.setAttribute("aria-disabled", String(!trail.group || !trail.subcategoryPath));
    }

    catalogBreadcrumbGroupSeparator?.classList.toggle("hidden", !trail.group);

    if (catalogBreadcrumbGroup) {
        catalogBreadcrumbGroup.textContent = trail.group;
        catalogBreadcrumbGroup.classList.toggle("hidden", !trail.group);
    }
}

catalogBreadcrumbCategory?.addEventListener("click", async () => {
    if (catalogBreadcrumbCategory.getAttribute("aria-disabled") === "true") return;

    const path = catalogBreadcrumbCategory.dataset.path;
    if (!path) return;

    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });
    activeCategoryPath = path;
    showAllCatalogProducts = false;
    showAllSubcategories = false;
    showAllGroups = false;
    await replacePublicProductsAndRender();
});

catalogBreadcrumbSubcategory?.addEventListener("click", async () => {
    if (catalogBreadcrumbSubcategory.getAttribute("aria-disabled") === "true") return;

    const path = catalogBreadcrumbSubcategory.dataset.path;
    if (!path) return;

    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });
    activeCategoryPath = path;
    showAllCatalogProducts = false;
    showAllGroups = false;
    await replacePublicProductsAndRender();
});

function productMatchesCategory(product) {
    if (!activeCategoryPath) return true;
    const [main, subcategory, productGroup] = getProductCatalogCategory(product);

    if (activeCategoryPath.startsWith("category:")) {
        const [, normalizedMain] = activeCategoryPath.split(":");
        return normalizeSearchText(main) === normalizedMain;
    }

    if (activeCategoryPath.startsWith("subcategory:")) {
        const [, normalizedMain, normalizedSubcategory] = activeCategoryPath.split(":");

        return normalizeSearchText(main) === normalizedMain
            && normalizeSearchText(subcategory) === normalizedSubcategory;
    }

    if (activeCategoryPath.startsWith("subcategory-all:")) {
        const [, normalizedMain, normalizedSubcategory] = activeCategoryPath.split(":");

        return normalizeSearchText(main) === normalizedMain
            && normalizeSearchText(subcategory) === normalizedSubcategory;
    }

    if (activeCategoryPath.startsWith("group:")) {
        const [, normalizedMain, normalizedSubcategory, normalizedGroup] = activeCategoryPath.split(":");

        return normalizeSearchText(main) === normalizedMain
            && normalizeSearchText(subcategory) === normalizedSubcategory
            && normalizeSearchText(productGroup) === normalizedGroup;
    }

    return false;
}

function getSubcategoryAllPath(subcategoryPath) {
    return subcategoryPath ? subcategoryPath.replace(/^subcategory:/, "subcategory-all:") : "";
}

function getCartTotal() {
    return ceilMoney(cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + ceilMoney(product?.price) * item.quantity;
    }, 0));
}

function getCartWeight() {
    return ceilWeight(cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        const weight = Number(product?.weight);
        return sum + ceilWeight(Number.isFinite(weight) ? weight : 0) * item.quantity;
    }, 0));
}

function getCartQty() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getDistinctCartItemsCount() {
    return cart.filter(item => getProductById(item.productId)).length;
}

function isCartModalOpen() {
    return Boolean(cartModal && !cartModal.classList.contains("hidden"));
}

function showCartPreview() {
    if (!cartPreview || isCartModalOpen()) return;
    cartPreview.classList.remove("hidden");
    cartBtn?.setAttribute("aria-expanded", "true");
}

function hideCartPreview() {
    if (!cartPreview) return;
    cartPreview.classList.add("hidden");
    cartBtn?.setAttribute("aria-expanded", "false");
}

function toggleCartPreview() {
    if (!cartPreview || isCartModalOpen()) {
        hideCartPreview();
        return;
    }

    if (!cartPreviewWasOpenOnPointerDown) {
        showCartPreview();
        return;
    }

    hideCartPreview();
}

function renderCartPreview() {
    if (!cartPreview) return;

    const hasItems = getDistinctCartItemsCount() > 0;
    cartPreview.classList.toggle("is-empty", !hasItems);

    if (cartPreviewTotal) {
        cartPreviewTotal.textContent = `${formatMoneyValue(getCartTotal())} ₽`;
    }

    if (cartPreviewWeight) {
        cartPreviewWeight.textContent = formatWeight(getCartWeight());
    }
}

function updateCartSummary() {
    const distinctItemsCount = getDistinctCartItemsCount();
    cartCountEl.textContent = distinctItemsCount;
    cartCountEl.classList.toggle("hidden", distinctItemsCount === 0);
    cartTotalEl.innerHTML = `
        <span>Итого: ${formatMoneyValue(getCartTotal())} ₽</span>
        <span id="cartWeight">Вес: ${formatWeight(getCartWeight())}</span>
    `;
    renderCartPreview();
    if (openCheckoutBtn) {
        openCheckoutBtn.disabled = !cart.length;
    }
}

function clampProductQty(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return 0;
    return Math.min(MAX_PRODUCT_QTY, Math.floor(number));
}

function sanitizeQtyInputValue(value) {
    const rawValue = String(value || "").trim();
    if (rawValue.startsWith("-")) return "";
    return rawValue.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function setProductQty(id, nextQty, options = {}) {
    const { renderCartView = true, renderSearchView = true, renderProductViews = true } = options;
    const product = getProductById(id);
    if (!product) return;

    const safeQty = clampProductQty(nextQty);
    const item = getCartItem(id);

    if (safeQty <= 0) {
        cart = cart.filter(entry => Number(entry.productId) !== Number(id));
    } else if (item) {
        item.quantity = safeQty;
        item.title = product.name;
        item.price = Number(product.price) || 0;
        item.weight = Number(product.weight) || 0;
        item.unit = product.unit || "шт";
    } else {
        cart.push({
            productId: Number(id),
            title: product.name,
            price: Number(product.price) || 0,
            weight: Number(product.weight) || 0,
            unit: product.unit || "шт",
            quantity: safeQty
        });
    }

    saveCart();
    updateCartSummary();
    if (renderProductViews && grid) {
        renderProducts();
    }
    if (renderProductViews && popularGrid) {
        renderPopularProducts();
    }
    if (renderSearchView && (!searchDropdown.classList.contains("hidden") || document.activeElement === searchInput)) {
        renderSearchDropdown();
    }

    if (renderCartView && !cartModal.classList.contains("hidden")) {
        renderCart();
    }
}

function showCartView() {
    cartView?.classList.remove("hidden");
    checkoutForm?.classList.add("hidden");
    clearCartConfirm?.classList.add("hidden");
    clearCheckoutMessage();
}

function showCheckoutForm() {
    if (!cart.length) return;
    cartView?.classList.add("hidden");
    checkoutForm?.classList.remove("hidden");
    clearCheckoutMessage();
    setCheckoutSubmitDisabled(false);
    checkoutForm?.querySelector("input")?.focus();
}

function isCatalogDefaultView() {
    return Boolean(grid?.closest(".catalog-page"))
        && !activeCategoryPath
        && !showAllCatalogProducts;
}

function getProductsByNames(names) {
    return names
        .map(name => {
            const product = products.find(item => cleanDisplayText(item.name) === cleanDisplayText(name));
            return product ? { product, id: product.id } : null;
        })
        .filter(Boolean);
}

function renderFeaturedCatalogProducts() {
    if (!featuredCatalog || !featuredCatalogGrid) return;

    const shouldShowFeatured = isCatalogDefaultView();
    featuredCatalog.classList.toggle("hidden", !shouldShowFeatured);
    featuredCatalogGrid.innerHTML = "";

    if (!shouldShowFeatured) return;

    getProductsByNames(featuredCatalogProductNames).forEach(({ product, id }) => {
        featuredCatalogGrid.appendChild(createProductCard(product, id));
    });
}

function animateCatalogGridUpdate(targetGrid) {
    if (!targetGrid || targetGrid.classList.contains("hidden")) return;

    targetGrid.classList.add("is-updating");
    window.setTimeout(() => {
        targetGrid.classList.remove("is-updating");
    }, 180);
}

function getCatalogSelectionState(groups = getCategoryFilterGroups()) {
    const activeMainPath = getActiveMainCategoryPath(groups);
    const activeSubcategoryPath = getActiveSubcategoryPath(groups);
    const activeGroup = groups.find(group => group.path === activeMainPath) || null;
    const activeSubcategory = activeGroup?.subcategories.find(subcategory => subcategory.path === activeSubcategoryPath) || null;

    return {
        activeGroup,
        activeSubcategory,
        hasSearch: false,
        isCategoryLevel: Boolean(activeCategoryPath && activeCategoryPath.startsWith("category:")),
        isSubcategoryLevel: Boolean(activeCategoryPath && activeCategoryPath.startsWith("subcategory:")),
        isSubcategoryAllLevel: Boolean(activeCategoryPath && activeCategoryPath.startsWith("subcategory-all:")),
        isProductGroupLevel: Boolean(activeCategoryPath && activeCategoryPath.startsWith("group:"))
    };
}

function getCatalogPromptMessage(state) {
    if (!activeCategoryPath || state.hasSearch) return "";

    if (state.isCategoryLevel && state.activeGroup?.subcategories.length) {
        return "Выберите подкатегорию, чтобы увидеть товары.";
    }

    if (state.isSubcategoryLevel && state.activeSubcategory?.groups.length) {
        return "Выберите группу товаров или откройте все товары подкатегории.";
    }

    return "";
}

function renderProducts() {
    if (!grid) return;
    animateCatalogGridUpdate(grid);
    grid.innerHTML = "";

    if (catalogLoadError) {
        featuredCatalog?.classList.add("hidden");
        grid.classList.remove("hidden");
        grid.innerHTML = `<p class="empty-products">${catalogLoadError}</p>`;
        return;
    }

    renderFeaturedCatalogProducts();

    if (isCatalogDefaultView()) {
        grid.classList.add("hidden");
        return;
    }

    grid.classList.remove("hidden");

    const selectionState = getCatalogSelectionState();
    const promptMessage = getCatalogPromptMessage(selectionState);
    if (promptMessage) {
        grid.innerHTML = `<p class="empty-products catalog-level-prompt">${promptMessage}</p>`;
        return;
    }

    const categoryProducts = products
        .map(product => ({ product, id: product.id }))
        .filter(({ product }) => productMatchesCategory(product));

    const visibleProducts = categoryProducts;

    if (!visibleProducts.length) {
        grid.innerHTML = `<p class="empty-products">Товары не найдены.</p>`;
        return;
    }

    visibleProducts.forEach(({ product, id }) => {
        grid.appendChild(createProductCard(product, id));
    });
    renderPublicCatalogPagination();
}

function renderPublicCatalogPagination() {
    if (!grid || isCatalogDefaultView()) return;
    const existing = grid.querySelector(".catalog-load-more");
    existing?.remove();
    const loadedCount = products.length;
    const canLoadMore = publicProductsPagination?.hasNext && loadedCount < 200;
    if (!canLoadMore && !(publicProductsPagination?.hasNext && loadedCount >= 200)) return;

    const wrapper = document.createElement("div");
    wrapper.className = "catalog-load-more";
    wrapper.innerHTML = canLoadMore
        ? `<button type="button" data-public-load-more${publicProductsLoadingMore ? " disabled" : ""}>${publicProductsLoadingMore ? "Загружаем..." : "Показать ещё 50"}</button>`
        : `<p>Для просмотра следующих товаров уточните категорию или поиск.</p>`;
    grid.appendChild(wrapper);
}

function appendPublicCatalogCards() {
    if (!grid || grid.classList.contains("hidden")) return;

    const existingPagination = grid.querySelector(".catalog-load-more");
    existingPagination?.remove();

    const existingIds = new Set(
        Array.from(grid.querySelectorAll(".card[data-product-id]"))
            .map(card => Number(card.dataset.productId))
            .filter(Number.isFinite)
    );
    const productList = products
        .map(product => ({ product, id: product.id }))
        .filter(({ product }) => productMatchesCategory(product));
    const visibleProducts = productList;
    const fragment = document.createDocumentFragment();

    visibleProducts.forEach(({ product, id }) => {
        const numericId = Number(id);
        if (existingIds.has(numericId)) return;

        existingIds.add(numericId);
        fragment.appendChild(createProductCard(product, id));
    });

    grid.appendChild(fragment);
    renderPublicCatalogPagination();
}

function createProductCard(product, id) {
    const qty = getCartItemQty(id);
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.productId = String(id);

    card.innerHTML = `
        <div class="card-main">
            <div class="thumb" aria-hidden="true">${renderProductThumb(product)}</div>
            <div class="card-info">
                <h3>${cleanDisplayText(product.name)}</h3>
                <p>${formatPrice(product.price)} / ${product.unit}</p>
            </div>
        </div>
        <div class="actions">
            ${qty ? getQtyControls(id, qty) : `<button class="add" data-id="${id}" type="button">В корзину</button>`}
        </div>
    `;

    return card;
}

function hideSearchDropdown() {
    searchDropdown.classList.add("hidden");
    searchDropdown.innerHTML = "";
    activeSearchSuggestionIndex = -1;
}

async function loadSearchSuggestions(query) {
    const normalizedQuery = String(query || "").trim();
    const requestId = ++searchSuggestionsRequestId;

    if (normalizedQuery.length < SEARCH_SUGGESTION_MIN_LENGTH) {
        closeSearchSuggestions({ clearQuery: false, cancelRequest: false });
        return;
    }

    searchSuggestionsLoading = true;
    renderSearchDropdown();

    try {
        const params = new URLSearchParams();
        params.set("search", normalizedQuery);
        params.set("limit", SEARCH_SUGGESTION_LIMIT);
        const response = await fetch(`/api/public/products?${params.toString()}`);
        const result = await response.json().catch(() => ({}));

        if (requestId !== searchSuggestionsRequestId || normalizedQuery !== getPublicSearchQuery()) return;
        searchSuggestions = response.ok && result.success && Array.isArray(result.products)
            ? result.products.map(normalizeProductForSite)
            : [];
    } catch (error) {
        if (requestId !== searchSuggestionsRequestId) return;
        console.warn("Public search suggestions load error:", error);
        searchSuggestions = [];
    } finally {
        if (requestId === searchSuggestionsRequestId) {
            searchSuggestionsLoading = false;
            activeSearchSuggestionIndex = -1;
            renderSearchDropdown();
        }
    }
}

function scheduleSearchSuggestionsLoad() {
    window.clearTimeout(publicSearchTimer);
    const query = getPublicSearchQuery();

    if (query.length < SEARCH_SUGGESTION_MIN_LENGTH) {
        closeSearchSuggestions({ clearQuery: false, cancelRequest: true });
        return;
    }

    searchSuggestionsLoading = true;
    renderSearchDropdown();
    publicSearchTimer = window.setTimeout(() => {
        loadSearchSuggestions(query);
    }, 300);
}

function getSearchSuggestionCategoryText(product = {}) {
    const [main, subcategory] = getProductCatalogCategory(product);
    return [main, subcategory].filter(Boolean).join(" / ");
}

function updateActiveSearchSuggestion() {
    const items = Array.from(searchDropdown.querySelectorAll(".search-result[data-search-index]"));
    items.forEach((item, index) => {
        const isActive = index === activeSearchSuggestionIndex;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        if (isActive) item.scrollIntoView({ block: "nearest" });
    });
}

function selectSearchSuggestion(productId) {
    const id = Number(productId);
    if (!Number.isInteger(id)) return;

    const visibleCard = grid?.querySelector(`.card[data-product-id="${id}"]`);
    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });

    if (visibleCard) {
        visibleCard.scrollIntoView({ behavior: "smooth", block: "center" });
        visibleCard.classList.add("is-highlighted");
        window.setTimeout(() => visibleCard.classList.remove("is-highlighted"), 900);
    }
}

function renderSearchDropdown() {
    if (!searchInput || !headerSearch) return;

    const query = searchInput.value.trim();
    if (!query || query.length < SEARCH_SUGGESTION_MIN_LENGTH) {
        hideSearchDropdown();
        return;
    }

    searchDropdown.classList.remove("hidden");

    if (searchSuggestionsLoading) {
        searchDropdown.innerHTML = `<p class="search-empty">Загружаем...</p>`;
        return;
    }

    if (!searchSuggestions.length) {
        searchDropdown.innerHTML = `<p class="search-empty">Ничего не найдено</p>`;
        return;
    }

    searchDropdown.innerHTML = "";
    searchSuggestions.forEach((product, index) => {
        const id = product.id;
        const qty = getCartItemQty(id);
        const categoryText = getSearchSuggestionCategoryText(product);
        const item = document.createElement("div");
        item.className = "search-result";
        item.dataset.productId = String(id);
        item.dataset.searchIndex = String(index);
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.innerHTML = `
            <button class="search-result-main" type="button" data-search-product="${id}">
                <span class="search-result-thumb" aria-hidden="true">${renderProductThumb(product)}</span>
                <span class="search-result-info">
                    <strong>${escapeHtml(cleanDisplayText(product.name))}</strong>
                    <span>${formatPrice(product.price)} / ${escapeHtml(product.unit)}</span>
                    ${categoryText ? `<small>${escapeHtml(categoryText)}</small>` : ""}
                </span>
            </button>
            <div class="search-result-actions">
                ${qty ? getQtyControls(id, qty, true) : `<button class="add" data-id="${id}" type="button">В корзину</button>`}
            </div>
        `;
        searchDropdown.appendChild(item);
    });
    updateActiveSearchSuggestion();
}

function renderPopularProducts() {
    if (!popularGrid) return;
    popularGrid.innerHTML = "";

    const productList = popularProducts.length
        ? popularProducts.map(product => ({ product, id: product.id }))
        : getProductsByNames(popularProductNames);

    productList.forEach(({ product, id }) => {
        try {
            popularGrid.appendChild(createProductCard(product, id));
        } catch (error) {
            console.warn("Popular product render error:", error);
        }
    });
}

function getActiveMainCategoryPath(groups) {
    if (!activeCategoryPath) return "";

    if (activeCategoryPath.startsWith("category:")) {
        return activeCategoryPath;
    }

    const group = groups.find(item => item.subcategories.some(subcategory => {
        return subcategory.path === activeCategoryPath
            || subcategory.groups.some(productGroup => productGroup.path === activeCategoryPath);
    }));
    return group?.path || "";
}

function getActiveSubcategoryPath(groups) {
    if (!activeCategoryPath) return "";

    if (activeCategoryPath.startsWith("subcategory:")) {
        return activeCategoryPath;
    }

    if (activeCategoryPath.startsWith("subcategory-all:")) {
        return activeCategoryPath.replace(/^subcategory-all:/, "subcategory:");
    }

    for (const group of groups) {
        const subcategory = group.subcategories.find(item => item.groups.some(productGroup => productGroup.path === activeCategoryPath));
        if (subcategory) return subcategory.path;
    }

    return "";
}

function createCategoryButton(label, path, className, isActive) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.path = path;
    button.textContent = label;
    button.classList.toggle("active", isActive);
    return button;
}

function createSubcategorySelect(activeGroup) {
    const wrapper = document.createElement("label");
    wrapper.className = "category-subcategory-select";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Выберите подкатегорию");
    select.innerHTML = `<option value="${activeGroup.path}">Все подкатегории</option>`;

    activeGroup.subcategories.forEach(subcategory => {
        const option = document.createElement("option");
        option.value = subcategory.path;
        option.textContent = subcategory.label;
        option.selected = subcategory.path === activeCategoryPath;
        select.appendChild(option);
    });

    wrapper.appendChild(select);
    return wrapper;
}

function createGroupSelect(activeSubcategory) {
    const wrapper = document.createElement("label");
    wrapper.className = "category-group-select";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Выберите группу товаров");
    select.innerHTML = `<option value="${getSubcategoryAllPath(activeSubcategory.path)}">Все товары подкатегории</option>`;

    activeSubcategory.groups.forEach(productGroup => {
        const option = document.createElement("option");
        option.value = productGroup.path;
        option.textContent = productGroup.label;
        option.selected = productGroup.path === activeCategoryPath;
        select.appendChild(option);
    });

    wrapper.appendChild(select);
    return wrapper;
}

function renderCategoryControls() {
    if (!categoryControls) return;
    categoryControls.innerHTML = "";
    const groups = getCategoryFilterGroups();
    const activeMainPath = getActiveMainCategoryPath(groups);
    const activeSubcategoryPath = getActiveSubcategoryPath(groups);

    updateCatalogBreadcrumbs(groups);

    const mainList = document.createElement("div");
    mainList.className = "category-main-list";
    mainList.appendChild(createCategoryButton(
        "Все товары",
        "",
        "category-control category-all",
        !activeCategoryPath
    ));

    groups.forEach(group => {
        mainList.appendChild(createCategoryButton(
            group.label,
            group.path,
            "category-control level-0",
            group.path === activeMainPath
        ));
    });

    categoryControls.appendChild(mainList);

    const activeGroup = groups.find(group => group.path === activeMainPath);
    if (!activeGroup?.subcategories.length) {
        if (!activeCategoryPath) {
            const hint = document.createElement("p");
            hint.className = "category-subcategory-hint";
            hint.textContent = "Выберите категорию, чтобы увидеть подкатегории.";
            categoryControls.appendChild(hint);
        }
        return;
    }

    categoryControls.appendChild(createSubcategorySelect(activeGroup));

    const subcategoryList = document.createElement("div");
    subcategoryList.className = "category-subcategory-list";
    subcategoryList.classList.toggle("is-expanded", showAllSubcategories);

    const visibleSubcategories = showAllSubcategories
        ? activeGroup.subcategories
        : activeGroup.subcategories.slice(0, 24);
    const visibleActiveSubcategory = activeGroup.subcategories.find(subcategory => {
        return subcategory.path === activeCategoryPath
            || getSubcategoryAllPath(subcategory.path) === activeCategoryPath;
    });
    if (visibleActiveSubcategory && !visibleSubcategories.some(subcategory => subcategory.path === visibleActiveSubcategory.path)) {
        visibleSubcategories.push(visibleActiveSubcategory);
    }

    visibleSubcategories.forEach(subcategory => {
        subcategoryList.appendChild(createCategoryButton(
            subcategory.label,
            subcategory.path,
            "category-control level-1",
            subcategory.path === activeCategoryPath || getSubcategoryAllPath(subcategory.path) === activeCategoryPath
        ));
    });

    categoryControls.appendChild(subcategoryList);

    if (activeGroup.subcategories.length > visibleSubcategories.length || showAllSubcategories) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "subcategory-toggle";
        toggle.textContent = showAllSubcategories ? "Свернуть" : "Показать все подкатегории";
        toggle.setAttribute("aria-expanded", String(showAllSubcategories));
        categoryControls.appendChild(toggle);
    }

    const activeSubcategory = activeGroup.subcategories.find(subcategory => subcategory.path === activeSubcategoryPath);
    if (!activeSubcategory?.groups.length) return;

    categoryControls.appendChild(createGroupSelect(activeSubcategory));

    const groupList = document.createElement("div");
    groupList.className = "category-group-list";
    groupList.classList.toggle("is-expanded", showAllGroups);
    groupList.appendChild(createCategoryButton(
        "Все товары подкатегории",
        getSubcategoryAllPath(activeSubcategory.path),
        "category-control level-2 category-group-all",
        activeCategoryPath === getSubcategoryAllPath(activeSubcategory.path)
    ));

    const visibleGroups = showAllGroups
        ? activeSubcategory.groups
        : activeSubcategory.groups.slice(0, 24);
    const activeProductGroup = activeSubcategory.groups.find(productGroup => productGroup.path === activeCategoryPath);
    if (activeProductGroup && !visibleGroups.some(productGroup => productGroup.path === activeProductGroup.path)) {
        visibleGroups.push(activeProductGroup);
    }

    visibleGroups.forEach(productGroup => {
        groupList.appendChild(createCategoryButton(
            productGroup.label,
            productGroup.path,
            "category-control level-2",
            productGroup.path === activeCategoryPath
        ));
    });

    categoryControls.appendChild(groupList);

    if (activeSubcategory.groups.length > visibleGroups.length || showAllGroups) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "group-toggle";
        toggle.textContent = showAllGroups ? "Свернуть" : "Показать все группы";
        toggle.setAttribute("aria-expanded", String(showAllGroups));
        categoryControls.appendChild(toggle);
    }
}

function getQtyControls(id, qty) {
    return `
        <div class="qty-row">
            <button class="qty minus" data-id="${id}" type="button" aria-label="Уменьшить количество">−</button>
            <input class="qty-input" data-id="${id}" type="text" inputmode="numeric" pattern="[0-9]*" value="${qty}" style="width: ${getQtyInputWidth(qty)}px;" aria-label="Количество">
            <button class="qty plus" data-id="${id}" type="button" aria-label="Увеличить количество">+</button>
        </div>
    `;
}

function getQtyInputWidth(value) {
    const length = String(value || "").length || 1;
    return Math.min(84, Math.max(44, length * 10 + 24));
}

function resizeQtyInput(input) {
    if (!input) return;
    input.style.width = `${getQtyInputWidth(input.value)}px`;
}

function renderCart() {
    cartItemsEl.innerHTML = "";
    clearCartBtn?.toggleAttribute("disabled", !cart.length);

    if (!cart.length) {
        clearCartConfirm?.classList.add("hidden");
        cartItemsEl.innerHTML = `<p class="empty-cart">Корзина пока пустая</p>`;
        updateCartSummary();
        return;
    }

    cart = cart.filter(item => getProductById(item.productId));
    if (!cart.length) {
        saveCart();
        clearCartConfirm?.classList.add("hidden");
        cartItemsEl.innerHTML = `<p class="empty-cart">Корзина пока пустая</p>`;
        updateCartSummary();
        return;
    }

    const fragment = document.createDocumentFragment();

    cart.forEach(item => {
        const product = getProductById(item.productId);
        const qty = Number(item.quantity) || 0;
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div>
                <b>${cleanDisplayText(product.name)}</b>
                <span>${formatPrice(product.price)} / ${product.unit}</span>
            </div>
            ${getQtyControls(item.productId, qty, true)}
        `;
        fragment.appendChild(row);
    });

    saveCart();
    cartItemsEl.appendChild(fragment);
    updateCartSummary();
}

function handleQtyClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isInteger(id)) return;

    const current = getCartItemQty(id);

    if (button.classList.contains("add") || button.classList.contains("plus")) {
        setProductQty(id, clampProductQty(current + 1));
    }

    if (button.classList.contains("minus")) {
        setProductQty(id, clampProductQty(current - 1));
    }
}

function handleQtyInput(event) {
    const input = event.target.closest(".qty-input");
    if (!input) return;

    const id = Number(input.dataset.id);
    if (!Number.isInteger(id)) return;

    const sanitizedValue = sanitizeQtyInputValue(input.value);
    if (input.value !== sanitizedValue) {
        input.value = sanitizedValue;
    }
    resizeQtyInput(input);
    if (!sanitizedValue) return;

    const nextQty = clampProductQty(sanitizedValue);
    if (String(nextQty) !== sanitizedValue) {
        input.value = String(nextQty);
        resizeQtyInput(input);
    }

    setProductQty(id, nextQty, {
        renderCartView: false,
        renderSearchView: false,
        renderProductViews: false
    });
}

function commitQtyInput(event) {
    const input = event.target.closest(".qty-input");
    if (!input) return;

    const id = Number(input.dataset.id);
    if (!Number.isInteger(id)) return;

    const nextQty = clampProductQty(sanitizeQtyInputValue(input.value));
    input.value = nextQty ? String(nextQty) : "";
    resizeQtyInput(input);
    setProductQty(id, nextQty);
}

grid?.addEventListener("click", async event => {
    const loadMoreButton = event.target.closest("[data-public-load-more]");
    if (!loadMoreButton) return;
    event.preventDefault();
    if (publicProductsLoadingMore) return;

    publicProductsLoadingMore = true;
    renderPublicCatalogPagination();
    try {
        const loaded = await loadPublicProducts({ append: true });
        if (loaded) {
            appendPublicCatalogCards();
        }
    } finally {
        publicProductsLoadingMore = false;
        renderPublicCatalogPagination();
    }
});
grid?.addEventListener("click", handleQtyClick);
featuredCatalogGrid?.addEventListener("click", handleQtyClick);
popularGrid?.addEventListener("click", handleQtyClick);
cartItemsEl.addEventListener("click", handleQtyClick);

grid?.addEventListener("input", handleQtyInput);
featuredCatalogGrid?.addEventListener("input", handleQtyInput);
popularGrid?.addEventListener("input", handleQtyInput);
cartItemsEl.addEventListener("input", handleQtyInput);

grid?.addEventListener("change", commitQtyInput);
featuredCatalogGrid?.addEventListener("change", commitQtyInput);
popularGrid?.addEventListener("change", commitQtyInput);
cartItemsEl.addEventListener("change", commitQtyInput);

grid?.addEventListener("blur", commitQtyInput, true);
featuredCatalogGrid?.addEventListener("blur", commitQtyInput, true);
popularGrid?.addEventListener("blur", commitQtyInput, true);
cartItemsEl.addEventListener("blur", commitQtyInput, true);

function scrollPopularProducts(direction) {
    if (!popularGrid) return;
    popularGrid.scrollBy({
        left: direction * 235,
        behavior: "smooth"
    });
}

popularArrowLeft?.addEventListener("click", () => {
    scrollPopularProducts(-1);
});

popularArrowRight?.addEventListener("click", () => {
    scrollPopularProducts(1);
});

managerPhoneAction?.addEventListener("mouseenter", () => {
    managerPhoneAction.classList.add("is-phone-visible");
});

copyManagerPhoneBtn?.addEventListener("click", event => {
    event.stopPropagation();
    const phone = copyManagerPhoneBtn.dataset.phone || copyManagerPhoneBtn.textContent.trim();

    copyTextToClipboard(phone).then(() => {
        copyManagerPhoneBtn.textContent = "Скопировано";
        window.setTimeout(() => {
            copyManagerPhoneBtn.textContent = phone;
            managerPhoneAction?.classList.remove("is-phone-visible");
        }, 1200);
    });
});

downloadPublicPriceBtn?.addEventListener("click", downloadPublicPrice);

document.addEventListener("click", event => {
    if (!managerPhoneAction?.classList.contains("is-phone-visible")) return;
    if (managerPhoneAction.contains(event.target)) return;

    managerPhoneAction.classList.remove("is-phone-visible");
});

cartContainer?.addEventListener("mouseenter", showCartPreview);
cartContainer?.addEventListener("mouseleave", hideCartPreview);
cartContainer?.addEventListener("focusin", showCartPreview);
cartContainer?.addEventListener("focusout", event => {
    if (!cartContainer.contains(event.relatedTarget)) {
        hideCartPreview();
    }
});

cartBtn.addEventListener("pointerdown", () => {
    cartPreviewWasOpenOnPointerDown = Boolean(cartPreview && !cartPreview.classList.contains("hidden"));
});

cartBtn.addEventListener("click", event => {
    event.stopPropagation();
    cartModal.classList.toggle("hidden");
    if (isCartModalOpen()) {
        hideCartPreview();
    } else {
        toggleCartPreview();
    }
    showCartView();
    renderCart();
});

closeCartBtn.addEventListener("click", () => {
    cartModal.classList.add("hidden");
});

closeCartPreviewBtn?.addEventListener("click", event => {
    event.stopPropagation();
    hideCartPreview();
});

clearCartBtn?.addEventListener("click", () => {
    if (!cart.length) return;
    clearCartConfirm?.classList.remove("hidden");
});

cancelClearCartBtn?.addEventListener("click", () => {
    clearCartConfirm?.classList.add("hidden");
});

confirmClearCartBtn?.addEventListener("click", () => {
    cart = [];
    saveCart();
    updateCartSummary();
    renderCart();
    renderProducts();
    renderPopularProducts();
    if (searchInput?.value.trim()) {
        renderSearchDropdown();
    }
});

openCheckoutBtn?.addEventListener("click", () => {
    hideCartPreview();
    showCheckoutForm();
});

checkoutFromPreviewBtn?.addEventListener("click", event => {
    event.stopPropagation();
    if (!cart.length) return;

    hideCartPreview();
    cartModal.classList.remove("hidden");
    showCheckoutForm();
});

cancelCheckoutBtn?.addEventListener("click", () => {
    showCartView();
    renderCart();
});

checkoutForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearCheckoutMessage();

    if (checkoutNameInput) {
        saveCheckoutValue(checkoutStorage.names, checkoutNameInput.value);
    }

    if (checkoutPhoneInput) {
        checkoutPhoneInput.value = formatRussianPhone(checkoutPhoneInput.value);
        saveCheckoutValue(
            checkoutStorage.phones,
            checkoutPhoneInput.value,
            normalizePhoneHistoryValue
        );
    }

    if (checkoutAddressInput) {
        saveCheckoutValue(
            checkoutStorage.addresses,
            checkoutAddressInput.value,
            normalizeAddressHistoryValue
        );
    }

    updateCheckoutSuggestions();

    const customerName = cleanDisplayText(checkoutNameInput?.value);
    const phone = formatRussianPhone(checkoutPhoneInput?.value);
    const orderItems = getCartOrderItems();

    if (!customerName) {
        showCheckoutError("Укажите имя клиента.");
        return;
    }

    if (!getRussianPhoneDigits(phone)) {
        showCheckoutError("Укажите телефон клиента.");
        return;
    }

    if (!orderItems.length) {
        showCheckoutError("Корзина пуста. Добавьте товары перед оформлением заказа.");
        return;
    }

    const formData = new FormData(checkoutForm);
    const payload = {
        customerName,
        phone,
        preferredContactMethod: cleanDisplayText(formData.get("preferredContactMethod")),
        address: cleanDisplayText(formData.get("deliveryAddress")),
        unloading: getUnloadingLabel(formData.get("unloading")),
        paymentMethod: cleanDisplayText(formData.get("paymentMethod")),
        comment: cleanDisplayText(formData.get("orderComment")),
        items: orderItems,
        totalPrice: getCartTotal(),
        totalWeight: getCartWeight()
    };

    setCheckoutSubmitDisabled(true);

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await (window.MatMixErrors?.readJson(response) || response.json().catch(() => ({})));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заказ не сохранился. Попробуйте еще раз.");
        }

        showCheckoutSuccess();
        cart = [];
        saveCart();
        updateCartSummary();
        hideCartPreview();
        renderProducts();
        renderPopularProducts();
        renderCart();
        checkoutForm.reset();
        if (checkoutPhoneInput) {
            checkoutPhoneInput.value = formatRussianPhone(checkoutPhoneInput.value);
        }
        resizeCheckoutComment();

        window.setTimeout(() => {
            cartModal.classList.add("hidden");
            showCartView();
        }, 1800);
    } catch (error) {
        showCheckoutError(getCheckoutErrorMessage(error));
        setCheckoutSubmitDisabled(false);
    }
});

cartModal.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("mousedown", event => {
    documentMouseDownStartedInsideCheckout = Boolean(event.target.closest("#cartModal, #cartBtn, .cart, .header-search, .search-dropdown"));
});

document.addEventListener("click", event => {
    if (event.target.closest("#cartModal, #cartBtn, .cart, .header-search, .search-dropdown")) {
        documentMouseDownStartedInsideCheckout = false;
        return;
    }

    if (documentMouseDownStartedInsideCheckout) {
        documentMouseDownStartedInsideCheckout = false;
        return;
    }

    cartModal.classList.add("hidden");
    hideCartPreview();
    showCartView();
    closeSearchSuggestions({ clearQuery: false, cancelRequest: true });
    closeMenu();
    documentMouseDownStartedInsideCheckout = false;
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        hideCartPreview();
        closeSearchSuggestions({ clearQuery: false, cancelRequest: true });
    }
});

function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.classList.remove("is-open");
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
}

function shouldJumpToAnchor(href) {
    return ["#contacts", "#top"].includes(href) && Boolean(document.querySelector(".catalog-page"));
}

function scrollToPageAnchor(href, options = {}) {
    if (!href?.startsWith("#")) return false;

    const target = document.getElementById(href.slice(1));
    if (!target) return false;

    const behavior = options.behavior || (shouldJumpToAnchor(href) ? "auto" : "smooth");
    target.scrollIntoView({ behavior, block: "start" });
    history.pushState(null, "", href);
    return true;
}

menuToggle?.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

mainNav?.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;

    if (scrollToPageAnchor(link.getAttribute("href"))) {
        event.preventDefault();
        closeMenu();
        return;
    }

    closeMenu();
});

document.querySelector(".logo")?.addEventListener("click", event => {
    if (scrollToPageAnchor(event.currentTarget.getAttribute("href"))) {
        event.preventDefault();
    }
});

searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    scheduleSearchSuggestionsLoad();
});

searchInput?.addEventListener("focus", () => {
    if (getPublicSearchQuery().length >= SEARCH_SUGGESTION_MIN_LENGTH && !searchSuggestions.length) {
        scheduleSearchSuggestionsLoad();
        return;
    }

    renderSearchDropdown();
});

searchInput?.addEventListener("keydown", event => {
    if (searchDropdown.classList.contains("hidden")) return;
    const itemCount = searchSuggestions.length;

    if (event.key === "Escape") {
        event.preventDefault();
        closeSearchSuggestions({ clearQuery: false, cancelRequest: true });
        return;
    }

    if (!itemCount) return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        activeSearchSuggestionIndex = (activeSearchSuggestionIndex + 1) % itemCount;
        updateActiveSearchSuggestion();
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        activeSearchSuggestionIndex = activeSearchSuggestionIndex <= 0
            ? itemCount - 1
            : activeSearchSuggestionIndex - 1;
        updateActiveSearchSuggestion();
        return;
    }

    if (event.key === "Enter" && activeSearchSuggestionIndex >= 0) {
        event.preventDefault();
        const product = searchSuggestions[activeSearchSuggestionIndex];
        if (product) selectSearchSuggestion(product.id);
    }
});

headerSearch?.addEventListener("click", event => {
    event.stopPropagation();
});

searchDropdown.addEventListener("click", event => {
    event.stopPropagation();
    const resultButton = event.target.closest("[data-search-product]");
    if (resultButton) {
        selectSearchSuggestion(resultButton.dataset.searchProduct);
        return;
    }

    handleQtyClick(event);
});

searchDropdown.addEventListener("input", event => {
    handleQtyInput(event);
});

searchDropdown.addEventListener("change", commitQtyInput);
searchDropdown.addEventListener("blur", commitQtyInput, true);

categoryControls?.addEventListener("click", async event => {
    const toggle = event.target.closest(".subcategory-toggle");
    if (toggle) {
        showAllSubcategories = !showAllSubcategories;
        renderCategoryControls();
        return;
    }

    const groupToggle = event.target.closest(".group-toggle");
    if (groupToggle) {
        showAllGroups = !showAllGroups;
        renderCategoryControls();
        return;
    }

    const button = event.target.closest(".category-control");
    if (!button) return;
    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });

    const nextPath = button.dataset.path || "";
    if (!nextPath || nextPath.startsWith("category:")) {
        showAllSubcategories = false;
        showAllGroups = false;
    } else if (nextPath.startsWith("subcategory:")) {
        showAllGroups = false;
    }

    activeCategoryPath = nextPath;
    showAllCatalogProducts = !activeCategoryPath;
    await replacePublicProductsAndRender();
});

categoryControls?.addEventListener("change", async event => {
    const select = event.target.closest(".category-subcategory-select select, .category-group-select select");
    if (!select) return;
    closeSearchSuggestions({ clearQuery: true, cancelRequest: true });

    activeCategoryPath = select.value || "";
    showAllCatalogProducts = false;
    if (activeCategoryPath.startsWith("subcategory:")) {
        showAllGroups = false;
    }
    await replacePublicProductsAndRender();
});

searchInput?.form?.addEventListener("submit", event => {
    event.preventDefault();
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
        closeMenu();
    }
});

const searchParams = new URLSearchParams(window.location.search);
const initialSearchQuery = searchParams.get("search");

if (initialSearchQuery && searchInput) {
    searchInput.value = initialSearchQuery;
    searchQuery = initialSearchQuery;
}

async function initializeSite() {
    products = products.map(normalizeProductForSite);
    rebuildProductsIndex();
    cart = loadCart();
    await loadPublicCatalogStructure();
    await loadPublicProducts();
    await loadPopularProducts();
    renderCategoryControls();
    renderProducts();
    renderPopularProducts();
    setupCheckoutFormFields();
    updateCartSummary();
    if (getPublicSearchQuery().length >= SEARCH_SUGGESTION_MIN_LENGTH) {
        scheduleSearchSuggestionsLoad();
    }
}

initializeSite();
