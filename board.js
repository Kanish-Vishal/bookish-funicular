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
    !l.includes("Lottery") &&
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
  return "#D3D3D3"; // Default gray for other corners
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

function drawTokens() {
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let [x, y] = getTilePosition(player.pos);

    fill(player.color);
    stroke(0);
    strokeWeight(1.5);
    ellipse(x + i * 8 - 12, y, 20);
  }
}

function getTilePosition(idx) {
  if (idx == 0) return [boardSize - cornerSize / 2, boardSize - cornerSize / 2];
  if (idx < 10) {
    let x = boardSize - cornerSize - idx * sideHeight + sideHeight / 2;
    let y = boardSize - cornerSize / 2;
    return [x, y];
  }
  if (idx == 10) return [cornerSize / 2, boardSize - cornerSize / 2];
  if (idx < 20) {
    let x = cornerSize / 2;
    let y = boardSize - cornerSize - (idx - 10) * sideHeight + sideHeight / 2;
    return [x, y];
  }
  if (idx == 20) return [cornerSize / 2, cornerSize / 2];
  if (idx < 30) {
    let x = cornerSize + (idx - 21) * sideHeight + sideHeight / 2;
    let y = cornerSize / 2;
    return [x, y];
  }
  if (idx == 30) return [boardSize - cornerSize / 2, cornerSize / 2];
  if (idx < 40) {
    let x = boardSize - cornerSize / 2;
    let y = cornerSize + (idx - 31) * sideHeight + sideHeight / 2;
    return [x, y];
  }
  print(idx);
}
