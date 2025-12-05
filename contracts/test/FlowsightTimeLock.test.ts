/**
 * FlowsightTimeLock Contract Tests
 * 
 * Comprehensive tests for the Ecosystem & DAO Treasury time-lock contract
 * Tests cover queueing, execution delays, cancellation, and integration with FLOWToken and Governance
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import { FLOWToken, Governance, FlowsightTimeLock } from "../typechain-types"
import { time } from "@nomicfoundation/hardhat-network-helpers"

describe("FlowsightTimeLock", function () {
  let flowToken: FLOWToken
  let governance: Governance
  let timeLock: FlowsightTimeLock
  let owner: any
  let proposer: any
  let executor: any
  let canceller: any
  let other: any

  const MIN_DELAY = 180 * 24 * 60 * 60 // 180 days in seconds
  const TREASURY_ALLOCATION = ethers.parseEther("350000000") // 350M FLOW

  beforeEach(async function () {
    [owner, proposer, executor, canceller, other] = await ethers.getSigners()

    // Deploy FLOWToken
    const FLOWTokenFactory = await ethers.getContractFactory("FLOWToken")
    flowToken = await FLOWTokenFactory.deploy(owner.address)
    await flowToken.waitForDeployment()

    // Deploy Governance
    const GovernanceFactory = await ethers.getContractFactory("Governance")
    governance = await GovernanceFactory.deploy(await flowToken.getAddress(), owner.address)
    await governance.waitForDeployment()

    // Setup proposers, executors, and admin
    const proposers = [proposer.address]
    const executors = [executor.address]
    const admin = owner.address

    // Deploy FlowsightTimeLock
    const FlowsightTimeLockFactory = await ethers.getContractFactory("FlowsightTimeLock")
    timeLock = await FlowsightTimeLockFactory.deploy(
      MIN_DELAY,
      proposers,
      executors,
      admin,
      await flowToken.getAddress()
    )
    await timeLock.waitForDeployment()

    // Mint tokens to timeLock contract
    await flowToken.mint(await timeLock.getAddress(), TREASURY_ALLOCATION)
  })

  describe("Deployment", function () {
    it("Should set the correct minimum delay", async function () {
      expect(await timeLock.getMinDelay()).to.equal(MIN_DELAY)
    })

    it("Should set the correct flowToken address", async function () {
      expect(await timeLock.flowToken()).to.equal(await flowToken.getAddress())
    })

    it("Should revert with delay less than MIN_DELAY", async function () {
      const FlowsightTimeLockFactory = await ethers.getContractFactory("FlowsightTimeLock")
      await expect(
        FlowsightTimeLockFactory.deploy(
          MIN_DELAY - 1,
          [proposer.address],
          [executor.address],
          owner.address,
          await flowToken.getAddress()
        )
      ).to.be.revertedWithCustomError(timeLock, "InvalidDelay")
    })

    it("Should revert with zero address for flowToken", async function () {
      const FlowsightTimeLockFactory = await ethers.getContractFactory("FlowsightTimeLock")
      await expect(
        FlowsightTimeLockFactory.deploy(
          MIN_DELAY,
          [proposer.address],
          [executor.address],
          owner.address,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(timeLock, "InvalidAddress")
    })

    it("Should have correct role setup", async function () {
      const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE()
      const EXECUTOR_ROLE = await timeLock.EXECUTOR_ROLE()
      const CANCELLER_ROLE = await timeLock.CANCELLER_ROLE()

      expect(await timeLock.hasRole(PROPOSER_ROLE, proposer.address)).to.equal(true)
      expect(await timeLock.hasRole(EXECUTOR_ROLE, executor.address)).to.equal(true)
      expect(await timeLock.hasRole(CANCELLER_ROLE, owner.address)).to.equal(true)
    })
  })

  describe("Queueing Transactions", function () {
    it("Should allow proposer to queue transaction", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await expect(
        timeLock.connect(proposer).schedule(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt,
          MIN_DELAY
        )
      ).to.not.be.reverted
    })

    it("Should not allow non-proposer to queue transaction", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await expect(
        timeLock.connect(other).schedule(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt,
          MIN_DELAY
        )
      ).to.be.reverted
    })

    it("Should queue transfer FLOWToken ownership", async function () {
      const tx = await timeLock.connect(proposer).queueTransferFLOWTokenOwnership(
        await flowToken.getAddress(),
        await timeLock.getAddress()
      )
      await expect(tx).to.not.be.reverted
    })

    it("Should queue transfer Governance ownership", async function () {
      const tx = await timeLock.connect(proposer).queueTransferGovernanceOwnership(
        await governance.getAddress(),
        await timeLock.getAddress()
      )
      await expect(tx).to.not.be.reverted
    })

    it("Should queue pause FLOWToken", async function () {
      const tx = await timeLock.connect(proposer).queuePauseFLOWToken(
        await flowToken.getAddress()
      )
      await expect(tx).to.not.be.reverted
    })

    it("Should queue unpause FLOWToken", async function () {
      const tx = await timeLock.connect(proposer).queueUnpauseFLOWToken(
        await flowToken.getAddress()
      )
      await expect(tx).to.not.be.reverted
    })

    it("Should queue set Governance contract addresses", async function () {
      const curatorStaking = ethers.Wallet.createRandom().address
      const whaleAlertBidding = ethers.Wallet.createRandom().address

      const tx = await timeLock.connect(proposer).queueSetGovernanceContractAddresses(
        await governance.getAddress(),
        curatorStaking,
        await flowToken.getAddress(),
        whaleAlertBidding
      )
      await expect(tx).to.not.be.reverted
    })
  })

  describe("Execution Delay", function () {
    it("Should not allow execution before delay", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      // Try to execute immediately
      await expect(
        timeLock.connect(executor).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.be.reverted
    })

    it("Should allow execution after delay", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      const txHash = await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Execute should succeed
      await expect(
        timeLock.connect(executor).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.not.be.reverted

      // Verify pause was executed
      expect(await flowToken.paused()).to.equal(true)
    })

    it("Should not allow execution by non-executor", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      await time.increase(MIN_DELAY + 1)

      await expect(
        timeLock.connect(other).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.be.reverted
    })
  })

  describe("Cancellation", function () {
    it("Should allow canceller to cancel queued transaction", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      const txHash = await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      await expect(
        timeLock.connect(owner).cancel(txHash)
      ).to.not.be.reverted
    })

    it("Should not allow execution after cancellation", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      const txHash = await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      await timeLock.connect(owner).cancel(txHash)
      await time.increase(MIN_DELAY + 1)

      await expect(
        timeLock.connect(executor).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.be.reverted
    })

    it("Should not allow non-canceller to cancel", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      const txHash = await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      await expect(
        timeLock.connect(other).cancel(txHash)
      ).to.be.reverted
    })
  })

  describe("FLOWToken Ownership Transfer", function () {
    it("Should transfer FLOWToken ownership to TimeLock after delay", async function () {
      // Queue ownership transfer
      await timeLock.connect(proposer).queueTransferFLOWTokenOwnership(
        await flowToken.getAddress(),
        await timeLock.getAddress()
      )

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Get the transaction hash
      const callData = flowToken.interface.encodeFunctionData("transferOwnership", [await timeLock.getAddress()])
      const salt = ethers.ZeroHash
      const txHash = await timeLock.hashOperation(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Execute
      await timeLock.connect(executor).execute(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Verify ownership transfer
      expect(await flowToken.owner()).to.equal(await timeLock.getAddress())
    })
  })

  describe("Governance Ownership Transfer", function () {
    it("Should transfer Governance ownership to TimeLock after delay", async function () {
      // Queue ownership transfer
      await timeLock.connect(proposer).queueTransferGovernanceOwnership(
        await governance.getAddress(),
        await timeLock.getAddress()
      )

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Get the transaction hash
      const callData = governance.interface.encodeFunctionData("transferOwnership", [await timeLock.getAddress()])
      const salt = ethers.ZeroHash
      const txHash = await timeLock.hashOperation(
        await governance.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Execute
      await timeLock.connect(executor).execute(
        await governance.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Verify ownership transfer
      expect(await governance.owner()).to.equal(await timeLock.getAddress())
    })
  })

  describe("FLOWToken Pause/Unpause via TimeLock", function () {
    it("Should pause FLOWToken via TimeLock after delay", async function () {
      // Queue pause
      await timeLock.connect(proposer).queuePauseFLOWToken(await flowToken.getAddress())

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Execute pause
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash
      await timeLock.connect(executor).execute(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Verify pause
      expect(await flowToken.paused()).to.equal(true)
    })

    it("Should unpause FLOWToken via TimeLock after delay", async function () {
      // First pause directly (as owner)
      await flowToken.pause()

      // Queue unpause
      await timeLock.connect(proposer).queueUnpauseFLOWToken(await flowToken.getAddress())

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Execute unpause
      const callData = flowToken.interface.encodeFunctionData("unpause")
      const salt = ethers.ZeroHash
      await timeLock.connect(executor).execute(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Verify unpause
      expect(await flowToken.paused()).to.equal(false)
    })
  })

  describe("Governance Contract Addresses via TimeLock", function () {
    it("Should set Governance contract addresses via TimeLock after delay", async function () {
      const curatorStaking = ethers.Wallet.createRandom().address
      const whaleAlertBidding = ethers.Wallet.createRandom().address

      // Queue set contract addresses
      await timeLock.connect(proposer).queueSetGovernanceContractAddresses(
        await governance.getAddress(),
        curatorStaking,
        await flowToken.getAddress(),
        whaleAlertBidding
      )

      // Wait for delay
      await time.increase(MIN_DELAY + 1)

      // Execute
      const callData = governance.interface.encodeFunctionData("setContractAddresses", [
        curatorStaking,
        await flowToken.getAddress(),
        whaleAlertBidding
      ])
      const salt = ethers.ZeroHash
      await timeLock.connect(executor).execute(
        await governance.getAddress(),
        0,
        callData,
        salt,
        salt
      )

      // Verify addresses were set
      expect(await governance.curatorStaking()).to.equal(curatorStaking)
      expect(await governance.flowTokenContract()).to.equal(await flowToken.getAddress())
      expect(await governance.whaleAlertBidding()).to.equal(whaleAlertBidding)
    })
  })

  describe("Edge Cases", function () {
    it("Should handle multiple queued transactions", async function () {
      const callData1 = flowToken.interface.encodeFunctionData("pause")
      const callData2 = flowToken.interface.encodeFunctionData("unpause")
      const salt = ethers.ZeroHash

      await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData1,
        salt,
        salt,
        MIN_DELAY
      )

      await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData2,
        salt,
        salt,
        MIN_DELAY
      )

      await time.increase(MIN_DELAY + 1)

      // Execute first
      await timeLock.connect(executor).execute(
        await flowToken.getAddress(),
        0,
        callData1,
        salt,
        salt
      )

      // Execute second
      await timeLock.connect(executor).execute(
        await flowToken.getAddress(),
        0,
        callData2,
        salt,
        salt
      )

      expect(await flowToken.paused()).to.equal(false)
    })

    it("Should prevent DoS by queueing many transactions", async function () {
      const salt = ethers.ZeroHash
      const callData = flowToken.interface.encodeFunctionData("pause")

      // Queue multiple transactions
      for (let i = 0; i < 10; i++) {
        await timeLock.connect(proposer).schedule(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt,
          MIN_DELAY
        )
      }

      await time.increase(MIN_DELAY + 1)

      // All should be executable
      for (let i = 0; i < 10; i++) {
        await expect(
          timeLock.connect(executor).execute(
            await flowToken.getAddress(),
            0,
            callData,
            salt,
            salt
          )
        ).to.not.be.reverted
      }
    })

    it("Should handle execution exactly at delay boundary", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await timeLock.connect(proposer).schedule(
        await flowToken.getAddress(),
        0,
        callData,
        salt,
        salt,
        MIN_DELAY
      )

      // Wait exactly MIN_DELAY
      await time.increase(MIN_DELAY)

      // Should still fail (needs to be > MIN_DELAY)
      await expect(
        timeLock.connect(executor).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.be.reverted
    })
  })

  describe("Security", function () {
    it("Should prevent unauthorized role changes", async function () {
      const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE()
      
      await expect(
        timeLock.connect(other).grantRole(PROPOSER_ROLE, other.address)
      ).to.be.reverted
    })

    it("Should allow admin to grant roles", async function () {
      const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE()
      
      await timeLock.connect(owner).grantRole(PROPOSER_ROLE, other.address)
      expect(await timeLock.hasRole(PROPOSER_ROLE, other.address)).to.equal(true)
    })

    it("Should prevent execution of non-queued transactions", async function () {
      const callData = flowToken.interface.encodeFunctionData("pause")
      const salt = ethers.ZeroHash

      await expect(
        timeLock.connect(executor).execute(
          await flowToken.getAddress(),
          0,
          callData,
          salt,
          salt
        )
      ).to.be.reverted
    })
  })
})

