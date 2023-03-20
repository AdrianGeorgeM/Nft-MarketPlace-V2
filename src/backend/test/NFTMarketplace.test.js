const { expect } = require('chai');

// eslint-disable-next-line jest/valid-describe-callback
describe('NFTMarketplace', async function () {
	let deployer, addr1, addr2, nft, marketplace;

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
});
