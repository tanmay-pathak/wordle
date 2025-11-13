import { v } from 'convex/values'
import { internalMutation, type DatabaseReader } from './_generated/server'
import { NUMBER_OF_TRIES } from './constants'
import { NUMBER_OF_LETTERS } from './constants'
import { mutationWithUser, queryWithUser, actionWithUser } from './utils'
import { WORDS } from './lib/six_letter_words'
import { api } from './_generated/api'
import {
	cellValidator,
	cursorValidator,
	getBasicGame,
	getNextRow,
} from './helpers'
import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'

async function getCurrentGameDate(db: DatabaseReader) {
	const now = new Date()
	const saskatoonTime = new Date(
		now.toLocaleString('en-US', { timeZone: 'America/Regina' }),
	)
	const today = saskatoonTime
		.toLocaleString('en-US', { timeZone: 'America/Regina' })
		.split(',')[0]
	// Check if today's game exists, if not return yesterday's date
	const todayGame = await db
		.query('game')
		.withIndex('by_date', (q) => q.eq('date', today))
		.first()
	if (!todayGame) {
		const yesterday = new Date(saskatoonTime)
		yesterday.setDate(yesterday.getDate() - 1)
		return yesterday
			.toLocaleString('en-US', { timeZone: 'America/Regina' })
			.split(',')[0]
	}
	return today
}

export const get = queryWithUser({
	args: {},
	handler: async (ctx) => {
		const date = await getCurrentGameDate(ctx.db)
		return await ctx.db
			.query('game')
			.withIndex('by_date', (q) => q.eq('date', date))
			.first()
	},
})

export const set = mutationWithUser({
	args: {
		_id: v.optional(v.id('game')),
		_creationTime: v.optional(v.number()),
		date: v.string(),
		data: v.array(v.array(cellValidator)),
		cursor: cursorValidator,
		finished: v.boolean(),
		attempts: v.number(),
		won: v.boolean(),
		wordOfTheDay: v.optional(v.string()),
		aboutWord: v.optional(v.string()),
                trashTalk: v.optional(v.string()),
        },
	handler: async (ctx, args) => {
		const { _id, ...gameData } = args
		if (!_id) {
			throw new Error('Game ID is required')
		}
		return await ctx.db.replace(_id, gameData)
	},
})

export const createGame = internalMutation({
	args: {},
	handler: async (ctx) => {
		const newGame = getBasicGame(NUMBER_OF_LETTERS, NUMBER_OF_TRIES)
		const game = {
			data: newGame,
			cursor: { x: 0, y: 0 },
			date: new Date()
				.toLocaleString('en-US', { timeZone: 'America/Regina' })
				.split(',')[0],
			finished: false,
			attempts: 0,
			won: false,
			wordOfTheDay: undefined,
			aboutWord: undefined,
                }
                return await ctx.db.insert('game', game)
        },
})

export const createNewGame = actionWithUser({
	args: {},
	returns: v.id('game'),
	handler: async (ctx) => {
		const allowManualCreation = process.env.ALLOW_MANUAL_GAME_CREATION
		if (allowManualCreation !== 'true') {
			throw new Error('Manual game creation is not enabled')
		}

		await ctx.runAction(internal.words.assignDailyWord, {})		
		const gameId: Id<'game'> = await ctx.runMutation(internal.game.createGame, {})
		
		return gameId
	},
})

