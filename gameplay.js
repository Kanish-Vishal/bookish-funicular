let propertyBuildings = {}; // key: property label, value: {residential: 0, industrial: 0}
let bonusBuildings = {}; // key: property label, value: boolean (true/false for bonus building presence)
let propertyHazards = {}; // Stores hazards on properties
let hazards = {};
let hazardTimers = {}; // key: property name, value: number of turns since hazard was placed
let skyscrapers = {}; // key: property label, value: boolean
let megaTowers = {}; // key: player index, value: property label where the tower is built

let currentPlayer = 0;
let isAITurn = false;
let dice = [1, 1];
let extraTurn = false;
let consecutiveTurns = 0;

let availableProperty = null; // Holds property name when player can choose to buy
let buyBtn; // Will store the button element
let auctionBtn;

let bonusBtn;
let hazardBtn;
let planningOptions = [];

function rollDice() {
  rollBtn.hide();
  dice[0] = floor(random(1, 7));
  dice[1] = floor(random(1, 7));
  let total = dice[0] + dice[1];
  let player = players[currentPlayer];
  // print(player);

  extraTurn = dice[0] === dice[1];
  consecutiveTurns++;
  if (consecutiveTurns >= 3) {
    console.log(`${player.name} is going to jail.`);
    player.pos = labels.indexOf("JAIL");
    player.inJail = true;
  }

  if (player.inJail) {
    if (extraTurn) {
      extraTurn = false; // effectively ends turn
      player.inJail = false;
      player.jailTurns = 0;
      console.log(`${player.name} rolled a double and is out of jail!`);
    }
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
      if (!isAITurn) {
        buyBtn.show();
        auctionBtn.show();
      } else {
        if (player.money > propertyPrices[availableProperty] * 1.2) {
          //1.2 so ai always has some money as backup for rent
          buyProperty();
        } else {
          auctionProperty();
        }
      }
      if (!isAITurn) {
        return;
      } // Wait for decision
    } else {
      // If can't afford, trigger auction automatically
      availableProperty = landedLabel;
      if (!isAITurn) {
        auctionBtn.show();
        return;
      } else {
        auctionProperty();
      }
    }
  } else if (
    propertyOwners[landedLabel] !== undefined &&
    propertyOwners[landedLabel] !== currentPlayer
  ) {
    calculateRent(landedLabel, currentPlayer);
  }

  if (landedLabel.includes("GO TO")) {
    // GO to JAIL
    if (player.hasGetOutOfJailCard == false) {
      console.log(`${player.name} is going to jail.`);
      player.pos = 10;
      player.inJail = true;
    } else
      player.pos = 10;
      console.log(
        `${player.name} is supposed to go to jail but used the 'Get Out Of Jail Card' to get out.`
      );
  }

  if (landedLabel === "Auction") {
    // Choose random unowned property
    let unowned = propertyLabels.filter((l) => propertyOwners[l] === undefined);
    if (unowned.length > 0) {
      availableProperty = random(unowned);
      if (!isAITurn) {
        auctionBtn.show();
      } else {
        auctionProperty();
      }
      setTimeout(() => {
        nextTurn(); // only advance after human finishes
      }, 1000);

      if (!isAITurn) {
        return;
      } // Wait for auction to be triggered
    }
  }

  if (landedLabel === "Chance") {
    // get random chance card
    let currentChanceCard = null;
    currentChanceCard = random(chanceCards);
    currentChanceCard.effect(player);
    console.log(
      player.name + " drew a chance card and " + currentChanceCard.text
    );
  }

  if (player.money <= 0) {
    console.log(`${player.name} is Bankrupt.`);
  }

  if (landedLabel === "Planning\nPermission") {
    let ownedProps = Object.keys(propertyOwners).filter(
      (label) => propertyOwners[label] === currentPlayer
    );

    if (ownedProps.length > 0) {
      planningOptions = ownedProps; // global variable to hold choices
      if (!isAITurn) {
        buyBtn.hide();
        auctionBtn.hide();
        showPlanningButtons(); // function to show bonus/hazard options
      } else {
        // ai
        if (random(0, 2)) {
          // build bonus
          if (planningOptions.length) {
            buildBonus(random(planningOptions));
          }
        } else {
          // build hazard
          const oppProps = Object.keys(propertyOwners).filter(
            (label) => propertyOwners[label] !== currentPlayer
          );
          print(oppProps);
          if (oppProps.length) {
            buildHazard(random(oppProps));
          }
        }
      }
      if (!isAITurn) {
        return;
      }
    }
  }

  print("Turn Ended");
  nextTurn();
  // if (!extraTurn && players[currentPlayer].name == "Red") {nextTurn()}
  // if (!extraTurn && players[currentPlayer].name != "Red") {aiTurn()}
}

