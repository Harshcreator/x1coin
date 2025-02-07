// test/TokenDistributor.test.ts
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Token Distribution", () => {
  let token: any, distributor: any;
  let owner: any, publicSale: any, communityFund: any;
  const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18);
  const PUBLIC_SALE = ethers.parseUnits("500000000", 18);
  const TEAM_ALLOCATION = ethers.parseUnits("300000000", 18);
  const COMMUNITY_ALLOCATION = ethers.parseUnits("200000000", 18);

  before(async () => {
    [owner, publicSale, communityFund] = await ethers.getSigners();
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const TokenDistributor = await ethers.getContractFactory("TokenDistributor");

    token = await X1Coin.deploy();
    distributor = await TokenDistributor.deploy(
      await token.getAddress(),
      communityFund.address,
      publicSale.address
    );

    // Approve the distributor to spend owner's tokens
    await token.approve(distributor.getAddress(), TOTAL_SUPPLY);
    await distributor.distribute();
  });

  it("Should distribute tokens correctly", async () => {
    // Check Public Sale balance
    const publicSaleBalance = await token.balanceOf(publicSale.address);
    expect(publicSaleBalance).to.equal(PUBLIC_SALE);

    // Check Team Vesting balance
    const vestingBalance = await token.balanceOf(await distributor.teamVestingWallet());
    expect(vestingBalance).to.equal(TEAM_ALLOCATION);

    // Check Community Fund balance
    const communityBalance = await token.balanceOf(communityFund.address);
    expect(communityBalance).to.equal(COMMUNITY_ALLOCATION);
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
    const initialCommunityBalance = await token.balanceOf(communityFund);

    console.log("Initial Owner Balance:", initialOwnerBalance.toString());
    console.log("Initial Vesting Balance:", initialVestingBalance.toString());
    console.log("Initial Community Balance:", initialCommunityBalance.toString());

    // Verify initial balances
    expect(initialOwnerBalance).to.equal(0);
    expect(initialVestingBalance).to.equal(TEAM_ALLOCATION);
    expect(initialCommunityBalance).to.equal(COMMUNITY_ALLOCATION);

    // Attempt early release (no effect)
    //  await vestingWallet.getFunction("release(address)")(await token.getAddress());

    //  const postEarlyReleaseOwnerBalance = await token.balanceOf(owner.address);
    //  console.log("Post Early Release Owner Balance:", postEarlyReleaseOwnerBalance.toString());

    //  expect(postEarlyReleaseOwnerBalance).to.equal(TOTAL_SUPPLY - TEAM_ALLOCATION - COMMUNITY_ALLOCATION);

    
    // Fast-forward 180 days to ensure complete vesting
    const SIX_MONTHS = 180 * 24 * 60 * 60;
    await network.provider.send("evm_increaseTime", [SIX_MONTHS]);
    await network.provider.send("evm_mine");

    // const start = await vestingWallet.start();
    // const duration = await vestingWallet.duration();
    // const currentTime = await ethers.provider.getBlock('latest').then(b => {
    //   if (!b) throw new Error("Block is null");
    //   return b.timestamp;
    // });

    // console.log("Vesting Start:", start.toString());
    // console.log("Vesting Duration:", duration.toString());
    // console.log("Current Time:", currentTime.toString());
    // console.log("Time Elapsed:", currentTime - Number(start));

    // Release tokens after full vesting period
    await vestingWallet.getFunction("release(address)")(await token.getAddress());

    // Verify final balances
    const finalOwnerBalance = await token.balanceOf(owner.address);
    const finalVestingBalance = await token.balanceOf(vestingWallet.getAddress());

    console.log("Final Owner Balance:", finalOwnerBalance.toString());
    console.log("Final Vesting Balance:", finalVestingBalance.toString());

    // Owner should now have the team's 300M tokens
    expect(finalOwnerBalance).to.equal(TEAM_ALLOCATION);
    expect(finalVestingBalance).to.equal(0);
  });
});