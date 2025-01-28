// test/Staking.test.ts
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Staking", () => {
  it("Should stake and unstake with rewards", async () => {
    const [owner, user] = await ethers.getSigners();
    
    // Deploy contracts
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const token = await X1Coin.deploy();
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await token.getAddress());

    // Fund the staking contract with rewards 
    await token.transfer(await staking.getAddress(), ethers.parseUnits("1000", 18));

    // Fund user with tokens
    await token.transfer(user.address, ethers.parseUnits("1000", 18));
    await token.connect(user).approve(await staking.getAddress(), ethers.parseUnits("1000", 18));

    // Stake 100 tokens
    await staking.connect(user).stake(ethers.parseUnits("100", 18));

    // Fast-forward 30 days
    await network.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await network.provider.send("evm_mine");

    // Unstake
    await staking.connect(user).unstake();

    const balance = await token.balanceOf(user.address);
    expect(balance).to.be.closeTo(
      ethers.parseUnits("1000.8219", 18),
      ethers.parseUnits("0.1", 18)
    );
  });
});