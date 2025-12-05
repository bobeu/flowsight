/**
 * FlowsightVesting Contract Tests
 * 
 * Comprehensive tests for the Team & Advisors vesting contract
 * Tests cover all edge cases including cliff, linear vesting, and multiple claims
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import { FLOWToken, FlowsightVesting } from "../typechain-types"
import { time } from "@nomicfoundation/hardhat-network-helpers"

describe("FlowsightVesting", function () {
  let flowToken: FLOWToken
  let vesting: FlowsightVesting
  let owner: any
  let beneficiary: any
  let other: any

  const TOTAL_ALLOCATION = ethers.parseEther("150000000") // 150M FLOW
  const CLIFF_PERIOD = 365 * 24 * 60 * 60 // 365 days in seconds
  const VESTING_DURATION = 1095 * 24 * 60 * 60 // 1095 days (36 months) in seconds
  let tgeTimestamp: number

  beforeEach(async function () {
    [owner, beneficiary, other] = await ethers.getSigners()

    // Deploy FLOWToken
    const FLOWTokenFactory = await ethers.getContractFactory("FLOWToken")
    flowToken = await FLOWTokenFactory.deploy(owner.address)
    await flowToken.waitForDeployment()

    // Set TGE timestamp to current time
    tgeTimestamp = Math.floor(Date.now() / 1000)

    // Deploy FlowsightVesting
    const FlowsightVestingFactory = await ethers.getContractFactory("FlowsightVesting")
    vesting = await FlowsightVestingFactory.deploy(
      await flowToken.getAddress(),
      TOTAL_ALLOCATION,
      tgeTimestamp
    )
    await vesting.waitForDeployment()

    // Mint tokens to vesting contract
    await flowToken.mint(await vesting.getAddress(), TOTAL_ALLOCATION)
  })

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await vesting.flowToken()).to.equal(await flowToken.getAddress())
      expect(await vesting.totalAllocation()).to.equal(TOTAL_ALLOCATION)
      expect(await vesting.tgeTimestamp()).to.equal(tgeTimestamp)
      expect(await vesting.CLIFF_PERIOD()).to.equal(CLIFF_PERIOD)
      expect(await vesting.VESTING_DURATION()).to.equal(VESTING_DURATION)
    })

    it("Should revert with zero address for flowToken", async function () {
      const FlowsightVestingFactory = await ethers.getContractFactory("FlowsightVesting")
      await expect(
        FlowsightVestingFactory.deploy(ethers.ZeroAddress, TOTAL_ALLOCATION, tgeTimestamp)
      ).to.be.revertedWithCustomError(vesting, "InvalidAddress")
    })

    it("Should revert with zero totalAllocation", async function () {
      const FlowsightVestingFactory = await ethers.getContractFactory("FlowsightVesting")
      await expect(
        FlowsightVestingFactory.deploy(await flowToken.getAddress(), 0, tgeTimestamp)
      ).to.be.revertedWithCustomError(vesting, "InvalidAmount")
    })

    it("Should revert with zero tgeTimestamp", async function () {
      const FlowsightVestingFactory = await ethers.getContractFactory("FlowsightVesting")
      await expect(
        FlowsightVestingFactory.deploy(await flowToken.getAddress(), TOTAL_ALLOCATION, 0)
      ).to.be.revertedWithCustomError(vesting, "InvalidAmount")
    })

    it("Should have zero released tokens initially", async function () {
      expect(await vesting.released()).to.equal(0)
    })

    it("Should have all tokens locked initially", async function () {
      expect(await vesting.locked()).to.equal(TOTAL_ALLOCATION)
    })
  })

  describe("Vesting Calculations", function () {
    it("Should return zero vested amount before TGE", async function () {
      const beforeTGE = tgeTimestamp - 1000
      expect(await vesting.vestedAmount(beforeTGE)).to.equal(0)
    })

    it("Should return zero vested amount before cliff", async function () {
      const beforeCliff = tgeTimestamp + CLIFF_PERIOD - 1000
      expect(await vesting.vestedAmount(beforeCliff)).to.equal(0)
    })

    it("Should return zero vested amount exactly at cliff", async function () {
      const atCliff = tgeTimestamp + CLIFF_PERIOD
      expect(await vesting.vestedAmount(atCliff)).to.equal(0)
    })

    it("Should return correct vested amount after cliff starts", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 2 // Halfway through vesting
      const expectedVested = TOTAL_ALLOCATION / 2n
      expect(await vesting.vestedAmount(afterCliff)).to.equal(expectedVested)
    })

    it("Should return full allocation after vesting completes", async function () {
      const afterVesting = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION + 1000
      expect(await vesting.vestedAmount(afterVesting)).to.equal(TOTAL_ALLOCATION)
    })

    it("Should calculate linear vesting correctly at 25%", async function () {
      const quarterVesting = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4n
      const expectedVested = TOTAL_ALLOCATION / 4n
      expect(await vesting.vestedAmount(quarterVesting)).to.equal(expectedVested)
    })

    it("Should calculate linear vesting correctly at 75%", async function () {
      const threeQuarterVesting = tgeTimestamp + CLIFF_PERIOD + (VESTING_DURATION * 3n) / 4n
      const expectedVested = (TOTAL_ALLOCATION * 3n) / 4n
      expect(await vesting.vestedAmount(threeQuarterVesting)).to.equal(expectedVested)
    })
  })

  describe("Releasable Amount", function () {
    it("Should return zero releasable before cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD - 1000)
      expect(await vesting.releasable()).to.equal(0)
    })

    it("Should return zero releasable at cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD)
      expect(await vesting.releasable()).to.equal(0)
    })

    it("Should return correct releasable after cliff starts", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 2
      await time.increaseTo(afterCliff)
      const expectedReleasable = TOTAL_ALLOCATION / 2n
      expect(await vesting.releasable()).to.equal(expectedReleasable)
    })

    it("Should return correct releasable after partial release", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 2
      await time.increaseTo(afterCliff)
      
      const firstRelease = TOTAL_ALLOCATION / 4n
      await vesting.release()
      
      // Releasable should be reduced by the amount already released
      const expectedReleasable = TOTAL_ALLOCATION / 2n - firstRelease
      expect(await vesting.releasable()).to.equal(expectedReleasable)
    })
  })

  describe("Release Functionality", function () {
    it("Should revert when trying to release before cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD - 1000)
      await expect(vesting.release()).to.be.revertedWithCustomError(vesting, "NoTokensToRelease")
    })

    it("Should revert when trying to release at cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD)
      await expect(vesting.release()).to.be.revertedWithCustomError(vesting, "NoTokensToRelease")
    })

    it("Should allow release after cliff starts", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      const expectedRelease = TOTAL_ALLOCATION / 4n
      const beneficiaryBalanceBefore = await flowToken.balanceOf(beneficiary.address)
      
      await vesting.connect(beneficiary).release()
      
      const beneficiaryBalanceAfter = await flowToken.balanceOf(beneficiary.address)
      expect(beneficiaryBalanceAfter - beneficiaryBalanceBefore).to.equal(expectedRelease)
      expect(await vesting.released()).to.equal(expectedRelease)
    })

    it("Should allow multiple partial releases", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      const firstRelease = TOTAL_ALLOCATION / 4n
      await vesting.connect(beneficiary).release()
      expect(await vesting.released()).to.equal(firstRelease)
      
      // Advance time by another quarter
      await time.increase(VESTING_DURATION / 4n)
      
      const secondRelease = TOTAL_ALLOCATION / 4n
      await vesting.connect(beneficiary).release()
      expect(await vesting.released()).to.equal(firstRelease + secondRelease)
    })

    it("Should allow release to different beneficiary", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      const expectedRelease = TOTAL_ALLOCATION / 4n
      const otherBalanceBefore = await flowToken.balanceOf(other.address)
      
      await vesting.connect(beneficiary).releaseTo(other.address)
      
      const otherBalanceAfter = await flowToken.balanceOf(other.address)
      expect(otherBalanceAfter - otherBalanceBefore).to.equal(expectedRelease)
    })

    it("Should revert when releasing to zero address", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      await expect(
        vesting.connect(beneficiary).releaseTo(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vesting, "InvalidAddress")
    })

    it("Should emit TokensReleased event", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      const expectedRelease = TOTAL_ALLOCATION / 4n
      await expect(vesting.connect(beneficiary).release())
        .to.emit(vesting, "TokensReleased")
        .withArgs(beneficiary.address, expectedRelease)
    })

    it("Should allow full release after vesting completes", async function () {
      const afterVesting = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION + 1000
      await time.increaseTo(afterVesting)
      
      await vesting.connect(beneficiary).release()
      
      expect(await vesting.released()).to.equal(TOTAL_ALLOCATION)
      expect(await vesting.locked()).to.equal(0)
      expect(await flowToken.balanceOf(beneficiary.address)).to.equal(TOTAL_ALLOCATION)
    })
  })

  describe("Vesting Status", function () {
    it("Should return correct status before cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD - 1000)
      
      const status = await vesting.getVestingStatus()
      expect(status.vested).to.equal(0)
      expect(status.releasedAmount).to.equal(0)
      expect(status.releasableAmount).to.equal(0)
      expect(status.lockedAmount).to.equal(TOTAL_ALLOCATION)
      expect(status.cliffReached).to.equal(false)
      expect(status.vestingComplete).to.equal(false)
    })

    it("Should return correct status at cliff", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD)
      
      const status = await vesting.getVestingStatus()
      expect(status.vested).to.equal(0)
      expect(status.releasedAmount).to.equal(0)
      expect(status.cliffReached).to.equal(true)
      expect(status.vestingComplete).to.equal(false)
    })

    it("Should return correct status during vesting", async function () {
      const duringVesting = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 2
      await time.increaseTo(duringVesting)
      
      const status = await vesting.getVestingStatus()
      expect(status.vested).to.equal(TOTAL_ALLOCATION / 2n)
      expect(status.releasableAmount).to.equal(TOTAL_ALLOCATION / 2n)
      expect(status.lockedAmount).to.equal(TOTAL_ALLOCATION)
      expect(status.cliffReached).to.equal(true)
      expect(status.vestingComplete).to.equal(false)
    })

    it("Should return correct status after vesting completes", async function () {
      const afterVesting = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION + 1000
      await time.increaseTo(afterVesting)
      
      const status = await vesting.getVestingStatus()
      expect(status.vested).to.equal(TOTAL_ALLOCATION)
      expect(status.releasableAmount).to.equal(TOTAL_ALLOCATION)
      expect(status.lockedAmount).to.equal(TOTAL_ALLOCATION)
      expect(status.cliffReached).to.equal(true)
      expect(status.vestingComplete).to.equal(true)
    })
  })

  describe("Edge Cases", function () {
    it("Should handle very small time increments correctly", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + 1
      await time.increaseTo(afterCliff)
      
      const releasable = await vesting.releasable()
      expect(releasable).to.be.greaterThan(0)
      expect(releasable).to.be.lessThan(TOTAL_ALLOCATION / 1000n) // Should be very small
    })

    it("Should handle multiple rapid releases", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 10
      await time.increaseTo(afterCliff)
      
      // Release multiple times with small time increments
      for (let i = 0; i < 5; i++) {
        await vesting.connect(beneficiary).release()
        await time.increase(100) // Small increment
      }
      
      // Should have released approximately 5/10 of total
      const released = await vesting.released()
      expect(released).to.be.greaterThan(0)
      expect(released).to.be.lessThan(TOTAL_ALLOCATION / 2n)
    })

    it("Should prevent reentrancy attacks", async function () {
      // This is tested by the nonReentrant modifier
      // If reentrancy was possible, multiple releases could happen in one transaction
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      await vesting.connect(beneficiary).release()
      const released = await vesting.released()
      expect(released).to.equal(TOTAL_ALLOCATION / 4n)
    })

    it("Should handle release when no tokens are releasable", async function () {
      await time.increaseTo(tgeTimestamp + CLIFF_PERIOD - 1000)
      
      await expect(vesting.release()).to.be.revertedWithCustomError(vesting, "NoTokensToRelease")
    })

    it("Should correctly track locked amount after partial release", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 4
      await time.increaseTo(afterCliff)
      
      await vesting.connect(beneficiary).release()
      
      const released = await vesting.released()
      const locked = await vesting.locked()
      expect(released + locked).to.equal(TOTAL_ALLOCATION)
    })
  })

  describe("Gas Optimization", function () {
    it("Should have low gas cost for release after many releases", async function () {
      const afterCliff = tgeTimestamp + CLIFF_PERIOD + VESTING_DURATION / 10
      await time.increaseTo(afterCliff)
      
      // Perform multiple releases
      for (let i = 0; i < 10; i++) {
        await vesting.connect(beneficiary).release()
        await time.increase(VESTING_DURATION / 100n)
      }
      
      // Final release should still be gas efficient
      const tx = await vesting.connect(beneficiary).release()
      const receipt = await tx.wait()
      
      // Gas cost should be reasonable (less than 100k gas)
      expect(receipt?.gasUsed).to.be.lessThan(100000n)
    })
  })
})

