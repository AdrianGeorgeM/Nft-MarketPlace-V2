const { expect } = require('chai');

// eslint-disable-next-line jest/valid-describe-callback
describe('NFTMarketplace', async function () {
	let deployer, addr1, addr2, nft, marketplace;
	const feePercent = 10;

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
			expect(await nft.name()).to.equal('NFT');
			expect(await nft.symbol()).to.equal('ANFT');
		});

		it('Should track the marketplace fee', async function () {
			expect(await marketplace.feeAccount()).to.equal(deployer.address);
			expect(await marketplace.feePercent()).to.equal(feePercent);
		});
	});
});
