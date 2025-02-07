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
    console.log("Staking Contract Balance:", ethers.formatUnits(await token.balanceOf(await staking.getAddress()), 18));

    // Fund user with tokens
    await token.transfer(user.address, ethers.parseUnits("1000", 18));
    console.log("Initial User Balance:", ethers.formatUnits(await token.balanceOf(user.address), 18));

    await token.connect(user).approve(await staking.getAddress(), ethers.parseUnits("1000", 18));

    // Stake 100 tokens
    await staking.connect(user).stake(ethers.parseUnits("100", 18));
    console.log("Staked Amount:", ethers.formatUnits(ethers.parseUnits("100", 18), 18));
    console.log("User Balance After Stake:", ethers.formatUnits(await token.balanceOf(user.address), 18));

    const THIRTY_DAYS = 30 * 24 * 60 * 60;
    await network.provider.send("evm_increaseTime", [THIRTY_DAYS]);
    await network.provider.send("evm_mine");
    console.log("Time elapsed: 30 days");

    await staking.connect(user).unstake();
    const finalBalance = await token.balanceOf(user.address);
    console.log("Final User Balance:", ethers.formatUnits(finalBalance, 18));
    console.log("Total Rewards:", ethers.formatUnits(finalBalance - (ethers.parseUnits("900", 18)), 18));

    expect(finalBalance).to.be.closeTo(
      ethers.parseUnits("1000.8219", 18),
      ethers.parseUnits("0.1", 18)
    );
  });
});