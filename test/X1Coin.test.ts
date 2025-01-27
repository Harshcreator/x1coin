// test/X1Coin.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("X1Coin", () => {
  it("Should deploy with 1B supply", async () => {
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const token = await X1Coin.deploy();
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000000", 18));
  });
});