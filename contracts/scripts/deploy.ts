import * as dotenv from "dotenv";
dotenv.config();

// @ts-ignore - Hardhat runtime environment types
import { ethers } from "hardhat";

/**
 * Deployment script for FlowSight smart contracts
 * 
 * Deploys:
 * 1. FLOWToken - ERC-20 token contract
 * 2. CuratorStaking - Staking and slashing contract
 * 
 * Usage:
 * npx hardhat run scripts/deploy.ts --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy FLOWToken
  console.log("\n📝 Deploying FLOWToken...");
  const FLOWToken = await ethers.getContractFactory("FLOWToken");
  const flowToken = await FLOWToken.deploy(deployer.address);
  await flowToken.waitForDeployment();
  const flowTokenAddress = await flowToken.getAddress();
  
  console.log("✅ FLOWToken deployed to:", flowTokenAddress);

  // Deploy CuratorStaking
  console.log("\n📝 Deploying CuratorStaking...");
  const CuratorStaking = await ethers.getContractFactory("CuratorStaking");
  const curatorStaking = await CuratorStaking.deploy(flowTokenAddress, deployer.address);
  await curatorStaking.waitForDeployment();
  const curatorStakingAddress = await curatorStaking.getAddress();
  
  console.log("✅ CuratorStaking deployed to:", curatorStakingAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 Deployment Summary");
  console.log("=".repeat(60));
  console.log("FLOWToken Address:", flowTokenAddress);
  console.log("CuratorStaking Address:", curatorStakingAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("=".repeat(60));

  // Save deployment addresses (for frontend/backend integration)
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      FLOWToken: flowTokenAddress,
      CuratorStaking: curatorStakingAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

