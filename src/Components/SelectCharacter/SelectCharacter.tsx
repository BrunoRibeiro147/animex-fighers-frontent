declare let window: any;
import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './SelectCharacter.module.css'
import { ethers, BigNumber } from 'ethers'
import { CONTRACT_ADDRESS } from '../../constants'
import { transformCharacterData } from '../../utils/helpers'
import myEpicGame from '../../utils/MyEpicGame.json'
import { LoadingIndicator } from '../LoadingIndicator'
import { ISelectCharacterProps } from './types'
import { ICharacterNFT } from '../../types/characterNFT'
import { IGameContract } from '../../types/gameContract'

const SelectCharacter = ({ setCharacterNFT }: ISelectCharacterProps) => {

	const [characters, setCharacters] = useState<ICharacterNFT[]>([])
	const [gameContract, setGameContract] = useState<IGameContract | null>(null)
	const [mintingCharacter, setMintingCharacter] = useState(false)

	const mintCharacterNFTAction = async (characterIndex: number) => {
		try {
			if (!gameContract) return;

			setMintingCharacter(true)
			const mintTxn = await gameContract.mintCharacterNFT(characterIndex)
			await mintTxn.wait()
			console.log('mintTxn:', mintTxn)
			setMintingCharacter(false)

		} catch (error) {
			console.warn('MintingCharacterAction error:', error)

			setMintingCharacter(false)
		}
	}

	useEffect(() => {
		const { ethereum } = window

		if (!ethereum) {
			console.log('Ethereum object not found')
			return;
		};

		const provider = new ethers.providers.Web3Provider(ethereum)
		const signer = provider.getSigner()
		const gameContract = new ethers.Contract(
			CONTRACT_ADDRESS,
			myEpicGame.abi,
			signer
		)

		setGameContract(gameContract as IGameContract)

	}, [])

	useEffect(() => {
		const getCharacters = async () => {
			try {
				console.log('Getting contract characters to mint')

				const charactersTxn = await gameContract!.getAllDefaultCharacters()
				console.log('charactersTxn:', charactersTxn)

				const characters = charactersTxn.map(
					(characterData: any) => transformCharacterData(characterData)
				)

				setCharacters(characters)

			} catch (error) {
				console.log('Something went wrong fetching characters:', error)
			}
		}

		const onCharacterMint = async (sender: string, tokenId: BigNumber, characterIndex: number) => {
			console.log(
				`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex}`
			)

			if (!gameContract) return;

			const characterNFT = await gameContract.checkifUserHasNFT();
			console.log('CharacterNFT: ', characterNFT);
			setCharacterNFT(transformCharacterData(characterNFT))


			alert(`Seu NFT está pronto -- confira aqui: https://testnets.opensea.io/assets/${gameContract?.address}/${tokenId.toNumber()}`)
		}

		if (gameContract) {
			getCharacters();

			gameContract["on"]('CharacterNFTMinted', onCharacterMint)
		}


		return () => {
			if (gameContract) {
				gameContract["off"]('CharacterNFTMinted', onCharacterMint)
			}
		}
	}, [gameContract, setCharacterNFT])

	const renderCharacters = () =>
		characters.map((character, index) => {
			return (
				<div className={styles.character_item} key={character.name}>
					<div className={styles.name_container}>
						<p>{character.name}</p>
					</div>
					<img src={character.imageURI} alt={character.name} />
					<button
						type="button"
						className={styles.character_mint_button}
						onClick={(e) => { mintCharacterNFTAction(index) }}
					>{`Criar ${character.name}`}</button>

				</div>
			)
		})


	return (
		<div className={styles.select_character_container}>
			<h2>Crie o seu Lutador. Escolha sabiamente.</h2>
			{characters.length > 0 && (
				<div className={styles.character_grid}>{renderCharacters()}</div>
			)}
			{mintingCharacter && (
				<div className={styles.loading}>
					<div className={styles.indicator}>
						<LoadingIndicator />
						<p>Minting In Progress...</p>
					</div>
					<img
						src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
						alt="Minting loading indicator"
					/>
				</div>
			)}
		</div>
	)
}

export { SelectCharacter }