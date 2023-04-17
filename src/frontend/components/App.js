import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';
import Navigation from './Navbar';
import Create from './Create.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';

function App() {
	const [loading, setLoading] = useState(true);
	const [account, setAccount] = useState(null);
	const [nft, setNFT] = useState({});
	const [marketplace, setMarketplace] = useState({});
	//Metamask code Login/COnnect
	const web3Handler = async () => {
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		setAccount(accounts[0]);
		// Get the provider and signer from Metamask and connect to the network
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner(); //signer is the account that is connected to the network

		const loadContracts = async (signer) => {
			//Get deployed copies of the contracts
			const marketplace = new ethers.Contract(
				MarketplaceAddress.address,
				MarketplaceAddress.abi,
				signer
			);
			loadContracts(signer);
			setMarketplace(marketplace);
			const nft = new ethers.Contract(NFTAddress.address, NFTAddress.abi, signer);
			setNFT(nft);
			setLoading(false);
		};
	};

	return (
		<div className='App'>
			<Navigation web3Handler={web3Handler} account={account} />

			<Routes>
				<Route path='/' element={<Home marketplace={marketplace} nft={nft} />} />
				<Route path='/create' element={<Create marketplace={marketplace} nft={nft} />} />
			</Routes>
		</div>
	);
}

export default App;
