import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import Page from '@/components/page'
import Loading from '@/components/loading'
import { Doc } from '@/convex/_generated/dataModel'

interface PlayerInfo {
	name: string
	userId: string
	email: string
	pictureUrl: string
}

interface EnhancedWinnerData extends Doc<'winners'> {
	formattedDate: string
}

const Karen = () => {
	const winners = useQuery(api.winners.get, { limit: 500 }) as
		| EnhancedWinnerData[]
		| null
		| undefined

	const monthlyPlayerWins = useMemo(() => {
		if (!winners || winners.length === 0) {
			return [] as {
				monthLabel: string
				players: {
					playerName: string
					wins: number
				}[]
				year: number
				month: number
			}[]
		}

		const monthlyMap = new Map<
			string,
			{
				label: string
				year: number
				month: number
				players: Map<
					string,
					{
						playerName: string
						wins: number
						lastWin: number
					}
				>
			}
		>()

		for (const winner of winners) {
			const winnerDate = new Date(winner.date)
			if (Number.isNaN(winnerDate.getTime())) {
				continue
			}

			const year = winnerDate.getFullYear()
			const month = winnerDate.getMonth()
			const key = `${year}-${month}`

			let entry = monthlyMap.get(key)
			if (!entry) {
				entry = {
					label: winnerDate.toLocaleDateString('en-US', {
						month: 'long',
						year: 'numeric',
					}),
					year,
					month,
					players: new Map(),
				}
				monthlyMap.set(key, entry)
			}

			const playerName = winner.winnerInfo.name
			const winTimestamp = winnerDate.getTime()
			const existing = entry.players.get(playerName)

			if (existing) {
				existing.wins += 1
				existing.lastWin = Math.max(existing.lastWin, winTimestamp)
			} else {
				entry.players.set(playerName, {
					playerName,
					wins: 1,
					lastWin: winTimestamp,
				})
			}
		}

		return Array.from(monthlyMap.values())
			.sort((a, b) => {
				if (a.year === b.year) {
					return b.month - a.month
				}

				return b.year - a.year
			})
			.slice(0, 6)
			.map((entry) => ({
				monthLabel: entry.label,
				year: entry.year,
				month: entry.month,
				players: Array.from(entry.players.values())
					.sort((a, b) => {
						if (b.wins !== a.wins) {
							return b.wins - a.wins
						}

						return b.lastWin - a.lastWin
					})
					.map((player) => ({
						playerName: player.playerName,
						wins: player.wins,
					})),
			}))
	}, [winners])

	if (winners === undefined) {
		return <Loading />
	}

	if (!winners || winners.length === 0) {
		return (
			<Page>
				<div>No winners found yet!</div>
			</Page>
		)
	}

	const recentWinners = winners.slice(0, 30)

	return (
		<Page>
			<div className='container mx-auto py-10 space-y-10'>
				<section>
					<h1 className='text-2xl font-bold mb-4'>
						Monthly Player Wins (Last 6 Months)
					</h1>
					{monthlyPlayerWins.length > 0 ? (
						<Table>
							<TableCaption>
								Total daily wins recorded for each player during the most recent
								six months.
							</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Month</TableHead>
									<TableHead>Player</TableHead>
									<TableHead className='text-right'>Wins</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{monthlyPlayerWins.flatMap((month) =>
									month.players.map((player, index) => (
										<TableRow
											key={`${month.year}-${month.month}-${player.playerName}`}
										>
											<TableCell>
												{index === 0 ? month.monthLabel : ''}
											</TableCell>
											<TableCell>{player.playerName}</TableCell>
											<TableCell className='text-right'>{player.wins}</TableCell>
										</TableRow>
									)),
								)}
							</TableBody>
						</Table>
					) : (
						<div>No monthly player wins calculated yet.</div>
					)}
				</section>

				<section>
					<h2 className='text-xl font-semibold mb-4'>Recent Daily Winners</h2>
					<Table>
						<TableCaption>
							A list of the most recent daily Wordle with Friends winners.
						</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Winner Name</TableHead>
								<TableHead>Winner Email</TableHead>
								<TableHead>Winning Word</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentWinners.map((winner) => (
								<TableRow key={winner._id}>
									<TableCell>{winner.formattedDate}</TableCell>
									<TableCell>{winner.winnerInfo.name}</TableCell>
									<TableCell>{winner.winnerInfo.email}</TableCell>
									<TableCell>{winner.word}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</section>
			</div>
		</Page>
	)
}

export default Karen
