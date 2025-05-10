function preload() {
  font = loadFont("PoiretOne-Regular.ttf");
}

function setup() {
  createCanvas(boardSize, boardSize);
  cornerSize = boardSize / 8;
  sideWidth = ((boardSize - 2 * cornerSize) / 9) * 1.2;
  sideHeight = (boardSize - 2 * cornerSize) / 9;

  textAlign(CENTER, CENTER);
  textSize(11);
  textFont(font);

  // Set up the center tiles for properties
  setupCenterTiles();

  rollBtn = createButton("Roll Dice");
  rollBtn.position(20, boardSize + 55);
  rollBtn.mousePressed(() => {
    rollDice();
  });

  buyBtn = createButton("Buy Property");
  buyBtn.position(120, boardSize + 55);
  buyBtn.mousePressed(() => {
    buyProperty();
    buyBtn.hide();
  });
  buyBtn.hide(); // Hide initially

  auctionBtn = createButton("Auction Property");
  auctionBtn.position(220, boardSize + 55);
  auctionBtn.mousePressed(() => {
    auctionProperty();
    auctionBtn.hide();
  });
  auctionBtn.hide(); // Initially hidden

  buildBtn = createButton("Build");
  buildBtn.position(350, boardSize + 55);
  buildBtn.mousePressed(() => {
    buildMenu();
    buildBtn.hide();
  });

  for (let label of propertyLabels) {
    propertyBuildings[label] = { residential: 0, industrial: 0 };
  }
}

function draw() {
  background(255);
  strokeWeight(1);
  textSize(12);

  drawBoard();
  // Draw center tiles instead of property tiles
  drawCenterTiles();
  drawChanceCard();
  drawTokens();

  // Display player stats
  drawPlayerStats();
}

function mousePressed() {
  // Handle mouse clicks on the board
  handleBoardClick();
}

// Display player stats at the bottom
function drawPlayerStats() {
  const startY = boardSize + 35;
  const playerWidth = boardSize / players.length;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const startX = i * playerWidth;

    // Player indicator
    fill(player.color);
    stroke(0);
    rect(startX + 5, startY, 15, 15);

    // Player name and money
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14);
    text(
      `${player.name}: $${player.money.toFixed(1)}M`,
      startX + 25,
      startY + 7
    );

    // Current player indicator
    if (i === currentPlayer) {
      noFill();
      stroke(player.color);
      strokeWeight(2);
      rect(startX, startY - 5, playerWidth - 5, 25);
      strokeWeight(1);
    }
  }

  // Draw dice if rolled
  if (dice[0] > 0 && dice[1] > 0) {
    const diceX = boardSize - 80;
    const diceY = boardSize + 35;

    // First die
    fill(255);
    stroke(0);
    rect(diceX, diceY, 20, 20, 3);
    fill(0);
    textAlign(CENTER, CENTER);
    text(dice[0], diceX + 10, diceY + 10);

    // Second die
    fill(255);
    stroke(0);
    rect(diceX + 30, diceY, 20, 20, 3);
    fill(0);
    text(dice[1], diceX + 40, diceY + 10);

    // Total
    textAlign(LEFT, CENTER);
    text(`= ${dice[0] + dice[1]}`, diceX + 60, diceY + 10);
  }
}