export const verifyGuess = mutationWithUser({
	args: {
		guess: v.string(),
		rowIndex: v.number(),
	},
	returns: v.object({
		status: v.union(
			v.literal('playing'),
			v.literal('win'),
			v.literal('loss'),
			v.literal('invalid_word'),
			v.literal('error'),
                ),
		message: v.optional(v.string()),
		gameFinished: v.optional(v.boolean()),
		newRow: v.optional(v.any()),
		attempts: v.optional(v.number()),
		word: v.optional(v.string()),
		aboutWord: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity()
		if (!user) {
			return {
				status: 'error' as const,
				message: 'User not authenticated',
			}
		}
		const { guess, rowIndex } = args
		const userSubject = user.subject

		// Get the current game date from the server
		const date = await getCurrentGameDate(ctx.db)

		// 3. Get current game data
		const gameData = await ctx.db
			.query('game')
			.withIndex('by_date', (q) => q.eq('date', date))
			.first()

		if (!gameData) {
			return {
				status: 'error' as const,
				message: 'No game data found',
			}
		}

		// 1. Validate the word exists in our word list
		if (guess.length !== NUMBER_OF_LETTERS) {
			return {
				status: 'invalid_word' as const,
				message: `Word must be ${NUMBER_OF_LETTERS} letters long`,
			}
		}

		if (!WORDS.includes(guess)) {
			return {
				status: 'invalid_word' as const,
				message: `"${guess}" is not in the word list`,
			}
		}

		// 2. Get the secret word FOR THE SPECIFIC DATE
		const secretWordDoc = await ctx.db
			.query('secretWord')
			.withIndex('by_date', (q) => q.eq('date', date))
			.first()

		if (!secretWordDoc) {
			return {
				status: 'error' as const,
				message: `No secret word assigned for date: ${date}. Please contact support.`,
			}
		}
		const secretWord = secretWordDoc.word
		const aboutWord = secretWordDoc.aboutWord

		// 4. Process the guess
		const currentRow = gameData.data[rowIndex]
		const newRow = getNextRow(currentRow, secretWord)
		const isWin = secretWord === guess
		const isLastRow = rowIndex === gameData.data.length - 1
		const gameFinished = isWin || isLastRow

		// 5. Update game data
		const updatedGameData = {
			...gameData,
			data: [...gameData.data],
			cursor: {
				x: isLastRow ? gameData.cursor.x : 0,
				y: isLastRow ? gameData.cursor.y : gameData.cursor.y + 1,
			},
			finished: gameFinished,
			attempts: rowIndex + 1,
			won: isWin,
			wordOfTheDay: gameFinished ? secretWord : gameData.wordOfTheDay,
			aboutWord: gameFinished ? aboutWord : gameData.aboutWord,
                }

		updatedGameData.data[rowIndex] = newRow

		await ctx.db.patch(gameData._id, updatedGameData)

		// 6. Handle win/loss completion tasks (logging winner, sending notifications)
		if (gameFinished) {
			// Collect participant info for notifications regardless of win/loss
			const participantInfos = new Map<
				string,
				{
					name: string
					userId: string
					email: string
					pictureUrl: string
				}
			>()

			// Iterate through all rows to capture all participants
			for (let y = 0; y < updatedGameData.data.length; y++) {
				for (let x = 0; x < updatedGameData.data[y].length; x++) {
					const cell = updatedGameData.data[y][x]
					// Ensure user details exist before adding
					if (
						cell.user?.id &&
						cell.user?.name &&
						cell.user?.email &&
						cell.user?.image
					) {
						participantInfos.set(cell.user.id, {
							name: cell.user.name,
							userId: cell.user.id,
							email: cell.user.email,
							pictureUrl: cell.user.image,
						})
					}
				}
			}
			const collectedParticipantInfos = Array.from(participantInfos.values())
			const status = isWin ? 'win' : ('loss' as 'win' | 'loss')
			const winnerUserId = isWin ? userSubject : undefined

			// Send Slack notification by scheduling an action
			await ctx.scheduler.runAfter(0, internal.slackNotifier.sendSlackMessage, {
				date,
				status,
				word: secretWord,
				attempts: rowIndex + 1,
				participantInfos: collectedParticipantInfos,
				winnerUserId: winnerUserId,
				aboutWord: aboutWord,
			})

			// If a user won, log the winner
			if (isWin) {
				// Log winner
				await ctx.runMutation(api.winners.set, {
					date,
					word: secretWord,
					attempts: rowIndex + 1,
					playerInfos: collectedParticipantInfos,
				})
			}
		} else {
			// Game is not finished, generate trash talk
			await ctx.scheduler.runAfter(0, internal.ai.generateTrashTalk, {
				guessedWord: guess,
				date,
				gameId: gameData._id,
			})
		}

		// 8. Return result with proper status literals
		const finalStatus = !gameFinished ? 'playing' : isWin ? 'win' : 'loss'

		return {
			status: finalStatus as 'playing' | 'win' | 'loss',
			gameFinished,
			newRow,
			attempts: rowIndex + 1,
			word: gameFinished ? secretWord : undefined,
			aboutWord: gameFinished ? aboutWord : undefined,
		}
	},
})

export const getStartTime = queryWithUser({
	args: {},
	handler: async () => {
		// Games are created daily at midnight Regina time (6 AM UTC)
		// Return midnight for the next day
		return '00:00'
	},
})
