import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from 'dotenv';
import { parseUnits } from 'ethers';

dotconfig();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute, read } = deployments;
  const { deployer } = await getNamedAccounts();

  const networkName = network.name;
  const INITIAL_MINT = parseUnits('100000', 18);
  console.log('Deploying to network:', networkName);
  console.log('Deployer address:', deployer);

  // Deploy FLOWToken
  console.log('\n Deploying FLOWToken...');
  const flowToken = await deploy('FLOWToken', {
    from: deployer,
    args: [deployer], // initialOwner
    log: true,
    waitConfirmations: networkName === 'hardhat' ? 0 : 1,
  });
  console.log(` FLOWToken deployed to: ${flowToken.address}`);

  // Deploy CuratorStaking
  console.log('\nDeploying CuratorStaking...');
  const curatorStaking = await deploy('CuratorStaking', {
    from: deployer,
    args: [flowToken.address, deployer], // _flowToken, initialOwner
    log: true,
    waitConfirmations: networkName === 'hardhat' ? 0 : 1,
  });
  console.log(` CuratorStaking deployed to: ${curatorStaking.address}`);

  // Deploy WhaleAlertBidding
  console.log('\n Deploying WhaleAlertBidding...');
  const whaleAlertBidding = await deploy('WhaleAlertBidding', {
    from: deployer,
    args: [flowToken.address, deployer], // _flowToken, initialOwner
    log: true,
    waitConfirmations: networkName === 'hardhat' ? 0 : 1,
  });
  console.log(`WhaleAlertBidding deployed to: ${whaleAlertBidding.address}`);

  // Deploy Governance
  console.log('\n Deploying Governance...');
  const governance = await deploy('Governance', {
    from: deployer,
    args: [flowToken.address, deployer], // _flowToken, initialOwner
    log: true,
    waitConfirmations: networkName === 'hardhat' ? 0 : 1,
  });
  console.log(`Governance deployed to: ${governance.address}`);

  const balanceOf = await read('FLOWToken', 'balanceOf', deployer) as bigint;
  console.log("Initial balanceOf:", balanceOf.toString());

  if(Number(balanceOf) === 0) {
    await execute('FLOWToken', {from : deployer}, 'mint', deployer, INITIAL_MINT);
    console.log("Minted INITIAL_MINT tokens to deployer");
  }

  const balanceOfAFter = await read('FLOWToken', 'balanceOf', deployer) as bigint;
  console.log("balanceOfAFter:", balanceOfAFter.toString());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(' Deployment Summary');
  console.log('='.repeat(60));
  console.log('Network:', networkName);
  console.log('Chain ID:', network.config.chainId);
  console.log('Deployer:', deployer);
  console.log('\nContract Addresses:');
  console.log('  FLOWToken:', flowToken.address);
  console.log('  CuratorStaking:', curatorStaking.address);
  console.log('  WhaleAlertBidding:', whaleAlertBidding.address);
  console.log('  Governance:', governance.address);
  console.log('='.repeat(60));
};

export default func;

func.tags = ['FLOWToken', 'CuratorStaking', 'WhaleAlertBidding', 'Governance'];

