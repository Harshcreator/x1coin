// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy X1Coin
  const X1Coin = await ethers.getContractFactory("X1Coin");
  const token = await X1Coin.deploy();

  // Use deployer's address as a placeholder for community fund
  const communityFund = deployer.address;
  
  // Deploy TokenDistributor
  const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
  const distributor = await TokenDistributor.deploy(await token.getAddress(), communityFund);

  // Approve the distributor to spend deployer's tokens
  await token.approve(
    await distributor.getAddress(),
    ethers.parseUnits("1000000000", 18) // Approve 1B tokens
  );

  // Cast to proper type and call distribute()
  const distributorWithSigner = distributor.connect(deployer);
  await distributorWithSigner.distribute();


  // Deploy Staking
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await token.getAddress());

  console.log("X1Coin deployed to:", await token.getAddress());
  console.log("TokenDistributor deployed to:", await distributor.getAddress());
  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});