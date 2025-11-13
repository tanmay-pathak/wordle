import Grid from '@/components/game/grid'
import Keyboard, { isMappableKey } from '@/components/game/keyboard'
import Loading from '@/components/loading'
import Page from '@/components/page'
import { api } from '@/convex/_generated/api'
import { NUMBER_OF_LETTERS } from '@/convex/constants'
import { findLastNonEmptyTile, getRowWord } from '@/convex/lib/helper'
import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useAction } from 'convex/react'
import { prop, flatten, reject, propEq, groupBy } from 'ramda'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Participants from '@/components/game/participants'
import { useEffect, useState } from 'react'
import { usePartySocket } from 'partysocket/react'
import type { UserPayload } from '@/party/types'
import LiveCursors from '@/components/game/LiveCursors'
import Reactions from '@/components/game/reactions'
import { Button } from '@/components/ui/button'

// Time Remaining component
const TimeRemaining = () => {
	const startTime = useQuery(api.game.getStartTime)
	const [timeRemaining, setTimeRemaining] = useState<string>('')

	useEffect(() => {
		if (!startTime) return
		const calculateTimeRemaining = () => {
			const now = new Date()
			const options = { timeZone: 'America/Regina' }
			const saskTime = new Date(now.toLocaleString('en-US', options))

			const [hour, minute] = startTime.split(':').map(Number)
			const nextGameTime = new Date(saskTime)
			nextGameTime.setHours(hour, minute, 0, 0)

			const currentMinutes = saskTime.getHours() * 60 + saskTime.getMinutes()
			const startMinutes = hour * 60 + minute
			if (currentMinutes >= startMinutes) {
				nextGameTime.setDate(nextGameTime.getDate() + 1)
			}

			const diffMs = nextGameTime.getTime() - saskTime.getTime()
			const hours = Math.floor(diffMs / (1000 * 60 * 60))
			const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
			const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

			return `${hours.toString().padStart(2, '0')}:${minutes
				.toString()
				.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
		}

		setTimeRemaining(calculateTimeRemaining())
		const interval = setInterval(() => {
			setTimeRemaining(calculateTimeRemaining())
		}, 1000)
		return () => clearInterval(interval)
	}, [startTime])

	return (
		<>
			<span className='font-mono font-semibold text-brand-orange'>
				{timeRemaining}
			</span>
		</>
	)
}

const GamePage = () => {
	const gameData = useQuery(api.game.get)
	const formattedDate = gameData?.date
		? new Date(gameData.date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})
		: ''
	const verifyGuess = useMutation(api.game.verifyGuess)
	const createNewGameAction = useAction(api.game.createNewGame)
	const setGameData = useMutation(api.game.set).withOptimisticUpdate(
		(localStore, args) => {
			const currentGameData = localStore.getQuery(api.game.get)
			if (currentGameData !== undefined && currentGameData !== null) {
				localStore.setQuery(
					api.game.get,
					{},
					{
						...args,
                                                _id: currentGameData._id,
                                                _creationTime: currentGameData._creationTime,
                                                aboutWord: args.aboutWord ?? currentGameData.aboutWord,
                                        },
                                )
                        }
                },
        )

	const { user } = useUser()

	const winnerUser =
		gameData?.won && gameData.attempts > 0
			? gameData.data[gameData.attempts - 1]?.[0]?.user
			: undefined

	// State for active users
	const [activeUsers, setActiveUsers] = useState<UserPayload[]>([])
	const [reactions, setReactions] = useState<
		Array<{
			id: string
			emoji: string
			userId: string
			userName: string
			userAvatar: string
		}>
	>([])

	// PartyKit WebSocket connection
	const socket = usePartySocket({
		host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
		room: gameData?.date ? `game-${gameData.date}` : 'loading-room',
	})

	useEffect(() => {
		if (socket && user?.id && user.imageUrl) {
			const userPayload: UserPayload = {
				id: user.id,
				avatarUrl: user.imageUrl,
				name: user.firstName
					? `${user.firstName} ${user.lastName || ''}`.trim()
					: 'Anonymous',
			}
			socket.send(JSON.stringify({ type: 'add-user', payload: userPayload }))

			return () => {
				socket.send(
					JSON.stringify({ type: 'remove-user', payload: { id: user.id } }),
				)
			}
		}
	}, [socket, user, gameData?.date])

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				const message = JSON.parse(event.data as string)
				if (message.type === 'presence') {
					setActiveUsers(message.payload.users)
				} else if (message.type === 'reaction') {
					const reactionId = `${Date.now()}-${Math.random()}`
					setReactions((prev) => [
						...prev,
						{
							id: reactionId,
							emoji: message.payload.emoji,
							userId: message.payload.userId,
							userName: message.payload.userName,
							userAvatar: message.payload.userAvatar,
						},
					])
					// Remove reaction after animation completes
					setTimeout(() => {
						setReactions((prev) => prev.filter((r) => r.id !== reactionId))
					}, 2000)
				}
			}
		}
	}, [socket])

	// Track mouse movements
	useEffect(() => {
		if (!socket || !user?.id) return

		const throttledSend = throttle((x: number, y: number) => {
			socket.send(
				JSON.stringify({
					type: 'update-cursor',
					payload: {
						id: user.id,
						cursor: { x, y },
					},
				}),
			)
		}, 50) // Throttle to avoid too many messages

		const handleMouseMove = (e: MouseEvent) => {
			throttledSend(e.clientX, e.clientY)
		}

		window.addEventListener('mousemove', handleMouseMove)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [socket, user])

	// Helper throttle function
	function throttle(callback: (x: number, y: number) => void, limit: number) {
		let waiting = false
		return function (x: number, y: number) {
			if (!waiting) {
				callback(x, y)
				waiting = true
				setTimeout(() => {
					waiting = false
				}, limit)
			}
		}
	}

	if (gameData === undefined) {
		return <Loading />
	}

	if (gameData === null) {
		return (
			<Page>
				<div className='flex flex-col items-center justify-center h-[70vh]'>
					<div className='text-center p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-md'>
						<h2 className='text-2xl font-bold mb-4'>No game data found</h2>
						<p>
							There seems to be an issue loading the game. Please try again
							later.
						</p>
					</div>
				</div>
			</Page>
		)
	}

        const handleNewCharacter = async (key: string) => {
                if (!gameData || gameData.finished) {
                        return
                }

		const row = gameData.data[gameData.cursor.y]
		const tile = row[gameData.cursor.x]
		const isLastColumn = gameData.cursor.x === NUMBER_OF_LETTERS - 1

		const updatedGameData = structuredClone(gameData)
		updatedGameData.data[gameData.cursor.y][gameData.cursor.x] = {
			...tile,
			children: key,
			user: {
				id: user?.id!,
				name: `${user?.firstName} ${user?.lastName}`,
				image: user?.imageUrl!,
				email: user?.emailAddresses[0]?.emailAddress!,
			},
		}

		let newX = gameData.cursor.x
		if (!isLastColumn) {
			newX = gameData.cursor.x + 1
		}

		updatedGameData.cursor = { x: newX, y: gameData.cursor.y }
		return await setGameData(updatedGameData)
	}

        const handleDeleteCharacter = async () => {
                if (!gameData) {
                        return
                }

		const lastNonEmptyTile = findLastNonEmptyTile(
			gameData.data[gameData.cursor.y],
		)

		if (!lastNonEmptyTile) {
			// nothing to to here if there's no non-empty tile
			return
		}

		const updatedGameData = structuredClone(gameData)
		// set cursor to lastNonEmptyTile's cursor
		updatedGameData.cursor = lastNonEmptyTile.cursor
		const { y, x } = lastNonEmptyTile.cursor
		updatedGameData.data[y][x] = {
			...updatedGameData.data[y][x],
			children: '',
			variant: 'empty',
			user: undefined,
		}

		return await setGameData(updatedGameData)
	}

	const handleEnter = async () => {
		if (!gameData) {
			return { status: 'playing', word: undefined }
		}

		const grid = gameData.data
		const cursor = gameData.cursor

		if (gameData.cursor.x !== grid[0].length - 1) {
			toast.error('Complete the word first', {
				icon: '⚠️',
				style: { borderRadius: '10px', background: '#333', color: '#fff' },
			})
			return { status: 'playing', word: undefined }
		}

		const guessWord = getRowWord(grid[cursor.y])

		if (guessWord.length !== NUMBER_OF_LETTERS) {
			return { status: 'playing', word: undefined }
		}

		try {
			const result = await verifyGuess({
				guess: guessWord,
				rowIndex: cursor.y,
			})

			if (result.status === 'invalid_word') {
				toast.error(result.message || 'Invalid word', {
					icon: '📚',
					style: { borderRadius: '10px', background: '#333', color: '#fff' },
				})
				return { status: 'playing', word: undefined }
			}

			// Update game data with the results from server
			if (result.newRow) {
				const updatedGameData = structuredClone(gameData)
				updatedGameData.data[cursor.y] = result.newRow
				updatedGameData.cursor = {
					x: result.gameFinished ? cursor.x : 0,
					y: result.gameFinished ? cursor.y : cursor.y + 1,
				}
				updatedGameData.finished = result.gameFinished
				updatedGameData.attempts = result.attempts || cursor.y + 1
				updatedGameData.won = result.status === 'win'
				updatedGameData.wordOfTheDay = result.word
				updatedGameData.aboutWord = result.aboutWord
                                await setGameData(updatedGameData)
                        }

			return {
				status: result.status,
				guess: guessWord,
				attempts: result.attempts || cursor.y + 1,
				word: result.word,
			}
		} catch (error) {
			console.log('Failed to verify word: %e', error)
			toast.error('Error verifying word', {
				icon: '⚠️',
				style: { borderRadius: '10px', background: '#333', color: '#fff' },
			})
			return { status: 'playing', word: undefined }
		}
	}

        const handleKeyPress = async (key: string) => {
                if (!isMappableKey(key)) {
                        return await handleNewCharacter(key)
                }

		switch (key) {
			case 'backspace':
				await handleDeleteCharacter()
				break
			case 'enter':
				const result = await handleEnter()
				let userNames: string[] = []
				if (gameData?.data) {
					gameData.data.forEach((row) => {
						row.forEach((tile) => {
							if (tile.user) {
								userNames.push(`${tile.user.name}`)
							}
						})
					})
					// unique username
					userNames = userNames.filter(
						(value, index, self) => self.indexOf(value) === index,
					)
				}
				switch (result.status) {
					case 'win':
						toast.success(
							<div className='text-center'>
								<p className='text-lg font-bold'>You won! 🎉</p>
								<p className='text-sm'>
									in {result.attempts}{' '}
									{result.attempts === 1 ? 'attempt' : 'attempts'}
								</p>
								{gameData.aboutWord && (
									<p className='mt-2 text-sm text-green-600 dark:text-green-400'>
										{gameData.aboutWord}
									</p>
								)}
							</div>,
							{
								duration: 5000,
								style: {
									borderRadius: '10px',
									background: '#22c55e',
									color: '#fff',
								},
							},
						)
						break
					case 'loss':
						toast.error(
							<div className='text-center'>
								<p className='text-lg font-bold'>Game Over</p>
								<p className='text-sm'>
									The word was:{' '}
									<span className='font-bold'>
										{result.word || gameData.wordOfTheDay}
									</span>
								</p>
								{gameData.aboutWord && (
									<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
										{gameData.aboutWord}
									</p>
								)}
							</div>,
							{
								duration: 5000,
								icon: '😢',
								style: {
									borderRadius: '10px',
									background: '#333',
									color: '#fff',
								},
							},
						)
						break
				}
				break
		}
	}

	function getUsedKeys(gameData: { data: any[] }): any {
		const grid = prop('data', gameData)
		const flattenedGrid = flatten(grid)
		const filteredGrid = reject(propEq('children', ''), flattenedGrid)
		return groupBy(prop('children'), filteredGrid)
	}

	const usedKeys = getUsedKeys(gameData)

	return (
		<Page>
			<Toaster position='top-center' />
			<LiveCursors activeUsers={activeUsers} />
			<Reactions
				socket={socket}
				reactions={reactions}
				setReactions={setReactions}
				currentUserId={user?.id}
				currentUserName={
					user?.firstName
						? `${user.firstName} ${user.lastName || ''}`.trim()
						: 'Anonymous'
				}
				currentUserAvatar={user?.imageUrl}
			/>

			<div className='min-h-[calc(100vh-8rem)] flex flex-col pb-1 sm:pb-0 p-safe'>
				{process.env.NEXT_PUBLIC_ALLOW_MANUAL_GAME_CREATION === 'true' && 
					gameData?.finished && (
					<div className='flex justify-end mb-4 px-4'>
						<Button
							variant='outline'
							size='sm'
							onClick={async () => {
								try {
									await createNewGameAction()
									toast.success('New game created!', {
										icon: '🎮',
										style: {
											borderRadius: '10px',
											background: '#22c55e',
											color: '#fff',
										},
									})
								} catch (error) {
									console.error('Failed to create new game:', error)
									const errorMessage = error instanceof Error ? error.message : 'Failed to create new game'
									toast.error(errorMessage, {
										icon: '⚠️',
										style: {
											borderRadius: '10px',
											background: '#333',
											color: '#fff',
										},
									})
								}
							}}
						>
							Create New Game
						</Button>
					</div>
				)}
				<Participants activeUsers={activeUsers} />

				{gameData.finished && (
					<motion.div
						className='mb-4 text-center'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-zinc-700'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-brand-orange'
							>
								<rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect>
								<line x1='16' y1='2' x2='16' y2='6'></line>
								<line x1='8' y1='2' x2='8' y2='6'></line>
								<line x1='3' y1='10' x2='21' y2='10'></line>
							</svg>
							<span className='whitespace-nowrap'>
								Next puzzle in <TimeRemaining />
							</span>
						</div>
					</motion.div>
				)}

                                {/* Game state message */}
				{gameData.finished && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className={`mb-6 p-4 rounded-lg shadow-md text-center ${
							gameData.won
								? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
								: 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
						}`}
					>
						{gameData.won ? (
							<>
								<h3 className='text-xl font-bold text-green-800 dark:text-green-200 mb-1'>
									Congratulations! 🎉
								</h3>
								<p className='text-green-700 dark:text-green-300'>
									{winnerUser?.id === user?.id
										? `You solved the ${formattedDate} puzzle in ${gameData.attempts} ${gameData.attempts === 1 ? 'try' : 'tries'}!`
										: `${winnerUser?.name ?? 'Someone'} solved the ${formattedDate} puzzle in ${gameData.attempts} ${gameData.attempts === 1 ? 'try' : 'tries'}!`}
								</p>
								{gameData.aboutWord && (
									<p className='mt-2 text-sm text-green-600 dark:text-green-400'>
										{gameData.aboutWord}
									</p>
								)}
							</>
						) : (
							<>
								<h3 className='text-xl font-bold text-red-800 dark:text-red-200 mb-1'>
									Game Over 😢
								</h3>
								<p className='text-red-700 dark:text-red-300'>
									The word was:{' '}
									<span className='font-bold'>{gameData.wordOfTheDay}</span>
								</p>
								{gameData.aboutWord && (
									<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
										{gameData.aboutWord}
									</p>
								)}
							</>
						)}
					</motion.div>
				)}

				<div className='flex-1 flex flex-col justify-between gap-4 sm:gap-6 md:gap-10'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className='mx-auto w-full max-w-md'
					>
						<Grid data={gameData.data} />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className='mt-3 sm:mt-4'
					>
						<div className='text-center mb-2 text-sm text-zinc-500 dark:text-zinc-400'>
							<p>
								<span className='font-medium text-brand-orange'>Tip:</span> Use
								your keyboard to type
							</p>
						</div>
                                                <Keyboard
                                                        onKeyPress={handleKeyPress}
                                                        usedKeys={usedKeys}
                                                        disabled={gameData.finished}
                                                />
                                        </motion.div>
                                </div>
			</div>
		</Page>
	)
}

export default GamePage
