let boardSize = 600;
let cornerSize;
let sideWidth;
let sideHeight;
let innerTiles = [];

let labels = [
  "GO",
  "Joburg",
  "Chance",
  "Cape Town",
  "Industry\nTax",
  "Planning\nPermission",
  "Delhi",
  "Chance",
  "Madras",
  "Bombay",
  "JAIL",
  "Perth",
  "Auction",
  "Sydney",
  "Melbourne",
  "Planning\nPermission",
  "Shenzhen",
  "Chance",
  "Beijing",
  "Shanghai",
  "FREE\nPARKING",
  "Kyoto",
  "Chance",
  "Osaka",
  "Tokyo",
  "Planning\nPermission",
  "Munich",
  "Berlin",
  "Chance",
  "Frankfurt",
  "GO TO\nJAIL",
  "Liverpool",
  "Manchester",
  "Auction",
  "London",
  "Planning\nPermission",
  "Chance",
  "San Francisco",
  "Industry Tax",
  "New York",
];

const propertyColors = {
  "South Africa": {
    names: ["Joburg", "Cape Town"],
    color: "#D65F3E",
  },
  India: {
    names: ["Delhi", "Madras", "Bombay"],
    color: "#ADD8E6",
  },
  Australia: {
    names: ["Perth", "Sydney", "Melbourne"],
    color: "#EA2BFF",
  },
  China: {
    names: ["Shenzhen", "Beijing", "Shanghai"],
    color: "#FFA01C",
  },
  Japan: {
    names: ["Kyoto", "Osaka", "Tokyo"],
    color: "#FF1500",
  },
  Germany: {
    names: ["Munich", "Berlin", "Frankfurt"],
    color: "#ECF016",
  },
  UK: {
    names: ["Liverpool", "Manchester", "London"],
    color: "#17AD30",
  },
  USA: {
    names: ["San Francisco", "New York"],
    color: "#516CF0",
  },
  Chance: {
    names: ["Chance"],
    color: "#FFE682",
  },
  "Planning Permission": {
    names: ["Planning\nPermission"],
    color: "#64A2D1",
  },
};

