/* eslint-disable no-undef */
const { expect } = require('chai');

// eslint-disable-next-line jest/valid-describe-callback
describe('NFTMarketplace', async function () {
	let deployer, addr1, addr2, nft, marketplace;
	const feePercent = 10;
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
		beforeEach(async function () {
			// Mint NFT
			await nft.connect(addr1).mint(URI);
			// Approve marketplace to spend NFT
			await nft.connect(addr1).approve(marketplace.address, true);
		});
	});
});
