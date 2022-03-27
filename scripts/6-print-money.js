import sdk from "./1-initialize-sdk.js";

// ERC-20 token. $MELON address at Rinkeby.
const token = sdk.getToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654");

(async () => {
  try {
    // Max supply
    const amount = 1000000;
    await token.mint(amount);
    const totalSupply = await token.totalSupply();

    // Print out how many of our token's are out there now!
    console.log("| ", totalSupply.displayValue, "$MELON in circulation");
  } catch (error) {
    console.error("Failed to print $MELON supply", error);
  }
})();