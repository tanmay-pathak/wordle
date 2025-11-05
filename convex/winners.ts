import { v } from 'convex/values'
import { mutationWithUser, queryWithUser } from './utils'

interface PlayerInfo {
	name: string
	userId: string
	email: string
	pictureUrl: string
	wins: number
}

export const get = queryWithUser({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 15
		const winnersData = await ctx.db.query('winners').order('desc').take(limit)

		if (!winnersData.length) return null

		// Enhance winners with game grid data
		const enhancedWinners = await Promise.all(
			winnersData.map(async (winner) => {
				// Fetch the game data for the corresponding date
				const game = await ctx.db
					.query('game')
					.withIndex('by_date', (q) => q.eq('date', winner.date))
					.first()

				const gameGridData = game ? game.data : null // Get grid data or null if game not found

				return {
					...winner,
					formattedDate: new Date(winner.date).toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					}),
					data: gameGridData,
				}
			}),
		)

		return enhancedWinners
	},
})


export const getActivePlayerStats = queryWithUser({
	args: {},
	handler: async (ctx) => {
		// Get all winners to aggregate player participation
		const winnersData = await ctx.db.query('winners').collect()

		if (!winnersData.length) return []

		// Create a map to track player activity
		const playerStatsMap = new Map<
			string,
			{
				name: string
				userId: string
				email: string
				pictureUrl: string
				gamesPlayed: number
				wins: number
			}
		>()

		// Process each winner document
		for (const winner of winnersData) {
			// Add the winner to our stats
			const winnerUserId = winner.winnerInfo.userId
			let winnerStats = playerStatsMap.get(winnerUserId)

			if (!winnerStats) {
				winnerStats = {
					name: winner.winnerInfo.name,
					userId: winner.winnerInfo.userId,
					email: winner.winnerInfo.email,
					pictureUrl: winner.winnerInfo.pictureUrl,
					gamesPlayed: 0,
					wins: 1, // This is a winner, so add 1 win
				}
			} else {
				winnerStats.wins += 1
			}

			// Track each player that participated
			for (const player of winner.playerInfos) {
				const playerId = player.userId
				let playerStats = playerStatsMap.get(playerId)

				if (!playerStats) {
					playerStats = {
						name: player.name,
						userId: player.userId,
						email: player.email,
						pictureUrl: player.pictureUrl,
						gamesPlayed: 1,
						wins: playerId === winnerUserId ? 1 : 0,
					}
				} else {
					playerStats.gamesPlayed += 1
				}

				playerStatsMap.set(playerId, playerStats)
			}
		}

		// Convert map to array and sort by games played (descending)
		const playerStats = Array.from(playerStatsMap.values()).sort(
			(a, b) => b.gamesPlayed - a.gamesPlayed,
		)

		return playerStats
	},
})

export const set = mutationWithUser({
	args: {
		date: v.string(),
		word: v.string(),
		attempts: v.number(),
		playerInfos: v.array(
			v.object({
				name: v.string(),
				userId: v.string(),
				email: v.string(),
				pictureUrl: v.string(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity()
		if (!user) {
			throw new Error('User must be logged in.')
		}

		// Extract essential user information
		const winnerInfo = {
			name: user.name!,
			userId: user.subject,
			email: user.email!,
			pictureUrl: user.pictureUrl!,
		}

		return await ctx.db.insert('winners', {
			...args,
			winnerInfo,
		})
	},
})
