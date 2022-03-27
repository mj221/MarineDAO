import sdk from "./1-initialize-sdk.js";

// ERC-1155 membership NFT contract. Melon DAO
const editionDrop = sdk.getEditionDrop("0x3E8e97c2cceB9C706443b100Ea613d06B530e09d");

// ERC-20 token contract. $Melon.
const token = sdk.getToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654");

(async () => {
  try {
    // Grab all the addresses of people who own the membership NFT, 
    // which has a tokenId of 0.
    const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet.",
      );
      process.exit(0);
    }

    // Loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {

      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("Airdropping ", randomAmount, " tokens to ", address);

      // Set up the target.
      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });

    // Call transferBatch on all our airdrop targets.
    console.log("Starting airdrop...");
    await token.transferBatch(airdropTargets);
    console.log("Successfully airdropped tokens to all the holders of Melon Slice NFT.");
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();