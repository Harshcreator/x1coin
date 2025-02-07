// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer, signer1, signer2] = await ethers.getSigners();

  // Define dedicated wallet addresses for community fund and public sale
  const communityFundAddress = "0x0000000000000000000000000000000000000001"; // Replace with actual address
  const publicSaleAddress = "0x0000000000000000000000000000000000000002"; // Replace with actual address

  // Define signers and required signatures
  const signers = [deployer.address, signer1.address, signer2.address];
  const requiredSignatures = 2;

  // Deploy X1Coin
  const X1Coin = await ethers.getContractFactory("X1Coin");
  const token = await X1Coin.deploy();
  await token.waitForDeployment();
  console.log("X1Coin deployed to:", await token.getAddress());

  // Deploy TokenDistributor
  const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
  const distributor = await TokenDistributor.deploy(
    await token.getAddress(),
    communityFundAddress,
    publicSaleAddress,
    signers,
    requiredSignatures
  );
  await distributor.waitForDeployment();
  console.log("TokenDistributor deployed to:", await distributor.getAddress());

  // Approve the distributor to spend deployer's tokens
  await token.approve(
    await distributor.getAddress(),
    ethers.parseUnits("1000000000", 18) // Approve 1B tokens
  );

  // Cast to proper type and call distribute()
  const distributorWithSigner1 = distributor.connect(signer1);
  const distributorWithSigner2 = distributor.connect(signer2);
  await distributorWithSigner1.distribute();
  await distributorWithSigner2.distribute();

  // Deploy Staking
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await token.getAddress());
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});