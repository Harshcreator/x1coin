// test/X1Coin.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("X1Coin", () => {
  it("Should deploy with 1B supply", async () => {
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const token = await X1Coin.deploy();
    console.log("X1Coin deployed to:", await token.getAddress());

    // Log token metadata
    console.log("Token Name:", await token.name());
    console.log("Token Symbol:", await token.symbol());
    console.log("Token Decimals:", await token.decimals());

    // Log supply info
    const totalSupply = await token.totalSupply();
    console.log("Total Supply (raw):", totalSupply.toString());
    console.log("Total Supply (formatted):", ethers.formatUnits(totalSupply, 18));

    // Verify supply
    expect(totalSupply).to.equal(ethers.parseUnits("1000000000", 18));
  });
});