function nextTurn() {
  // Reset UI state
  rollBtn.show();
  buyBtn.hide();
  auctionBtn.hide();
  bonusBtn.hide();
  hazardBtn.hide();
  hidePlanningButtons();
  buildBtn.hide();

  // Handle extra turn logic
  if (!extraTurn) {
    consecutiveTurns = 1;
    currentPlayer = (currentPlayer + 1) % players.length;
  } else {
    console.log("Extra turn for:", players[currentPlayer].name);
    extraTurn = false;
  }

  const player = players[currentPlayer];

  // Next turn
  // print(players[currentPlayer].name)
  if (players[currentPlayer].name === "Red") {
    // It's the human's turn
    isAITurn = false;
    buildBtn.show();
    console.log("Red's turn.");
  } else {
    // It's the AI's turn
    isAITurn = true;
    rollBtn.hide();
    console.log(`${player.name}'s turn'`);
    rollDice(); // AI plays
  }
}

function delay(time) {
  // doesn't work
  return new Promise((resolve, reject) => {
    if (isNaN(time)) {
      reject(new Error("delay requires a valid number."));
    } else {
      setTimeout(resolve, time);
    }
  });
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

function buyProperty() {
  if (availableProperty !== null) {
    let player = players[currentPlayer];
    let cost = propertyPrices[availableProperty];
    if (player.money >= cost) {
      player.money -= cost;
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
    rollBtn.show();
    buyBtn.hide();
    auctionBtn.hide();
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

  let colorSets = checkColorSets(winnerIndex);
  if (colorSets.length > 0) {
    console.log(`${winner.name} owns all cities in ${colorSets.join(", ")}`);
  }

  availableProperty = null;
  rollBtn.show();
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
      if (ownsAll) ownedGroups.push({ group, properties: groupProps });
    }
  }

  return ownedGroups;
}

function showPlanningButtons() {
  bonusBtn.show();
  hazardBtn.show();
}

function hidePlanningButtons() {
  bonusBtn.hide();
  hazardBtn.hide();
}

function addBonus() {
  if (planningOptions && planningOptions.length > 0) {
    let selected = random(planningOptions);
    if (selected && typeof selected === "string") {
      let prop = selected;
      if (prop) {
        propertyBuildings[prop] = true;
        console.log(
          `Bonus Building added to ${prop}. Hazards cannot be built on ${prop}.`
        );
      }
      drawGameBoard();
    }
  }

  rollBtn.show();
  bonusBtn.hide();
  hazardBtn.hide();
  if (!extraTurn) nextTurn();
}

function addHazard(property) {
  const owner = propertyOwners[property];

  if (!property || hazards[property]) return;

  if (owner === currentPlayer) {
    console.log("You can't place a hazard on your own property.");
    return;
  }

  if (bonusBuildings[property]) {
    console.log(
      "You can't place a hazard on a property with a bonus building."
    );
    return;
  }

  rollBtn.show();
  bonusBtn.hide();
  hazardBtn.hide();
  if (!extraTurn) nextTurn();

  hazards[property] = true;
  hazardTimers[property] = 0; // Start the timer
  console.log(`Hazard built on ${property}`);
}

function buildMenu() {
  const player = players[currentPlayer];
  const colorSets = checkColorSets(currentPlayer);
  let ownedProps = Object.keys(propertyOwners).filter(
    (label) => propertyOwners[label] === currentPlayer
  );

  if (colorSets.length === 0 && ownedProps.length === 0) {
    console.log("No properties or color sets to build on.");
    return;
  }

  // Priority: Build skyscraper if player owns a color set
  for (const set of colorSets) {
    const group = set.group;
    const props = set.properties;
    const alreadyHasSkyscraper = props.some((p) => skyscrapers[p]);

    if (!alreadyHasSkyscraper) {
      const target = random(props);
      const cost = 3 * buildingPrices[target];

      if (player.money >= cost) {
        player.money -= cost;
        skyscrapers[target] = true;
        console.log(
          `${player.name} built a skyscraper on ${target}. Rent for all ${group} properties is doubled.`
        );
        return;
      } else {
        console.log(`Not enough money to build a skyscraper on ${target}.`);
      }
    }
  }

  // Regular building logic
  let selectedProp = random(ownedProps);
  let baseCost = buildingPrices[selectedProp];

  if (!baseCost) {
    console.log(`No building cost defined for ${selectedProp}.`);
    return;
  }

  let resCost = baseCost;
  let indCost = 2 * baseCost;

  let canBuildRes = player.money >= resCost * 2.5;
  let canBuildInd = player.money >= indCost * 2.5;

  let buildingType = null;
  if (canBuildRes && canBuildInd)
    buildingType = random(["residential", "industrial"]);
  else if (canBuildRes) buildingType = "residential";
  else if (canBuildInd) buildingType = "industrial";
  else {
    console.log("Not enough money to build anything.");
    return;
  }

  let buildings = propertyBuildings[selectedProp];
  let total = buildings.residential + buildings.industrial;
  if (total >= 8) {
    console.log(`${selectedProp} already has 8 buildings.`);
    return;
  }

  buildings[buildingType]++;
  player.money -= buildingType === "residential" ? resCost : indCost;
  console.log(`${player.name} built a ${buildingType} block on ${selectedProp}.`);

  // Log new rent
  const totalBlocks = buildings.residential + buildings.industrial;
  const rentTable = rentTables[selectedProp];
  if (rentTable) {
    let rent = rentTable[Math.min(totalBlocks, rentTable.length - 1)];
    console.log(`Rent on ${selectedProp} is now $${rent}M.`);
  }

  // Check Mega Monopoly Tower conditions
  if (!megaTowers[currentPlayer] && colorSets.length >= 2) {
    // Filter sets that don't already have skyscrapers
    const eligibleSets = colorSets.filter((set) =>
      set.properties.every((p) => !skyscrapers[p])
    );

    if (eligibleSets.length > 0 && player.money >= 7) {
      const chosenSet = random(eligibleSets);
      const buildProp = random(chosenSet.properties);

      player.money -= 7;
      megaTowers[currentPlayer] = buildProp;

      console.log(
        `${player.name} built a Mega Monopoly Tower on ${buildProp}!`
      );
      console.log(
        `Rent for all of ${player.name}'s properties is now doubled.`
      );

      return; // End turn after Mega Tower is built
    }
  }
}

function addHazard(property) {
  const owner = propertyOwners[property];

  if (!property || hazards[property]) return;

  if (owner === currentPlayer) {
    alert("You can't place a hazard on your own property.");
    return;
  }

  if (bonusBuildings[property]) {
    alert("Can't place a hazard on a property with a bonus building.");
    return;
  }

  hazards[property] = true;
  hazardTimers[property] = 0; // Start the timer
  console.log(`Hazard built on ${property.name}`);

  hazardBtn.hide();
  bonusBtn.hide();
}

function advanceHazardTimers() {
  for (let property in hazards) {
    if (!hazards[property]) continue;

    hazardTimers[property]++;

    const ownerIndex = propertyOwners[property];
    const owner = players[ownerIndex];

    if (hazardTimers[property] >= 2) {
      if (owner && owner.money > 7) {
        owner.money -= 1; // Deduct $1M to clear the hazard
        hazards[property] = false;
        hazardTimers[property] = 0;
        console.log(
          `Hazard on ${property.name} has been cleared. ${owner.name} paid $1M.`
        );
      } else {
        console.log(
          `Hazard on ${property.name} remains. ${owner.name} does not have enough money to clear it.`
        );
      }
    }
  }
}

// Function to add a bonus building to a property
function addBonusBuildingToProperty(label, playerIndex) {
  const payer = players[playerIndex];
  const ownerIndex = propertyOwners[label];

  // Ensure the player can only place bonus buildings on their own property
  if (payerIndex !== ownerIndex) {
    console.log("You can only place bonus buildings on your own property.");
    return;
  }

  // Place the bonus building and prevent hazards on the property
  bonusBuildings[label] = true;
  console.log(
    `Bonus building placed on ${label}. No hazards can be built here.`
  );

  bonusBtn.hide();
}

// Function to calculate rent with hazard check
function calculateRent(label, payerIndex) {
  const payer = players[payerIndex];
  const ownerIndex = propertyOwners[label];
  const owner = players[ownerIndex];

  // No rent if player owns property or there is no owner
  if (!owner || payerIndex === ownerIndex) return 0;

  const buildings = propertyBuildings[label] || {
    residential: 0,
    industrial: 0,
    skyscraper: 0,
  };

  // Total blocks are the sum of residential + industrial buildings
  const totalBlocks = buildings.residential + buildings.industrial;

  // Lookup the rent from the rentTables based on the total number of blocks
  const rentTable = rentTables[label];

  if (!rentTable) {
    return 0; // No rent table found for the property
  }

  const rentIndex = Math.min(totalBlocks, rentTable.length);
  let rent = rentTable[rentIndex];

  if (rent === undefined) {
    return 0; // Rent is undefined for the property
  }

  // Check if the property has any hazards and adjust rent accordingly
  const hazards = propertyHazards[label];

  // Ensure rent doesn't go below 0
  rent = Math.max(rent, 0);

  // Deduct from payer, give to owner
  payer.money -= rent;
  owner.money += rent;

  console.log(
    `${payer.name} paid rent of $${rent}M to ${owner.name} for ${label}.`
  );

  return rent;
}

// Periodic update every turn (calls updateHazardTurnCounters)
function gameTurn() {
  // Increment turn counters for hazards and check if any hazard should be removed
  updateHazardTurnCounters();
}

function getRentAmount(label) {
  const buildings = propertyBuildings[label] || {
    residential: 0,
    industrial: 0,
    skyscraper: 0,
  };

  const totalBlocks = buildings.residential + buildings.industrial;
  const rentTable = rentTables[label];

  if (!rentTable) return 0;

  const rentIndex = Math.min(totalBlocks, rentTable.length - 1);
  let rent = rentTable[rentIndex];

  // Check skyscraper in property group
  for (const group in propertyGroups) {
    if (propertyGroups[group].includes(label)) {
      const hasSkyscraper = propertyGroups[group].some((p) => skyscrapers[p]);
      if (hasSkyscraper) rent *= 2;
    }
  }

  // Check if player has a Mega Tower
  const ownerIndex = propertyOwners[label];
  if (ownerIndex !== undefined && megaTowers[ownerIndex]) {
    rent *= 2;
  }

  return Math.max(rent, 0);
}

function industryTax() {
  let player = players[currentPlayer];
  let totalIndustrialBuildings = 0;

  // Iterate over the player's properties to count the industrial buildings
  for (const property in propertyOwners) {
    if (propertyOwners[property] === currentPlayer) {
      totalIndustrialBuildings += propertyBuildings[property].industrial || 0;
    }
  }

  // If the player has any industrial buildings, they pay $2M
  if (player.pos == 4 || player.pos == 38) {
    if (totalIndustrialBuildings != 0) {
      console.log(`${player.name} pays industry tax of $2M.`);
      player.money -= 2; // Deduct $2M for the tax
    } else {
      console.log(
        `${player.name} has no industrial buildings and does not pay any taxes.`
      );
    }
  }
}

//chance cards
let chanceCards = [
  {
    text: "advances to Go and collects $2M",
    effect: (player) => {
      player.pos = 0;
      player.money += 2;
    },
  },
  {
    text: "has to pay $1M in taxes",
    effect: (player) => {
      player.money -= 1;
    },
  },
  {
    text: "has to go back 3 spaces",
    effect: (player) => {
      player.pos = (player.pos - 3 + 40) % 40; // wrap around board
    },
  },
  {
    text: "gets a get out of jail free card",
    effect: (player) => {
      player.hasGetOutOfJailCard = true;
    },
  },
  {
    text: "advances to Free Parking",
    effect: (player) => {
      if (player.pos > 20) {
        player.money += 2; // Passes through GO
      }
      player.pos = 20;
      console.log(`${player.name} passes through GO and collects $2M.`);
    },
  },
  {
    text: "earns $1M from investments",
    effect: (player) => {
      player.money += 1;
    },
  },
  {
    text: "goes directly to jail",
    effect: (player) => {
      player.pos = 10;
      player.inJail = true;
    },
  },
];

function buildHazard() {}
function buildBonus() {}
