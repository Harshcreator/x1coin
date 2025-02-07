// test/TokenDistributor.test.ts
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Token Distribution", () => {
  let token: any, distributor: any;
  let owner: any, publicSale: any, communityFund: any, signer1: any, signer2: any;
  const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18);
  const PUBLIC_SALE = ethers.parseUnits("500000000", 18);
  const TEAM_ALLOCATION = ethers.parseUnits("300000000", 18);
  const COMMUNITY_ALLOCATION = ethers.parseUnits("200000000", 18);
  const REQUIRED_SIGNATURES = 2;

  before(async () => {
    [owner, publicSale, communityFund, signer1, signer2] = await ethers.getSigners();
    const X1Coin = await ethers.getContractFactory("X1Coin");
    const TokenDistributor = await ethers.getContractFactory("TokenDistributor");

    token = await X1Coin.deploy();
    await token.waitForDeployment();
    
    distributor = await TokenDistributor.deploy(
      await token.getAddress(),
      communityFund.address,
      publicSale.address,
      [signer1.address, signer2.address],
      REQUIRED_SIGNATURES
    );
    await distributor.waitForDeployment();

    // Approve the distributor to spend owner's tokens
    await token.approve(distributor.getAddress(), TOTAL_SUPPLY);
  });

  it("Should distribute tokens correctly", async () => {
    // Signers approve the distribution
    await distributor.connect(signer1).distribute();
    await distributor.connect(signer2).distribute();

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

    
    // Fast-forward 180 days to ensure complete vesting
    const SIX_MONTHS = 180 * 24 * 60 * 60;
    await network.provider.send("evm_increaseTime", [SIX_MONTHS]);
    await network.provider.send("evm_mine");

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