const specialTileColors = {
  Chance: "#FFE682",
  "Industry\nTax": "#D3D3D3",
  Auction: "#D3D3D3",
  "Planning\nPermission": "#64A2D1",
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

// Filter only property tiles
let propertyLabels = labels.filter(
  (l) =>
    !l.includes("GO") &&
    !l.includes("JAIL") &&
    !l.includes("FREE") &&
    !l.includes("Chance") &&
    !l.includes("Tax") &&
    !l.includes("Planning") &&
    !l.includes("Auction")
);

function preload() {
  font = loadFont("PoiretOne-Regular.ttf");
}

function drawBoard() {
  stroke(0);
  noFill();
  let idx = 0;

  // Bottom row: GO → JAIL
  drawCorner(boardSize - cornerSize, boardSize - cornerSize, labels[idx++]);
  for (let i = 8; i >= 0; i--) {
    drawLabel(
      cornerSize + i * sideHeight,
      boardSize - cornerSize,
      sideHeight,
      cornerSize,
      labels[idx++]
    );
  }
  drawCorner(0, boardSize - cornerSize, labels[idx++]);

  // Left column: JAIL → FREE PARKING
  for (let i = 8; i >= 0; i--) {
    drawLabel(
      0,
      cornerSize + i * sideHeight,
      cornerSize,
      sideHeight,
      labels[idx++]
    );
  }
  drawCorner(0, 0, labels[idx++]);

  // Top row
  for (let i = 0; i < 9; i++) {
    drawLabel(
      cornerSize + i * sideHeight,
      0,
      sideHeight,
      cornerSize,
      labels[idx++]
    );
  }
  drawCorner(boardSize - cornerSize, 0, labels[idx++]);

  // Right column
  for (let i = 0; i < 9; i++) {
    drawLabel(
      boardSize - cornerSize,
      cornerSize + i * sideHeight,
      cornerSize,
      sideHeight,
      labels[idx++]
    );
  }
}

function drawCorner(x, y, label) {
  fill(200);
  rect(x, y, cornerSize, cornerSize);
  fill(0);
  text(label, x + cornerSize / 2, y + cornerSize / 2);
}

function drawLabel(x, y, w, h, label) {
  let isProperty = propertyLabels.includes(label);
  let fillColor = "#DCDCDC"; // default colour

  if (isProperty) {
    fillColor = getPropertyColor(label);
  } else if (specialTileColors[label]) {
    fillColor = specialTileColors[label];
  }

  fill(fillColor);
  stroke(0);
  rect(x, y, w, h);

  fill(0);
  textAlign(CENTER, CENTER);

  if (isProperty) {
    text(label, x + w / 2, y + h / 2 - 10);
    let price = propertyPrices[label] ? `$${propertyPrices[label]}M` : "";

    text(price, x + w / 2, y + h / 2 + 10);
  } else {
    text(label, x + w / 2, y + h / 2);
  }

  // Draw ownership indicator
  let ownerIndex = propertyOwners[label];
  if (ownerIndex !== undefined) {
    fill(players[ownerIndex].color);
    rect(x + w - 15, y + h - 15, 15, 15); // small square in corner
  }
}

function drawCorner(x, y, label) {
  let cornerColor = getCornerColor(label);
  fill(cornerColor);
  stroke(0);
  rect(x, y, cornerSize, cornerSize);

  fill(0);
  text(label, x + cornerSize / 2, y + cornerSize / 2);
}

function getCornerColor(label) {
  if (label.includes("GO") && !label.includes("JAIL")) return "#1DC4A3"; // Turqoise
  if (label.includes("JAIL")) return "#F5C962"; // Orange
  if (label.includes("FREE")) return "#1DC4A3"; // Turqoise
}

function drawPropertyTiles() {
  const innerX = cornerSize;
  const innerY = cornerSize;
  const innerW = boardSize - 2 * cornerSize;
  const innerH = boardSize - 2 * cornerSize;

  const cols = 5;
  const rows = 5;
  const total = 22;
  const tileW = innerW / cols;
  const tileH = innerH / rows;

  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (count >= total) return;
      if ((r === 2 && c === 2) || (r === 0 && c === 0) || (r === 4 && c === 4))
        continue;

      let x = innerX + c * tileW;
      let y = innerY + r * tileH;
      let label = propertyLabels[count];
      let fillColor = getPropertyColor(label);

      fill(fillColor);
      stroke(0);
      rect(x, y, tileW, tileH);

      fill(0);
      text(label, x + tileW / 2, y + tileH / 2);

      count++;
    }
  }

  // Draw player tokens
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let [x, y] = getTilePosition(player.pos);

    fill(player.color);
    stroke(0);
    strokeWeight(1.5);
    ellipse(x + i * 8 - 12, y, 20); // Spread out tokens
  }

  // Draw bonuses and hazards on owned properties
  for (let label of propertyLabels) {
    let idx = labels.indexOf(label);
    if (idx === -1) continue;

    let [x, y] = getTilePosition(idx);

    if (bonusBuildings[label]) {
      fill("pink");
      noStroke();
      ellipse(x - 10, y - 10, 12); // Small pink circle in the tile
      console.log(`Drawing bonus building on ${label} at (${x}, ${y})`);
    }

    if (hazards[label]) {
      fill("black");
      noStroke();
      ellipse(x - 10, y - 10, 12); // Small black circle in the tile
      console.log(`Drawing hazard on ${label} at (${x}, ${y})`);
    }
  }
}

function drawChanceCard() {
  const chanceSize = cornerSize * 1; // size of the square
  const x = cornerSize + 8;
  const y = cornerSize + 8;

  fill(255, 230, 130); // light yellow-ish
  stroke(0);
  rect(x, y, chanceSize, chanceSize);

  fill(0);
  textSize(15);
  textAlign(CENTER, CENTER);
  text("Chance", x + chanceSize / 2, y + chanceSize / 2);

  // Additional code for Monopoly Logo in the center of the board
  textSize(100);
  fill(0);
  textAlign(CENTER, CENTER);
  text("M", width / 2, height / 2 - 10);
  textSize(65);
  text("____", width / 2, height / 2 - 40);
  text("____", width / 2, height / 2 - 30);
}

function getPropertyColor(name) {
  for (let country in propertyColors) {
    if (propertyColors[country].names.includes(name)) {
      return propertyColors[country].color;
    }
  }
  return "#DDDDDD";
}

function drawGameBoard() {
  for (let property of propertyLabels) {
    drawPropertyTiles(property);

    if (bonusBuildings[property.name]) {
      console.log(`Drawing bonus building at (${property.x}, ${property.y})`);
      drawCircle(property.x, property.y, "pink");
    }

    if (hazards[property.name]) {
      console.log(`Drawing hazard at (${property.x}, ${property.y})`);
      drawCircle(property.x, property.y, "black");
    }
  }
}
