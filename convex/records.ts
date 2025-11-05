import { v } from 'convex/values'
import { queryWithUser } from './utils'

export const getAllRecords = queryWithUser({
	args: {},
	returns: v.object({
		totalGamesStats: v.object({
			totalGames: v.number(),
			totalWins: v.number(),
			winRate: v.number(),
			averageAttempts: v.number(),
		}),
		communityStats: v.object({
			uniquePlayers: v.number(),
			averagePlayersPerGame: v.number(),
		}),
		fastestSolve: v.optional(
			v.object({
				date: v.string(),
				word: v.string(),
				attempts: v.number(),
				winnerInfo: v.object({
					name: v.string(),
					userId: v.string(),
					email: v.string(),
					pictureUrl: v.string(),
				}),
			}),
		),
		recentChampion: v.optional(
			v.object({
				date: v.string(),
				word: v.string(),
				attempts: v.number(),
				winnerInfo: v.object({
					name: v.string(),
					userId: v.string(),
					email: v.string(),
					pictureUrl: v.string(),
				}),
				formattedDate: v.string(),
			}),
		),
		playerSpotlight: v.optional(
			v.object({
				name: v.string(),
				userId: v.string(),
				email: v.string(),
				pictureUrl: v.string(),
				wins: v.number(),
				gamesPlayed: v.number(),
				winRate: v.number(),
				averageAttempts: v.number(),
			}),
		),
		longestWinStreak: v.optional(
			v.object({
				streak: v.number(),
				playerInfo: v.object({
					name: v.string(),
					userId: v.string(),
					email: v.string(),
					pictureUrl: v.string(),
				}),
			}),
		),
		hardestWord: v.optional(
			v.object({
				word: v.string(),
				date: v.string(),
				attempts: v.number(),
				aboutWord: v.optional(v.string()),
			}),
		),
		topPlayers: v.array(
			v.object({
				name: v.string(),
				userId: v.string(),
				email: v.string(),
				pictureUrl: v.string(),
				wins: v.number(),
				gamesPlayed: v.number(),
				winRate: v.number(),
				averageAttempts: v.number(),
			}),
		),
		recentGames: v.array(
			v.object({
				date: v.string(),
				word: v.string(),
				attempts: v.number(),
				winnerInfo: v.object({
					name: v.string(),
					userId: v.string(),
					email: v.string(),
					pictureUrl: v.string(),
				}),
				formattedDate: v.string(),
			}),
		),
	}),
	handler: async (ctx) => {
		const winnersData = await ctx.db.query('winners').order('desc').collect()
		const gamesData = await ctx.db.query('game').order('desc').collect()

		if (!winnersData.length) {
			return {
				totalGamesStats: {
					totalGames: 0,
					totalWins: 0,
					winRate: 0,
					averageAttempts: 0,
				},
				communityStats: {
					uniquePlayers: 0,
					averagePlayersPerGame: 0,
				},
				fastestSolve: undefined,
				recentChampion: undefined,
				playerSpotlight: undefined,
				longestWinStreak: undefined,
				hardestWord: undefined,
				topPlayers: [],
				recentGames: [],
			}
		}

		const totalGames = gamesData.filter((game) => game.finished).length
		const totalWins = winnersData.length
		const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0
		const averageAttempts =
			winnersData.length > 0
				? winnersData.reduce((sum, winner) => sum + winner.attempts, 0) /
					winnersData.length
				: 0

		const fastestSolve = winnersData.reduce((min, current) =>
			!min || current.attempts < min.attempts ? current : min,
		)

		const uniquePlayers = new Set<string>()
		let totalParticipants = 0

		const playerWinStreaks = new Map<
			string,
			{
				current: number
				max: number
				playerInfo: any
			}
		>()

		const sortedWinners = [...winnersData].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		)

		for (const winner of sortedWinners) {
			const userId = winner.winnerInfo.userId
			const existing = playerWinStreaks.get(userId)

			const participants = [...(winner.playerInfos ?? [])]
			if (!participants.some((player) => player.userId === userId)) {
				participants.push(winner.winnerInfo)
			}

			for (const participant of participants) {
				uniquePlayers.add(participant.userId)
			}
			totalParticipants += participants.length

			if (!existing) {
				playerWinStreaks.set(userId, {
					current: 1,
					max: 1,
					playerInfo: winner.winnerInfo,
				})
			} else {
				existing.current += 1
				existing.max = Math.max(existing.max, existing.current)
			}

			for (const [otherUserId, streak] of playerWinStreaks.entries()) {
				if (otherUserId !== userId) {
					streak.current = 0
				}
			}
		}

		let maxStreak = 0
		let streakPlayer: any = undefined
		for (const streak of playerWinStreaks.values()) {
			if (streak.max > maxStreak) {
				maxStreak = streak.max
				streakPlayer = streak.playerInfo
			}
		}

		let longestWinStreak:
			| {
					streak: number
					playerInfo: any
			  }
			| undefined

		if (streakPlayer && maxStreak > 1) {
			longestWinStreak = {
				streak: maxStreak,
				playerInfo: streakPlayer,
			}
		}

		const hardestWord = winnersData.reduce((max, current) =>
			!max || current.attempts > max.attempts ? current : max,
		)

		const playerStatsMap = new Map<
			string,
			{
				playerInfo: any
				wins: number
				gamesPlayed: number
				totalAttempts: number
			}
		>()

		for (const winner of winnersData) {
			const winnerId = winner.winnerInfo.userId
			const participants = [...(winner.playerInfos ?? [])]

			if (!participants.some((player) => player.userId === winnerId)) {
				participants.push(winner.winnerInfo)
			}

			for (const participant of participants) {
				const participantId = participant.userId
				const playerStats = playerStatsMap.get(participantId)

				if (!playerStats) {
					playerStatsMap.set(participantId, {
						playerInfo: participant,
						wins: participantId === winnerId ? 1 : 0,
						gamesPlayed: 1,
						totalAttempts: participantId === winnerId ? winner.attempts : 0,
					})
					continue
				}

				playerStats.playerInfo = {
					...playerStats.playerInfo,
					...participant,
				}

				playerStats.gamesPlayed += 1

				if (participantId === winnerId) {
					playerStats.wins += 1
					playerStats.totalAttempts += winner.attempts
				}
			}
		}

		const topPlayers = Array.from(playerStatsMap.values())
			.map((stats) => {
				return {
					name: stats.playerInfo.name,
					userId: stats.playerInfo.userId,
					email: stats.playerInfo.email,
					pictureUrl: stats.playerInfo.pictureUrl,
					wins: stats.wins,
					gamesPlayed: stats.gamesPlayed,
					winRate:
						stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
					averageAttempts:
						stats.wins > 0 ? stats.totalAttempts / stats.wins : 0,
				}
			})
			.sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
			.slice(0, 10)

		const recentGames = winnersData.slice(0, 10).map((winner) => {
			return {
				date: winner.date,
				word: winner.word,
				attempts: winner.attempts,
				winnerInfo: winner.winnerInfo,
				formattedDate: new Date(winner.date).toLocaleDateString('en-US', {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
				}),
			}
		})

		const recentChampionRaw = winnersData[0]

		const averagePlayersPerGame =
			totalParticipants > 0
				? Math.round((totalParticipants / winnersData.length) * 10) / 10
				: 0

		return {
			totalGamesStats: {
				totalGames,
				totalWins,
				winRate: Math.round(winRate * 10) / 10,
				averageAttempts: Math.round(averageAttempts * 10) / 10,
			},
			communityStats: {
				uniquePlayers: uniquePlayers.size,
				averagePlayersPerGame,
			},
			fastestSolve: {
				date: fastestSolve.date,
				word: fastestSolve.word,
				attempts: fastestSolve.attempts,
				winnerInfo: fastestSolve.winnerInfo,
			},
			recentChampion: recentChampionRaw
				? {
						date: recentChampionRaw.date,
						word: recentChampionRaw.word,
						attempts: recentChampionRaw.attempts,
						winnerInfo: recentChampionRaw.winnerInfo,
						formattedDate: new Date(recentChampionRaw.date).toLocaleDateString(
							'en-US',
							{
								weekday: 'short',
								month: 'short',
								day: 'numeric',
							},
						),
					}
				: undefined,
			playerSpotlight: topPlayers[0],
			longestWinStreak,
			hardestWord: hardestWord
				? {
						word: hardestWord.word,
						date: hardestWord.date,
						attempts: hardestWord.attempts,
						aboutWord: undefined,
					}
				: undefined,
			topPlayers,
			recentGames,
		}
	},
})
