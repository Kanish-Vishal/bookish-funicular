function aiTurn() {
  if (players[currentPlayer].name !== "Red") {
    const ai = players[currentPlayer];
    const startMoney = ai.money;

    // Roll for the AI
    console.log("AI moved: " + players[currentPlayer].name);
    rollDice();

    // If AI lands on an unowned property, decide to buy or auction
    if (availableProperty) {
      const cost = propertyPrices[availableProperty];
      if (ai.money > cost * 1.2) {
        //1.2 so ai always has some money as backup for rent
        buyProperty();
      } else {
        auctionProperty();
      }

      // Immediately attempt to build if the AI still has any owned properties and enough cash for at least one building
      const myProps = Object.keys(propertyOwners).filter(
        (p) => propertyOwners[p] === currentPlayer
      );
      if (myProps.length) {
        // buildMenu() will internally pick a random property and check affordability
        buildMenu();
      }
    }

    // Lottery
    const label = labels[ai.pos];
    if (label === "Lottery") {
      let lotteryMoney = floor(random(-3, 8));
      player.money += lotteryMoney;
      if (lotteryMoney >= 0) {
        console.log(`${player.name} won $${lotteryMoney}M at a lottery.`);
      } else {
        let updatedLotteryMoney = lotteryMoney * -1;
        console.log(
          `${player.name} lost $${updatedLotteryMoney} at a lottery.`
        );
      }
    }
  }

  let aiPlayer = players[currentPlayer];
  let totalIndustrialBuildings = 0;

  for (const property in propertyOwners) {
    if (propertyOwners[property] === currentPlayer) {
      totalIndustrialBuildings += propertyBuildings[property]?.industrial || 0;
    }
  }

  if (totalIndustrialBuildings > 0) {
    console.log(
      `${aiPlayer.name} has ${totalIndustrialBuildings} industrial buildings and pays $2.5M tax.`
    );
    aiPlayer.money -= 2.5;
  } else {
    console.log(`${player.name} has no industrial buildings. No tax paid.`);
  }
}

