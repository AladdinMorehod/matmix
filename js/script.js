const catalog = {
    "Черновые материалы": {
        "Смеси": ["цемент", "штукатурка", "шпаклёвка", "наливной пол"],
        "Гидроизоляция": [],
        "Грунтовки": []
    },
    "Стеновые материалы": {
        "Блоки и кирпич": ["газобетон", "кирпич"],
        "ГКЛ системы": ["гипсокартон", "профили"],
        "ПГП": []
    },
    "Сантехника": {
        "Водоснабжение": ["трубы", "фитинги"],
        "Канализация": [],
        "Смесители": []
    },
    "Электрика": {
        "Кабель": [],
        "Автоматика": ["автоматы", "УЗО"],
        "Розетки": []
    },
    "Отделка": {
        "Обои": [],
        "Плитка": ["керамогранит", "керамическая"],
        "Полы": ["ламинат", "линолеум"]
    }
};

const categoryRules = [
    { path: ["Черновые материалы", "Смеси", "цемент"], words: ["цемент"] },
    { path: ["Черновые материалы", "Смеси", "штукатурка"], words: ["штукатур"] },
    { path: ["Черновые материалы", "Смеси", "шпаклёвка"], words: ["шпакл", "шпатл"] },
    { path: ["Черновые материалы", "Смеси", "наливной пол"], words: ["налив"] },
    { path: ["Черновые материалы", "Грунтовки"], words: ["грунт", "тифенгрунд", "ct-17"] },
    { path: ["Черновые материалы", "Гидроизоляция"], words: ["гидроизоля", "гидро"] },
    { path: ["Стеновые материалы", "Блоки и кирпич", "газобетон"], words: ["газобетон", "блок d", "блок"] },
    { path: ["Стеновые материалы", "Блоки и кирпич", "кирпич"], words: ["кирпич"] },
    { path: ["Стеновые материалы", "ГКЛ системы", "гипсокартон"], words: ["гипсокартон", "гкл"] },
    { path: ["Стеновые материалы", "ГКЛ системы", "профили"], words: ["профиль", "профили"] },
    { path: ["Стеновые материалы", "ПГП"], words: ["пгп", "пазогреб"] },
    { path: ["Сантехника", "Водоснабжение", "трубы"], words: ["труба", "rehau", "stout", "valtec", "пп", "fv"] },
    { path: ["Сантехника", "Водоснабжение", "фитинги"], words: ["фитинг", "муфта", "угольник", "тройник", "коллектор"] },
    { path: ["Сантехника", "Канализация"], words: ["канализац"] },
    { path: ["Сантехника", "Смесители"], words: ["смесител"] },
    { path: ["Электрика", "Кабель"], words: ["кабель", "провод"] },
    { path: ["Электрика", "Автоматика", "автоматы"], words: ["автомат"] },
    { path: ["Электрика", "Автоматика", "УЗО"], words: ["узо"] },
    { path: ["Электрика", "Розетки"], words: ["розет", "выключател", "legrand"] },
    { path: ["Отделка", "Плитка", "керамогранит"], words: ["керамогранит"] },
    { path: ["Отделка", "Плитка", "керамическая"], words: ["плитка", "мозаик"] },
    { path: ["Отделка", "Полы", "ламинат"], words: ["ламинат"] },
    { path: ["Отделка", "Полы", "линолеум"], words: ["линолеум"] },
    { path: ["Отделка", "Обои"], words: ["обои"] }
];

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
const products = [
    {
        "name": "Штукатурка гипсовая Knauf Ротбанд 5 кг",
        "price": 220,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Knauf Ротбанд 30 кг",
        "price": 460,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Knauf МП-75 маш. 30 кг",
        "price": 420,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг",
        "price": 388,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Слой Бел. 30 кг",
        "price": 448,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Гипс Актив мех. Сер. 30 кг",
        "price": 380,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая ВОЛМА Гипс Актив мех. Бел. 30 кг",
        "price": 410,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая UNIS Теплон белая 30 кг",
        "price": 400,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсовая Старатели 30 кг",
        "price": 398,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка гипсово-цементная Старатели Оптимум серая универсальная мех. 30 кг",
        "price": 425,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Цементум 25 кг",
        "price": 345,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурка цементная Knauf Унтерпутц 25 кг",
        "price": 360,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Штукатурная смесь цементная Русеан М-150 40кг",
        "price": 350,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кладочно - монтажная смесь цементная Русеан М-200 40кг",
        "price": 340,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кладочно - монтажная смесь цементная Вертекс М-200 40кг",
        "price": 230,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка готовая Danogips SuperFinish (Шитрок) 5 кг",
        "price": 580,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка готовая Danogips SuperFinish (Шитрок) 28 кг",
        "price": 2350,
        "unit": "шт",
        "weight": 28,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка готовая финишная Knauf Ротбанд паста Профи 5 кг",
        "price": 710,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка готовая финишная Knauf Ротбанд паста Профи 18 кг",
        "price": 1480,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit LR+ 20 кг",
        "price": 850,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка Vetonit VH для влажных помещений белая 20 кг",
        "price": 715,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Ротбанд Финиш 25 кг",
        "price": 630,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Унифлот 5 кг",
        "price": 1600,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Унифлот 25 кг",
        "price": 4700,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Фуген 25 кг",
        "price": 640,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Knauf Фуген 5 кг",
        "price": 250,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая высокопрочная Knauf Унихард 20 кг",
        "price": 1250,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка полимерная финишная Knauf Polymer finish 20 кг",
        "price": 730,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпатлевка полимерная финишная Основит Элисилк РА39 W 28 кг",
        "price": null,
        "unit": "шт",
        "weight": 28,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Старатели базовая 20 кг",
        "price": 380,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая Старатели финишная 20 кг",
        "price": 470,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 5 кг",
        "price": 800,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка гипсовая финишная, заполняющая Full+Finish Pufas / Пуфас 20 кг",
        "price": 2450,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка цементная базовая Старатели 20 кг",
        "price": 380,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка цементная фасадно финишная Старатели 20 кг",
        "price": 595,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шпаклевка по дереву VGT Белая 1 кг",
        "price": 380,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзит фр. 5-20 (0,02 куб.м) 20л",
        "price": 110,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзит фр. 10-30 (0,03 куб.м) 30л",
        "price": 95,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Керамзитовая засыпка фракция до 5 мм (0,04 куб.м) 40л",
        "price": 195,
        "unit": "шт",
        "weight": 17,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Клей для плитки Knauf Флизен, 25 кг",
        "price": 378,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Knauf Флизен ПЛЮС, 25 кг",
        "price": 510,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки и керамогранита Ceresit CM 11 PRO, 25 кг",
        "price": 495,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки, керамогранита и камня Ceresit СМ 14 сер. 25 кг",
        "price": 690,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки, керамогранита и камня Ceresit СМ 16 сер. 25 кг",
        "price": 1200,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К80, 25 кг",
        "price": 980,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К55, 25 кг",
        "price": 1250,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Litokol К47, 25 кг",
        "price": 390,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для плитки Unis Плюс 25 кг",
        "price": 450,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для теплоизоляции Knauf Севенер 25 кг",
        "price": 850,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей монтажный Knauf Перлфикс 30 кг",
        "price": 510,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей Волма Монтаж для ПГП 30кг",
        "price": 460,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Русеан 25кг",
        "price": 280,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Волма 25кг",
        "price": 410,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Евро 25кг",
        "price": 250,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для Блока Цементум 25кг Зимний",
        "price": 330,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стеклохолста Pufas 10кг",
        "price": 1800,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стеклохолста Oscar 10кг",
        "price": 2380,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для фанеры и линолеума КС 15кг",
        "price": 1100,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для швов линолеума холодная сварка Sintex H-4",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер СТК 1 л",
        "price": 198,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА Супер Новгородский 2,8 л",
        "price": 810,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 1 л",
        "price": 198,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 5 л",
        "price": 450,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей ПВА 10 л",
        "price": 860,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
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
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для стекло и флизелиновых обоев Kleo Ultra 50 500г",
        "price": 1100,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для всех видов флизелиновых обоев Kleo Extra, 240 г (35м2)",
        "price": 450,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для виниловых обоев Quelyd Спец-винил 450 гр (40м2)",
        "price": 580,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Клей для флизелиновых обоев Quelyd Спец-флизелин 300 гр (40м2)",
        "price": 490,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Клей",
            "section": "",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Наливной пол \"Unis Горизонт\" 20 кг",
        "price": 330,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол \"Старатели\" Быстрый 20 кг",
        "price": 345,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол Волма Нивелир Экспресс 25 кг",
        "price": 380,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол финишный Weber Vetonit 3000 самовыравнивающийся 20 кг",
        "price": 1050,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол универсальный Weber Vetonit fast 4000 20 кг",
        "price": 480,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол финишный Vetonit 4100 высокопрочный 20 кг",
        "price": 910,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол первичный Weber Vetonit 5000 быстротвердеющий 25 кг",
        "price": 980,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол универсальный Litokol Litoliv S50 самовыравнивающийся 20 кг",
        "price": 390,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Наливной пол Основит Скорлайн FK45R самовыравнивающийся 20 кг",
        "price": 470,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Огнебиозащита СТК для дерева 10 л",
        "price": 450,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция Knauf Флэхендихт 5 кг",
        "price": 1900,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция полимерная СТК 5кг",
        "price": 1350,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Гидроизоляция Ceresit CR 65 20 кг",
        "price": 1450,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гидроизоляция обмазочная Глимс (Glims) водостоп 18 кг",
        "price": 1320,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон (ЦПС) М300 Русеан 40 кг",
        "price": 335,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон Tex Pro М-300 ГОСТ 40 кг",
        "price": 215,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Пескобетон Евро М-300 ГОСТ 40кг",
        "price": 235,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цемент \"Цементум\" 40кг",
        "price": 475,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Цемент \"РосЦемент\" 50кг",
        "price": 490,
        "unit": "шт",
        "weight": 50,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Песок в мешке 40 кг",
        "price": 95,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Смеси",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Алебастр 5 кг",
        "price": 150,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Алебастр 20 кг",
        "price": 280,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Жидкое стекло 5 л",
        "price": 490,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Ведро",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
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
            "main": "Ведро",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Антиплесень СТК 1л",
        "price": 320,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Антиплесень СТК 5л",
        "price": 550,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Антиплесень Ceresit СТ 99 1 л",
        "price": 650,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Антисептик пропитка для дерева СТК 10л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Добавка противоморозная СТК Профи 10 л",
        "price": 385,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Knauf Бетогрунд 5 кг",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Knauf Бетогрунд 15 кг",
        "price": 1880,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Ceresit CT 19, 5 кг",
        "price": 750,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Ceresit CT 19, 15 кг",
        "price": 2100,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Cтаратели 20 кг",
        "price": 2400,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Евро (5 кг)",
        "price": 650,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Евро (10 кг)",
        "price": 1200,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт Евро (20 кг)",
        "price": 1980,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Бетонконтакт REAL (20 кг)",
        "price": 1450,
        "unit": "шт",
        "weight": 20,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд 5 л",
        "price": 730,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд 10 л",
        "price": 1050,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Knauf Мульти Грунд универсальный 10 л",
        "price": 1650,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л",
        "price": 3200,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунт Litokol PRIMER A универсальный укрепляющий 10 л",
        "price": 750,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Старатели универсальная 10 л",
        "price": 650,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка UNIS глубокого проникновения укрепляющий 10 л",
        "price": 850,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Oscar глубокого проникновения 10 л",
        "price": 950,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Ceresit CT-17 PRO, 5л",
        "price": 690,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Ceresit CT-17 PRO, 10л",
        "price": 1050,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Ceresit CT16 под декоративную штукатурку 10 л",
        "price": null,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Акрил 5 л",
        "price": 300,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Грунтовка Акрил 10 л",
        "price": 480,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Пластификатор для цементных растворов и бетона, 5 л",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Пластификатор для цементных растворов и бетона, 10 л",
        "price": 380,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Ведро",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Ацетон 1 л",
        "price": 190,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Уайт - спирит 1 л",
        "price": 220,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Обезжириватель 1л",
        "price": 355,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Расстворитель 646, 1 л",
        "price": 230,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Грунт ГФ-021 по металлу и дереву серый 0,8 кг",
        "price": 385,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Грунт по металлу серый 1 л",
        "price": 850,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Грунт Tikkurila Euro Primer концентрат 0,9 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Грунт Tikkurila Euro Primer концентрат 3 л",
        "price": null,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска по дереву белая 1 л",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска - Грунт 3 в 1 по металлу белая 1 л",
        "price": 750,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска - Грунт Slaven 3 в 1 по металлу светло-серый 1 л",
        "price": 850,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная без запаха 1 л",
        "price": 1100,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная Аэрозоль баллон белая мат. 330 мл",
        "price": 350,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска радиаторная Аэрозоль баллон черная мат. 330 мл",
        "price": 395,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска моющаяся Dulux Ultra Resist кухня и ванная база BW белая 2,5 л",
        "price": 3500,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка СТК Белоснежная латексная, моющаяся и износостойкая 10 л, шелковисто-матовая",
        "price": 2600,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска фасадная акриловая FASSADENFARBE супербелая 14 кг",
        "price": 2600,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска фасадная акриловая Colorika Aqua белая мат. 14 кг",
        "price": 4500,
        "unit": "шт",
        "weight": 14,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска акриловая для стен и потолка Colorika (влажная уборка), супербелая 3 л",
        "price": 1300,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска акриловая для стен и потолка Colorika (влажная уборка), супербелая 10 л",
        "price": 3800,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Colorika моющаяся, супербелая 3 л",
        "price": 1700,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка Colorika моющаяся, супербелая 10 л",
        "price": 4500,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка моющаяся Dufa Premium KeraLine Keramik Paint 7 база А матовая белая 2,5 л",
        "price": 1870,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) белая основа BW 4,5 л, глубокоматовая",
        "price": 2750,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 2 (влажная уборка) белая основа BW 9 л, глубокоматовая",
        "price": 3900,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска ВД для стен и потолка латексная Marshall Export 7 моющаяся белая основа BW 9 л, матовая",
        "price": 4850,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая 0,75 л (10м2)",
        "price": null,
        "unit": "шт",
        "weight": 0.75,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая 2,5 л (32м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EJDER YARIMAT особопрочная моющаяся шелковисто-матовая 9 л (115м2)",
        "price": 14300,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
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
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint EXTRA KIVI Шелковисто-матовая высокоэффективная (А) 9 л (112м2)",
        "price": 12150,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая 0,75 л (10м2)",
        "price": null,
        "unit": "шт",
        "weight": 0.75,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая 2,5 л (32м2)",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Краска для стен и потолков Europaint SEN Shen tam mat особопрочная моющаяся глубокоматовая 9 л (115м2)",
        "price": 8550,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Краска",
            "section": "Грунтовки, растворители и краски",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Блок D500 50х250х600 мм",
        "price": 70,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 75х250х600 мм",
        "price": 80,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 100х250х600 мм",
        "price": 98,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 120х250х600 мм",
        "price": 145,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 150х250х600 мм",
        "price": 150,
        "unit": "шт",
        "weight": 15.5,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 200х250х600 мм",
        "price": 200,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 200х300х600 мм",
        "price": 235,
        "unit": "шт",
        "weight": 23,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Блок D500 300х250х600 мм",
        "price": 295,
        "unit": "шт",
        "weight": 32,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "Кирпич рядовой полнотелый 250х120х65 мм М150 А",
        "price": 23.8,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая Knauf 667х500х 80 мм",
        "price": 350,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая 667х500х 80 мм",
        "price": 340,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая 667х500х 80 мм",
        "price": 298,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП полнотелая 667х500х 100 мм",
        "price": 410,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Блок",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Б"
    },
    {
        "name": "ПГП влагостойкая полнотелая 667х500х100 мм",
        "price": 450,
        "unit": "шт",
        "weight": 40,
        "category": {
            "main": "Блок",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГВЛ Knauf 2500х1200х10 мм",
        "price": 765,
        "unit": "шт",
        "weight": 37.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГВЛ Knauf 2500х1200х12,5 мм",
        "price": 880,
        "unit": "шт",
        "weight": 44,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2000х1200х9,5 мм",
        "price": 325,
        "unit": "шт",
        "weight": 15.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2500х1200х9,5 мм",
        "price": 350,
        "unit": "шт",
        "weight": 19.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2000х1200х12,5 мм",
        "price": 330,
        "unit": "шт",
        "weight": 20.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Knauf 2500х1200х12,5 мм",
        "price": 395,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2500х1200х9,5 мм",
        "price": 468,
        "unit": "шт",
        "weight": 18,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2000х1200х12,5 мм",
        "price": 435,
        "unit": "шт",
        "weight": 22,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛВ Knauf 2500х1200х12,5 мм",
        "price": 485,
        "unit": "шт",
        "weight": 27,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир Хоум 2000х1200х10 мм",
        "price": 580,
        "unit": "шт",
        "weight": 24.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир 2000х1200х12,5 мм",
        "price": 695,
        "unit": "шт",
        "weight": 29,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf Сапфир 2500х1200х12,5 мм",
        "price": 810,
        "unit": "шт",
        "weight": 37.5,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Гипсокартон Knauf арочный (ремонтный) 2500х1200х6,5 мм",
        "price": 635,
        "unit": "шт",
        "weight": 18.9,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 27х28 мм 3 м",
        "price": 195,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 60х27 мм 3 м",
        "price": 270,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 60х27 мм 4 м",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 50х40 мм 3м",
        "price": 345,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 50х50 мм 3м",
        "price": 368,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 75х40 мм 3м",
        "price": 398,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 75х50 мм 3м",
        "price": 415,
        "unit": "шт",
        "weight": 2.2,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПН Knauf 100х40 мм 3м",
        "price": 465,
        "unit": "шт",
        "weight": 2.9,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Профиль ПС Knauf 100х50 мм 3м",
        "price": 485,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес прямой Knauf",
        "price": 23,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес прямой Knauf, удлиненный 460мм",
        "price": 38,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 0,35 м",
        "price": 38.5,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 0,5 м",
        "price": 47,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Подвес с зажимом Knauf 60*27 со спицей 1 м",
        "price": 68,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель - удлинитель Knauf 60х27",
        "price": 17,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель одноур. Краб Knauf 60х27 0.9 мм",
        "price": 33,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Соединитель двухуровневый Knauf 60х27 0.9 мм",
        "price": 25,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скоба для ПГП",
        "price": 23,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "ГКЛ Gyproc 2500х1200х12,5 мм",
        "price": 410,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Лист",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Металл",
            "section": "Перегородочные материалы",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Гидроизоляция Техноэласт ЭПП Технониколь 4 мм черный 10 кв.м",
        "price": 3800,
        "unit": "шт",
        "weight": 49.5,
        "category": {
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Гидроизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Звукоизоляция Шуманет Комби 5 мм 1х10 м",
        "price": 4850,
        "unit": "шт",
        "weight": 25,
        "category": {
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звуко - Гидроизоляция Шуманет 100 Гидро 5 мм 1х10 м",
        "price": 6300,
        "unit": "шт",
        "weight": 34,
        "category": {
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "З"
    },
    {
        "name": "Звукоизоляционная панель ЗИПС-III Ультра 43x600х1200 мм",
        "price": 2650,
        "unit": "шт",
        "weight": 18.4,
        "category": {
            "main": "Звукоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Лайт Баттс Скандик 50х600х800 мм 5,76 кв.м",
        "price": 1100,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Лайт Баттс Скандик 100х600х800 мм 2,88 кв.м",
        "price": 1150,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс 50х600х1000 мм 6 кв.м",
        "price": 2090,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Rockwool Акустик Баттс ПРО Ультратонкий 27х600х1000 мм 7,2 м2",
        "price": 2300,
        "unit": "шт",
        "weight": 12,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 3мм 1,2 х 22 м (26.4 м2)",
        "price": 1200,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 5мм 1,2 х 22 м (26.4 м2)",
        "price": 1300,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Утеплитель Пенофол фольгированный 10мм 1,2 х 12 м (14.4 м2)",
        "price": 1450,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 20x600x1200 мм 1л. (0.72 м2)",
        "price": 155,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 20x600x1200 мм 20л. (13.8 м2)",
        "price": 2990,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 30x600x1200 мм 1л. (0.72 м2)",
        "price": 230,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 30x600x1200 мм 13л. (9 м2)",
        "price": 2850,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 50х585х1185 мм 1л. (0.69м2)",
        "price": 345,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 50х585х1185 мм 7л. (4.85 м2)",
        "price": 2380,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 100х585х1185 мм 1л. (0.69 м2)",
        "price": 715,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пеноплэкс Комфорт 100х585х1185 мм 4л. (2.76 м2)",
        "price": 2700,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Подложка хвойная толщина 790х590х3мм 15л. (уп. 7 м2)",
        "price": 1950,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пароизоляция TEHNOVEK А 30 70 кв.м",
        "price": 1600,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пароизоляция TEHNOVEK B 30 70 кв.м",
        "price": 1200,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
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
            "main": "Теплоизоляция",
            "section": "Утеплитель и подложка",
            "type": ""
        },
        "image": "Т"
    },
    {
        "name": "Пистолет для герметика 1. Эконом",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для герметика 2. Премиум",
        "price": 1000,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 1. Эконом",
        "price": 380,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 2.",
        "price": 600,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Пистолет для монтажной пены 3. Премиум",
        "price": 1800,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная Tytan Uni 65",
        "price": 650,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная 750, летняя",
        "price": 550,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная 750, зимняя",
        "price": 580,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная 750, с трубочкой всесезонная -10\\+35",
        "price": 450,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Пена монтажная профессиональная, Огнеупорная",
        "price": 750,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена Kudo для блоков под пистолет PROF 28+",
        "price": 630,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена универсальная проф. Tytan Professional 60 секунд 750 мл",
        "price": 780,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей - Пена универсальная REFIT 14 профессиональная всесезонная",
        "price": 650,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель монтажной пены",
        "price": 170,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель силиконового герметика Kudo аэрозоль 150 мл",
        "price": 650,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Очиститель эпоксидной затирки Litokol Litonet Gel Evo 0,75л",
        "price": 1650,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка для канализационных труб",
        "price": 250,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Смазка для канализационных труб Ostendorf 500 г",
        "price": 595,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Расходники",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Герметик акриловый санитарный Irfix белый 280 мл",
        "price": 450,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный AVG белый 280 мл",
        "price": 700,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный Kim Tech белый 280 мл",
        "price": 550,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик силиконовый санитарный Kim Tech прозрачный 280 мл",
        "price": 550,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик акриловый морозостойкий Kim Tech белый 420 мл",
        "price": 450,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Герметик звукоизоляционный Вибросил 290мл",
        "price": 680,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный каучуковый Titebond Heavy Duty Сверхсильный светло-коричневый 296 мл",
        "price": 550,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей монтажный каучуковый Tytan Classic Fix прозрачный 310 мл",
        "price": 550,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей Суперклей универсальный Akfix 705 двухкомпонентный, цианакрилатный с активатором, прозрачный 200 мл + 50 г",
        "price": 350,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Клей Суперклей универсальный Akfix 705 двухкомпонентный, цианакрилатный с активатором, прозрачный 400 мл + 100 г",
        "price": 530,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент, прозрачный 270мл",
        "price": 470,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент, белый 290мл",
        "price": 380,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент акрил. Монтаж Экспресс MB-50, белый 290мл",
        "price": 370,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
            "type": ""
        },
        "image": "Г"
    },
    {
        "name": "Жидкие гвозди Момент акрил. Монтаж Суперсильный Плюс MB-100, белый 310мл",
        "price": 380,
        "unit": "шт",
        "weight": 0.32,
        "category": {
            "main": "Гермет",
            "section": "Пены и клеи",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 10мм А500С А3 ПИЛИТЬ",
        "price": 48,
        "unit": "м",
        "weight": 0.8,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 12мм А500С А3 ПИЛИТЬ",
        "price": 65,
        "unit": "м",
        "weight": 1.13,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 14мм А500С А3 ПИЛИТЬ",
        "price": 86,
        "unit": "м",
        "weight": 1.6,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Арматура 16мм А500С А3 ПИЛИТЬ",
        "price": null,
        "unit": "м",
        "weight": 1.85,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "main": "Композ",
            "section": "Металл",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 6 мм 3 м",
        "price": 55,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный Knauf 6 мм 3 м",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 6 мм 3 м усиленный",
        "price": 95,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк пластиковый 6 мм 3 м",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк пластиковый 10 мм 3 м",
        "price": 60,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 10 мм 3 м",
        "price": 70,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный Knauf 10 мм 3 м",
        "price": 185,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк оцинкованный 10 мм 3 м усиленный",
        "price": 110,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Маяк реперный пластиковый для наливного пола, 50 шт.",
        "price": 550,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Крепления для маячков 6 мм и 10 мм универс. (100 шт.) Металл",
        "price": 370,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Крепления для маячков 6 мм и 10 мм универс. (100 шт.) Пластик",
        "price": 370,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Проволока вязальная 1.2 мм",
        "price": 140,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка кладочная сварная в рулонах 25х25х1,3 мм 0,25х50 м, оцинкованная",
        "price": 2850,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка кладочная базальтовая 25х25х1,3 мм 0,25х50 м",
        "price": 1500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 2,5 мм 0,5 х 2,0м, 50х50мм",
        "price": 125,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3 мм 0,5 х 2,0м, 50х50мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.9,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3,5 мм 0,5 х 2,0м, 50х50мм",
        "price": 195,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 2,5 мм 1,5 х 2,0м, 100х100мм",
        "price": 215,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка карта 3 мм 1,5 х 2,0м, 100х100мм",
        "price": 230,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок алюминиевый малярный 20х20 3 м",
        "price": 70,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок оцинкованный перфорированный 22х22",
        "price": 55,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок оцинкованный перфорированный Knauf 31х31 мм 3 м 0,60 мм",
        "price": 310,
        "unit": "шт",
        "weight": 0.31,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 32х32х3мм ПИЛИТЬ",
        "price": 150,
        "unit": "м",
        "weight": 3,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 40х40х3мм ПИЛИТЬ",
        "price": 185,
        "unit": "м",
        "weight": 4,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок металл 45х45х4мм ПИЛИТЬ",
        "price": 218,
        "unit": "м",
        "weight": 4.5,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*35 мм",
        "price": 18,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*50 мм",
        "price": 18,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 70*70*55*2,2 мм",
        "price": 45,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 40*40*40 мм, усиленный",
        "price": 45,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 50*50*50 мм, усиленный",
        "price": 50,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Уголок крепежный 105х105х90 мм, усиленный",
        "price": 80,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Металл",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Поддон (палет) деревянный",
        "price": 450,
        "unit": "шт",
        "weight": 30,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 100х25 (6м) ПИЛИТЬ",
        "price": 445,
        "unit": "шт",
        "weight": 13,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 100х50 (6м) ПИЛИТЬ",
        "price": 850,
        "unit": "шт",
        "weight": 24,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 150х25 (6м) ПИЛИТЬ",
        "price": 560,
        "unit": "шт",
        "weight": 15,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Доска обрезная 150х50 (6м) ПИЛИТЬ",
        "price": 1200,
        "unit": "шт",
        "weight": 29,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 45х45 (3м)",
        "price": 295,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 40х20 (3м)",
        "price": 120,
        "unit": "шт",
        "weight": 1.1,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус строганный 40х40 (3м)",
        "price": 230,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х50 (3м)",
        "price": 210,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х40 (3м)",
        "price": 170,
        "unit": "шт",
        "weight": 5.5,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Брус обрезной 50х25 (3м)",
        "price": 120,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Оргалит ДВП 3х1220х2140",
        "price": 220,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Плита OSB-3 12х1220х2440 мм",
        "price": 830,
        "unit": "шт",
        "weight": 22.6,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 6мм",
        "price": 550,
        "unit": "шт",
        "weight": 11,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 8мм",
        "price": 715,
        "unit": "шт",
        "weight": 12.5,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 12мм",
        "price": 1050,
        "unit": "шт",
        "weight": 21,
        "category": {
            "main": "Дерево",
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 15мм",
        "price": 1350,
        "unit": "шт",
        "weight": 26.5,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Фанера 1.5х1.5м, сорт 4\\4, 20мм",
        "price": 1550,
        "unit": "шт",
        "weight": 34,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "Д"
    },
    {
        "name": "Набор для Козлика 1шт (Брус 50х50х2000 мм - 4шт; Доска 100х25х2000 мм 6шт; Саморез 50мм 0,5кг)",
        "price": 1700,
        "unit": "шт",
        "weight": 30.5,
        "category": {
            "main": "Дерево",
            "section": "",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Обои KLEO флизелиновые без фактурные под покраску 1,06х25 м (110 г/м2)",
        "price": 3100,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Pufas (50м2) (25 г/м2)",
        "price": 1700,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Pufas (50м2) (40 г/м2)",
        "price": 1800,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Oscar Паутинка (1х50 м) 25 г/м2",
        "price": 2450,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Стеклохолст Oscar Wellton W40 (50м2) 40 г/м2",
        "price": 2600,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая малярная 2х2 (1х20м)",
        "price": 650,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая малярная 2х2 (1х50м)",
        "price": 1700,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х18 м",
        "price": 650,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х25 м",
        "price": 850,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 5х5 мм рулон 1х50 м",
        "price": 1650,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка стеклотканевая штукатурная ячейка 10х10 мм рулон 1х50 м",
        "price": 2800,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х30 м 145 г/м.кв., желтая",
        "price": 1500,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х50 м 160 г/м.кв., синяя",
        "price": 2200,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Сетка фасад. стеклотк. ячейка 5х5 мм рулон 1х50 м 160 г/м.кв., прозр.",
        "price": 2600,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч двухсторонний 45мм",
        "price": 230,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный 50 мм х 50 м",
        "price": 130,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Kraft 50 мм х 50 м",
        "price": 230,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Unibob 50 мм х 50 м белый",
        "price": 330,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный 50 мм х 100 м",
        "price": 220,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный для деликатной окраски розовый 25 мм 25 м",
        "price": 250,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Unibob для наружных работ синий 50 мм 25 м",
        "price": 380,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный Tesa для деликатных поверхностей розовый 30 мм 50 м",
        "price": 950,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный синий Unibob для деликатных поверхностей 50 мм 25 м",
        "price": 295,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч малярный синий Howard для деликатных поверхностей 50 мм 25 м",
        "price": 380,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч полиэтиленовый 50 мм",
        "price": 120,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч армированный 50 мм х 50 м",
        "price": 250,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Скотч монтажный алюминиевый 50 мм 50 м",
        "price": 350,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 50 мм x 90 м",
        "price": 180,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 100 мм x 45 м",
        "price": 200,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента серпянка 150 мм x 20 м",
        "price": 250,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента бумажная Knauf для швов ГКЛ 50 мм 150 м",
        "price": 450,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента армирующая для швов Knauf Kurt 50 мм х 75 м",
        "price": 1150,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента кромочная демпферная 100 мм 20 м для полов",
        "price": 250,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента гидроизоляционная Knauf Флэхендихтбанд 12 см 10 м",
        "price": 1350,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 30х3 мм 30 м",
        "price": 180,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 50х3 мм 30 м",
        "price": 290,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Дихтунгсбанд 95х3 мм 30 м",
        "price": 550,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 30х3 мм 30 м",
        "price": 240,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента уплотнительная Knauf Дихтунгсбанд 50х3 мм 30 м",
        "price": 330,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
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
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Лента для звукоизоляции Вибростек М-100 0,1х30 м",
        "price": 2450,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка армированная сеткой 5 х 5 мм 2м х 12,5м (25м2)",
        "price": 1700,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка защитная с клейким краем 10 мкм 1,4х33 м (46,2 кв.м)",
        "price": 350,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка защитная с клейким краем 10 мкм 2,7х20 м (54 кв.м)",
        "price": 380,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка черная 100 мкр полиэтиленовая, рук. 1,5 м",
        "price": 45,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка черная 200 мкр полиэтиленовая, рук. 1,5 м",
        "price": 80,
        "unit": "м",
        "weight": 0.16,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 80 мкр полиэтиленовая, рук. 1.5 м",
        "price": 40,
        "unit": "м",
        "weight": 0.05,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 100 мкр полиэтиленовая, рук. 1.5 м",
        "price": 50,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 150 мкр полиэтиленовая, рук. 1.5 м",
        "price": 60,
        "unit": "м",
        "weight": 0.09,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 180 мкр полиэтиленовая, рук. 1.5 м",
        "price": 65,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка 200 мкр полиэтиленовая, рук. 1.5 м",
        "price": 75,
        "unit": "м",
        "weight": 0.16,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Пленка Стрэйч 500 мм 300 м",
        "price": 550,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Маляр",
            "section": "Малярные товары",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Болгарка 125мм",
        "price": 3500,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Гвоздодер 500мм",
        "price": 450,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лом гвоздодер усиленный 600 мм (монтировка)",
        "price": 1100,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лом строительный 25х1300",
        "price": 1450,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лопата совковая с черенком",
        "price": 450,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Лопата штыковая с черенком",
        "price": 450,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Черенок для совка 600 мм",
        "price": 230,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Черенок - ручка для лопаты метлы",
        "price": 300,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 300 гр",
        "price": 385,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 500 гр",
        "price": 400,
        "unit": "шт",
        "weight": 0.55,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 600 гр",
        "price": 495,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 800 гр",
        "price": 550,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток 1000 гр",
        "price": 650,
        "unit": "шт",
        "weight": 1.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток Киянка резиновая 300 г",
        "price": 250,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Молоток Киянка резиновая 600 г",
        "price": 450,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Набор для укладки ламината",
        "price": 595,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для укладки ламината 20 шт",
        "price": 380,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножницы по металлу 1. Эконом",
        "price": 450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по ГКЛ прокалывающая 150мм",
        "price": 450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 500мм Эконом",
        "price": 900,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по блоку 700мм Эконом",
        "price": 1100,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по дереву Эконом",
        "price": 395,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по дереву Премиум",
        "price": 595,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Ножовка по металлу Эконом",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Отвертка плюс",
        "price": 280,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Отвертка минус",
        "price": 280,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Просекатель для профиля, работа одной рукой",
        "price": 1950,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок обдирочный по ГКЛ",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок штукатурный 450х90 Дерево",
        "price": 1300,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рубанок штукатурный 450х90 Металл",
        "price": 2200,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рулетка магнитная 5м 1. Эконом",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Рулетка магнитная 10м 1. Эконом",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Сварочный аппарат для ПП труб",
        "price": null,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для очистки межплиточных швов",
        "price": 285,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 100мм",
        "price": 300,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 100мм, удлиненная ручка",
        "price": 350,
        "unit": "шт",
        "weight": 0.85,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 200мм Эконом",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 200мм",
        "price": 750,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Скребок для снятия краски, обоев 300мм",
        "price": 1350,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стол малярный 500х950х800",
        "price": 3800,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 5 ступ.",
        "price": 2980,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 6 ступ.",
        "price": 3550,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стремянка алюминий 8 ступ.",
        "price": 3850,
        "unit": "шт",
        "weight": 10,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Степлер строительный 1. Эконом",
        "price": 580,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стусло коробчатое 11*120",
        "price": 435,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Стамеска 32 мм",
        "price": 580,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Тачка строительная (1 колесо)",
        "price": 3800,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Топор 200 г",
        "price": 495,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Топор 300 г",
        "price": 550,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Присоска Вакуумная (стеклодомкрат), пластик",
        "price": 750,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный 400 х 600 мм, Черн",
        "price": 350,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный с рукояткой 300 мм, Желтый",
        "price": 230,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Угольник строительный с рукояткой 400 мм, Желтый",
        "price": 250,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Крестики для плитки 1,5 мм (уп 200 шт)",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Малые (уп 50 шт)",
        "price": 120,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Средние (уп 50 шт)",
        "price": 120,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Клинья для плитки Большие (уп 50 шт)",
        "price": 120,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 1мм, Зажим (уп 100 и 500шт)",
        "price": 3.5,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 1,5мм, Зажим (уп 100 и 500шт)",
        "price": 3.5,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D 2мм, Зажим (уп 100 и 500шт)",
        "price": 3.5,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП 3D Клин (уп 50 и 200шт)",
        "price": 6.5,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 1мм, Зажим (уп 100 шт)",
        "price": 350,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 1,5мм, Зажим (уп 100 шт)",
        "price": 350,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS 2мм, Зажим (уп 100 шт)",
        "price": 350,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "СВП TLS Клин (уп 100шт)",
        "price": 650,
        "unit": "шт",
        "weight": 0.0025,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Щипцы для монтажа СВП",
        "price": 1300,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Инструменты",
            "section": "",
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
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Щетка по металлу с пластиковой ручкой 245 мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Инструменты",
            "section": "",
            "type": ""
        },
        "image": "И"
    },
    {
        "name": "Батарейка Duracell АА пальчиковая 1шт",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x110 мм SDS+",
        "price": 80,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x160 мм SDS+",
        "price": 110,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x210 мм SDS+",
        "price": 170,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 6x310 мм SDS+",
        "price": 195,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x110 мм SDS+",
        "price": 130,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x160 мм SDS+",
        "price": 150,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x210 мм SDS+",
        "price": 195,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 8x250 мм SDS+",
        "price": 210,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x110 мм SDS+",
        "price": 150,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x160 мм SDS+",
        "price": 175,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x210 мм SDS+",
        "price": 195,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x250 мм SDS+",
        "price": 295,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x310 мм SDS+",
        "price": 310,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x600 мм SDS+",
        "price": 650,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 10x800 мм SDS+",
        "price": 850,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x110 мм SDS+",
        "price": 210,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x160 мм SDS+",
        "price": 230,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x210 мм SDS+",
        "price": 250,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 12x310 мм SDS+",
        "price": 280,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 14x210 мм SDS+",
        "price": 390,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 16х310 мм SDS+",
        "price": 350,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бур по бетону 16х460 мм SDS+",
        "price": 850,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 25 мм",
        "price": 60,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 50 мм",
        "price": 80,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 70 мм",
        "price": 90,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 100 мм",
        "price": 130,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 150 мм",
        "price": 170,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита PH2 магнитная 50 мм Премиум",
        "price": 125,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита с ограничителем, PH2 магнитная 50 мм",
        "price": 130,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита с ограничителем, PH2 магнитная 50 мм, Премиум",
        "price": 250,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 6мм для кровельных саморезов",
        "price": 125,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 8мм для кровельных саморезов",
        "price": 145,
        "unit": "шт",
        "weight": 0.012,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 10мм для кровельных саморезов",
        "price": 160,
        "unit": "шт",
        "weight": 0.013,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 12мм для кровельных саморезов",
        "price": 180,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Бита головка 13мм для кровельных саморезов",
        "price": 190,
        "unit": "шт",
        "weight": 0.017,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка - адаптер для шуруповерта угловой 60мм",
        "price": 480,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило плоское SDS+ 20х250 мм",
        "price": 250,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило плоское SDS+ 40х250 мм",
        "price": 320,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило канальное SDS+ 22х250 мм",
        "price": 280,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило пикообразное SDS-plus 250 мм Эконом",
        "price": 250,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Зубило пикообразное SDS-plus 250 мм Премиум",
        "price": 395,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик обойный для стыков (бочка) 45 мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик для нанесения шпаклевки 230 мм",
        "price": 1500,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик 100 мм для грунтовки и покраски, Matrix",
        "price": 180,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 12мм, для грунтовки и покраски в сборе",
        "price": 220,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 12мм, для грунтовки и покраски, Matrix в сборе",
        "price": 320,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик полиакрил 250 мм ворс 18мм, для грунтовки и покраски, Matrix в сборе",
        "price": 320,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик микрофибра 100 мм ворс 10мм, для покраски в сборе",
        "price": 350,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик микрофибра 250 мм ворс 10мм, для покраски в сборе",
        "price": 620,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 100 мм для покраски, Matrix",
        "price": 130,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА полиакрил 250 мм ворс 12мм для покраски, Matrix",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА полиакрил 250 мм ворс 18мм для покраски, Matrix",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА микрофибра 100 мм ворс 10мм, для покраски",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА микрофибра 250 мм ворс 10мм, для покраски",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 100 мм для покраски, Анза",
        "price": 500,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик ШУБКА 250 мм для покраски, Анза",
        "price": 1500,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 50х6 мм для покраски, Matrix",
        "price": 70,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 100х6 мм для покраски, Matrix",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 250х6 мм для покраски, Matrix",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ручка 250 мм для покраски, Анза",
        "price": 850,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (300 мм, игла 14 мм)",
        "price": 450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (400 мм, игла 14 мм)",
        "price": 550,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов (600 мм)",
        "price": 750,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (300 мм, игла 14 мм)",
        "price": 650,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (400 мм, игла 14 мм)",
        "price": 750,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Валик игольчатый для наливных полов с ручкой 1.5м (600 мм)",
        "price": 950,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ванночка малярная 285*155 мм",
        "price": 100,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ванночка малярная 330*350 мм",
        "price": 110,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро строительное 12 л",
        "price": 170,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро строительное 20 л",
        "price": 185,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 45 л",
        "price": 380,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 65 л",
        "price": 450,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ведро Таз строительный 95 л",
        "price": 580,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовая горелка, кровельная",
        "price": 700,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовая горелка, пьеза",
        "price": 650,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовый баллон 0,5 л",
        "price": 150,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка для влажной уборки 1шт",
        "price": 70,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Тряпка микрофибра 1шт",
        "price": 130,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №60",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №80",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная крупная №100",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №120",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №150",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная средняя №180",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №220",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №240",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка шлифовальная мелкая №320",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка для затирки швов плитки 1шт",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка целлюлозная для удаления остатков затирки жёсткая",
        "price": 750,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Губка целлюлозная для удаления остатков затирки жёсткая LITOKOL",
        "price": 850,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Пилки для лобзика по дереву набор (5 шт)",
        "price": 170,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Пилки для лобзика по металлу набор (5 шт)",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Подошва тапочки для наливного пола",
        "price": 850,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1 м",
        "price": 350,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1,5 м",
        "price": 525,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2 м",
        "price": 700,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2,5 м",
        "price": 875,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 3 м",
        "price": 950,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1 м ЗУБР, усиленное",
        "price": 500,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 1,5 м ЗУБР, усиленное",
        "price": 700,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2 м ЗУБР, усиленное",
        "price": 950,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 2,5 м ЗУБР, усиленное",
        "price": 1350,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило трапеционное 3 м ЗУБР, усиленное",
        "price": 1550,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 2м, 2 ручки",
        "price": 1600,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 2.5м, 2 ручки",
        "price": 2100,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Правило алюминиевое с уровнем 3м, 2 ручки",
        "price": 2300,
        "unit": "шт",
        "weight": 4.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть макловица",
        "price": 250,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть радиаторная 25мм",
        "price": 125,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть радиаторная 50мм",
        "price": 130,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть для красок круглая 35 мм",
        "price": 130,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм натуральная щетина",
        "price": 35,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 38 мм натуральная щетина",
        "price": 70,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм натуральная щетина",
        "price": 80,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 75 мм натуральная щетина",
        "price": 120,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм натуральная щетина",
        "price": 150,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм искусственная щетина ЗУБР",
        "price": 70,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 38 мм искусственная щетина ЗУБР",
        "price": 95,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм искусственная щетина ЗУБР",
        "price": 130,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 75 мм искусственная щетина ЗУБР",
        "price": 160,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм искусственная щетина ЗУБР",
        "price": 250,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 25 мм, Анза",
        "price": 320,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 50 мм, Анза",
        "price": 480,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 70 мм, Анза",
        "price": 750,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кисть плоская 100 мм, Анза",
        "price": 850,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма - Гладилка для штукатурных работ пластик. ручка 270х130 мм",
        "price": 350,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кельма - Гладилка для штукатурных работ дер. ручка 270х130 мм",
        "price": 470,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ковш штукатурный",
        "price": 350,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по бетону d-68мм, с центрирующим сверлом",
        "price": 850,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по бетону d-70мм, с центрирующим сверлом",
        "price": 880,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка \"Зубр\" по бетону d-68 мм, с центрирующим сверлом",
        "price": 1150,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-68мм, с центрирующим сверлом",
        "price": 385,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-70мм, с центрирующим сверлом",
        "price": 395,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка по дереву d-100мм, с центрирующим сверлом",
        "price": 430,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-10мм, с центрирующим сверлом",
        "price": 295,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-16мм, с центрирующим сверлом",
        "price": 350,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-20мм, с центрирующим сверлом",
        "price": 550,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-25мм, с центрирующим сверлом",
        "price": 800,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-30мм, с центрирующим сверлом",
        "price": 1100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-32мм, с центрирующим сверлом",
        "price": 1200,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-35мм, с центрирующим сверлом",
        "price": 1350,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-40мм, с центрирующим сверлом",
        "price": 1500,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-50мм, с центрирующим сверлом",
        "price": 1700,
        "unit": "шт",
        "weight": 0.14,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-60мм, с центрирующим сверлом",
        "price": 1800,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-63мм, с центрирующим сверлом",
        "price": 1950,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-68мм, с центрирующим сверлом",
        "price": 2200,
        "unit": "шт",
        "weight": 0.16,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-70мм, с центрирующим сверлом",
        "price": 2350,
        "unit": "шт",
        "weight": 0.17,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная по керамограниту d-100мм, с центрирующим сверлом",
        "price": 2500,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-10мм",
        "price": 780,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-20мм",
        "price": 800,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-32мм",
        "price": 1100,
        "unit": "шт",
        "weight": 0.11,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-70мм",
        "price": 2700,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Коронка алмазная для УШМ по керамограниту d-100мм",
        "price": 4850,
        "unit": "шт",
        "weight": 0.18,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Опрыскиватель - пульверизатор, пластик 2 л",
        "price": 450,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Опрыскиватель - пульверизатор, пластик 5 л",
        "price": 1800,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 12",
        "price": 70,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по дереву 16",
        "price": 130,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 6",
        "price": 280,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 8",
        "price": 300,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 10",
        "price": 360,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перо по керамограниту 12",
        "price": 480,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Карандаш строительный",
        "price": 15,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер чёрный",
        "price": 25,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер перманентный двусторонний грифель 0,7-1мм черный",
        "price": 120,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Маркер лаковый для промышленной графики грифель 2мм белый",
        "price": 130,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвие малярного ножа 25 мм (10шт)",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный 25 мм",
        "price": 200,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвие малярного ножа 18 мм (10шт)",
        "price": 150,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный 18 мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвия Olfa для малярного ножа 18мм (10шт)",
        "price": 480,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нож малярный Olfa 18 мм",
        "price": 950,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скребок для снятия шпатлевки",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Лезвия для скребка по шпатлевке",
        "price": null,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перфолента оцинкованная 10мм х 20м",
        "price": 230,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перфолента оцинкованная 20мм х 20м",
        "price": 350,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 115",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 125",
        "price": 45,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 125 DeWALT",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 180",
        "price": 75,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск отрезной по металлу 230",
        "price": 130,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 125 Эконом",
        "price": 650,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для УШМ 125 Премиум",
        "price": 850,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск пильный по дереву для циркулярной пилы d125 Эконом",
        "price": 750,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка для УШМ (болгарки) для резки плитки под углом 45 градусов",
        "price": 2900,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка чашка для УШМ 100 мм, мягкая пушистая",
        "price": 250,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка чашка для УШМ 125 мм, жесткая",
        "price": 550,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по камню Triodiamant 125 1.1 мм",
        "price": 950,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Triodiamant 125 1.1 мм",
        "price": 950,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Esthete 7D 125x22,2x1,1 мм , сух. Рез",
        "price": 4300,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по керамограниту Distar Hard Ceramics 5D 125 1,4 мм",
        "price": 2800,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 125 Эконом",
        "price": 700,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 125 Премиум",
        "price": 1800,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 230 Эконом",
        "price": 750,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный по бетону (штроборез) 230 Премиум",
        "price": 2500,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск чашка шлифовальный по бетону 125, №2",
        "price": 650,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск алмазный гибкий (черепашка) 100 мм P-",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка липучка для диска алмазный гибкий (черепашка) 100 мм",
        "price": 280,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки диаметром 125мм P-",
        "price": 80,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки 6 отверстий диаметром 125мм P-",
        "price": 85,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 125 мм",
        "price": 250,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Диск наждачный липучка для шлифмашинки диаметром 180мм P-",
        "price": 85,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Насадка на шлифмашинку липучка на диск 180 мм",
        "price": 280,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Держатель для наджачной сетки",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Терка полиуретановая для шлифовки штукатурки 280x140 мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Терка полиуретановая для шлифовки штукатурки 600x110 мм",
        "price": 480,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нить капроновая",
        "price": 80,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Нить отбивочная с колером 1. Эконом",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Колер для нити отбивочной",
        "price": 130,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"40\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"60\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"80\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"100\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"120\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"150\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"180\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"220\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"240\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка абразивная алмазная сетка евро \"320\"",
        "price": 35,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-60 (25-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-80 (20-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-100 (12-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-120 (10-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-150 (8-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-180 (6-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-240 (5-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-280 (4-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-400 (3-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачная бумага Р-1500 (0-Н) (ширина 80см) 1м",
        "price": 550,
        "unit": "м",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наждачка шлифовальная в рулоне на тканевой основе 2500x115 мм P-",
        "price": 450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Отвес строительный 300 г",
        "price": 280,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Респиратор - маска KN95 3-сл.",
        "price": 130,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Респиратор - полумаска фильтрующая без клапана",
        "price": 50,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 6мм",
        "price": 85,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 8мм",
        "price": 95,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по дереву 12мм",
        "price": 280,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 3 мм, Кобальтовое",
        "price": 60,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 4 мм, Кобальтовое",
        "price": 70,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 5 мм, Кобальтовое",
        "price": 95,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 6 мм, Кобальтовое",
        "price": 150,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 8 мм, Кобальтовое",
        "price": 180,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 10 мм, Кобальтовое",
        "price": 230,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло по металлу 10х100 мм, Эконом",
        "price": 30,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло ступенчатое пирамида 4 - 22",
        "price": 750,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Сверло ступенчатое пирамида 4 - 39",
        "price": 950,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скобы для степлера строительного 10 мм, (1000 шт)",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Скобы для степлера строительного 12 мм, (1000 шт)",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Очки защитные",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Наколенники",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки х/б",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки с 2-м обливом",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки с 2-м обливом Утепленные",
        "price": 130,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Перчатки защитные с латексным покрытием",
        "price": 95,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Комбинезон одноразовый Каспер",
        "price": 350,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. стальной 2 м",
        "price": 550,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. стальной 3 м",
        "price": 850,
        "unit": "шт",
        "weight": 1.7,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Удлинитель телескоп. алюминиевый 2 м",
        "price": 850,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мастерок лепесток плиточника",
        "price": 250,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мастерок трапециевидный каменщика",
        "price": 250,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 60 мм",
        "price": 60,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 100 мм",
        "price": 60,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 150 мм",
        "price": 120,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 200 мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 250 мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 350 мм",
        "price": 220,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 450 мм",
        "price": 300,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 600 мм",
        "price": 450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 450 мм СибрТех",
        "price": 650,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 40 мм Matrix",
        "price": 120,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 60 мм Matrix",
        "price": 145,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 80 мм Matrix",
        "price": 210,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 100 мм Matrix",
        "price": 250,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 150 мм Matrix",
        "price": 270,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 200 мм Matrix",
        "price": 450,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 250 мм Matrix",
        "price": 550,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 300 мм Matrix",
        "price": 600,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 350 мм Matrix",
        "price": 780,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 475 мм Matrix",
        "price": 990,
        "unit": "шт",
        "weight": 0.58,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель 600 мм Matrix",
        "price": 1250,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Набор шпателей сталь 50/80/100/120 мм, 4 шт.",
        "price": 180,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Скребок изогнутый 75 мм",
        "price": 450,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Скребок Matrix 253 мм, нержавеющая сталь",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 8мм",
        "price": 230,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 12мм Эконом",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Гладилка Нерж. Зуб 12мм Премиум",
        "price": 1450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - Правило, 800 мм",
        "price": 2500,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель - фасадный 450мм с широким полотном",
        "price": 850,
        "unit": "шт",
        "weight": 0.55,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 150мм, Зуб 10мм",
        "price": 95,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 250мм, Зуб 10мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.35,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель Гребенка 350мм, Зуб 10мм",
        "price": 300,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 180 мм, Зуб 4х4 мм нерж.",
        "price": 150,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 230 мм, Зуб 2х2 мм, пластик",
        "price": 180,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель зубчатый для клея, трапеция 250 мм, Зуб треугольный 5х4 мм нерж.",
        "price": 285,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для обоев универсальный 280 мм пластиковый",
        "price": 200,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель резиновый 126 мм пластиковая ручка",
        "price": 170,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для затирки резиновый, набор (3 шт.) белый",
        "price": 180,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель для выравнивания затирки резиновый, набор геометрия (4 шт.)",
        "price": 380,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Шпатель резиновый для нанесения эпоксидной затирки с ручкой 115х250, Эконом",
        "price": 650,
        "unit": "шт",
        "weight": 0.7,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Щетка метла с ручкой",
        "price": 550,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Веник + Совок",
        "price": 370,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Совок металл",
        "price": 190,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Веник",
        "price": 180,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под резьбу 120мм",
        "price": 750,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под резьбу 140мм",
        "price": 850,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под дрель",
        "price": 450,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под перфоратор, SDS+ 100 мм",
        "price": 550,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Венчик на Миксер под перфоратор, SDS+ 120 мм",
        "price": 650,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок под мусор Белый, прочный 56х105см",
        "price": 18,
        "unit": "шт",
        "weight": 0.07,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки под мусор в рулоне 280л. черные",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки для пылесоса Dexter 5шт",
        "price": 850,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешки одноразовые для пылесоса Dexter 20л 4 шт",
        "price": 1100,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок для пылесоса Tools Master WD 3 (5 шт)",
        "price": 1150,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Мешок для пылесоса универсальный Bayrtools Master Professional UM 20, 36 л (5 шт.)",
        "price": 850,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ветош половая",
        "price": 40,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Ветош полотенце",
        "price": 55,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Матрас Подушка Одеяло - Комплект",
        "price": 1350,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Фиброволокно HOWARD полипропиленовое 12 мм, 0.6кг",
        "price": 280,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Фиксатор арматуры горизонтальный (стульчик)",
        "price": 4.5,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Электроды 3мм, 1кг",
        "price": 550,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Расходники",
            "section": "",
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
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Кислота для пайки",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Неодимовый магнит круглый для люков и креплений 20х3 мм",
        "price": 280,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Неодимовый магнит прямоугольный для люков и креплений 35х15х3 мм",
        "price": 350,
        "unit": "шт",
        "weight": 0.008,
        "category": {
            "main": "Расходники",
            "section": "",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Анкерный болт для бетона 8х60 мм (1 шт.)",
        "price": 25,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 10х100 мм (1 шт.)",
        "price": 30,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкерный болт для бетона 12х120 мм (1 шт.)",
        "price": 35,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 8х30 (1 шт.)",
        "price": 35,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 10х30 (1 шт.)",
        "price": 33,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 10х35 (1 шт.)",
        "price": 35,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Анкер для бетона забивной (цанга) латунь 12х50 (1 шт.)",
        "price": 50,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х90 мм пластиковый гвоздь",
        "price": 6.5,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х90 мм металлический гвоздь",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель Гриб 10х150 мм металлический гвоздь",
        "price": 16.5,
        "unit": "шт",
        "weight": 0.12,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х40 (200 шт), Гриб",
        "price": 480,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х60 (200 шт), Гриб",
        "price": 480,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х80 (100 шт), Гриб",
        "price": 550,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x40 мм (200 шт), Гриб",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x60 мм (100 шт), Гриб",
        "price": 580,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x80 мм (100 шт), Гриб",
        "price": 600,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x100 мм (100 шт), Гриб",
        "price": 600,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x120 мм (1 шт), Гриб",
        "price": 13,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х40 (200 шт), Потай",
        "price": 480,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 6х60 (200 шт), Потай",
        "price": 480,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x60 мм (100 шт), Потай",
        "price": 580,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x80 мм (100 шт), Потай",
        "price": 600,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x100 мм (100 шт), Потай",
        "price": 600,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель - гвоздь 8x120 мм (1 шт), Потай",
        "price": 13,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель пластиковый 6x50 мм (1 шт)",
        "price": 1.5,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 5-10мм Белый (100 шт)",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 11-19мм Белый (100 шт)",
        "price": 195,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для круглого кабеля 19-25мм Белый (100 шт)",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 5-10 мм белый (100 шт)",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 6-12 мм белый (100 шт)",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 9-16 мм белый (100 шт)",
        "price": 195,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель-хомут для плоского кабеля 19-25 мм белый (100 шт)",
        "price": 210,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель нейлоновый бабочка для листовых материалов 8х50 мм (1шт)",
        "price": 13,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x32 мм полипропилен (100 шт)",
        "price": 120,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x60 мм полипропилен (500 шт)",
        "price": 395,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель распорный 6x60 мм полипропилен (1000 шт)",
        "price": 850,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель морковка оранжевый 6x40 мм (1 шт)",
        "price": 1.8,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Дюбель морковка оранжевый 6x40 мм (500 шт)",
        "price": 550,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый 25 мм по металлу",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый 25 мм по дереву",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез желтый универсальный 51 мм",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 25 мм по металлу",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 35 мм по металлу",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 50 мм по металлу",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 70 мм по металлу",
        "price": 380,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 25 мм по дереву",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 35 мм по дереву",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 50 мм по дереву",
        "price": 350,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 70 мм по дереву",
        "price": 380,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 75 мм по дереву",
        "price": 380,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 100 мм по дереву",
        "price": 380,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез 150 мм по дереву",
        "price": 380,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 13мм острый",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 13мм с буром",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 16мм острый",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 16мм с буром",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 19мм острый",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 19мм с буром",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 50мм острый",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Прессшайба 50мм с буром",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы черные клопы 9,5x2,5 острый",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморезы черные клопы 9,5x3,5 с буром",
        "price": 550,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 25 мм",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 35 мм",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез по ГВЛ 45 мм",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 25 мм (1000 шт.)",
        "price": 1350,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 35 мм (1000 шт.)",
        "price": 1350,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез Knauf по гипсокартону 45 мм (1000 шт.)",
        "price": 1500,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез в ленте Knauf по гипсокартону 25 мм (1000 шт.)",
        "price": 1750,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез в ленте Knauf по гипсокартону 35 мм (1000 шт.)",
        "price": 1750,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Саморез для подрозетника 10 / 20 мм",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 70 мм",
        "price": 180,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 75 мм",
        "price": 180,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 80 мм",
        "price": 180,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 100 мм",
        "price": 180,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 120 мм",
        "price": 180,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гвозди 150 мм",
        "price": 200,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М8 х 2000 мм",
        "price": 250,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М8 х 1000 мм",
        "price": 130,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М8",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М8",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М10 х 2000 мм",
        "price": 350,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М10 х 1000 мм",
        "price": 180,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М10",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М10",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шпилька резьбовая М12 х 1000 мм",
        "price": 210,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Шайба М12",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Гайка М12",
        "price": 480,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Крепёж",
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
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
            "section": "Саморезы, дюбеля и анкера",
            "type": ""
        },
        "image": "К"
    },
    {
        "name": "Изолента",
        "price": 95,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Изолента Желто - Зеленая",
        "price": 110,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Расходники",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Подрозетник по ГКЛ",
        "price": 19,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по ГКЛ глубокий",
        "price": 35,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по бетону",
        "price": 14,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Подрозетник по бетону глубокий",
        "price": 18,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Вилка каучуковая с заземлением",
        "price": 180,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 2-е розетки",
        "price": 250,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 3-и розетки",
        "price": 450,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Колодка с заземл. (тройник) 4-е розетки",
        "price": 420,
        "unit": "шт",
        "weight": 0.45,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 2x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 2x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 3x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 3x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 3x4 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 3x6 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 5x1,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 5x2,5 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.24,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 5x4 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 5x6 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.42,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ВВГнг LS 5x10 ТУ",
        "price": null,
        "unit": "м",
        "weight": 0.75,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 2x1,5 ГОСТ",
        "price": 43,
        "unit": "м",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x1,5 ГОСТ",
        "price": 67,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x2,5 ГОСТ",
        "price": 80,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x4 ГОСТ",
        "price": 170,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 3x6 ГОСТ",
        "price": 230,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 4x5 ГОСТ",
        "price": 250,
        "unit": "м",
        "weight": 0.66,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x1,5 ГОСТ",
        "price": 110,
        "unit": "м",
        "weight": 0.12,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x4 ГОСТ",
        "price": 275,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ОмКабель ВВГнг LS 5x6 ГОСТ",
        "price": 330,
        "unit": "м",
        "weight": 0.42,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x1,5 ГОСТ",
        "price": 87,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x2,5 ГОСТ",
        "price": 110,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x4 ГОСТ",
        "price": 165,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель плоский ЕвроКабель ВВГнг LS 3x6 ГОСТ",
        "price": 285,
        "unit": "м",
        "weight": 0.26,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 3x1,5 ГОСТ",
        "price": 80,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель круглый Конкорд ВВГнг LS 3x2,5 ГОСТ",
        "price": 115,
        "unit": "м",
        "weight": 0.14,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х0,75 ГОСТ",
        "price": 26,
        "unit": "м",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х1,5 ГОСТ",
        "price": 47,
        "unit": "м",
        "weight": 0.07,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 2х2,5 ГОСТ",
        "price": 70,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х0,75 ГОСТ",
        "price": null,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х1.5 ГОСТ",
        "price": 75,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х2.5 ГОСТ",
        "price": 95,
        "unit": "м",
        "weight": 0.13,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВС 3х6 ГОСТ",
        "price": 260,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ШВВП 2х0,75",
        "price": null,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ПВ-3 (ПУГВ) 6,0 цвет ?",
        "price": 85,
        "unit": "м",
        "weight": 0.07,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель ТВ РЖ6",
        "price": 35,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 16х16, 2м белый",
        "price": 70,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 20х10, 2м белый",
        "price": 50,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 25х16, 2м белый",
        "price": 60,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - канал 25х25, 2м белый",
        "price": 88,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - Канал 40х20, 2м белый",
        "price": 135,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Кабель - Канал 40х40, 2м белый",
        "price": 165,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель тройник (5м)",
        "price": 680,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Удлинитель тройник (10м)",
        "price": 900,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Интернет кабель UTP",
        "price": 35,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Интернет кабель FTP 5cat - 4е пары",
        "price": 38,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 16 мм с зондом (уп. 100м) Серая",
        "price": 1200,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 20 мм с зондом (уп. 1м) Серая",
        "price": 17,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 20 мм с зондом (уп. 100м) Серая",
        "price": 1300,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 25 мм с зондом (50м) Серая",
        "price": 950,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПВХ 32 мм с зондом (25м) Серая",
        "price": 850,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 16 мм с зондом (уп. 100м), черная",
        "price": 1400,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 20 мм с зондом (уп. 100м), черная",
        "price": 1500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 25 мм с зондом (50м), черная",
        "price": 1000,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра электрическая ПНД 32 мм с зондом (25м), черная",
        "price": 900,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гофра DKC электрическая ПНД 20 мм с зондом (уп. 100м), черная",
        "price": 2500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 85х85х40",
        "price": 60,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распаячная коробка 100х100х50",
        "price": 75,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 2-я Защелка",
        "price": 19,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 3-я Защелка",
        "price": 25,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 5-я Защелка",
        "price": 32,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-203 самозажимная для жёсткого кабеля Без пасты",
        "price": 20,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-204 самозажимная для жёсткого кабеля Без пасты",
        "price": 25,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма WAGO 2273-205 самозажимная для жёсткого кабеля Без пасты",
        "price": 28,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 4-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": 26,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма 5-я 0,5-2,5 кв.мм самозажимная без пасты",
        "price": 33,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 2-проводная плоская с пастой",
        "price": 28,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 3-проводная плоская с пастой",
        "price": 28,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 4-проводная плоская с пастой",
        "price": 32,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 5-проводная плоская с пастой",
        "price": 36,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клемма соединительная 6-проводная плоская с пастой",
        "price": 45,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клеммник колодка винтовой 2,5 мм, 12 пар",
        "price": 120,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 16 мм (100 шт)",
        "price": 350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 20 мм (100 шт)",
        "price": 380,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для гофры 25 мм (100 шт)",
        "price": 430,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 20 мм (100 шт)",
        "price": 850,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 25 мм (100 шт)",
        "price": 450,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Клипсы для труб с защелкой 32 мм (50 шт)",
        "price": 450,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа электрическая Е27 200 Вт",
        "price": 70,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа электрическая Е27 300 Вт",
        "price": 95,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа светодиодная E27 30 Вт",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа светодиодная E27 50 Вт",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная электрическая Е27 60 Вт 6500К",
        "price": 750,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная груша электрическая Е27 25 Вт 6500К",
        "price": 150,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Лампа Светодиодная груша электрическая Е27 40 Вт 6500К",
        "price": 380,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Патрон электрический Е27",
        "price": 85,
        "unit": "шт",
        "weight": 0.06,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 50 Вт",
        "price": 850,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 100 Вт",
        "price": 1200,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Прожектор светодиодный 100 Вт, на треноге",
        "price": 2800,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 1-я белая, Эконом",
        "price": 170,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 2-я белая, Эконом",
        "price": 270,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 3-я белая, Эконом",
        "price": 350,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 4-я белая, Эконом",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка накладная 3-я белая, влагостойкая",
        "price": 480,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка щитовая модульная на дин рейку 220 В 16 А тип AC 2Р+N",
        "price": 280,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель накладной 1-кл белый, Эконом",
        "price": 170,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель накладной 2-кл белый, Эконом",
        "price": 230,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 100х3,5 мм нейлон белая (100 шт.)",
        "price": 180,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 150х3,5 мм нейлон белая (100 шт.)",
        "price": 180,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 200х3,5 мм нейлон белая (100 шт.)",
        "price": 180,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 250х3,5 мм нейлон белая (100 шт.)",
        "price": 195,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 300х3,6 мм с 3м замком нейлон черная (100 шт.)",
        "price": 230,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 350х3,6 мм с 3м замком нейлон белая (100 шт.)",
        "price": 200,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Стяжка кабельная 500х8 мм с 3м замком нейлон черная (100 шт.)",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 36 модулей ABB",
        "price": 7500,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 12 модулей Текфор",
        "price": 1600,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 18 модулей Текфор",
        "price": 2300,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 24 модуля Текфор",
        "price": 3500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (скрытого монтажа) 36 модулей Текфор",
        "price": 4500,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Щит электричесский тонир. (накладной) 18 модулей Текфор",
        "price": 2500,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Контактор мод. ABB ESB (ESB20-20N-06) 230 В 20 А тип AC/DС 2НО",
        "price": 1990,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Реле контроля напряжения СР-723 / 63А 3 фазы",
        "price": 8100,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 6А",
        "price": 495,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 10А",
        "price": 370,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 16А",
        "price": 380,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 20А",
        "price": 470,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 25А",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 32А",
        "price": 485,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 40А",
        "price": 510,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 1-пол. SH201 63А",
        "price": 950,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 32А",
        "price": 1650,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 40А",
        "price": 1900,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 50А",
        "price": 2300,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 2-пол. SH202 63А",
        "price": 2300,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 16А",
        "price": 1650,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 25А",
        "price": 1750,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 32А",
        "price": 1850,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Автомат ABB 3-пол. SH203 63А",
        "price": 3100,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 10А AC 30mA",
        "price": 4700,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 16А AC 10mA",
        "price": 3950,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 16А AC 30mA",
        "price": 4100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 20А AC 30mA",
        "price": 4300,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 25А AC 30mA",
        "price": 4700,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 32А AC 30mA",
        "price": 5200,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Диф. автомат ABB DSH201 C 40А AC 30mA",
        "price": 6300,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-40A/0,3мА",
        "price": 4100,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "УЗО ABB F202 AC-63A/0,3мА",
        "price": 7600,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Дин - рейка для монтажа автоматов 1000 мм",
        "price": 350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина нулевая (N)",
        "price": 150,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина заземления (PE)",
        "price": 250,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соединительная тип PIN однорядная",
        "price": 460,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 1 пол. на 30 постов 1м",
        "price": 450,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 2 пол. на 30 постов 1м",
        "price": 870,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина гребенка соеденительная 3 пол. на 30 постов 1м",
        "price": 950,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина на DIN-рейку в корпусе кросс-модуль 2x7",
        "price": 460,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Шина на DIN-рейку в корпусе кросс-модуль 4x7",
        "price": 750,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Терморегулятор теплого пола механический",
        "price": 950,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Электрика",
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
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
            "section": "Электрика и освещение",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Унитаз Черновой без Бачка",
        "price": 2350,
        "unit": "шт",
        "weight": 7,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унитаз Черновой с Бачком",
        "price": 4950,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сливная арматура для бачка унитаза универсальная",
        "price": 1800,
        "unit": "шт",
        "weight": 8,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гофра для унитаза",
        "price": 370,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 16 мм цвет синий (50м)",
        "price": 990,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 16 мм цвет красный (50м)",
        "price": 990,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 20 мм цвет синий (50м)",
        "price": 1100,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 20 мм цвет красный (50м)",
        "price": 1100,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 25 мм цвет синий (50м)",
        "price": 1200,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба гофрированная для труб 25 мм цвет красный (50м)",
        "price": 1200,
        "unit": "шт",
        "weight": 6,
        "category": {
            "main": "Сантехника",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Раковина Умывальник Черновой",
        "price": 1700,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Гофра для сифона",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сифон с гофрой в комплекте",
        "price": 470,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Смеситель Черновой",
        "price": 1600,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 0,6м",
        "price": 170,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 1м",
        "price": 350,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 1,5м",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 2м",
        "price": 380,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подводка 3м",
        "price": 450,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унипак 75г",
        "price": 385,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Унипак 250г",
        "price": 650,
        "unit": "шт",
        "weight": 0.28,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Лен сантехнический",
        "price": 130,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект сантехнический Лен + Unipak 75 г",
        "price": 650,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Лента ФУМ 12 мм 15 м",
        "price": 150,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тангит унилок 20м",
        "price": 600,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тангит унилок 80м",
        "price": 1350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "",
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
            "section": "",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Подоконник ПВХ белый матовый *150мм",
        "price": 300,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *200мм",
        "price": 380,
        "unit": "шт",
        "weight": 3.5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *250мм",
        "price": 460,
        "unit": "шт",
        "weight": 4,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Подоконник ПВХ белый матовый *600мм",
        "price": 3300,
        "unit": "шт",
        "weight": 6.5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка для подоконника ПВХ матовая белая",
        "price": 100,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель подоконника ПВХ, белый матовый",
        "price": 180,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок пластиковый перфорированный ПВХ 25х25х2700мм",
        "price": 80,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок арочный перфорированный ПВХ 25х25х3000мм",
        "price": 70,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 10х10х1.8х2700 мм, белый",
        "price": 45,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 15х15х1.8х2700 мм, белый",
        "price": 50,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 20х20х1.8х2700 мм, белый",
        "price": 55,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 25х25х1.8х2700 мм, белый",
        "price": 60,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 30х30х1.8х2700 мм, белый",
        "price": 85,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок ПВХ 40х40х1.8х2700 мм, белый",
        "price": 125,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок перфорированный ПВХ 25х25х2500мм, с арм. сеткой",
        "price": 130,
        "unit": "шт",
        "weight": 0.4,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль примыкания оконный самоклеящийся с сеткой 6 мм 2.4 м, пласт.",
        "price": 195,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ стартовый для панелей 5х3000 мм, цвет белый",
        "price": 135,
        "unit": "шт",
        "weight": 0.13,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Профиль ПВХ П-образный стартовый 30х3000х10 мм, цвет белый",
        "price": 135,
        "unit": "шт",
        "weight": 0.19,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
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
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Сэндвич панель ПВХ белый матовый 3 x 1,5 х 9 мм",
        "price": 3375,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "ПВХ",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Доставка",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 1.8т ТТК",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 2.8т",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 2.8т ТТК",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 5т",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 5т ТТК",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 1.8т - 1км от МКАД",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 2.8т - 1км от МКАД",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка до 5т - 1км от МКАД",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка манипулятором",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Доставка ограничение по высоте 1.8т",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Разгрузка",
        "price": 1600,
        "unit": "тонн",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Разгрузка без лифта - Эт. ?",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Разгрузка с проносом (до 50м)",
        "price": 2000,
        "unit": "тонн",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Разгрузка лифт + Габарит на руках эт. ?",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Резка листового материала",
        "price": 18,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Резка прочного листового материала",
        "price": 60,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Рез резка распил фанеры ОСБ по ширине",
        "price": 70,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Рез резка распил фанеры ОСБ по длинне",
        "price": 135,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Услуги",
            "section": "Подоконники ПВХ",
            "type": ""
        },
        "image": "У"
    },
    {
        "name": "Кран Бугатти 1/2 г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1/2 г/ш",
        "price": 650,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 3/4 г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 3/4 г/ш",
        "price": 850,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1\" г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1\" г/ш",
        "price": 1270,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1 1/4\" г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1 1/4\" г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1\" 1/2 г/г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 1\" 1/2 г-ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 2\" г-г",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 2\" г-ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
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
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 3/4",
        "price": 1270,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1\"",
        "price": 1650,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с американкой Бугатти 1\" 1/4",
        "price": 3100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
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
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с полусгоном Бугатти 1/2 г/ш бабочка",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран с полусгоном Бугатти 3/4 г/ш бабочка",
        "price": 1150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти Орегон с накидной гайкой 3/4 г/ш",
        "price": 1300,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой латунный Бугатти 3/4 ВР(г) х 3/4 НР(ш) бабочка с полусгоном прямой",
        "price": 1150,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Бугатти 883 угловой 1/2\"-3/4\" с отражателем для стиральной машины",
        "price": 750,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой 1/2\"-3/4\" с отражателем для стиральной машины",
        "price": 450,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой бабочка 1/2 г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый угловой ручка 1/2 г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка 1/2 г/ш",
        "price": 530,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка 3/4 г/ш",
        "price": 790,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый бабочка 1\" г/ш",
        "price": 1100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка 1/2 г/ш",
        "price": 550,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка 3/4 г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый ручка 1\" г/ш",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Маевского 1\\2\"",
        "price": 68,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран Маевского 3\\4\"",
        "price": 95,
        "unit": "шт",
        "weight": 0.035,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран для радиатора Oventrop 1/2\" осевой для терморегулятора",
        "price": 2880,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран для радиатора Oventrop 1/2\" угловой нижний",
        "price": 2200,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой с полусгоном 1/2\"",
        "price": 820,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровой с полусгоном 3/4\"",
        "price": 1100,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантехника",
            "section": "Бугати (РЕЗЬБОВОЙ",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Труба 20пп",
        "price": 72,
        "unit": "м",
        "weight": 0.3,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20пп 90",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20пп 45",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 20пп",
        "price": 20,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Обвод 20пп",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20пп",
        "price": 20,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20х1/2н пп",
        "price": 85,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20х1/2в пп",
        "price": 85,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20х3/4н пп",
        "price": 80,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 20х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 20х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 20х1/2в пп",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Планка 20х1/2в пп 2-й",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Накидная гайка 20х1/2в пп",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х1/2н пп",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Американка 20х1/2в пп",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 20х1/2н пп",
        "price": 99,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 20пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 25пп",
        "price": 110,
        "unit": "м",
        "weight": 0.35,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25пп 90",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25пп 45",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25пп",
        "price": 18,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 25х20пп",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 25х1/2н пп",
        "price": 95,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 25х1/2в пп",
        "price": 95,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 25х3/4н пп",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 25х3/4в пп",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 25х3/4в пп",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 25х3/4н пп",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 25х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Водорозетка 25х1/2н пп",
        "price": 115,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Планка 25х1/2в пп 2-й",
        "price": 198,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 25пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32пп",
        "price": 157,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32пп 90",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32пп 45",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32пп",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х20пп",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32х25пп",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32пп",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х1/2н пп",
        "price": 680,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х3/4н пп",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х1н пп",
        "price": 170,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 32х1в пп",
        "price": 170,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта разъемная 32х1в пп",
        "price": 330,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 32пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40пп",
        "price": 248,
        "unit": "м",
        "weight": 0.4,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40пп 90",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40пп 45",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40х25пп",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40пп",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х1/2н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х1/2в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40х3/4н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40х3/4в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40х1н пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
            "section": "Труба 40пп",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40х1в пп",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "ПП",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 25пп стекловолокно FV-plast",
        "price": 298,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 32пп стекловолокно FV-plast",
        "price": 530,
        "unit": "м",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20пп 90 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 20пп 45 FV-plast",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25пп 90 FV-plast",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 25пп 45 FV-plast",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32пп 90 FV-plast",
        "price": 75,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Уголок 32пп 45 FV-plast",
        "price": 75,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25пп FV-plast",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25пп FV-plast",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 32пп FV-plast",
        "price": 75,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Муфта 25х1/2н пп FV-plast",
        "price": 280,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Тройник 25х1/2н пп FV-plast",
        "price": 330,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Американка 25х3/4н пп FV-plast",
        "price": 550,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
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
            "main": "FV",
            "section": "Труба FV Plast",
            "type": ""
        },
        "image": "F"
    },
    {
        "name": "Труба 110 3м Политек",
        "price": 850,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 2м Политек",
        "price": 518,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 1,5м Политек",
        "price": 470,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 1м Политек",
        "price": 290,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 0,5м Политек",
        "price": 185,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 0,3м Политек",
        "price": 130,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 30 Политек",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 45 Политек",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 67 Политек",
        "price": 140,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 90 Политек",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный 45 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый 45 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый 45 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный 90 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый 90 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый 90 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50 45 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50 90 Политек",
        "price": 150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110 45 Политек",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110 90 Политек",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Ревизия 110 Политек",
        "price": 260,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 110 Политек",
        "price": 70,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта компенсионная 110 Политек",
        "price": 170,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Патрубок компенсационный 110 мм Политэк",
        "price": 150,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 110 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 110 Политек",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х50 Политек",
        "price": 70,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход чугун/пласт тапер с манжетой 110 Политэк",
        "price": 350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 3м Политек",
        "price": 345,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 2м Политек",
        "price": 225,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 1,5м Политек",
        "price": 195,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 1м Политек",
        "price": 120,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 0,5м Политек",
        "price": 75,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 0,3м Политек",
        "price": 65,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 45 Политек",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 90 Политек",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50 45 Политек",
        "price": 75,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50 90 Политек",
        "price": 75,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50х40 45 Политек",
        "price": 98,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50х40 90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 50 Политек",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 50 Политек",
        "price": 18,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 50 Политек",
        "price": 22,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х40 Политек",
        "price": 65,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х32 Политек",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 2м Политек",
        "price": 195,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 1,5м Политек",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 1м Политек",
        "price": 114.99999999999999,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 0,5м Политек",
        "price": 75,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 0,3м Политек",
        "price": 58,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 45 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 90 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40 45 Политек",
        "price": 80,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40 90 Политек",
        "price": 80,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 40 Политек",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Клипса 40 Политек",
        "price": 20,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 40х32 Политек",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 2м Политек",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 1м Политек",
        "price": 114.99999999999999,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 1,5м Политек",
        "price": 180,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 0,5м Политек",
        "price": 78,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 0,3м Политек",
        "price": 58,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 30 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 45 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 90 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32 45 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32 90 Политек",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 32 Политек",
        "price": 15,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 123х110 чугун/пласт Политек",
        "price": 85,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 73х50 чугун/пласт Политек",
        "price": 70,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х40 Политек",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х32 Политек",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 50х25 Политек",
        "price": 35,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х32 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 40х25 Политек",
        "price": 30,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х50х50 / 45 одноплоскостная Политек",
        "price": 260,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 левая 2х-плоскостная Политек",
        "price": 325,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 правая 2х-плоскостная Политек",
        "price": 325,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 3м Ostendorf",
        "price": 1380,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 2м Ostendorf",
        "price": 980,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 1,5м Ostendorf",
        "price": 780,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 1м Ostendorf",
        "price": 470,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 0,5м Ostendorf",
        "price": 325,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 0,3м Ostendorf",
        "price": 260,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 110 0,15м Ostendorf",
        "price": 228,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 30 Ostendorf",
        "price": 135,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 45 Ostendorf",
        "price": 135,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 67 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110 90 Ostendorf",
        "price": 135,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный 45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый 45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый 45 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 фронтальный 90 Ostendorf",
        "price": 395,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 левый 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 110х50 правый 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50 45 Ostendorf",
        "price": 210,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110х50 90 Ostendorf",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110 45 Ostendorf",
        "price": 280,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 110 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Муфта 110 Ostendorf",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 110 Ostendorf",
        "price": 135,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х50 Ostendorf",
        "price": 165,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 110х90 Ostendorf",
        "price": 276,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 2м Ostendorf",
        "price": 1000,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 1м Ostendorf",
        "price": 560,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 0,5м Ostendorf",
        "price": 350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 90 0,3м Ostendorf",
        "price": 285,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90 30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90 45 Ostendorf",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 90 90 Ostendorf",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 90 45 Ostendorf",
        "price": 350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 90 90 Ostendorf",
        "price": 350,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 90х50 Ostendorf",
        "price": 260,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 2м Ostendorf",
        "price": 330,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 1,5м Ostendorf",
        "price": 320,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 1м Ostendorf",
        "price": 210,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 0,5м Ostendorf",
        "price": 155,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 0,3м Ostendorf",
        "price": 100,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 50 0,15м Ostendorf",
        "price": 135,
        "unit": "шт",
        "weight": 0.04,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 15 Ostendorf",
        "price": 65,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 30 Ostendorf",
        "price": 65,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 45 Ostendorf",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 50 90 Ostendorf",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50 45 Ostendorf",
        "price": 114.99999999999999,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 50 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 50 Ostendorf",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х40 Ostendorf",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 50х32 Ostendorf",
        "price": 95,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 2м Ostendorf",
        "price": 280,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 1м Ostendorf",
        "price": 195,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 0,5м Ostendorf",
        "price": 120,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 0,3м Ostendorf",
        "price": 110,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 40 0,15м Ostendorf",
        "price": 325,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 15 Ostendorf",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 30 Ostendorf",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 45 Ostendorf",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 40 90 Ostendorf",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40 45 Ostendorf",
        "price": 115,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 40 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Переход 40х32 Ostendorf",
        "price": 90,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 2м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 1м Ostendorf",
        "price": 190,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 1,5м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 0,5м Ostendorf",
        "price": 115,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Труба 32 0,3м Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 30 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 45 Ostendorf",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Уголок 32 90 Ostendorf",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32 45 Ostendorf",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Тройник 32 90 Ostendorf",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка 32 Ostendorf",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Манжет 123х110 чугун/пласт Ostendorf",
        "price": 100,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 одноплоскостная Ostendorf",
        "price": 435,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Крестовина 110х110х110х50 / 87 правая 2х-плоскостная Ostendorf",
        "price": 580,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 18 2м",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 22 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 28 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 35 2м",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 42 2м",
        "price": 58,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 54 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Теплоизоляция серая 110 2м",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1/2 (20-25мм)",
        "price": 45,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3/4 (25-32мм)",
        "price": 55,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 (32-36мм)",
        "price": 65,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/2 (47-52мм)",
        "price": 80,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3 (87-92мм)",
        "price": 110,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 110 (107-112мм)",
        "price": 130,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1/2 с дюбелем (20-25мм)",
        "price": 40,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 3/4 с дюбелем (25-32мм)",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 с дюбелем (32-36мм)",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/4 с дюбелем (38-43мм)",
        "price": 60,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 1 1/2 с дюбелем (47-52мм)",
        "price": 65,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут для труб 110 с дюбелем (107-112мм)",
        "price": 130,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут заземления для труб ТХЗ 1\" (32-35мм)",
        "price": 45,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Хомут заземления для труб ТХЗ 1 1/4\" (39-46мм)",
        "price": 50,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Политек",
            "section": "Канализация Политек",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Коллекторная группа для отопления Stout (SMS-0927-000003) 1 ВР(г) х 3 выходов 3/4 НР(ш) ЕК х 1 ВР(г) с расходомерами нержавеющая сталь",
        "price": 9500,
        "unit": "шт",
        "weight": 2.7,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 3/4\", проходной, хромированный, 2 отвода 1/2\"",
        "price": 1950,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 3/4\", проходной, хромированный, 3 отвода 1/2\"",
        "price": 2900,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 3/4\", проходной, хромированный, 4 отвода 1/2\"",
        "price": 3800,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 2 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 3 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 4 отвода 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 2 отвода 3/4\"",
        "price": 2200,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 3 отвода 3/4\"",
        "price": 3850,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "FAR Коллектор 1\", проходной, хромированный, 4 отвода 3/4\"",
        "price": 3900,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Крепление колектора FAR пара (комплект на 2 колектора)",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1/2 н",
        "price": 66,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1/2 в",
        "price": 66,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 3/4 н",
        "price": 125,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 3/4 в",
        "price": 125,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1\" н",
        "price": 230,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка 1\" в",
        "price": 230,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка для радиатора 1\\2\"н",
        "price": 130,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Футорка 1/2в х 3/4н",
        "price": 170,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ниппель 1/2н х 3/4н",
        "price": 180,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2н х 3/4в",
        "price": 170,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2в х 3/4н",
        "price": 150,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2в х 3/4в",
        "price": 195,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Переход 1/2н х 3/4н",
        "price": 180,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-0 (670мм-125мм-406мм) (1-3 конт.)",
        "price": 3800,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-1 (670мм-125мм-494мм) (4-5 конт.)",
        "price": 4100,
        "unit": "шт",
        "weight": 1.8,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шкаф встраиваемый ШРВ-2 (670мм-125мм-594мм) (6-7 конт.)",
        "price": 3350,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
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
            "main": "Сантехника",
            "section": "Колектора и комплектующие,группы и шкафы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Ниппель 1/2 бронза Stout",
        "price": 98,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель 3/4 бронза Stout",
        "price": 230,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель 1 бронза Stout",
        "price": 295,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 ш/ш стальной оц.",
        "price": 80,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 40мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 60мм бронза Stout",
        "price": 325,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 70мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 100мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 120мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 140мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 150мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 160мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 180мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1/2 200мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 40мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 60мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 100мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 120мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 140мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 150мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 160мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 180мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 3/4 200мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 40мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 60мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 100мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 120мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 150мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Бочонок 1'' 200мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина 1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина 3/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Крестовина 1г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1/2 г/г бронза Stout",
        "price": 175,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1/2 ш/ш бронза Stout",
        "price": 130,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 3/4 г/г бронза Stout",
        "price": 260,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 3/4 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 3/4 ш/ш бронза Stout",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1\" г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1\" г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 1\" ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/4 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/4 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 11/2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 2 ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1/2г/г бронза Stout",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1/2г/ш бронза Stout",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1/2ш/ш бронза Stout",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 3/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 3/4г/ш бронза Stout",
        "price": 482.99999999999994,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 3/4ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 11/4''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 11/4''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 1''ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 11/2''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 11/2''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 2''г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка 2''г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка прямая 1/2г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта американка угловая 1/2г/ш бронза Stout",
        "price": 280,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 1-1/2 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход. 1-3/4 г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход 3/4 х 1/2 г/г бронза Stout",
        "price": 230,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход 3/4 х 1/2 ш/ш бронза Stout",
        "price": 230,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход 3/4 х 1/2 г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта переход 3/4 х 1/2 ш/г бронза Stout",
        "price": 280,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 3/8-1/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1/2-1/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1/2-3/8 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 3/4-1/2 бронза Stout",
        "price": 190,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1- 1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 1- 3/4 бронза Stout",
        "price": 280,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/4- 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/4-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/2-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 11/2-11/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 2- 11/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель перех. 2- 11/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Ниппель переходной 1/2 х 3/4 бронза Stout",
        "price": 180,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Фитинги Stout - Бронза",
            "section": "",
            "type": ""
        },
        "image": "Ф"
    },
    {
        "name": "Переходник в/н 1/2-3/8 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник в/н 3/4-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник в/н 1-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник в/н 1-3/4 бронза Stout",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник в/н 11/4- 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник в/н 11/4-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 1/2 г/г/г бронза Stout",
        "price": 270,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 3/4 г/г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 1'' г/г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 11/4' г/'г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 3/4-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 1-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 11/2-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 11/4-1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 11/4-3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 1-3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник переходной 2\"-1\" бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1/2г/г бронза Stout",
        "price": 260,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1/2г/ш бронза Stout",
        "price": 260,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1/2ш/ш бронза Stout",
        "price": 270,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 3/4г/г бронза Stout",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 3/4г/ш бронза Stout",
        "price": 380,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 3/4ш/ш бронза Stout",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 1ш/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 2\" г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 11/4г/г бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 11/4г/ш бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход. 3/4-1/2 г/г бронза Stout",
        "price": 440,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход. 3/4-1/2 г/ш бронза Stout",
        "price": 410,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок переход. 3/4-1/2 ш/ш бронза Stout",
        "price": 450,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 12,5 мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 15 мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 17,5мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 20мм бронза Stout",
        "price": 168,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 25мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 30мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 40мм бронза Stout",
        "price": 250,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 50мм бронза Stout",
        "price": 270,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 65мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 100мм бронза Stout",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 120мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1/2\" ш/ш 150мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 12,5мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 15мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 20мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 25мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 30мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 40мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 50мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 65мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 3/4\" ш/ш 100мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 15мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 20мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 25мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 30мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 40мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 50мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 65мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 80мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Удлинитель 1\" ш/ш 100мм бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1/2-1/4 бронза Stout",
        "price": 88,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1/2-3/8 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 3/4-1/2 бронза Stout",
        "price": 135,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 3/8-1/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1- 1/2 бронза Stout",
        "price": 280,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 1- 3/4 бронза Stout",
        "price": 218,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4- 1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4- 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/4-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2- 1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2- 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 11/2-11/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2- 1/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2- 3/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-1 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-1 1/4 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Футорка 2-11/2 бронза Stout",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Кран шаровой угловой Stout 3/4 г/ш с американкой",
        "price": 1450,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Stout",
            "section": "Фитинги Stout - Бронза",
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
            "main": "Valtec",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "V"
    },
    {
        "name": "Труба 20мм металлопласт Valtec",
        "price": 170,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Valtec",
            "section": "Stout - Труба",
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
            "main": "Valtec",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "V"
    },
    {
        "name": "Труба 16мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 140,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 20мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 195,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 25мм Stout для водоснабжения и отопления из сшитого полиэтилена",
        "price": 300,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 16 Stout",
        "price": 80,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 20 Stout",
        "price": 98,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Гильза 25 Stout",
        "price": 140,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта 20х1\\2н Stout",
        "price": 280,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Муфта с накидной гайкой 16х1\\2в Stout",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Тройник 25х20 Stout",
        "price": 680,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок 20 Stout",
        "price": 430,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Уголок установочный 16х1/2в Stout",
        "price": 455,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 1/2\" Stout",
        "price": 1300,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Обратный клапан с мет.седлом 3/4\" Stout",
        "price": 1350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, прямой 1/2\" Stout",
        "price": 455,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 1/2\" Stout",
        "price": 455,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 3/4\" Stout",
        "price": 650,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Фильтр грубой очистки, косой 1\" Stout",
        "price": 920,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
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
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Переходник Stout с накидной гайкой (евроконус) 16 x 3/4\" для труб из с/п SFA-0034-001634",
        "price": 370,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Stout",
            "section": "Stout - Труба",
            "type": ""
        },
        "image": "S"
    },
    {
        "name": "Труба 16 stabil Rehau",
        "price": 278,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 20 stabil Rehau",
        "price": 440,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 25 stabil Rehau",
        "price": 680,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 16 pink Rehau",
        "price": 185,
        "unit": "м",
        "weight": 0.15,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 20 pink Rehau",
        "price": 280,
        "unit": "м",
        "weight": 0.2,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Труба 25 pink Rehau",
        "price": 465,
        "unit": "м",
        "weight": 0.25,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 16 Rehau PVDF",
        "price": 110,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 20 Rehau PVDF",
        "price": 160,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Гильза 25 Rehau PVDF",
        "price": 165,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 16 Rehau PVDF",
        "price": 590,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 20 Rehau PVDF",
        "price": 780,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25 Rehau PVDF",
        "price": 980,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Тройник 25х20 Rehau PVDF",
        "price": 910,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16 Rehau PVDF",
        "price": 460,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20 Rehau PVDF",
        "price": 610,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25 Rehau PVDF",
        "price": 920,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х16 Rehau PVDF",
        "price": 600,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х1/2н Rehau бронза",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х3/4н Rehau бронза",
        "price": 580,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х1/2н Rehau бронза",
        "price": 580,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х3/4н Rehau бронза",
        "price": 750,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1/2н Rehau бронза",
        "price": 950,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х3/4н Rehau бронза",
        "price": 760,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1н Rehau бронза",
        "price": 810,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 16х1/2в Rehau бронза",
        "price": 650,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х1/2в Rehau бронза",
        "price": 880,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 20х3/4в Rehau бронза",
        "price": 730,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х1/2в Rehau бронза",
        "price": 950,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта 25х3/4в Rehau бронза",
        "price": 850,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 16х1/2в Rehau бронза",
        "price": 650,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 16х3/4в Rehau бронза",
        "price": 650,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 20х1/2в Rehau бронза",
        "price": 870,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 20х3/4в Rehau бронза",
        "price": 880,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 25х3/4в Rehau бронза",
        "price": 850,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта с накидной гайкой 25х1в Rehau бронза",
        "price": 1150,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Муфта переходник на евроконус 16-G 3/4\" Rehau",
        "price": 680,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16 Rehau PVDF",
        "price": 480,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20 Rehau PVDF",
        "price": 680,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25 Rehau PVDF",
        "price": 880,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16 Rehau бронза",
        "price": 495,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20 Rehau бронза",
        "price": 850,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 25 Rehau бронза",
        "price": 950,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х1/2н Rehau бронза",
        "price": 620,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х1/2н Rehau бронза",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х3/4н Rehau бронза",
        "price": 680,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х1/2в Rehau бронза",
        "price": 620,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 16х3/4в Rehau бронза",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х1/2в Rehau бронза",
        "price": 880,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок 20х3/4в Rehau бронза",
        "price": 680,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 16х1/2в Rehau бронза",
        "price": 660,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х1/2в Rehau бронза",
        "price": 720,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 25х3/4в Rehau бронза",
        "price": 1100,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 16х1/2н Rehau бронза",
        "price": 660,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 20х1/2н Rehau бронза",
        "price": 850,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Уголок установочный 25х3/4н Rehau бронза",
        "price": 930,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Угольник настенный для гипсокартонных плит 16-Rp1/2x28 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Угольник настенный для гипсокартонных плит 20-Rp1/2x28 Rehau бронза",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Планка 2-й Rehau тип О 75/150 длинный",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Планка 1-й Rehau тип Z 30 короткий",
        "price": 270,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали для подкл. радиатора, Г-образная 16/250",
        "price": 950,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали для подкл. радиатора, Г-образная 16/500",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали для подкл. радиатора, Г-образная 20/250",
        "price": 980,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка из. нерж. стали для подкл. радиатора, Г-образная 20/500",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) для металлической трубки G 3/4 -15",
        "price": 450,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) flex/pink 16х2,2xG3/4",
        "price": 390,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) stabil 16,2x2,6xG3/4",
        "price": 350,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) stabil 20x2,9xG3/4",
        "price": 450,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Сервопривод Rehau UNI 230В нормально закрытый",
        "price": null,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Трубка для радиатора Rehau 20 х 15 х 20 х 250 мм Т-образная нерж. Сталь",
        "price": 1850,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Резьбозажимное соединение (Евроконус) Rehau 15 мм х 3/4 ЕК для стальных трубок",
        "price": 550,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Rehau",
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
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
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 18 2м",
        "price": 65,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 18 2м",
        "price": 65,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 22 2м",
        "price": 70,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 22 2м",
        "price": 70,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect синяя 28 2м",
        "price": 80,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб Energoflex Super Protect красная 28 2м",
        "price": 80,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Узел нижнего подключения (мультифлекс) прямой для радиатора Rehau 1/2 НР(ш) х 3/4 ЕК НР(ш) с шаровыми кранами и накидными гайками",
        "price": 2450,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Узел нижнего подключения (мультифлекс) угловой для радиатора Rehau 1/2 НР(ш) х 3/4 ЕК НР(ш) с шаровыми кранами и накидными гайками",
        "price": 2300,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Rehau - Труба",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
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
            "main": "Rehau",
            "section": "Rehau - Канализация",
            "type": ""
        },
        "image": "R"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 20*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 20*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 20*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 20*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 30*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*80",
        "price": 9500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 40*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*60",
        "price": 10700,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 50*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*60",
        "price": 12100,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 60*120",
        "price": 14500,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной алюм. 80*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 20*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 20*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 20*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 20*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 30*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*30",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 40*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 50*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*40",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*50",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*60",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*70",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*90",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*100",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 60*120",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Люк \"Практика\" под плитку нажимной металл 80*80",
        "price": null,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Люк",
            "section": "Люк под плитку Практика",
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
            "main": "Люк",
            "section": "Люк под плитку Практика",
            "type": ""
        },
        "image": "Л"
    },
    {
        "name": "Вентилятор электрический вытяжной d100",
        "price": 1300,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Вентилятор накладной круглый электрический вытяжной d100",
        "price": 1700,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 0,5м",
        "price": 195,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 1м",
        "price": 280,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 2м",
        "price": 540,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 110*55 мм х 3м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 120*60 мм х 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 120*60 мм х 1м",
        "price": 310,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 120*60 мм х 2м",
        "price": 595,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 120*60 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 204*60 мм х 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 204*60 мм х 1м",
        "price": 500,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 204*60 мм х 1,5м",
        "price": 735,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 204*60 мм х 2м",
        "price": 885,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод плоский 204*60 мм х 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских 110*55",
        "price": 80,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских 120*60",
        "price": 95,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских 204*60",
        "price": 180,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских с обратным клапаном 110*55",
        "price": 110,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских с обратным клапаном 120*60",
        "price": 120,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель воздуховодов плоских с обратным клапаном 204*60",
        "price": 190,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное 110*55 мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное 120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено вертикальное 204*60 мм",
        "price": 230,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное 110*55 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное 120*60 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено горизонтальное 204*60 мм",
        "price": 399,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 110*55 мм",
        "price": 190,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник 204*60 мм",
        "price": 350,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 110*55 мм",
        "price": 55,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 120*60 мм",
        "price": 65,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Держатель 204*60 мм",
        "price": 85,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 110*55 х 100 мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 120*60 х 100 мм",
        "price": 170,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 204*60 х 100 мм",
        "price": 325,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединительное колено 204*60 х 125 мм",
        "price": 330,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм 0,5м",
        "price": 185,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм 1м",
        "price": 298,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 100 мм 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм 0,5м",
        "price": 220,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм 1м",
        "price": 410,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 125 мм 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм 0,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм 1м",
        "price": 530,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм 1,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 150 мм 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм 1м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм 2м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Воздуховод круглый 200 мм 2,5м",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов 100 мм",
        "price": 110,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов 125 мм",
        "price": 150,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов 150 мм",
        "price": 135,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов 200 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов с обратным клапаном 100",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов с обратным клапаном 125",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель круглых воздуховодов с обратным клапаном 150",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Соединитель с монтажной пластиной 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 100 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 125 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Настенная пластина 150 мм",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Колено круглое 125 мм",
        "price": 248,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Тройник плоский (по центру круглый) 120х60х100 мм",
        "price": 390,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Редуктор 150/125/120/100/80 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Решетка вентиляционная 200х200 мм, белый",
        "price": 220,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Вент",
            "section": "Вентиляция",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка паронитовая 3/4\"",
        "price": 12,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка силиконоваяая 1/2\"",
        "price": 10,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Прокладка силиконоваяая 3/4\"",
        "price": 12,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Втулка защитная 16-20 мм синяя",
        "price": 60,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Втулка защитная 16-20 мм красная",
        "price": 60,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 1/2 синяя",
        "price": 55,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка монтажная 1/2 красная",
        "price": 55,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Компенсатор гидроудара Far (FA 2895 12) 1/2 НР 10-50 бар",
        "price": 2900,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Набор наклеек маркировочных",
        "price": 470,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Клей - герметик анаэробный, для резьбовых соединений 100 г",
        "price": 1200,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления 1/2",
        "price": 1850,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления 3/4",
        "price": 2150,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Neptun Bugatti Base (NEPBugBase12) 1/2\"",
        "price": 18500,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Система контроля протечки воды Neptun Bugatti Base (NEPBugBase12) 3/4\"",
        "price": 20500,
        "unit": "шт",
        "weight": 2.8,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кран шаровый с электроприводом Neptun PROFI 220В 1/2\"",
        "price": 6800,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Датчик контроля протечки воды Neptun SW005 12-24 В",
        "price": 1400,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб синяя 18 2м",
        "price": 70,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб краснаяя 18 2м",
        "price": 70,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб синяя 22 2м",
        "price": 85,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Теплоизоляция для труб краснаяя 22 2м",
        "price": 85,
        "unit": "шт",
        "weight": 0.3,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Дюбель-крюк двойной, для труб 20х80 мм",
        "price": 40,
        "unit": "шт",
        "weight": 0.006,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шина монтажная для труб 50х3х2000 мм",
        "price": 1200,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект Адаптер для подключения слива с двумя отводами 14 мм-50 мм (Шланги, Хомуты, Адаптер)",
        "price": 550,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Адаптер для подключения слива с двумя отводами 14 мм-50 мм",
        "price": 250,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Муфта переходная FAR 1\" х 1/2\" г/г латунная",
        "price": 650,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
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
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Американка угловая Valtec 1/2\" г/ш латунная",
        "price": 330,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Американка угловая Valtec 3/4 ВР(г) х 3/4 НР(ш) латунная",
        "price": 590,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Сифон для ванны Mcalpine 1 1/2 х 40 мм с выпуском и ревизией полуавтомат хром",
        "price": 4800,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Расходник сантехнический",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Розетка Legrand Valena Classic белый 1-ая с/з 774420",
        "price": 180,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Розетка Legrand Valena белый 1-ая с/з с крышкой 774422",
        "price": 280,
        "unit": "шт",
        "weight": 0.08,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель Legrand Valena Classic белый 1-клавишный 774401",
        "price": 180,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Выключатель Legrand Valena Classic белый 2-х клавишный 774405",
        "price": 250,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Переключатель Legrand Valena Classic белый 1-клавишный 774406",
        "price": 230,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Переключатель Legrand Valena Classic белый 2-х клавишный 774408",
        "price": 290,
        "unit": "шт",
        "weight": 0.09,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 1-я Legrand Valena Classic, белая",
        "price": 60,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 2-я Legrand Valena Classic, белая",
        "price": 75,
        "unit": "шт",
        "weight": 0.015,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 3-я Legrand Valena Classic, белая",
        "price": 95,
        "unit": "шт",
        "weight": 0.02,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 4-я Legrand Valena Classic, белая",
        "price": 140,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Рамка 5-я Legrand Valena Classic, белая",
        "price": 180,
        "unit": "шт",
        "weight": 0.03,
        "category": {
            "main": "Электрика",
            "section": "Legrand Легранд",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 1/2\", с манометром",
        "price": 2700,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 1/2\", с манометром",
        "price": 3200,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 1/2\", без манометра",
        "price": 3800,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 1/2\", без манометра",
        "price": 3400,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ХВС) 3/4\", с манометром",
        "price": 3700,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр тонкой очистки, промывной (ГВС) 3/4\", с манометром",
        "price": 3950,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
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
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
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
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр грубой очистки универсальный Valtec 1/2 г х 1/2 г",
        "price": 700,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр грубой очистки универсальный Valtec 3/4 г х 3/4 г",
        "price": 1750,
        "unit": "шт",
        "weight": 0.025,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр промывной Far с манометром 1/2 НР(ш) х 1/2 НР(ш) (FA 3944 12100)",
        "price": 7800,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр промывной Far с манометром 3/4 НР(ш) х 3/4 НР(ш) (FA 39A4 34100)",
        "price": 9500,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Редуктор давления FAR 3/4 н мембранный с манометром",
        "price": 10500,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр колбовый 1\" (ввод)",
        "price": 1400,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун 1/2\"",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун 3/4\"",
        "price": 8500,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Фильтр магистральный Гейзер Тайфун 1\"",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Картридж в фильтр магистральный ПФМ-Г 20/10 10SL механической очистки для холодной и горячей воды",
        "price": 230,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Счетчик холодной воды ВСХ-15",
        "price": 1350,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Счетчик универсальный Valtec DN15 80 мм со сгонами с импульсным выходом",
        "price": 1950,
        "unit": "шт",
        "weight": 0.65,
        "category": {
            "main": "Сантехника",
            "section": "Фильтры гурбой и тонкой очистки ,регуляторы давления,манометры, счетчики",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кронштейн для радиатора Rifar (пара)",
        "price": 860,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Радиаторы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Кронштейн для радиатора Эконом (пара)",
        "price": 150,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сантехника",
            "section": "Радиаторы",
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
            "main": "Сантехника",
            "section": "Радиаторы",
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
            "main": "Сантехника",
            "section": "Радиаторы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект монтажный переходной Rifar 1 НР х 1/2 ВР для радиатора белый",
        "price": 450,
        "unit": "шт",
        "weight": 0.25,
        "category": {
            "main": "Сантехника",
            "section": "Радиаторы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Комплект звукоизоляционный для канализационных труб 110 мм 3 м",
        "price": 2300,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Сантехника",
            "section": "Радиаторы",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Заглушка для радиатора Rifar 3\\4\"н",
        "price": 85,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Сантехника",
            "section": "Радиаторы",
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
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Крепление одинарное для монтажа инсталяции Tece 9030002",
        "price": 750,
        "unit": "шт",
        "weight": 0.01,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Уголок для монтажа инсталяции Tece",
        "price": 550,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Профиль для монтажа инсталяции Tece 4,5 м",
        "price": 3800,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
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
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Душевой трап с боковым отводом 100х100, нерж",
        "price": 650,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Трап Лоток душевой TIM с гидрозатвором 600 мм d50 мм решетка из нержавеющей стали",
        "price": 3900,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Шаблон для монтажа водорозеток",
        "price": 420,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Сантехника",
            "type": ""
        },
        "image": "С"
    },
    {
        "name": "Тепловая пушка электрическая 2000 Вт (20 м2)",
        "price": 3300,
        "unit": "шт",
        "weight": 5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба 16 Vieir Сшитый Полиэтилен",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Сопутствующие товары",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Труба 20 Vieir Сшитый Полиэтилен",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Сопутствующие товары",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Труба 25 Vieir Сшитый Полиэтилен",
        "price": null,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Сопутствующие товары",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Керамическая плитка",
        "price": null,
        "unit": "м2",
        "weight": 16.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Плитка",
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
            "main": "Сопутствующие товары",
            "section": "Плитка",
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
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плинтус ПВХ 55 мм, 2,2 м, Цвет",
        "price": 135,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 55 мм, Цвет",
        "price": 45,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 55 мм, Цвет",
        "price": 45,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 55 мм, Цвет",
        "price": 45,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 55 мм лев/прав 2шт Цвет",
        "price": 80,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 70 мм, Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 70 мм лев/прав 2шт Цвет",
        "price": null,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плинтус ПВХ 85 мм, 2,2 м, Цвет",
        "price": 210,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Соединитель плинтуса ПВХ 85 мм, Цвет",
        "price": 75,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса наружный ПВХ 85 мм, Цвет",
        "price": 75,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Угол плинтуса внутренний ПВХ 85 мм, Цвет",
        "price": 75,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Заглушка плинтуса ПВХ 85 мм лев/прав 2шт Цвет",
        "price": 140,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Сопутствующие товары",
            "section": "ПВХ",
            "type": ""
        },
        "image": "П"
    },
    {
        "name": "Плита потолочная Armstrong 600х600 Tegular, сталь (1шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Плита потолочная Armstrong Ангара 600х600х6мм (24 шт)",
        "price": 160,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Плита потолочная Armstrong Енисей Board 600х600х7мм (24шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Плита потолочная Armstrong Байкал 600х600х12мм (1шт)",
        "price": 227,
        "unit": "шт",
        "weight": 1.15,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Профиль угловой универсальный Armstrong PL 19х24х3000 мм оцинкованный белый",
        "price": 138,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Профиль несущий Armstrong 3700 мм",
        "price": 165,
        "unit": "шт",
        "weight": 0.6,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Профиль поперечный Armstrong 1200 мм",
        "price": 65,
        "unit": "шт",
        "weight": 0.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Профиль поперечный Armstrong 600 мм",
        "price": 38,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Подвес Armstrong АП 0,5м",
        "price": 15,
        "unit": "шт",
        "weight": 0.05,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Подвес Armstrong АП 1м",
        "price": 25,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Чистовые материалы",
            "type": ""
        },
        "image": "Ч"
    },
    {
        "name": "Бирка кабельная (250 шт)",
        "price": null,
        "unit": "шт",
        "weight": 0.8,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 4 мм",
        "price": 25,
        "unit": "шт",
        "weight": 0.001,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 6 мм",
        "price": 30,
        "unit": "шт",
        "weight": 0.002,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 8 мм",
        "price": 35,
        "unit": "шт",
        "weight": 0.003,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 10 мм",
        "price": 40,
        "unit": "шт",
        "weight": 0.004,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Гильза кабельная медная ГМЛ под кабель 12 мм",
        "price": 45,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 1,5 мм (100 шт)",
        "price": 195,
        "unit": "шт",
        "weight": 0.1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 2,5 мм (100 шт)",
        "price": 230,
        "unit": "шт",
        "weight": 0.15,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Наконечник НШВИ 6 мм (1 шт)",
        "price": 3.5,
        "unit": "шт",
        "weight": 0.005,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Термоусадочная трубка, Набор (20шт)",
        "price": 250,
        "unit": "шт",
        "weight": 0.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Распределительная коробка уравнивания потенциалов IP55 100х100х50 мм 7 вводов (КУП)",
        "price": 390,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Сопутствующие товары",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D16 мм 2 м цвет белый",
        "price": null,
        "unit": "шт",
        "weight": 1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Труба гладкая для кабеля ПВХ D20 мм 2 м цвет черный",
        "price": 115,
        "unit": "шт",
        "weight": 1.2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
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
            "main": "Сопутствующие товары",
            "section": "Электрика",
            "type": ""
        },
        "image": "Э"
    },
    {
        "name": "Профиль перф. П-образный 1,5х3000 мм, для монтажа металлических лотков",
        "price": 1000,
        "unit": "шт",
        "weight": null,
        "category": {
            "main": "Сопутствующие товары",
            "section": "",
            "type": ""
        },
        "image": "В"
    },
    {
        "name": "Труба оцинкованная d25 с наружной резьбой 2 м",
        "price": null,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
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
            "main": "Сопутствующие товары",
            "section": "Металл",
            "type": ""
        },
        "image": "М"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 16 мм усиленные 1000 шт.",
        "price": 1780,
        "unit": "шт",
        "weight": 1.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 19 мм усиленные 1000 шт.",
        "price": 1980,
        "unit": "шт",
        "weight": 2,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 22 мм усиленные 1000 шт.",
        "price": 2100,
        "unit": "шт",
        "weight": 2.5,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Гвозди для монтажного пистолета 3.0 х 25 мм усиленные 1000 шт.",
        "price": 2200,
        "unit": "шт",
        "weight": 3,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Газовый баллон для монтажных пистолетов 165 мм 80мл",
        "price": 750,
        "unit": "шт",
        "weight": 0.9,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    },
    {
        "name": "Саморез кровельный по профлисту гарпун 5,5х38",
        "price": 650,
        "unit": "кг",
        "weight": 1,
        "category": {
            "main": "Сопутствующие товары",
            "section": "Расходники",
            "type": ""
        },
        "image": "Р"
    }
];

const grid = document.getElementById("productGrid");
const popularGrid = document.getElementById("popularGrid");
const popularArrowLeft = document.querySelector(".popular-arrow-left");
const popularArrowRight = document.querySelector(".popular-arrow-right");
const categoryControls = document.getElementById("categoryControls");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");
const closeCartBtn = document.getElementById("closeCart");
const cartTotalEl = document.getElementById("cartTotal");
const cartView = document.getElementById("cartView");
const openCheckoutBtn = document.getElementById("openCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const cancelCheckoutBtn = document.getElementById("cancelCheckout");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutNameInput = checkoutForm?.querySelector("input[name='customerName']");
const checkoutPhoneInput = checkoutForm?.querySelector("input[name='customerPhone']");
const checkoutAddressInput = checkoutForm?.querySelector("input[name='deliveryAddress']");
const nameSuggestionsEl = document.getElementById("nameSuggestions");
const phoneSuggestionsEl = document.getElementById("phoneSuggestions");
const addressSuggestionsEl = document.getElementById("addressSuggestions");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const searchInput = document.getElementById("searchInput");

let cart = loadCart();
let searchQuery = "";
let activeCategoryPath = "";

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

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("matmix_cart") || "[]");
        return Array.isArray(saved) ? saved.filter(item => products[item.id]) : [];
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem("matmix_cart", JSON.stringify(cart));
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
        checkoutMessage.classList.remove("success");
        checkoutMessage.textContent = "";
    }
}

function setCheckoutSubmitDisabled(isDisabled) {
    checkoutForm?.querySelector("button[type='submit']")?.toggleAttribute("disabled", isDisabled);
}

function setupCheckoutFormFields() {
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
}

function formatPrice(value) {
    if (value === null || value === undefined) return "Цена по запросу";
    return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function formatWeight(value) {
    if (value === null || value === undefined) return "Вес не указан";
    return `${new Intl.NumberFormat("ru-RU").format(value)} кг`;
}

function cleanDisplayText(value) {
    return String(value || "").replace(/\?/g, "").replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value) {
    return cleanDisplayText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9\s-]/g, " ")
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

function getProductSearchText(product) {
    return normalizeSearchText([
        product.name,
        product.unit,
        formatWeight(product.weight),
        getCategorySearchText(product)
    ].filter(Boolean).join(" "));
}

function getProductSearchScore(product, query) {
    const queryText = normalizeSearchText(query);
    if (!queryText) return { score: 1, matchedTokens: 0 };

    const productText = getProductSearchText(product);
    const queryTokens = getSearchTokens(queryText);
    if (!queryTokens.length) return { score: 1, matchedTokens: 0 };

    let score = productText.includes(queryText) ? 100 : 0;
    let matchedTokens = 0;

    queryTokens.forEach(token => {
        const variants = expandSearchToken(token);
        const bestVariantScore = variants.reduce((best, variant) => {
            if (productText.includes(variant)) {
                const exactWordScore = productText.split(" ").includes(variant) ? 12 : 8;
                return Math.max(best, exactWordScore + Math.min(variant.length, 12));
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

function getProductCatalogCategory(product) {
    const source = [
        cleanDisplayText(product.name),
        product.category?.main,
        product.category?.section,
        product.category?.type
    ].filter(Boolean).join(" ").toLowerCase();

    const rule = categoryRules.find(item => item.words.some(word => source.includes(word.toLowerCase())));
    return rule ? rule.path : ["Черновые материалы", "Смеси"];
}

function getCategoryParts(category, product) {
    if (product) return getProductCatalogCategory(product);
    if (Array.isArray(category)) return category.filter(Boolean);
    return [category?.main, category?.section, category?.type].filter(Boolean);
}

function getCategoryPath(category, product) {
    return getCategoryParts(category, product).join(" / ");
}

function getCategorySearchText(product) {
    return getProductCatalogCategory(product).join(" ").toLowerCase();
}

function getCategoryFilterOptions() {
    const options = [{ label: "Все товары", path: "", level: 0 }];

    Object.entries(catalog).forEach(([main, sections]) => {
        options.push({ label: main, path: main, level: 0 });

        Object.entries(sections).forEach(([section, types]) => {
            options.push({ label: section, path: `${main} / ${section}`, level: 1 });

            types.forEach(type => {
                options.push({ label: type, path: `${main} / ${section} / ${type}`, level: 2 });
            });
        });
    });

    return options;
}

function productMatchesCategory(product) {
    if (!activeCategoryPath) return true;
    return getCategoryPath(product.category, product).startsWith(activeCategoryPath);
}

function getCartTotal() {
    return cart.reduce((sum, item) => {
        const product = products[item.id];
        return sum + (product.price || 0) * item.qty;
    }, 0);
}

function getCartWeight() {
    return cart.reduce((sum, item) => {
        const product = products[item.id];
        const weight = Number(product?.weight);
        return sum + (Number.isFinite(weight) ? weight : 0) * item.qty;
    }, 0);
}

function getCartQty() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartSummary() {
    cartCountEl.textContent = getCartQty();
    cartTotalEl.innerHTML = `
        <span>Итого: ${new Intl.NumberFormat("ru-RU").format(getCartTotal())} ₽</span>
        <span id="cartWeight">Вес: ${new Intl.NumberFormat("ru-RU").format(getCartWeight())} кг</span>
    `;
    if (openCheckoutBtn) {
        openCheckoutBtn.disabled = !cart.length;
    }
}

function setProductQty(id, nextQty, options = {}) {
    const { renderCartView = true } = options;
    const item = cart.find(entry => entry.id === id);

    if (nextQty <= 0) {
        cart = cart.filter(entry => entry.id !== id);
    } else if (item) {
        item.qty = nextQty;
    } else {
        cart.push({ id, qty: nextQty });
    }

    saveCart();
    updateCartSummary();
    if (grid) {
        renderProducts();
    }
    if (popularGrid) {
        renderPopularProducts();
    }

    if (renderCartView && !cartModal.classList.contains("hidden")) {
        renderCart();
    }
}

function showCartView() {
    cartView?.classList.remove("hidden");
    checkoutForm?.classList.add("hidden");
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

function renderProducts() {
    if (!grid) return;
    grid.innerHTML = "";

    const categoryProducts = products
        .map((product, id) => ({ product, id }))
        .filter(({ product }) => productMatchesCategory(product));

    const visibleProducts = smartSearch(searchQuery, categoryProducts);

    if (!visibleProducts.length) {
        grid.innerHTML = `<p class="empty-products">Ничего не найдено</p>`;
        return;
    }

    visibleProducts.forEach(({ product, id }) => {
        grid.appendChild(createProductCard(product, id));
    });
}

function createProductCard(product, id) {
    const cartItem = cart.find(item => item.id === id);
    const qty = cartItem ? cartItem.qty : 0;
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
        <div class="card-main">
            <div class="thumb" aria-hidden="true">${product.image}</div>
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

function renderPopularProducts() {
    if (!popularGrid) return;
    popularGrid.innerHTML = "";

    popularProductNames.forEach(name => {
        const id = products.findIndex(product => product.name === name);
        if (id === -1) return;
        popularGrid.appendChild(createProductCard(products[id], id));
    });
}

function renderCategoryControls() {
    if (!categoryControls) return;
    categoryControls.innerHTML = "";

    getCategoryFilterOptions().forEach(option => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `category-control level-${option.level}`;
        button.dataset.path = option.path;
        button.textContent = option.label;
        button.classList.toggle("active", option.path === activeCategoryPath);
        categoryControls.appendChild(button);
    });
}

function getQtyControls(id, qty, inputMode = false) {
    return `
        <div class="qty-row">
            <button class="qty minus" data-id="${id}" type="button" aria-label="Уменьшить количество">−</button>
            ${inputMode
                ? `<input class="qty-input" data-id="${id}" type="text" inputmode="numeric" pattern="[0-9]*" value="${qty}" aria-label="Количество">`
                : `<span class="qty-val">${qty}</span>`}
            <button class="qty plus" data-id="${id}" type="button" aria-label="Увеличить количество">+</button>
        </div>
    `;
}

function renderCart() {
    cartItemsEl.innerHTML = "";

    if (!cart.length) {
        cartItemsEl.innerHTML = `<p class="empty-cart">Корзина пока пустая</p>`;
        updateCartSummary();
        return;
    }

    cart.forEach(item => {
        const product = products[item.id];
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div>
                <b>${cleanDisplayText(product.name)}</b>
                <span>${formatPrice(product.price)} / ${product.unit}</span>
            </div>
            ${getQtyControls(item.id, item.qty, true)}
        `;
        cartItemsEl.appendChild(row);
    });

    updateCartSummary();
}

function handleQtyClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isInteger(id)) return;

    const current = cart.find(item => item.id === id)?.qty || 0;

    if (button.classList.contains("add") || button.classList.contains("plus")) {
        setProductQty(id, current + 1);
    }

    if (button.classList.contains("minus")) {
        setProductQty(id, current - 1);
    }
}

grid?.addEventListener("click", handleQtyClick);
popularGrid?.addEventListener("click", handleQtyClick);
cartItemsEl.addEventListener("click", handleQtyClick);

cartItemsEl.addEventListener("input", event => {
    const input = event.target.closest(".qty-input");
    if (!input) return;

    const id = Number(input.dataset.id);
    if (!Number.isInteger(id)) return;

    const sanitizedValue = input.value.replace(/\D/g, "").replace(/^0+/, "");
    if (input.value !== sanitizedValue) {
        input.value = sanitizedValue;
    }
    if (!sanitizedValue) return;

    setProductQty(id, Number(sanitizedValue), { renderCartView: false });
});

cartItemsEl.addEventListener("change", event => {
    const input = event.target.closest(".qty-input");
    if (!input) return;

    const id = Number(input.dataset.id);
    if (!Number.isInteger(id)) return;

    const current = cart.find(item => item.id === id)?.qty || 1;
    if (!input.value) {
        input.value = current;
    }
});

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

cartBtn.addEventListener("click", event => {
    event.stopPropagation();
    cartModal.classList.toggle("hidden");
    showCartView();
    renderCart();
});

closeCartBtn.addEventListener("click", () => {
    cartModal.classList.add("hidden");
});

openCheckoutBtn?.addEventListener("click", showCheckoutForm);

cancelCheckoutBtn?.addEventListener("click", () => {
    showCartView();
    renderCart();
});

checkoutForm?.addEventListener("submit", event => {
    event.preventDefault();

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

    if (checkoutMessage) {
        checkoutMessage.classList.add("success");
        checkoutMessage.innerHTML = `
            <span class="checkout-success-icon" aria-hidden="true">✓</span>
            <span class="checkout-success-text">
                <strong class="checkout-success-title">Заказ успешно оформлен</strong>
                <span>Спасибо за обращение в «МатМикс».</span>
                <span>В ближайшее время наш менеджер свяжется с вами для подтверждения заказа, уточнения времени доставки и ответит на все ваши вопросы.</span>
            </span>
        `;
    }

    setCheckoutSubmitDisabled(true);
});

cartModal.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    cartModal.classList.add("hidden");
    showCartView();
    closeMenu();
});

function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.classList.remove("is-open");
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
}

menuToggle?.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

mainNav?.addEventListener("click", event => {
    if (event.target.closest("a")) {
        closeMenu();
    }
});

searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    if (!grid && searchQuery) {
        window.location.href = `catalog.html?search=${encodeURIComponent(searchQuery)}`;
        return;
    }
    renderProducts();
});

categoryControls?.addEventListener("click", event => {
    const button = event.target.closest(".category-control");
    if (!button) return;
    activeCategoryPath = button.dataset.path;
    renderCategoryControls();
    renderProducts();
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

renderCategoryControls();
renderProducts();
renderPopularProducts();
setupCheckoutFormFields();
updateCartSummary();

