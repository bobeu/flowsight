/**
 * CuratorStaking Contract Tests
 * 
 * Basic tests for the curator staking contract
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import { FLOWToken, CuratorStaking } from "../typechain-types"

describe("CuratorStaking", function () {
  let flowToken: FLOWToken
  let curatorStaking: CuratorStaking
  let owner: any
  let curator1: any
  let curator2: any

  beforeEach(async function () {
    [owner, curator1, curator2] = await ethers.getSigners()

    // Deploy FLOWToken
    const FLOWTokenFactory = await ethers.getContractFactory("FLOWToken")
    flowToken = await FLOWTokenFactory.deploy(owner.address)
    await flowToken.waitForDeployment()

    // Deploy CuratorStaking
    const CuratorStakingFactory = await ethers.getContractFactory("CuratorStaking")
    curatorStaking = await CuratorStakingFactory.deploy(
      await flowToken.getAddress(),
      owner.address
    )
    await curatorStaking.waitForDeployment()

    // Mint tokens for testing
    const mintAmount = ethers.parseEther("100000")
    await flowToken.mint(curator1.address, mintAmount)
    await flowToken.mint(curator2.address, mintAmount)
  })

  describe("Staking", function () {
    it("Should allow staking minimum amount", async function () {
      const stakeAmount = await curatorStaking.MIN_STAKE()
      
      await flowToken.connect(curator1).approve(
        await curatorStaking.getAddress(),
        stakeAmount
      )
      
      await curatorStaking.connect(curator1).stake(stakeAmount)
      
      const curatorInfo = await curatorStaking.getCuratorInfo(curator1.address)
      expect(curatorInfo.stakedAmount).to.equal(stakeAmount)
      expect(curatorInfo.isActive).to.equal(true)
    })

    it("Should not allow staking below minimum", async function () {
      const minStake = await curatorStaking.MIN_STAKE()
      const belowMin = minStake - ethers.parseEther("1")
      
      await flowToken.connect(curator1).approve(
        await curatorStaking.getAddress(),
        belowMin
      )
      
      await expect(
        curatorStaking.connect(curator1).stake(belowMin)
      ).to.be.revertedWith("CuratorStaking: Amount below minimum")
    })
  })

  describe("Slashing", function () {
    it("Should allow owner to slash curator", async function () {
      const stakeAmount = await curatorStaking.MIN_STAKE()
      
      await flowToken.connect(curator1).approve(
        await curatorStaking.getAddress(),
        stakeAmount
      )
      await curatorStaking.connect(curator1).stake(stakeAmount)
      
      const slashPercentage = await curatorStaking.SLASH_PERCENTAGE()
      const expectedSlash = (stakeAmount * slashPercentage) / 10000n
      
      await curatorStaking.slashCurator(curator1.address, "Test slash")
      
      const curatorInfo = await curatorStaking.getCuratorInfo(curator1.address)
      expect(curatorInfo.stakedAmount).to.equal(stakeAmount - expectedSlash)
      expect(curatorInfo.totalSlashCount).to.equal(1)
    })
  })
})

