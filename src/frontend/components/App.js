import './App.css';
import { ethers } from 'ethers';

function App() {
	//Metamask code Login/COnnect
	const web3Handler = async () => {
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		const provider = new ethers.providers.Web3Provider(window.ethereum);
	};
	return (
		<div>
			<h1>React App</h1>
		</div>
	);
}

export default App;
