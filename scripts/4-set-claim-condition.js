import sdk from "./1-initialize-sdk.js";
import { MaxUint256 } from "@ethersproject/constants";

const editionDrop = sdk.getEditionDrop("0x3E8e97c2cceB9C706443b100Ea613d06B530e09d");

(async () => {
  try {
    const claimConditions = [{

      startTime: new Date(),

      maxQuantity: 50_000,

      price: 0,

      quantityLimitPerTransaction: 1,

      waitInSeconds: MaxUint256,
    }]

    // id 0 is first nft
    await editionDrop.claimConditions.set("0", claimConditions);
    console.log("✅ Sucessfully set claim condition!");
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();