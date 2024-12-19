const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtyomLovesOlya", function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;
  const initialSupply = 1000000;
  const maxSupply = 10000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Token = await ethers.getContractFactory("ArtyomLovesOlya");
    token = await Token.deploy(initialSupply, maxSupply);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("50");
      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);

      const transferAmount = ethers.parseEther("25");
      await token.connect(addr1).transfer(addr2.address, transferAmount);
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialBalance = await token.balanceOf(addr1.address);
      const transferAmount = ethers.parseEther("1");
      await expect(
        token.connect(addr1).transfer(owner.address, transferAmount)
      ).to.be.reverted;
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to address", async function () {
      const mintAmount = ethers.parseEther("1");
      const initialBalance = await token.balanceOf(addr1.address);
      
      const currentSupply = await token.totalSupply();
      const maxSupply = await token.getMaxSupply();
      
      expect(currentSupply + mintAmount).to.be.lessThanOrEqual(maxSupply);

      await token.mint(addr1.address, mintAmount);
      expect(await token.balanceOf(addr1.address)).to.equal(initialBalance + mintAmount);
    });

    it("Should fail if not owner", async function () {
      const mintAmount = ethers.parseEther("1");
      await expect(
        token.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should fail if exceeds max supply", async function () {
      const currentSupply = await token.totalSupply();
      const maxSupply = await token.getMaxSupply();
      
      const exceedAmount = maxSupply - currentSupply + ethers.parseEther("1");
      
      await expect(
        token.mint(addr1.address, exceedAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Blacklist", function () {
    it("Should blacklist and unblacklist address", async function () {
      await token.addToBlacklist(addr1.address);
      expect(await token.isBlacklisted(addr1.address)).to.be.true;

      await token.removeFromBlacklist(addr1.address);
      expect(await token.isBlacklisted(addr1.address)).to.be.false;
    });

    it("Should prevent transfers to/from blacklisted addresses", async function () {
      const amount = ethers.parseEther("50");
      await token.transfer(addr1.address, amount);
      await token.addToBlacklist(addr1.address);

      await expect(
        token.connect(addr1).transfer(addr2.address, amount)
      ).to.be.revertedWith("Address is blacklisted");

      await expect(
        token.transfer(addr1.address, amount)
      ).to.be.revertedWith("Address is blacklisted");
    });
  });

  describe("Pause", function () {
    it("Should pause and unpause transfers", async function () {
      const amount = ethers.parseEther("50");
      await token.transfer(addr1.address, amount);
      
      await token.pause();
      await expect(
        token.connect(addr1).transfer(addr2.address, amount)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");

      await token.unpause();
      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
    });
  });

  describe("Batch Transfer", function () {
    it("Should perform batch transfer", async function () {
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
      const recipients = [addr1.address, addr2.address];
      
      await token.batchTransfer(recipients, amounts);
      
      expect(await token.balanceOf(addr1.address)).to.equal(amounts[0]);
      expect(await token.balanceOf(addr2.address)).to.equal(amounts[1]);
    });
  });
}); 