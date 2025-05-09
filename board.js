let boardSize = 570;
let cornerSize;
let sideWidth;
let sideHeight;
let innerTiles = [];

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
  let fillColor = "rgb(220, 220, 220)"; // default colour

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
  drawBuildings();
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

function drawBuildings() {
  for (let property in propertyBuildings) {
    if (!propertyOwners.hasOwnProperty(property)) continue;

    let buildings = propertyBuildings[property];
    let totalBuildings = buildings.residential + buildings.industrial;
    if (totalBuildings === 0) continue;

    let propertyIndex = labels.indexOf(property);
    if (propertyIndex === -1) continue;

    let [x, y] = getTilePosition(propertyIndex);
    let hazardPresent = hazards[property] === true; // Check if this property has a hazard

    // Draw residential buildings (grey or faded if hazard present)
    for (let i = 0; i < buildings.residential; i++) {
      if (hazards[property]) {
        fill(200, 200, 200, 120); // faded grey if hazard is present
      } else {
        fill(150); // normal grey
      }
      stroke(0);
      rect(x - 15 + i * 4, y + 10, 3, 3);
    }

    // Draw industrial buildings (light blue - not affected by hazards)
    for (let i = 0; i < buildings.industrial; i++) {
      fill(100, 180, 255); // Light blue
      stroke(0);
      rect(x - 15 + i * 4, y + 16, 3, 3);
    }
  }
}
