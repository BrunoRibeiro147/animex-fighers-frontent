declare let window: any;
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ethers, BigNumber } from 'ethers'
import { CONTRACT_ADDRESS } from '../../constants'
import { transformCharacterData } from '../../utils/helpers'
import myEpicJson from '../../utils/MyEpicGame.json'
import { LoadingIndicator } from '../LoadingIndicator'
import { IArenaProps } from './types'
import { ICharacterNFT } from '../../types/characterNFT'
import { IGameContract } from '../../types/gameContract'
import styles from './Arena.module.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const Arena = ({ characterNFT, setCharacterNFT }: IArenaProps) => {
	const [gameContract, setGameContract] = useState<IGameContract | null>(null)

	const [boss, setBoss] = useState<ICharacterNFT | null>(null)

	const [attackState, setAttackState] = useState('')

	const runAttackAction = async () => {
		try {
			if (!gameContract) return;

			console.log('Contract:', gameContract)
			setAttackState('Attacking')
			console.log('Attacking Boss...')
			const attackTxn = await gameContract.attackBoss();
			await attackTxn.wait()
			console.log('attackTxn: ', attackTxn)
			setAttackState('hit')

			toast.success(
				`${boss?.name} foi acertado com ${characterNFT.attackDamage}HP de dano`, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: false,
				progress: undefined,
			});

		} catch (error) {
			console.log('Error attacking boss: ', error)
			toast.error(
				`${characterNFT.name} não possui mais HP, está fora da batalha.`, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: true,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: false,
				progress: undefined,
			});
			setAttackState('')
		}
	}

	useEffect(() => {
		const { ethereum } = window

		if (!ethereum) {
			console.log('Ethereum object not found')
			return;
		}

		const provider = new ethers.providers.Web3Provider(ethereum)
		const signer = provider.getSigner()
		const gameContract = new ethers.Contract(
			CONTRACT_ADDRESS,
			myEpicJson.abi,
			signer
		)

		setGameContract(gameContract as IGameContract)

	}, [])

	useEffect(() => {
		const fetchBoss = async () => {
			const bossTxn = await gameContract!.getBigBoss()
			console.log(bossTxn)
			setBoss(transformCharacterData(bossTxn))
		};

		const onAttackComplete = (newBossHp: BigNumber, newPlayerHp: BigNumber) => {
			const bossHp = newBossHp.toNumber()
			const playerHp = newPlayerHp.toNumber()

			console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`)

			setBoss((prevState: any) => { return { ...prevState, hp: bossHp } })

			setCharacterNFT((prevState: ICharacterNFT) => { return { ...prevState, hp: playerHp } })
		}

		if (gameContract) {
			fetchBoss()
			gameContract.on('AttackComplete', onAttackComplete)
		}

		return () => {
			if (gameContract) {
				gameContract["off"]('AttackComplete', onAttackComplete)
			}
		}
	}, [gameContract, setCharacterNFT])

	return (
		<>
			{
				boss && boss.hp === 0 ?
					<div className={styles.congratulations_container}>
						<p className={styles.congratulations_text}>
							Parabéns a todos os lutadores, o Boss foi derrotado.
						</p>
					</div> :
					<div className={styles.arena_container}>
						<ToastContainer />

						{boss && (
							<div className={styles.boss_container}>
								<div className={`${styles.boss_content}  ${styles[attackState]}`}>
									<h2>{boss.name}</h2>
									<div className={styles.image_content}>
										<img src={boss.imageURI} alt={`Boss ${boss.name}`} />
										<div className={styles.health_bar}>
											<progress value={boss.hp} max={boss.maxHp} />
											<p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
										</div>
									</div>
								</div>
								<div className={styles.attack_container}>
									<button className={styles.cta_button} onClick={() => { runAttackAction() }}>
										{`Ataque ${boss.name}`}
									</button>
									{attackState === 'Attacking' && (
										<div className={styles.loading_indicator}>
											<LoadingIndicator />
											<p>Atacando</p>
										</div>
									)}
								</div>
							</div>
						)
						}

						{
							characterNFT && (
								<div className={styles.players_container}>
									<div className={styles.player_container}>
										<div className={styles.player}>
											<div className={styles.image_content}>
												<h2>{characterNFT.name}</h2>
												<img src={characterNFT.imageURI} alt={characterNFT.name} />
												<div className={styles.health_bar}>
													<progress value={characterNFT.hp} max={characterNFT.maxHp} />
													<p>{`${characterNFT.hp} / ${characterNFT.maxHp}`}</p>
												</div>
											</div>
											<div className={styles.stats}>
												<h4>{`Dano de Ataque: ${characterNFT.attackDamage}`}</h4>
											</div>
										</div>
									</div>
								</div>
							)
						}
					</div >
			}
		</>
	)
}

export { Arena }