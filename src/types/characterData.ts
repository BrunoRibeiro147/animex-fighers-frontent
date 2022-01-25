import { BigNumber } from 'ethers'

export interface ICharacterData {
	name: string,
	maxHp: BigNumber,
	imageURI: string,
	hp: BigNumber,
	attackDamage: BigNumber
}