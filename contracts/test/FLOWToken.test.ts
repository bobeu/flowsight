/**
 * FLOWToken Contract Tests
 * 
 * Basic tests for the FLOW token contract
 * Run with: npx hardhat test
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import { FLOWToken } from "../typechain-types"

describe("FLOWToken", function () {
  let flowToken: FLOWToken
  let owner: any
  let addr1: any
  let addr2: any

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners()

    const FLOWTokenFactory = await ethers.getContractFactory("FLOWToken")
    flowToken = await FLOWTokenFactory.deploy(owner.address)
    await flowToken.waitForDeployment()
  })

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await flowToken.owner()).to.equal(owner.address)
    })

    it("Should have correct name and symbol", async function () {
      expect(await flowToken.name()).to.equal("FlowSight")
      expect(await flowToken.symbol()).to.equal("FLOW")
    })

    it("Should have zero initial supply", async function () {
      expect(await flowToken.totalSupply()).to.equal(0)
    })
  })

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("1000")
      await flowToken.mint(addr1.address, amount)
      
      expect(await flowToken.balanceOf(addr1.address)).to.equal(amount)
      expect(await flowToken.totalSupply()).to.equal(amount)
    })

    it("Should not allow non-owner to mint", async function () {
      const amount = ethers.parseEther("1000")
      await expect(
        flowToken.connect(addr1).mint(addr1.address, amount)
      ).to.be.revertedWithCustomError(flowToken, "OwnableUnauthorizedAccount")
    })

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await flowToken.MAX_MINTABLE()
      const excess = maxSupply + ethers.parseEther("1")
      
      await expect(
        flowToken.mint(addr1.address, excess)
      ).to.be.revertedWith("FLOWToken: Cannot exceed max mintable supply")
    })
  })

  describe("Pausing", function () {
    it("Should allow owner to pause", async function () {
      await flowToken.pause()
      expect(await flowToken.paused()).to.equal(true)
    })

    it("Should prevent transfers when paused", async function () {
      const amount = ethers.parseEther("1000")
      await flowToken.mint(addr1.address, amount)
      await flowToken.pause()
      
      await expect(
        flowToken.connect(addr1).transfer(addr2.address, amount)
      ).to.be.revertedWithCustomError(flowToken, "EnforcedPause")
    })
  })
})

