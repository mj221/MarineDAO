import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x3E8e97c2cceB9C706443b100Ea613d06B530e09d");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "Melon Slices",
        description: "This NFT will give you access to MelonDAO!",
        image: readFileSync("scripts/assets/Melon_slice.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();