let players = [
  { name: "Red", color: "red", money: 15, pos: 0, inJail: false, jailTurns: 0 },
  {
    name: "Green",
    color: "green",
    money: 15,
    pos: 0,
    inJail: false,
    jailTurns: 0,
  },
  {
    name: "Blue",
    color: "blue",
    money: 15,
    pos: 0,
    inJail: false,
    jailTurns: 0,
  },
  {
    name: "Yellow",
    color: "yellow",
    money: 15,
    pos: 0,
    inJail: false,
    jailTurns: 0,
  },
];

let propertyOwners = {}; // key: label, value: player index

let rentPrices = {
  Joburg: 0.02,
  "Cape Town": 0.04,
  Delhi: 0.06,
  Madras: 0.06,
  Bombay: 0.08,
  Perth: 0.1,
  Sydney: 0.1,
  Melbourne: 0.12,
  Shenzhen: 0.14,
  Beijing: 0.14,
  Shanghai: 0.16,
  Kyoto: 0.18,
  Osaka: 0.18,
  Tokyo: 0.2,
  Munich: 0.22,
  Berlin: 0.22,
  Frankfurt: 0.24,
  Liverpool: 0.26,
  Manchester: 0.26,
  London: 0.28,
  "San Francisco": 0.35,
  "New York": 0.5,
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

let bonusBuildings = {}; // key: property label, value: true
let hazards = {}; // key: property label, value: true

let currentPlayer = 0;
let dice = [1, 1];
let extraTurn = false;

let availableProperty = null; // Holds property name when player can choose to buy
let buyBtn; // Will store the button element
let auctionBtn;

let bonusBtn;
let hazardBtn;
let planningOptions = [];

function rollDice() {
  dice[0] = floor(random(1, 7));
  dice[1] = floor(random(1, 7));
  let total = dice[0] + dice[1];
  let player = players[currentPlayer];

  /* THIS IS FOR DISPLAYING NUMBER ON DICE
  textAlign(CENTER, CENTER);
  textSize(50);
  displayNumber = total.toString();
  text(displayNumber, height - 120, width - 120); // To display the total number rolled on the dice
  if (dice[0] == dice[1]) {
    textSize(30);
    text("2", height - 93, width - 93); // To indicate Doubles.
  }
  */

  if (player.inJail) {
    player.jailTurns++;
    if (player.jailTurns == 4) {
      player.inJail = false;
      player.jailTurns = 0;
      console.log(`${player.name} is out of jail!`);
      // Player is now free and can roll/move
    } else {
      console.log(`${player.name} is in jail (Turn ${player.jailTurns}/3)`);
      nextTurn();
      return;
    }
  }

  player.pos += total;

  // Full round of board completed
  if (player.pos >= labels.length) {
    player.pos %= labels.length;
    player.money += 2; // $2M for Pass GO
    console.log(`${player.name} collects $2M for passing GO!`);
  }

  let landedLabel = labels[player.pos];

  if (
    propertyPrices[landedLabel] &&
    propertyOwners[landedLabel] === undefined
  ) {
    let cost = propertyPrices[landedLabel];
    if (player.money >= cost) {
      availableProperty = landedLabel;
      buyBtn.show();
      auctionBtn.show();
      return; // Wait for decision
    } else {
      // If can't afford, trigger auction automatically
      availableProperty = landedLabel;
      auctionBtn.show();
      return;
    }
  } else if (
    propertyOwners[landedLabel] !== undefined &&
    propertyOwners[landedLabel] !== currentPlayer
  ) {
    let ownerIndex = propertyOwners[landedLabel];
    let rent = rentPrices[landedLabel] || 0;
    player.money -= rent;
    players[ownerIndex].money += rent;
    console.log(
      `${player.name} paid rent of $${rent}M to ${players[ownerIndex].name}.`
    );
  }

  if (landedLabel.includes("GO TO")) {
    // GO to JAIL
    player.pos = labels.indexOf("JAIL");
    player.inJail = true;
  }

  if (landedLabel === "Auction") {
    // Choose random unowned property
    let unowned = propertyLabels.filter((l) => propertyOwners[l] === undefined);
    if (unowned.length > 0) {
      availableProperty = random(unowned);
      auctionBtn.show();
      return; // Wait for auction to be triggered
    }
  }

  extraTurn = dice[0] === dice[1];

  if (!extraTurn) nextTurn();

  if (player.money <= 0) {
    console.log(`${player.name} is Bankrupt.`);
  }

  if (landedLabel.trim() === "Planning\nPermission") {
    let ownedProps = Object.keys(propertyOwners).filter(
      (label) => propertyOwners[label] === currentPlayer
    );

    if (ownedProps.length > 0) {
      planningOptions = ownedProps; // global variable to hold choices
      showPlanningButtons(); // function to show bonus/hazard options
      return;
    }
  }
}

function nextTurn() {
  currentPlayer = (currentPlayer + 1) % players.length;
  availableProperty = null;
  buyBtn.hide();
  auctionBtn.hide();
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

function drawPlayerInfo() {
  noStroke();
  fill(0);
  textSize(12);
  for (let i = 0; i < players.length; i++) {
    let p = players[i];
    text(`${p.name}: $${p.money / 1000}M`, 100, boardSize + 20 + i * 15);
  }

  text(`Dice: ${dice[0]}, ${dice[1]}`, 400, boardSize + 20);
}

function getTilePosition(idx) {
  if (idx === 0)
    return [boardSize - cornerSize / 2, boardSize - cornerSize / 2];
  if (idx < 10) {
    let x = boardSize - cornerSize - idx * sideHeight + sideHeight / 2;
    let y = boardSize - cornerSize / 2;
    return [x, y];
  }
  if (idx === 10) return [cornerSize / 2, boardSize - cornerSize / 2];
  if (idx < 20) {
    let x = cornerSize / 2;
    let y = boardSize - cornerSize - (idx - 10) * sideHeight + sideHeight / 2;
    return [x, y];
  }
  if (idx === 20) return [cornerSize / 2, cornerSize / 2];
  if (idx < 30) {
    let x = cornerSize + (idx - 21) * sideHeight + sideHeight / 2;
    let y = cornerSize / 2;
    return [x, y];
  }
  if (idx === 30) return [boardSize - cornerSize / 2, cornerSize / 2];
  if (idx < 40) {
    let x = boardSize - cornerSize / 2;
    let y = cornerSize + (idx - 31) * sideHeight + sideHeight / 2;
    return [x, y];
  }
}

function buyProperty() {
  if (availableProperty !== null) {
    let player = players[currentPlayer];
    let cost = propertyPrices[availableProperty];
    if (player.money >= cost) {
      player.money -= cost;
      propertyOwners[availableProperty] = currentPlayer;
      console.log(`${player.name} bought ${availableProperty} for $${cost}M.`);

      propertyOwners[availableProperty] = currentPlayer;
      console.log(`${player.name} bought ${availableProperty} for $${cost}M.`);

      let colorSets = checkColorSets(currentPlayer);
      if (colorSets.length > 0) {
        console.log(
          `${player.name} owns all cities in ${colorSets.join(", ")}`
        );
      }
    }
    availableProperty = null;
    buyBtn.hide();
    if (!extraTurn) {
      nextTurn();
      buyBtn.hide();
    }
  }
}

function auctionProperty() {
  if (!availableProperty) return;

  let player = players[currentPlayer];
  let opponents = players.filter((_, i) => i !== currentPlayer);
  if (opponents.length === 0) return;

  let winner = random(opponents);
  let winnerIndex = players.indexOf(winner);
  propertyOwners[availableProperty] = winnerIndex;
  winner.money -= propertyPrices[availableProperty];

  console.log(`${winner.name} won the auction for ${availableProperty}`);

  propertyOwners[availableProperty] = winnerIndex;
  winner.money -= propertyPrices[availableProperty];

  console.log(`${winner.name} won the auction for ${availableProperty}`);

  let colorSets = checkColorSets(winnerIndex);
  if (colorSets.length > 0) {
    console.log(`${winner.name} owns all cities in ${colorSets.join(", ")}`);
  }

  availableProperty = null;
  buyBtn.hide();
  auctionBtn.hide();

  if (!extraTurn) nextTurn();
}
function checkColorSets(playerIndex) {
  const ownedGroups = [];

  for (const group in propertyGroups) {
    const groupProps = propertyGroups[group];
    if (Array.isArray(groupProps)) {
      const ownsAll = groupProps.every(
        (prop) => propertyOwners[prop] === playerIndex
      );
      if (ownsAll) ownedGroups.push(group);
    }
  }

  return ownedGroups;
}

function showPlanningButtons() {
  bonusBtn.show();
  hazardBtn.show();
}

function addBonus() {
  if (planningOptions && planningOptions.length > 0) {
    let selected = random(planningOptions);
    if (selected && typeof selected === "string") {
      let prop = selected;
      if (prop) {
        bonusBuildings[prop] = true;
        console.log(`Bonus Building added to ${prop}`);
      }
      drawGameBoard();
    }
  }

  bonusBtn.hide();
  hazardBtn.hide();
  if (!extraTurn) nextTurn();
}

function addHazard() {
  if (planningOptions && planningOptions.length > 0) {
    let selected = random(planningOptions);
    if (selected && typeof selected === "string") {
      let prop = selected;
      if (prop) {
        hazards[prop] = true;
        console.log(`Hazard added to ${prop}`);
      }

      drawGameBoard();
    }
  }

  bonusBtn.hide();
  hazardBtn.hide();
  if (!extraTurn) nextTurn();
}

function buildMenu() {
  let player = players[currentPlayer];
  let ownedProps = Object.keys(propertyOwners).filter(
    (label) => propertyOwners[label] === currentPlayer
  );

  if (ownedProps.length === 0) {
    console.log("No properties to build on.");
    return;
  }

  let selectedProp = random(ownedProps);
  let buildingType = random(['residential', 'industrial']);
  let cost = buildingType === 'residential' ? 1 : 2; // $1M or $2M
  let buildingLimit = 8;

  if (player.money < cost) {
    console.log("Not enough money to build.");
    return;
  }

  let currentBuildings = propertyBuildings[selectedProp][buildingType];
  if (currentBuildings >= buildingLimit) {
    console.log(`${selectedProp} already has ${buildingLimit} ${buildingType} buildings.`);
    return;
  }

  propertyBuildings[selectedProp][buildingType]++;
  player.money -= cost;
  console.log(`${player.name} built a ${buildingType} building on ${selectedProp}.`);
  drawGameBoard();
}

function calculateRent(label) {
  let baseRent = rentPrices[label] || 0;
  let buildings = propertyBuildings[label] || { residential: 0, industrial: 0 };
  let hazardPresent = hazards[label] === true;

  let residentialCount = hazardPresent ? 0 : buildings.residential;
  let industrialCount = buildings.industrial;

  let rentMultiplier = 1 + 0.1 * (residentialCount + industrialCount);
  return baseRent * rentMultiplier;
}


