let players = [
  {
    name: "Red",
    color: "red",
    money: 37.7,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    hasGetOutOfJailCard: false
  },
  {
    name: "Green",
    color: "green",
    money: 37.7,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    hasGetOutOfJailCard: false
  },
  {
    name: "Blue",
    color: "blue",
    money: 37.7,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    hasGetOutOfJailCard: false
  },
  {
    name: "Yellow",
    color: "yellow",
    money: 37.7,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    hasGetOutOfJailCard: false
  },
];

let propertyOwners = {}; // key: label, value: player index

const rentTables = {
  Joburg: [0.02, 0.1, 0.2, 0.4, 0.8, 1.6, 2.2, 3, 5.5],
  "Cape Town": [0.04, 0.2, 0.4, 0.8, 1.6, 2.2, 3, 4, 7],
  Delhi: [0.06, 0.3, 0.6, 1.2, 1.8, 2.5, 3.5, 5, 7.5],
  Madras: [0.06, 0.3, 0.6, 1.2, 1.8, 2.5, 3.5, 5, 7.5],
  Bombay: [0.08, 0.4, 0.6, 1.5, 2.5, 3.5, 4.5, 6, 8.5],
  Perth: [0.1, 0.5, 1, 2, 3, 4, 5, 6.5, 8],
  Sydney: [0.1, 0.5, 1, 2, 3, 4, 5, 6.5, 8],
  Melbourne: [0.12, 0.6, 1.2, 2.4, 3.5, 4.5, 5.5, 7, 9.5],
  Shenzhen: [0.14, 0.7, 1.4, 2.8, 3.8, 4.8, 6, 7.5, 10],
  Beijing: [0.14, 0.7, 1.4, 2.8, 3.8, 4.8, 6, 7.5, 10],
  Shanghai: [0.16, 0.8, 1.6, 3, 4, 5, 6, 8, 11],
  Kyoto: [0.18, 0.2, 1.8, 3.5, 4.5, 5.5, 6.5, 8.5, 12],
  Osaka: [0.18, 0.2, 1.8, 3.5, 4.5, 5.5, 6.5, 8.5, 12],
  Tokyo: [0.2, 1, 2, 3.8, 4.8, 5.8, 6.8, 8.8, 13.5],
  Munich: [0.22, 1.1, 2.2, 4, 5, 6, 7, 10, 14],
  Berlin: [0.22, 1.1, 2.2, 4, 5, 6, 7, 10, 14],
  Frankfurt: [0.24, 1.2, 2.4, 4.8, 5.2, 6.2, 8.2, 10.5, 15],
  Liverpool: [0.26, 1.3, 2.6, 4.4, 5.3, 6.5, 8.5, 11, 15.5],
  Manchester: [0.26, 1.3, 2.6, 4.4, 5.3, 6.5, 8.5, 11, 15.5],
  London: [0.28, 1.5, 3, 4.5, 5.5, 7, 9, 12, 16],
  "San Francisco": [0.35, 1.75, 4.5, 5.5, 7, 9, 11, 16, 18],
  "New York": [0.5, 3, 5, 8, 10, 12, 15, 18, 20],
};

const buildingPrices = {
  Joburg: 0.5,
  "Cape Town": 0.5,
  Delhi: 0.5,
  Madras: 0.5,
  Bombay: 0.5,
  Perth: 1,
  Sydney: 1,
  Melbourne: 1,
  Shenzhen: 1,
  Beijing: 1,
  Shanghai: 1,
  Kyoto: 1.5,
  Osaka: 1.5,
  Tokyo: 1.5,
  Munich: 1.5,
  Berlin: 1.5,
  Frankfurt: 1.5,
  Liverpool: 2,
  Manchester: 2,
  London: 2,
  "San Francisco": 2,
  "New York": 2,
};

const propertyGroups = {
  SouthAfrica: ["Joburg", "Cape Town"],
  India: ["Delhi", "Madras", "Bombay"],
  Australia: ["Perth", "Sydney", "Melbourne"],
  China: ["Shenzhen", "Beijing", "Shanghai"],
  Japan: ["Kyoto", "Osaka", "Tokyo"],
  Germany: ["Munich", "Berlin", "Frankfurt"],
  UK: ["Liverpool", "Manchester", "London"],
  USA: ["New York", "San Francisco"],
};

let labels = [
  "GO",
  "Joburg",
  "Chance",
  "Cape Town",
  "Industry\nTax",
  "Lottery",
  "Delhi",
  "Chance",
  "Madras",
  "Bombay",
  "JAIL",
  "Perth",
  "Auction",
  "Sydney",
  "Melbourne",
  "Lottery",
  "Shenzhen",
  "Chance",
  "Beijing",
  "Shanghai",
  "FREE\nPARKING",
  "Kyoto",
  "Chance",
  "Osaka",
  "Tokyo",
  "Lottery",
  "Munich",
  "Berlin",
  "Chance",
  "Frankfurt",
  "GO TO\nJAIL",
  "Liverpool",
  "Manchester",
  "Auction",
  "London",
  "Lottery",
  "Chance",
  "San Francisco",
  "Industry Tax",
  "New York",
];

const propertyColors = {
  "South Africa": {
    names: ["Joburg", "Cape Town"],
    color: "rgb(214, 132, 109)",
  },
  India: {
    names: ["Delhi", "Madras", "Bombay"],
    color: "rgb(173, 216, 230)",
  },
  Australia: {
    names: ["Perth", "Sydney", "Melbourne"],
    color: "rgb(204, 116, 214)",
  },
  China: {
    names: ["Shenzhen", "Beijing", "Shanghai"],
    color: "rgb(214, 156, 75)",
  },
  Japan: {
    names: ["Kyoto", "Osaka", "Tokyo"],
    color: "rgb(217, 73, 61)",
  },
  Germany: {
    names: ["Munich", "Berlin", "Frankfurt"],
    color: "rgb(194, 196, 67)",
  },
  UK: {
    names: ["Liverpool", "Manchester", "London"],
    color: "rgb(23, 173, 48)",
  },
  USA: {
    names: ["San Francisco", "New York"],
    color: "rgb(81, 108, 240)",
  },
  Chance: {
    names: ["Chance"],
    color: "rgb(255, 230, 130)",
  },
};


const specialTileColors = {
  Chance: "#FFE682",
  "Industry\nTax": "#D3D3D3",
  Auction: "#D3D3D3",
  "Lottery": "#64A2D1",
};

const propertyPrices = {
  Joburg: 0.6,
  "Cape Town": 0.6,
  Delhi: 1,
  Madras: 1,
  Bombay: 1.2,
  Perth: 1.4,
  Sydney: 1.4,
  Melbourne: 1.6,
  Shenzhen: 1.8,
  Beijing: 1.8,
  Shanghai: 2,
  Kyoto: 2.2,
  Osaka: 2.2,
  Tokyo: 2.4,
  Munich: 2.6,
  Berlin: 2.8,
  Frankfurt: 2.8,
  Liverpool: 3,
  Manchester: 3,
  London: 3.2,
  "San Francisco": 3.5,
  "New York": 4,
};
