import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

// Governance contract.
const vote = sdk.getVote("0x895aa4dA0dA442E358C21FB753445BAc959fc723");

// ERC-20 contract.
const token = sdk.getToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654");

(async () => {
  try {
    // Create proposal to mint 420,000 new token to the treasury.
    const amount = 420_000;
    const description = "Should MelonDAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        // Token contract that actually executes the mint.
        toAddress: token.getAddress(),
        // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
        // to send in this proposal. In this case, we're sending 0 ETH.
        // We're just minting new tokens to the treasury. So, set to 0.
        nativeTokenValue: 0,
        // Minting to the treasury 
        transactionData: token.encoder.encode(
          "mintTo", [
            vote.getAddress(),
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
      }
    ];

    await vote.propose(description, executions);

    console.log("Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // Create proposal to transfer to myself 3000 tokens.
    const amount = 3000;
    const description = "Should MelonDAO transfer " + amount + " tokens from the treasury to " +
      process.env.WALLET_ADDRESS + " for most community involvement?";
    const executions = [
      {
        // With nativeTokenValue, we can send ETH as a reward as well as the governance token.
        // However it would require the treasury to have enough ETH.
        // Currently just set to 0 for the time being.
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // Transfer from the treasury to my wallet.
          "transfer",
          [
            process.env.WALLET_ADDRESS,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "Successfully created proposal to reward most active user from the treasury."
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();