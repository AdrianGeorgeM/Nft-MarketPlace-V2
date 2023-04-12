/* eslint-disable no-undef */
const { expect } = require('chai');
const { ethers } = require('hardhat');

const toWei = (num) => ethers.utils.parseEther(num.toString()); // 1 ether = 10 ** 18 wei
const fromWei = (num) => ethers.utils.formatEther(num);

// eslint-disable-next-line jest/valid-describe-callback
describe('NFTMarketplace', async function () {
	let deployer, addr1, addr2, nft, marketplace;
	const feePercent = 1;
	const URI = 'Sample URI';

	beforeEach(async function () {
		// create a fresh contract instance before each test
		//GET CONTRACT FACTORIES
		const NFT = await ethers.getContractFactory('NFT');
		const Marketplace = await ethers.getContractFactory('Marketplace');
		// GET SIGNERS
		[deployer, addr1, addr2] = await ethers.getSigners();
		// DEPLOY CONTRACTS
		nft = await NFT.deploy();
		marketplace = await Marketplace.deploy(feePercent);
	});

	// eslint-disable-next-line jest/valid-describe-callback
	describe('Deployment', async function () {
		it('Should track name and symbol of the nft collection', async function () {
			expect(await nft.name()).equal('NFT');
			expect(await nft.symbol()).equal('ANFT');
		});

		it('Should track the marketplace fee', async function () {
			expect(await marketplace.feeAccount()).equal(deployer.address);
			expect(await marketplace.feePercent()).equal(feePercent);
		});
	});

	// eslint-disable-next-line jest/valid-describe-callback
	describe('Minting NFTS', async function () {
		it('Should track each minted NFT', async function () {
			// Mint NFT
			await nft.connect(addr1).mint(URI);
			expect(await nft.tokenCount()).equal(1);
			expect(await nft.balanceOf(addr1.address)).equal(1);
			expect(await nft.ownerOf(1)).equal(addr1.address);
			expect(await nft.tokenURI(1)).equal(URI);

			// Mint another second NFT
			await nft.connect(addr2).mint(URI);
			expect(await nft.tokenCount()).equal(2);
			expect(await nft.balanceOf(addr2.address)).equal(1);
			expect(await nft.ownerOf(2)).equal(addr2.address);
			expect(await nft.tokenURI(2)).equal(URI);
		});
	});

	// eslint-disable-next-line jest/valid-describe-callback
	describe('Making marketplace items', async function () {
		let price = 1;
		beforeEach(async function () {
			// Mint NFT
			await nft.connect(addr1).mint(URI);
			// Approve marketplace to spend NFT
			await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
		});

		it('Should track each marketplace item, transfer NFT from seller to marketplace and emit Offered event', async function () {
			// Convert price to wei
			// const weiPrice = ethers.utils.parseEther(price.toString());
			// console.log('weiPrice', weiPrice);
			// console.log('price', toWei(price));

			await expect(
				marketplace.connect(addr1).createMarketItem(nft.address, 1, toWei(price))
			)
				.emit(marketplace, 'Offered')
				.withArgs(1, nft.address, 1, addr1.address, toWei(price));

			expect(await nft.ownerOf(1)).equal(marketplace.address);
			expect(await marketplace.itemCounter()).equal(1);

			const item = await marketplace.marketItems(1);
			expect(item.tokenId).equal(1);
			expect(item.nft).equal(nft.address);
			expect(item.itemId).equal(1);
			expect(item.price).equal(toWei(price));
			expect(item.isSold).equal(false);
		});

		it('Should fail if price is set to zero', async function () {
			await expect(
				marketplace.connect(addr1).createMarketItem(nft.address, 1, 0)
			).revertedWith("reverted with reason string 'Price must be greater than 0'");
		});
	});

	// eslint-disable-next-line jest/valid-describe-callback
	describe('Buying marketplace items', async function () {
		beforeEach(async function () {
			// addr1 mints an NFT
			await nft.connect(addr1).mint(URI);
			// addr1 approves marketplace to spend NFT
			await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
			// addr1 creates a marketplace item
			await marketplace.connect(addr1).createMarketItem(nft.address, 1, toWei(2));
		});

		it('Should update item as sold,pay seller, transfer NFT to buyer,charge fees and emit a Bought event', async function () {
			const sellerInitialEthBalance = await ethers.provider.getBalance();
			const feeAccountInitialEthBalance = await deployer.getBalance();
			//fetch items total price(market price + item fee)
			let totalPriceInWei = await marketplace.getTotalPrice(1);
			//addr 2 purchases the item
			await marketplace
				.connect(addr2)
				.purchaseItem(1, { value: totalPriceInWei })
				.emit('Bought', 1, nft.address, 1, toWei(2), addr1.address, addr2.address)
				.withArgs(1, nft.address, 1, toWei(2), addr1.address, addr2.address);

			const sellerFinalEthBalance = await addr1.getBalance();
			const feeAccountFinalEthBalance = await deployer.getBalance();
			//Seller should receive payment for the price of the NFT sold,]
			expect(+fromWei(sellerFinalEthBalance)).equal(
				+price + +fromWei(sellerInitialEthBalance)
			);
			//calculate the fee amount
			const feeAmount = (feePercent / 100) * price;
			//fee account should receive the fee amount
			expect(+fromWei(feeAccountFinalEthBalance)).equal(
				+feeAmount + +fromWei(feeAccountInitialEthBalance)
			);
			// NFT should be transferred to the buyer
			expect(await nft.ownerOf(1)).equal(addr2.address);
			// Marketplace item should be marked as sold
			expect(await marketplace.marketItems(1).isSold).equal(true);
		});
	});
});
