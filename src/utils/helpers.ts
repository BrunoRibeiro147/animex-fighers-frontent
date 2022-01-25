import { ICharacterData } from "../types/characterData"

const transformCharacterData = (characterData: ICharacterData) => {
	return {
		name: characterData.name,
		imageURI: characterData.imageURI,
		hp: characterData.hp.toNumber(),
		maxHp: characterData.maxHp.toNumber(),
		attackDamage: characterData.attackDamage.toNumber()
	}
}

export { transformCharacterData }