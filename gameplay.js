let propertyBuildings = {}; // key: property label, value: {residential: 0, industrial: 0}
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
        if (player.money > propertyPrices[availableProperty] * 1.5) {
          //1.5 so AI always has some money as backup for rent
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
    } else player.pos = 10;
    console.log(
      `${player.name} is supposed to go to jail but used the 'Get Out Of Jail Card' to get out.`
    );
  }

  if (landedLabel === "Auction") {
    let unowned = propertyLabels.filter((l) => propertyOwners[l] === undefined);
    if (unowned.length > 0) {
      availableProperty = random(unowned);
      auctionProperty();
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

  if (landedLabel === "Lottery") {
    let lotteryMoney = floor(random(-3, 8));
    player.money += lotteryMoney;
    if (lotteryMoney >= 0) {
      console.log(`${player.name} won $${lotteryMoney}M at a lottery.`);
    } else {
      let updatedLotteryMoney = lotteryMoney * -1;
      console.log(`${player.name} lost $${updatedLotteryMoney}M at a lottery.`);
    }
  }

  print("Turn Ended");
  nextTurn();

  if (player.pos === 4 || player.pos === 38) {
    industryTax();
  }
}

function nextTurn() {
  // Reset UI state
  rollBtn.show();
  buyBtn.hide();
  auctionBtn.hide();

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
  console.log(`${player.name} auctioned ${availableProperty}.`);

  let opponents = players.filter((_, i) => i !== currentPlayer);
  if (opponents.length === 0) return;

  let winner = random(opponents);
  let winnerIndex = players.indexOf(winner);
  propertyOwners[availableProperty] = winnerIndex;
  winner.money -= propertyPrices[availableProperty];

  console.log(`${winner.name} won the auction for ${availableProperty}.`);

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

  let resCost = baseCost * 1.5;
  let indCost = baseCost;

  let canBuildRes = player.money >= resCost * 2.5;
  let canBuildInd = player.money >= indCost * 2.5;

  let buildingType = null;
  if (canBuildRes && canBuildInd)
    // Checks if player has enough money to build residential block.
    buildingType = random(["residential", "industrial"]);
  // If player has enoguh to build residential block, he builds a random block.
  else if (canBuildInd) buildingType = "industrial";
  // If player does not have enough money to build residential block but has enough to build Industrial block, he builds industrial block
  else {
    console.log("Not enough money to build anything.");
    return;
  }

  let buildings = propertyBuildings[selectedProp];
  let total = buildings.residential + buildings.industrial;
  if (total >= 8) {
    console.log(`${selectedProp} already has the max of 8 blocks.`);
    return;
  }

  buildings[buildingType]++;
  let price = buildingType === "residential" ? resCost : indCost;
  player.money -= price;
  console.log(
    `${player.name} built a ${buildingType} block on ${selectedProp} for $${price}M.`
  );

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

// Function to calculate rent
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

  for (const property in propertyOwners) {
    if (propertyOwners[property] === currentPlayer) {
      totalIndustrialBuildings += propertyBuildings[property]?.industrial || 0;
    }
  }

  if (totalIndustrialBuildings > 0) {
    console.log(
      `${player.name} has ${totalIndustrialBuildings} industrial buildings and pays $2.5M tax.`
    );
    player.money -= 2.5;
  } else {
    console.log(`${player.name} has no industrial buildings. No tax paid.`);
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
