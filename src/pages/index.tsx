declare let window: any;
import { useEffect, useState } from 'react';
import Image from 'next/image'
import twitterLogo from './assets/twitter-logo.svg';
import styles from '../styles/App.module.css';
import { SelectCharacter } from '../Components/SelectCharacter'
import { CONTRACT_ADDRESS } from '../constants'
import myEpicGame from '../utils/MyEpicGame.json'
import { ethers } from 'ethers'
import { transformCharacterData } from '../utils/helpers'
import { Arena } from '../Components/Arena'
import { LoadingIndicator } from '../Components/LoadingIndicator'
import { ICharacterNFT } from '../types/characterNFT'

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {

	const [currentAccount, setCurrentAccount] = useState(null);
	const [characterNFT, setCharacterNFT] = useState<ICharacterNFT | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have MetaMask!");

				setIsLoading(true)
				return;
			} else {
				console.log("We have the etherum object", ethereum);

				const accounts = await ethereum.request({ method: 'eth_accounts' });

				if (accounts.length !== 0) {
					const account = accounts[0];
					console.log('Found an authorized account', account);
					setCurrentAccount(account);
				} else {
					console.log('No authorized account found')
				}
			}
		} catch (error) {
			console.log(error)
		}

		setIsLoading(false)
	}

	const checkNetwork = async () => {
		try {
			if (window.ethereum.networkVersion !== '4') {
				alert('Por favor conecte-se a rede do Rinkeby!')
			}
		} catch (error) {
			console.log(error)
		}
	}

	const renderContent = () => {
		if (isLoading) {
			return <LoadingIndicator />
		}

		if (!currentAccount) {
			return (
				<div className={styles.connect_wallet_container}>
					<img
						src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
						alt="Monty Python Gif"
					/>
					<button
						className={`${styles.cta_button} ${styles.connect_wallet_button}`}
						onClick={connectWalletAction}
					>
						Conecte a sua carteira para começar
					</button>
				</div>
			)
		}

		if (currentAccount && !characterNFT) {
			return <SelectCharacter setCharacterNFT={setCharacterNFT} />
		} else if (currentAccount && characterNFT) {
			return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
		}
	}

	const connectWalletAction = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0])
			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		checkNetwork();
		setIsLoading(true)
		checkIfWalletIsConnected();
	}, [])

	useEffect(() => {
		const fetchNFTMetadata = async () => {
			console.log('Checking for Character NFT on address:', currentAccount);

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const gameContract = new ethers.Contract(
				CONTRACT_ADDRESS,
				myEpicGame.abi,
				signer
			);

			const txn = await gameContract.checkifUserHasNFT();
			if (txn.name) {
				console.log('User has character NFT');
				setCharacterNFT(transformCharacterData(txn));
			} else {
				console.log('No character NFT found');
			}

			setIsLoading(false);
		}

		if (currentAccount) {
			console.log('CurrentAccount:', currentAccount);
			fetchNFTMetadata();
		}
	}, [currentAccount])


	return (
		<div className={styles.App}>
			<div className={styles.container}>
				<div className={styles.header_container}>
					<p
						className={`${styles.header} 
						${styles.gradient_text}`}
					>⚔️ Animex Fighters ⚔️</p>
					<p className={styles.sub_text}>Junte-se a Luta!</p>
					{renderContent()}
				</div>
			</div>
		</div>
	);
};

export default App;
