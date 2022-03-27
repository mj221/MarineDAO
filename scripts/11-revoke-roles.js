import sdk from "./1-initialize-sdk.js";

const token = sdk.getToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654");

(async () => {
  try {
    // Log the current roles.
    const allRoles = await token.roles.getAll();

    console.log("Roles that exist right now:", allRoles);

    // Revoke all privileges of current account
    await token.roles.setAll({ admin: [], minter: [] });
    console.log(
      "Roles after revoking user",
      await token.roles.getAll()
    );
    console.log("Successfully revoked all admin rights to the ERC-20 contract");

  } catch (error) {
    console.error("Failed to revoke private user from the DAO treasury", error);
  }
})();