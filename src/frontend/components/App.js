import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';

function App() {
	const [loading, setLoading] = useState(true);
	const [account, setAccount] = useState(null);
	const [marketplace, setMarketplace] = useState({});
	//Metamask code Login/COnnect
	const web3Handler = async () => {
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		setAccount(accounts[0]);
		// Get the provider and signer from Metamask and connect to the network
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner(); //signer is the account that is connected to the network

		loadContracts(signer);

		const loadContracts = async (signer) => {
			//Get deployed copies of the contracts
			const marketplace = new ethers.Contract(
				MarketplaceAddress.address,
				MarketplaceAddress.abi,
				signer
			);
			setMarketplace(marketplace);
			const nft = new ethers.Contract(NFTAddress.address, NFTAddress.abi, signer);
			setNft(nft);
			setLoading(false);
		};
	};

	return (
		<div>
			<h1>React App</h1>
		</div>
	);
}

export default App;
