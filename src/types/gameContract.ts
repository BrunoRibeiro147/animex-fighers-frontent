import { Contract } from 'ethers'

export interface IGameContract extends Contract {
	getAllDefaultCharacters: Function
	checkifUserHasNFT: Function
	mintCharacterNFT: Function
	attackBoss: Function
}