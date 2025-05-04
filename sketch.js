function setup() {
  createCanvas(boardSize, boardSize);
  cornerSize = boardSize / 8;
  sideWidth = ((boardSize - 2 * cornerSize) / 9) * 1.2;
  sideHeight = (boardSize - 2 * cornerSize) / 9;

  textAlign(CENTER, CENTER);
  textSize(11);
  //noLoop();
  textFont(font);

  let rollBtn = createButton("Roll Dice");
  rollBtn.position(20, boardSize + 5);
  rollBtn.mousePressed(rollDice);
  
  let propertyBuildings = {}; // key: property label, value: {residential: 0, industrial: 0}


  buyBtn = createButton("Buy Property");
  buyBtn.position(120, boardSize + 5);
  buyBtn.mousePressed(buyProperty);
  buyBtn.hide(); // Hide initially

  auctionBtn = createButton("Auction Property");
  auctionBtn.position(220, boardSize + 5);
  auctionBtn.mousePressed(auctionProperty);
  auctionBtn.hide(); // Initially hidden

  bonusBtn = createButton("Add Bonus");
  bonusBtn.position(120, boardSize + 5);
  bonusBtn.mousePressed(addBonus);
  bonusBtn.hide();

  hazardBtn = createButton("Add Hazard");
  hazardBtn.position(220, boardSize + 5);
  hazardBtn.mousePressed(addHazard);
  hazardBtn.hide();

  buildBtn = createButton("Build");
  buildBtn.position(10, boardSize + 100);
  buildBtn.mousePressed(buildMenu);
  buildBtn.hide();
  
  for (let label of propertyLabels) {
  propertyBuildings[label] = { residential: 0, industrial: 0 };
}

}

function draw() {
  background(255);
  strokeWeight(1.2);
  drawBoard();
  drawPropertyTiles();
  drawChanceCard();
  drawTokens();
  drawPlayerInfo();
}
