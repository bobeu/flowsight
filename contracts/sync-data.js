#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration - directory paths
const HARDHAT_ARTIFACTS_PATH = './deployments/';
const REACT_DATA_PATH = '../frontend/src/lib/contracts';
const GLOBAL_OUTPUT_PATH = '../frontend/src/lib/contracts/contracts.json';

// Contracts to sync
const requiredContracts = [
  'FLOWToken.json',
  'CuratorStaking.json',
  'WhaleAlertBidding.json',
  'Governance.json',
];

// Chain ID mapping
const chainName = {
  97: 'bnbTestnet',
  1337: 'hardhat',
  31337: 'hardhat',
};

// Supported chain IDs
const chainIds = [97, 1337, 31337];

let workBuild = {
  97: [],
  1337: [],
  31337: [],
};

// Track processed files to avoid duplicates
const processedFiles = new Set();

let globalOutput = {
  chainName: chainName,
  chainIds: chainIds,
  paths: workBuild,
  contractAddresses: {
    bnbTestnet: {},
    hardhat: {},
  },
};

// Create the React contracts directory if it doesn't exist
if (!fs.existsSync(REACT_DATA_PATH)) {
  fs.mkdirSync(REACT_DATA_PATH, { recursive: true });
}

// Function to process contracts.json file
function processContractsJson(filePath, chainId) {
  if (processedFiles.has(filePath)) {
    return; // Already processed
  }
  processedFiles.add(filePath);

  try {
    const contractsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const detectedChainId = parseInt(contractsData.chainId) || chainId;
    const chainKey = chainName[detectedChainId] || 'hardhat';

    Object.keys(contractsData.contracts || {}).forEach((contractName) => {
      const contract = contractsData.contracts[contractName];
      if (requiredContracts.includes(`${contractName}.json`)) {
        if (!workBuild[detectedChainId]) {
          workBuild[detectedChainId] = [];
        }
        // Check if contract already added for this chain
        const existing = workBuild[detectedChainId].find(
          (c) => c.name === contractName && c.chainId === detectedChainId
        );
        if (!existing) {
          workBuild[detectedChainId].push({
            name: contractName,
            address: contract.address,
            abi: contract.abi,
            chainId: detectedChainId,
            chainKey: chainKey,
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error processing contracts.json: ${error.message}`);
  }
}

// Function to walk through directories recursively
function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory ${dir} does not exist. Run deployment first.`);
    return workBuild;
  }

  let list = fs.readdirSync(dir);
  const contractsJsonPath = path.join(dir, 'contracts.json');

  // Check for contracts.json file first
  if (fs.existsSync(contractsJsonPath)) {
    // Process contracts.json once - it will detect the chain ID from the file
    processContractsJson(contractsJsonPath, 1337); // default, will be overridden by file content
  }

  // Also check for individual contract files in network subdirectories
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const fileWithSolcInputs = file.includes('solcInputs');
    const fileWithChainId = file.endsWith('.chainId');
    const onlyRequired = requiredContracts.includes(file);

    if (stat && stat.isDirectory() && !fileWithSolcInputs && !fileWithChainId) {
      // Recursively process subdirectories
      const subFiles = walkDir(filePath);
      Object.keys(subFiles).forEach((key) => {
        workBuild[key] = workBuild[key].concat(subFiles[key]);
      });
    } else if (
      stat &&
      stat.isFile() &&
      !fileWithSolcInputs &&
      !fileWithChainId &&
      onlyRequired &&
      file.endsWith('.json')
    ) {
      // Process individual contract JSON files
      try {
        const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const contractName = file.replace('.json', '');
        let detectedChainId = 1337; // default to hardhat

        // Determine chain ID from path
        if (filePath.includes('bnbTestnet') || filePath.includes('97')) {
          detectedChainId = 97;
        } else if (filePath.includes('hardhat') || filePath.includes('localhost')) {
          detectedChainId = 1337;
        }

        const chainKey = chainName[detectedChainId] || 'hardhat';

        if (!workBuild[detectedChainId]) {
          workBuild[detectedChainId] = [];
        }
        workBuild[detectedChainId].push({
          name: contractName,
          address: artifact.address,
          abi: artifact.abi,
          chainId: detectedChainId,
          chainKey: chainKey,
        });
      } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
      }
    }
  });

  return workBuild;
}

// Main script
console.log('🔄 Syncing contracts data to Frontend...');

try {
  // Find all artifact JSON files
  walkDir(HARDHAT_ARTIFACTS_PATH);

  chainIds.forEach((chainId) => {
    const chainKey = chainName[chainId] || 'hardhat';
    const contractAddresses = {};

    if (workBuild[chainId] && workBuild[chainId].length > 0) {
      workBuild[chainId].forEach((contractData) => {
        try {
          const contractName = contractData.name;
          const chainDir = `${REACT_DATA_PATH}/${contractData.chainKey || chainKey}`;
          if (!fs.existsSync(chainDir)) {
            fs.mkdirSync(chainDir, { recursive: true });
          }

          const artifactPath = path.join(chainDir, `${contractName}.json`);
          fs.writeFileSync(
            artifactPath,
            JSON.stringify(
              {
                address: contractData.address,
                abi: contractData.abi,
                contractName: contractName,
              },
              null,
              2
            )
          );

          // Store address in global output
          contractAddresses[contractName] = contractData.address;

          console.log(`✅ Synced ${contractName} to ${artifactPath}`);
        } catch (error) {
          console.error(`❌ Error processing contract:`, error.message);
        }
      });

      globalOutput.contractAddresses[chainKey] = contractAddresses;
    }
  });

  // Write global contracts file
  fs.writeFileSync(
    GLOBAL_OUTPUT_PATH,
    JSON.stringify(globalOutput, null, 2)
  );

  console.log('✅ Data synchronization completed!');
  console.log(`📁 Artifacts synced to: ${REACT_DATA_PATH}`);
  console.log(`📄 Global contracts file: ${GLOBAL_OUTPUT_PATH}`);
} catch (error) {
  console.error('❌ Error syncing contracts:', error);
  process.exit(1);
}

