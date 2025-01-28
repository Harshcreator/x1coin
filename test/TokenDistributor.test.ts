// test/TokenDistributor.test.ts
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Token Distribution", () => {
    let token: any, distributor: any;
    const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18);
    const TEAM_ALLOCATION = ethers.parseUnits("300000000", 18);

  before(async () => {
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
    
    token = await X1Coin.deploy();
    distributor = await TokenDistributor.deploy(await token.getAddress());
    
    await token.approve(distributor.getAddress(), TOTAL_SUPPLY);
    await distributor.distribute();
  });

  it("Should lock and release team tokens", async () => {
    const [owner] = await ethers.getSigners();
    
    // Get vesting wallet contract with explicit function signature
    const vestingWallet = await ethers.getContractAt(
      "VestingWallet",
      await distributor.teamVestingWallet(),
      owner
    );

    // Check initial balances
    const initialOwnerBalance = await token.balanceOf(owner.address);
    const initialVestingBalance = await token.balanceOf(vestingWallet.getAddress());
    console.log("Initial Owner Balance:", initialOwnerBalance.toString());
    console.log("Initial Vesting Balance:", initialVestingBalance.toString());

    expect(initialOwnerBalance).to.equal(TOTAL_SUPPLY - TEAM_ALLOCATION); // 700M
    expect(initialVestingBalance).to.equal(TEAM_ALLOCATION); // 300
  
   // Attempt early release (no effect)
   await vestingWallet.getFunction("release(address)")(await token.getAddress());
   const postEarlyReleaseOwnerBalance = await token.balanceOf(owner.address);
   console.log("Post Early Release Owner Balance:", postEarlyReleaseOwnerBalance.toString());
   expect(postEarlyReleaseOwnerBalance).to.equal(TOTAL_SUPPLY - TEAM_ALLOCATION);

    // Fast-forward 2 years to ensure complete vesting
    const TWO_YEARS = 2 * 365 * 24 * 60 * 60;
    await network.provider.send("evm_increaseTime", [TWO_YEARS]);
    await network.provider.send("evm_mine");

    const start = await vestingWallet.start();
    const duration = await vestingWallet.duration();
    const currentTime = await ethers.provider.getBlock('latest').then(b => {
      if (!b) throw new Error("Block is null");
      return b.timestamp;
    });
    
    console.log("Vesting Start:", start.toString());
    console.log("Vesting Duration:", duration.toString());
    console.log("Current Time:", currentTime.toString());
    console.log("Time Elapsed:", currentTime - Number(start));
    
    // Release tokens after full vesting period
    await vestingWallet.getFunction("release(address)")(await token.getAddress());
    
    // Verify final balances
    const finalOwnerBalance = await token.balanceOf(owner.address);
    const finalVestingBalance = await token.balanceOf(vestingWallet.getAddress());
    console.log("Final Owner Balance:", finalOwnerBalance.toString());
    console.log("Final Vesting Balance:", finalVestingBalance.toString());
    
    expect(finalOwnerBalance).to.equal(TOTAL_SUPPLY);
    expect(finalVestingBalance).to.equal(0);
  });
});