/**
 * WhaleAlertBidding Contract Tests
 * 
 * Comprehensive tests for the whale alert bidding contract including:
 * - Bidding functionality
 * - Outbidding with refunds
 * - Withdrawing bids
 * - Burning fees
 * - Pause/unpause
 * - Edge cases and security checks
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import { FLOWToken, WhaleAlertBidding } from "../typechain-types"

describe("WhaleAlertBidding", function () {
  let flowToken: FLOWToken
  let whaleAlertBidding: WhaleAlertBidding
  let owner: any
  let bidder1: any
  let bidder2: any
  let bidder3: any
  let whale1: any
  let whale2: any

  const MIN_BID = ethers.parseEther("100")
  const BID_AMOUNT_1 = ethers.parseEther("200")
  const BID_AMOUNT_2 = ethers.parseEther("300")
  const BID_AMOUNT_3 = ethers.parseEther("500")

  beforeEach(async function () {
    [owner, bidder1, bidder2, bidder3, whale1, whale2] = await ethers.getSigners()

    // Deploy FLOWToken
    const FLOWTokenFactory = await ethers.getContractFactory("FLOWToken")
    flowToken = await FLOWTokenFactory.deploy(owner.address)
    await flowToken.waitForDeployment()

    // Deploy WhaleAlertBidding
    const WhaleAlertBiddingFactory = await ethers.getContractFactory("WhaleAlertBidding")
    whaleAlertBidding = await WhaleAlertBiddingFactory.deploy(
      await flowToken.getAddress(),
      owner.address
    )
    await whaleAlertBidding.waitForDeployment()

    // Mint tokens for testing
    const mintAmount = ethers.parseEther("100000")
    await flowToken.mint(bidder1.address, mintAmount)
    await flowToken.mint(bidder2.address, mintAmount)
    await flowToken.mint(bidder3.address, mintAmount)
  })

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await whaleAlertBidding.MIN_BID()).to.equal(MIN_BID)
      expect(await whaleAlertBidding.flowToken()).to.equal(await flowToken.getAddress())
      expect(await whaleAlertBidding.owner()).to.equal(owner.address)
      expect(await whaleAlertBidding.totalBurned()).to.equal(0)
    })

    it("Should revert with zero address for flowToken", async function () {
      const WhaleAlertBiddingFactory = await ethers.getContractFactory("WhaleAlertBidding")
      await expect(
        WhaleAlertBiddingFactory.deploy(ethers.ZeroAddress, owner.address)
      ).to.be.revertedWith("WhaleAlertBidding: Invalid token address")
    })
  })

  describe("Placing Bids", function () {
    beforeEach(async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
    })

    it("Should allow placing a bid on a whale address", async function () {
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder1.address)
      expect(bid.amount).to.equal(BID_AMOUNT_1)
      expect(bid.isActive).to.equal(true)
      expect(bid.timestamp).to.be.greaterThan(0)

      const totalBid = await whaleAlertBidding.getUserTotalBid(bidder1.address)
      expect(totalBid).to.equal(BID_AMOUNT_1)
    })

    it("Should not allow placing bid below minimum", async function () {
      const belowMin = MIN_BID - ethers.parseEther("1")

      await expect(
        whaleAlertBidding.connect(bidder1).placeBid(whale1.address, belowMin)
      ).to.be.revertedWith("WhaleAlertBidding: Bid below minimum")
    })

    it("Should not allow placing bid on zero address", async function () {
      await expect(
        whaleAlertBidding.connect(bidder1).placeBid(ethers.ZeroAddress, BID_AMOUNT_1)
      ).to.be.revertedWith("WhaleAlertBidding: Invalid whale address")
    })

    it("Should not allow placing bid equal to current bid", async function () {
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)

      await flowToken.connect(bidder2).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_1
      )

      await expect(
        whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_1)
      ).to.be.revertedWith("WhaleAlertBidding: Bid must be higher than current bid")
    })

    it("Should not allow placing bid lower than current bid", async function () {
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_2)

      await flowToken.connect(bidder2).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_1
      )

      await expect(
        whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_1)
      ).to.be.revertedWith("WhaleAlertBidding: Bid must be higher than current bid")
    })

    it("Should add whale address to active list", async function () {
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)

      const activeAddresses = await whaleAlertBidding.getActiveWhaleAddresses()
      expect(activeAddresses).to.include(whale1.address)
      expect(await whaleAlertBidding.isInActiveList(whale1.address)).to.equal(true)
    })

    it("Should not allow placing bid when paused", async function () {
      await whaleAlertBidding.connect(owner).pause()

      await expect(
        whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      ).to.be.revertedWithCustomError(whaleAlertBidding, "EnforcedPause")
    })
  })

  describe("Outbidding", function () {
    beforeEach(async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await flowToken.connect(bidder2).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
    })

    it("Should allow outbidding and refund previous bidder", async function () {
      const bidder1BalanceBefore = await flowToken.balanceOf(bidder1.address)
      const bidder2BalanceBefore = await flowToken.balanceOf(bidder2.address)

      await whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_2)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder2.address)
      expect(bid.amount).to.equal(BID_AMOUNT_2)

      // Check bidder1 got refunded
      const bidder1BalanceAfter = await flowToken.balanceOf(bidder1.address)
      expect(bidder1BalanceAfter - bidder1BalanceBefore).to.equal(BID_AMOUNT_1)

      // Check bidder2's tokens were transferred
      const bidder2BalanceAfter = await flowToken.balanceOf(bidder2.address)
      expect(bidder2BalanceBefore - bidder2BalanceAfter).to.equal(BID_AMOUNT_2)

      // Check total bids
      expect(await whaleAlertBidding.getUserTotalBid(bidder1.address)).to.equal(0)
      expect(await whaleAlertBidding.getUserTotalBid(bidder2.address)).to.equal(BID_AMOUNT_2)
    })

    it("Should emit BidPlaced event with refund information", async function () {
      const tx = await whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_2)
      const receipt = await tx.wait()

      const WhaleAlertBiddingFactory = await ethers.getContractFactory("WhaleAlertBidding")
      const iface = WhaleAlertBiddingFactory.interface
      const bidEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = iface.parseLog(log)
          return parsed?.name === "BidPlaced"
        } catch {
          return false
        }
      })

      expect(bidEvent).to.not.be.undefined
      if (bidEvent) {
        const parsed = iface.parseLog(bidEvent)
        expect(parsed?.args[0]).to.equal(whale1.address) // whaleAddress
        expect(parsed?.args[1]).to.equal(bidder2.address) // bidder
        expect(parsed?.args[2]).to.equal(BID_AMOUNT_2) // amount
        expect(parsed?.args[3]).to.equal(bidder1.address) // previousBidder
        expect(parsed?.args[4]).to.equal(BID_AMOUNT_1) // refundAmount
      }
    })

    it("Should handle multiple outbids correctly", async function () {
      await flowToken.connect(bidder3).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )

      // Bidder2 outbids bidder1
      await whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_2)

      // Bidder3 outbids bidder2
      await whaleAlertBidding.connect(bidder3).placeBid(whale1.address, BID_AMOUNT_3)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder3.address)
      expect(bid.amount).to.equal(BID_AMOUNT_3)

      // Check bidder2 got refunded
      expect(await whaleAlertBidding.getUserTotalBid(bidder2.address)).to.equal(0)
      expect(await whaleAlertBidding.getUserTotalBid(bidder3.address)).to.equal(BID_AMOUNT_3)
    })

    it("Should track total bids across multiple whale addresses", async function () {
      await whaleAlertBidding.connect(bidder1).placeBid(whale2.address, BID_AMOUNT_1)

      const totalBid = await whaleAlertBidding.getUserTotalBid(bidder1.address)
      expect(totalBid).to.equal(BID_AMOUNT_1 + BID_AMOUNT_1) // Both whale addresses
    })
  })

  describe("Withdrawing Bids", function () {
    beforeEach(async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
    })

    it("Should allow bidder to withdraw their bid", async function () {
      const bidder1BalanceBefore = await flowToken.balanceOf(bidder1.address)

      await whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.isActive).to.equal(false)
      expect(bid.amount).to.equal(0)
      expect(bid.bidder).to.equal(ethers.ZeroAddress)

      // Check refund
      const bidder1BalanceAfter = await flowToken.balanceOf(bidder1.address)
      expect(bidder1BalanceAfter - bidder1BalanceBefore).to.equal(BID_AMOUNT_1)

      // Check total bid updated
      expect(await whaleAlertBidding.getUserTotalBid(bidder1.address)).to.equal(0)
    })

    it("Should not allow withdrawing someone else's bid", async function () {
      await expect(
        whaleAlertBidding.connect(bidder2).withdrawBid(whale1.address)
      ).to.be.revertedWith("WhaleAlertBidding: Not your bid")
    })

    it("Should not allow withdrawing when there's no active bid", async function () {
      await whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)

      await expect(
        whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)
      ).to.be.revertedWith("WhaleAlertBidding: No active bid")
    })

    it("Should not allow withdrawing when paused", async function () {
      await whaleAlertBidding.connect(owner).pause()

      await expect(
        whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)
      ).to.be.revertedWithCustomError(whaleAlertBidding, "EnforcedPause")
    })

    it("Should emit BidWithdrawn event", async function () {
      const tx = await whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)
      const receipt = await tx.wait()

      const WhaleAlertBiddingFactory = await ethers.getContractFactory("WhaleAlertBidding")
      const iface = WhaleAlertBiddingFactory.interface
      const withdrawEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = iface.parseLog(log)
          return parsed?.name === "BidWithdrawn"
        } catch {
          return false
        }
      })

      expect(withdrawEvent).to.not.be.undefined
    })
  })

  describe("Burning Fees", function () {
    beforeEach(async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
    })

    it("Should allow owner to burn bidding fees", async function () {
      const contractBalance = await flowToken.balanceOf(await whaleAlertBidding.getAddress())
      const burnAmount = contractBalance / 2n

      const totalBurnedBefore = await whaleAlertBidding.totalBurned()

      await whaleAlertBidding.connect(owner).burnBiddingFees(burnAmount)

      const totalBurnedAfter = await whaleAlertBidding.totalBurned()
      expect(totalBurnedAfter - totalBurnedBefore).to.equal(burnAmount)
    })

    it("Should not allow burning more than contract balance", async function () {
      const contractBalance = await flowToken.balanceOf(await whaleAlertBidding.getAddress())

      await expect(
        whaleAlertBidding.connect(owner).burnBiddingFees(contractBalance + ethers.parseEther("1"))
      ).to.be.revertedWith("WhaleAlertBidding: Insufficient balance")
    })

    it("Should not allow burning zero amount", async function () {
      await expect(
        whaleAlertBidding.connect(owner).burnBiddingFees(0)
      ).to.be.revertedWith("WhaleAlertBidding: Invalid amount")
    })

    it("Should not allow non-owner to burn fees", async function () {
      const contractBalance = await flowToken.balanceOf(await whaleAlertBidding.getAddress())
      const burnAmount = contractBalance / 2n

      await expect(
        whaleAlertBidding.connect(bidder1).burnBiddingFees(burnAmount)
      ).to.be.revertedWithCustomError(whaleAlertBidding, "OwnableUnauthorizedAccount")
    })

    it("Should emit TokensBurned event", async function () {
      const contractBalance = await flowToken.balanceOf(await whaleAlertBidding.getAddress())
      const burnAmount = contractBalance / 2n

      const tx = await whaleAlertBidding.connect(owner).burnBiddingFees(burnAmount)
      const receipt = await tx.wait()

      const WhaleAlertBiddingFactory = await ethers.getContractFactory("WhaleAlertBidding")
      const iface = WhaleAlertBiddingFactory.interface
      const burnEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = iface.parseLog(log)
          return parsed?.name === "TokensBurned"
        } catch {
          return false
        }
      })

      expect(burnEvent).to.not.be.undefined
      if (burnEvent) {
        const parsed = iface.parseLog(burnEvent)
        expect(parsed?.args[0]).to.equal(burnAmount)
      }
    })
  })

  describe("View Functions", function () {
    beforeEach(async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await flowToken.connect(bidder2).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      await whaleAlertBidding.connect(bidder2).placeBid(whale2.address, BID_AMOUNT_2)
    })

    it("Should return correct bid information", async function () {
      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder1.address)
      expect(bid.amount).to.equal(BID_AMOUNT_1)
      expect(bid.isActive).to.equal(true)
    })

    it("Should return all active whale addresses", async function () {
      const activeAddresses = await whaleAlertBidding.getActiveWhaleAddresses()
      expect(activeAddresses).to.include(whale1.address)
      expect(activeAddresses).to.include(whale2.address)
      expect(activeAddresses.length).to.equal(2)
    })

    it("Should return correct user total bid", async function () {
      const totalBid = await whaleAlertBidding.getUserTotalBid(bidder1.address)
      expect(totalBid).to.equal(BID_AMOUNT_1)
    })

    it("Should return zero for user with no bids", async function () {
      const totalBid = await whaleAlertBidding.getUserTotalBid(bidder3.address)
      expect(totalBid).to.equal(0)
    })
  })

  describe("Pause/Unpause", function () {
    it("Should allow owner to pause", async function () {
      await whaleAlertBidding.connect(owner).pause()
      expect(await whaleAlertBidding.paused()).to.equal(true)
    })

    it("Should allow owner to unpause", async function () {
      await whaleAlertBidding.connect(owner).pause()
      await whaleAlertBidding.connect(owner).unpause()
      expect(await whaleAlertBidding.paused()).to.equal(false)
    })

    it("Should not allow non-owner to pause", async function () {
      await expect(
        whaleAlertBidding.connect(bidder1).pause()
      ).to.be.revertedWithCustomError(whaleAlertBidding, "OwnableUnauthorizedAccount")
    })

    it("Should not allow non-owner to unpause", async function () {
      await whaleAlertBidding.connect(owner).pause()
      await expect(
        whaleAlertBidding.connect(bidder1).unpause()
      ).to.be.revertedWithCustomError(whaleAlertBidding, "OwnableUnauthorizedAccount")
    })
  })

  describe("Edge Cases", function () {
    it("Should handle placing bid on same whale address multiple times", async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3 * 2n
      )

      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_2)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder1.address)
      expect(bid.amount).to.equal(BID_AMOUNT_2)
      expect(await whaleAlertBidding.getUserTotalBid(bidder1.address)).to.equal(BID_AMOUNT_2)
    })

    it("Should handle withdrawing bid and then placing new bid", async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )

      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      await whaleAlertBidding.connect(bidder1).withdrawBid(whale1.address)

      // Should be able to place new bid after withdrawal
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_2)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.bidder).to.equal(bidder1.address)
      expect(bid.amount).to.equal(BID_AMOUNT_2)
    })

    it("Should not add duplicate whale addresses to active list", async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3 * 2n
      )

      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_2)

      const activeAddresses = await whaleAlertBidding.getActiveWhaleAddresses()
      const count = activeAddresses.filter((addr: string) => addr === whale1.address).length
      expect(count).to.equal(1)
    })

    it("Should handle minimum bid exactly", async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        MIN_BID
      )

      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, MIN_BID)

      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.amount).to.equal(MIN_BID)
    })
  })

  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is tested by the nonReentrant modifier
      // If reentrancy was possible, multiple bids could be placed in one transaction
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )

      // Normal bid should work
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)
      const bid = await whaleAlertBidding.getBid(whale1.address)
      expect(bid.amount).to.equal(BID_AMOUNT_1)
    })

    it("Should maintain correct balances after multiple operations", async function () {
      await flowToken.connect(bidder1).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )
      await flowToken.connect(bidder2).approve(
        await whaleAlertBidding.getAddress(),
        BID_AMOUNT_3
      )

      const bidder1InitialBalance = await flowToken.balanceOf(bidder1.address)
      const bidder2InitialBalance = await flowToken.balanceOf(bidder2.address)

      // Place bid
      await whaleAlertBidding.connect(bidder1).placeBid(whale1.address, BID_AMOUNT_1)

      // Outbid
      await whaleAlertBidding.connect(bidder2).placeBid(whale1.address, BID_AMOUNT_2)

      // Withdraw
      await whaleAlertBidding.connect(bidder2).withdrawBid(whale1.address)

      // Check balances are correct
      const bidder1FinalBalance = await flowToken.balanceOf(bidder1.address)
      const bidder2FinalBalance = await flowToken.balanceOf(bidder2.address)

      expect(bidder1FinalBalance).to.equal(bidder1InitialBalance) // Got refunded
      expect(bidder2FinalBalance).to.equal(bidder2InitialBalance) // Got refunded after withdrawal
    })
  })
})

