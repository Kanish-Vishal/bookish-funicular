let propertyBuildings = {}; // key: property label, value: {residential: 0, industrial: 0}
let bonusBuildings = {}; // key: property label, value: boolean (true/false for bonus building presence)
let propertyHazards = {}; // Stores hazards on properties
let hazards = {}; // key: property label, value: boolean
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

// UI controls for planning permission
let bonusBtn;
let hazardBtn;
let planningOptions = [];
let planningPropertySelector; // Dropdown for selecting property
let planningMenuVisible = false;

// UI for building menu
let buildingMenuVisible = false;
let buildingPropertySelector;
let buildResidentialBtn;
let buildIndustrialBtn;
let closeBuildMenuBtn;

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
    } else {
      player.pos = 10;
      player.hasGetOutOfJailCard = false;
      console.log(
        `${player.name} is supposed to go to jail but used the 'Get Out Of Jail Card' to get out.`
      );
    }
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
        showPlanningMenu(); // function to show bonus/hazard options
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
}

function nextTurn() {
  // Reset UI state
  rollBtn.show();
  buyBtn.hide();
  auctionBtn.hide();
  hidePlanningMenu();
  hideBuildingMenu();

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

      // Initialize property buildings
      if (!propertyBuildings[availableProperty]) {
        propertyBuildings[availableProperty] = { residential: 0, industrial: 0 };
      }

      let colorSets = checkColorSets(currentPlayer);
      if (colorSets.length > 0) {
        console.log(
          `${player.name} owns all cities in ${colorSets.map(set => set.group).join(", ")}`
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
  
  // Make sure winner can afford it
  let cost = propertyPrices[availableProperty];
  if (winner.money >= cost) {
    winner.money -= cost;
  } else {
    winner.money = 0; // Bankrupt if they can't afford it
  }

  // Initialize property buildings
  if (!propertyBuildings[availableProperty]) {
    propertyBuildings[availableProperty] = { residential: 0, industrial: 0 };
  }

  console.log(`${winner.name} won the auction for ${availableProperty}`);

  let colorSets = checkColorSets(winnerIndex);
  if (colorSets.length > 0) {
    console.log(`${winner.name} owns all cities in ${colorSets.map(set => set.group).join(", ")}`);
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

// Function to show planning menu with a property selector
function showPlanningMenu() {
  planningMenuVisible = true;
  
  // Create dropdown for property selection
  if (!planningPropertySelector) {
    planningPropertySelector = createSelect();
    planningPropertySelector.position(120, boardSize + 50);
    planningPropertySelector.style('width', '150px');
  }
  
  // Clear previous options
  planningPropertySelector.remove();
  planningPropertySelector = createSelect();
  planningPropertySelector.position(120, boardSize + 50);
  planningPropertySelector.style('width', '150px');
  
  // Add header option
  planningPropertySelector.option('Select property...');
  
  // Populate with owned properties for bonuses and opponent properties for hazards
  let ownedProps = Object.keys(propertyOwners).filter(
    (label) => propertyOwners[label] === currentPlayer
  );
  
  let opponentProps = Object.keys(propertyOwners).filter(
    (label) => propertyOwners[label] !== undefined && 
               propertyOwners[label] !== currentPlayer
  );
  
  // Add owned properties
  if (ownedProps.length > 0) {
    ownedProps.forEach(prop => {
      planningPropertySelector.option(`${prop} (Bonus)`);
    });
  }
  
  // Add opponent properties
  if (opponentProps.length > 0) {
    opponentProps.forEach(prop => {
      // Only add if no bonus building and no hazard already
      if (!bonusBuildings[prop] && !hazards[prop]) {
        planningPropertySelector.option(`${prop} (Hazard)`);
      }
    });
  }
  
  // Create buttons for bonus and hazard
  bonusBtn = createButton("Place Bonus");
  bonusBtn.position(120, boardSize + 80);
  bonusBtn.mousePressed(() => {
    let selection = planningPropertySelector.value();
    if (selection.includes('(Bonus)')) {
      // Extract property name
      let propertyName = selection.substring(0, selection.indexOf(' (Bonus)'));
      buildBonus(propertyName);
    } else {
      console.log("Can only place bonus on your own property");
    }
    hidePlanningMenu();
    if (!extraTurn) nextTurn();
  });
  
  hazardBtn = createButton("Place Hazard");
  hazardBtn.position(220, boardSize + 80);
  hazardBtn.mousePressed(() => {
    let selection = planningPropertySelector.value();
    if (selection.includes('(Hazard)')) {
      // Extract property name
      let propertyName = selection.substring(0, selection.indexOf(' (Hazard)'));
      buildHazard(propertyName);
    } else {
      console.log("Can only place hazard on opponent's property");
    }
    hidePlanningMenu();
    if (!extraTurn) nextTurn();
  });
  
  // Show buttons
  planningPropertySelector.show();
  bonusBtn.show();
  hazardBtn.show();
}

function hidePlanningMenu() {
  planningMenuVisible = false;
  
  if (planningPropertySelector) {
    planningPropertySelector.hide();
  }
  
  if (bonusBtn) {
    bonusBtn.hide();
  }
  
  if (hazardBtn) {
    hazardBtn.hide();
  }
}

// Function to build bonus on a property
function buildBonus(propertyName) {
  // Verify property is owned by current player
  if (propertyOwners[propertyName] !== currentPlayer) {
    console.log("You can only place bonus buildings on your own property.");
    return false;
  }

  // Place the bonus building
  bonusBuildings[propertyName] = true;
  console.log(`${players[currentPlayer].name} placed a bonus building on ${propertyName}. No hazards can be built here.`);
  return true;
}

// Function to build hazard on a property
function buildHazard(propertyName) {
  // Verify property is not owned by current player
  if (propertyOwners[propertyName] === currentPlayer) {
    console.log("You can't place a hazard on your own property.");
    return false;
  }

  // Verify property doesn't have a bonus
  if (bonusBuildings[propertyName]) {
    console.log("You can't place a hazard on a property with a bonus building.");
    return false;
  }

  // Verify property doesn't already have a hazard
  if (hazards[propertyName]) {
    console.log("This property already has a hazard.");
    return false;
  }

  // Place the hazard
  hazards[propertyName] = true;
  hazardTimers[propertyName] = 0; // Start the timer
  console.log(`${players[currentPlayer].name} placed a hazard on ${propertyName}`);
  return true;
}

// Function for building menu
function showBuildingMenu() {
  buildingMenuVisible = true;
  
  // Get owned properties
  let ownedProps = Object.keys(propertyOwners).filter(
    (label) => propertyOwners[label] === currentPlayer
  );
  
  if (ownedProps.length === 0) {
    console.log("You don't own any properties to build on.");
    return;
  }
  
  // Create dropdown for property selection
  if (!buildingPropertySelector) {
    buildingPropertySelector = createSelect();
    buildingPropertySelector.position(120, boardSize + 50);
    buildingPropertySelector.style('width', '150px');
  }
  
  // Clear previous options
  buildingPropertySelector.remove();
  buildingPropertySelector = createSelect();
  buildingPropertySelector.position(120, boardSize + 50);
  buildingPropertySelector.style('width', '150px');
  
  // Add header option
  buildingPropertySelector.option('Select property...');
  
  // Populate with owned properties
  ownedProps.forEach(prop => {
    // Check if the property already has max buildings
    const buildings = propertyBuildings[prop];
    const totalBuildings = buildings.residential + buildings.industrial;
    
    if (totalBuildings < 8) {
      buildingPropertySelector.option(prop);
    }
  });
  
  // Create buttons for residential and industrial buildings
  buildResidentialBtn = createButton("Build Residential ($)");
  buildResidentialBtn.position(120, boardSize + 80);
  buildResidentialBtn.mousePressed(() => {
    let propertyName = buildingPropertySelector.value();
    if (propertyName !== 'Select property...') {
      buildResidential(propertyName);
    }
    hideBuildingMenu();
  });
  
  buildIndustrialBtn = createButton("Build Industrial ($$)");
  buildIndustrialBtn.position(260, boardSize + 80);
  buildIndustrialBtn.mousePressed(() => {
    let propertyName = buildingPropertySelector.value();
    if (propertyName !== 'Select property...') {
      buildIndustrial(propertyName);
    }
    hideBuildingMenu();
  });
  
  closeBuildMenuBtn = createButton("Close");
  closeBuildMenuBtn.position(400, boardSize + 80);
  closeBuildMenuBtn.mousePressed(() => {
    hideBuildingMenu();
  });
  
  // Show buttons
  buildingPropertySelector.show();
  buildResidentialBtn.show();
  buildIndustrialBtn.show();
  closeBuildMenuBtn.show();
}

function hideBuildingMenu() {
  buildingMenuVisible = false;
  
  if (buildingPropertySelector) {
    buildingPropertySelector.hide();
  }
  
  if (buildResidentialBtn) {
    buildResidentialBtn.hide();
  }
  
  if (buildIndustrialBtn) {
    buildIndustrialBtn.hide();
  }
  
  if (closeBuildMenuBtn) {
    closeBuildMenuBtn.hide();
  }
}

function buildResidential(propertyName) {
  if (!propertyName) return;
  
  // Verify property is owned by current player
  if (propertyOwners[propertyName] !== currentPlayer) {
    console.log("You can only build on your own property.");
    return false;
  }
  
  // Get the cost of building
  const baseCost = buildingPrices[propertyName];
  const resCost = baseCost;
  
  // Check if player has enough money
  const player = players[currentPlayer];
  if (player.money < resCost) {
    console.log("Not enough money to build a residential building.");
    return false;
  }
  
  // Check if property already has max buildings
  if (!propertyBuildings[propertyName]) {
    propertyBuildings[propertyName] = { residential: 0, industrial: 0 };
  }
  
  const buildings = propertyBuildings[propertyName];
  const totalBuildings = buildings.residential + buildings.industrial;
  
  if (totalBuildings >= 8) {
    console.log(`${propertyName} already has maximum buildings (8).`);
    return false;
  }
  
  // Build the residential building
  buildings.residential++;
  player.money -= resCost;
  
  console.log(`${player.name} built a residential building on ${propertyName} for $${resCost}M.`);
  
  // Update rent display
  updateRentDisplay(propertyName);
  
  return true;
}

function buildIndustrial(propertyName) {
  if (!propertyName) return;
  
  // Verify property is owned by current player
  if (propertyOwners[propertyName] !== currentPlayer) {
    console.log("You can only build on your own property.");
    return false;
  }
  
  // Get the cost of building
  const baseCost = buildingPrices[propertyName];
  const indCost = 2 * baseCost;
  
  // Check if player has enough money
  const player = players[currentPlayer];
  if (player.money < indCost) {
    console.log("Not enough money to build an industrial building.");
    return false;
  }
  
  // Check if property already has max buildings
  if (!propertyBuildings[propertyName]) {
    propertyBuildings[propertyName] = { residential: 0, industrial: 0 };
  }
  
  const buildings = propertyBuildings[propertyName];
  const totalBuildings = buildings.residential + buildings.industrial;
  
  if (totalBuildings >= 8) {
    console.log(`${propertyName} already has maximum buildings (8).`);
    return false;
  }
  
  // Build the industrial building
  buildings.industrial++;
  player.money -= indCost;
  
  console.log(`${player.name} built an industrial building on ${propertyName} for $${indCost}M.`);
  
  // Update rent display
  updateRentDisplay(propertyName);
  
  return true;
}

function updateRentDisplay(propertyName) {
  // Get total buildings
  const buildings = propertyBuildings[propertyName];
  const totalBuildings = buildings.residential + buildings.industrial;
  
  // Get rent from table
  const rentTable = rentTables[propertyName];
  if (rentTable) {
    let rent = rentTable[Math.min(totalBuildings, rentTable.length - 1)];
    console.log(`Rent on ${propertyName} is now $${rent}M.`);
  }
}

// Function for AI to build buildings
function buildMenu() {
  if (isAITurn) {
    aiBuilding();
  } else {
    showBuildingMenu();
  }
}

function aiBuilding() {
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

  // Initialize if needed
  if (!propertyBuildings[selectedProp]) {
    propertyBuildings[selectedProp] = { residential: 0, industrial: 0 };
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
          `Hazard on ${property} has been cleared. ${owner.name} paid $1M.`
        );
      } else {
        console.log(
          `Hazard on ${property} remains. ${owner.name} does not have enough money to clear it.`
        );
      }
    }
  }
}

// Function to calculate rent with hazard check
function calculateRent(label, payerIndex) {
  const payer = players[payerIndex];
  const ownerIndex = propertyOwners[label];
  const owner = players[ownerIndex];

  // No rent if player owns property or there is no owner
  if (!owner || payerIndex === ownerIndex) return 0;

  // Initialize if needed
  if (!propertyBuildings[label]) {
    propertyBuildings[label] = { residential: 0, industrial: 0 };
  }

  const buildings = propertyBuildings[label];

  // Total blocks are the sum of residential + industrial buildings
  const totalBlocks = buildings.residential + buildings.industrial;

  // Lookup the rent from the rentTables based on the total number of blocks
  const rentTable = rentTables[label];

  if (!rentTable) {
    return 0; // No rent table found for the property
  }

  const rentIndex = Math.min(total
