import sdk from "./1-initialize-sdk.js";


// Governance voting contract.
const vote = sdk.getVote("0x895aa4dA0dA442E358C21FB753445BAc959fc723");

const token = sdk.getToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654");

(async () => {
  try {
    // Give the treasury the power to mint additional token if needed.
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await token.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Grab 90% of the supply that the deploy account holds.
    const ownedAmount = ownedTokenBalance.displayValue;
    const percent90 = Number(ownedAmount) / 100 * 90;
    // Transfer 90% of the supply to the voting contract.
    await token.transfer(
      vote.getAddress(),
      Math.floor(percent90)
    ); 

    console.log("Successfully transferred " + percent90 + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();