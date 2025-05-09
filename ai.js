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

    // If on Planning Permission, place bonus on own and hazard on opponent
    const label = labels[ai.pos];
    if (label === "Planning\nPermission") {
      const ownProps = Object.keys(propertyOwners).filter(
        (p) => propertyOwners[p] === currentPlayer
      );
      if (ownProps.length) {
        buildBonus(random(ownProps));
      }
      const oppProps = Object.keys(propertyOwners).filter(
        (p) => propertyOwners[p] !== currentPlayer
      );
      if (oppProps.length) {
        buildHazard(random(oppProps));
      }
    }
  }
}
