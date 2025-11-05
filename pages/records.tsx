import Loading from '@/components/loading'
import Page from '@/components/page'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { type ReactNode } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	GamepadIcon,
	TargetIcon,
	TimerIcon,
	UsersIcon,
} from 'lucide-react'

const StatCard = ({
	title,
	value,
	description,
	icon,
}: {
	title: string
	value: string
	description?: string
	icon?: ReactNode
}) => (
	<Card>
		<CardHeader>
			<CardTitle className='flex items-center gap-2 text-base font-semibold text-muted-foreground'>
				{icon && <span className='text-foreground'>{icon}</span>}
				{title}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p className='text-2xl font-bold text-foreground'>{value}</p>
			{description && (
				<p className='text-sm text-muted-foreground mt-2'>{description}</p>
			)}
		</CardContent>
	</Card>
)

const formatAttempts = (attempts: number) =>
	`${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`

const getInitials = (name: string) => {
	const parts = name.trim().split(' ')
	const first = parts[0]?.[0]
	const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
	return `${first ?? ''}${last ?? ''}`.toUpperCase()
}

const PlayerAvatar = ({
	name,
	pictureUrl,
	size = 'md',
}: {
	name: string
	pictureUrl: string
	size?: 'sm' | 'md'
}) => (
	<Avatar className={size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'}>
		<AvatarImage src={pictureUrl} alt={name} />
		<AvatarFallback>{getInitials(name)}</AvatarFallback>
	</Avatar>
)

const Records = () => {
	const records = useQuery(api.records.getAllRecords)

	if (records === undefined) {
		return <Loading />
	}

	const hasGames = records.totalGamesStats.totalGames > 0

	if (!hasGames) {
		return (
			<Page>
				<div className='max-w-xl mx-auto px-4 py-24 text-center space-y-4'>
					<h1 className='text-4xl font-bold text-foreground'>Game Records</h1>
					<p className='text-muted-foreground'>
						Play your first game to start filling out the record book.
					</p>
				</div>
			</Page>
		)
	}

	const topPlayers = records.topPlayers.slice(0, 5)
	const recentGames = records.recentGames.slice(0, 6)

	return (
		<Page>
			<div className='max-w-4xl mx-auto px-4 py-12 space-y-12'>
				<header className='space-y-2 text-center'>
					<h1 className='text-4xl font-bold text-foreground'>Game Records</h1>
					<p className='text-muted-foreground'>
						A quick look at the streaks, stand-out solves, and players shaping
						every game.
					</p>
				</header>

				<section className='space-y-6'>
					<h2 className='text-xl font-semibold text-foreground'>
						Overall performance
					</h2>
					<div className='grid gap-4 sm:grid-cols-3'>
						<StatCard
							title='Games played'
							value={records.totalGamesStats.totalGames.toLocaleString()}
							description='Completed games tracked in Wordle with Friends'
							icon={<GamepadIcon className='h-5 w-5' />}
						/>
						<StatCard
							title='Win rate'
							value={`${records.totalGamesStats.winRate.toFixed(1)}%`}
							description='Share of finished games ending in a win'
							icon={<TargetIcon className='h-5 w-5' />}
						/>
						<StatCard
							title='Avg. winning attempts'
							value={records.totalGamesStats.averageAttempts.toFixed(1)}
							description='Tries it usually takes to solve the word'
							icon={<TimerIcon className='h-5 w-5' />}
						/>
					</div>
					<div className='grid gap-4 sm:grid-cols-3'>
						<StatCard
							title='Active players'
							value={records.communityStats.uniquePlayers.toLocaleString()}
							description='People who have played a recorded game'
							icon={<UsersIcon className='h-5 w-5' />}
						/>
						<StatCard
							title='Players per game'
							value={records.communityStats.averagePlayersPerGame.toFixed(1)}
							description='Average players involved in each puzzle'
							icon={<UsersIcon className='h-5 w-5' />}
						/>
					</div>
				</section>

				<section className='space-y-6'>
					<h2 className='text-xl font-semibold text-foreground'>Spotlights</h2>
					<div className='grid gap-4 lg:grid-cols-3'>
						{records.recentChampion && (
							<Card className='flex flex-col'>
								<CardHeader className='flex-1'>
									<CardTitle className='text-lg font-semibold text-foreground'>
										Most recent champion
									</CardTitle>
									<CardDescription>
										{records.recentChampion.formattedDate}
									</CardDescription>
								</CardHeader>
								<CardContent className='flex flex-col gap-4'>
									<div className='flex items-center gap-3'>
										<PlayerAvatar
											name={records.recentChampion.winnerInfo.name}
											pictureUrl={records.recentChampion.winnerInfo.pictureUrl}
										/>
										<div>
											<p className='text-base font-semibold text-foreground'>
												{records.recentChampion.winnerInfo.name}
											</p>
											<p className='text-sm text-muted-foreground'>
												Solved “{records.recentChampion.word}” in{' '}
												{formatAttempts(records.recentChampion.attempts)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{records.fastestSolve && (
							<Card className='flex flex-col'>
								<CardHeader className='flex-1'>
									<CardTitle className='text-lg font-semibold text-foreground'>
										Fastest solve
									</CardTitle>
									<CardDescription>
										“{records.fastestSolve.word}” cracked in{' '}
										{formatAttempts(records.fastestSolve.attempts)}
									</CardDescription>
								</CardHeader>
								<CardContent className='flex flex-col gap-4'>
									<div className='flex items-center gap-3'>
										<PlayerAvatar
											name={records.fastestSolve.winnerInfo.name}
											pictureUrl={records.fastestSolve.winnerInfo.pictureUrl}
										/>
										<div>
											<p className='text-base font-semibold text-foreground'>
												{records.fastestSolve.winnerInfo.name}
											</p>
											<p className='text-sm text-muted-foreground'>
												{new Date(records.fastestSolve.date).toLocaleDateString(
													'en-US',
													{
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													},
												)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{records.playerSpotlight && (
							<Card className='flex flex-col'>
								<CardHeader className='flex-1'>
									<CardTitle className='text-lg font-semibold text-foreground'>
										Player spotlight
									</CardTitle>
									<CardDescription>Top winner overall</CardDescription>
								</CardHeader>
								<CardContent className='flex flex-col gap-4'>
									<div className='flex items-center gap-3'>
										<PlayerAvatar
											name={records.playerSpotlight.name}
											pictureUrl={records.playerSpotlight.pictureUrl}
										/>
										<div>
											<p className='text-base font-semibold text-foreground'>
												{records.playerSpotlight.name}
											</p>
											<p className='text-sm text-muted-foreground'>
												{records.playerSpotlight.wins} wins ·{' '}
												{records.playerSpotlight.gamesPlayed}{' '}
												{records.playerSpotlight.gamesPlayed === 1
													? 'game played'
													: 'games played'}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</section>

				{topPlayers.length > 0 && (
					<section className='space-y-4'>
						<h2 className='text-xl font-semibold text-foreground'>
							Top players
						</h2>
						<Card>
							<CardContent className='py-6'>
								<ul className='space-y-4'>
									{topPlayers.map((player) => (
										<li
											key={player.userId}
											className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
										>
											<div className='flex items-center gap-3'>
												<PlayerAvatar
													name={player.name}
													pictureUrl={player.pictureUrl}
													size='sm'
												/>
												<div>
													<p className='font-semibold text-foreground'>
														{player.name}
													</p>
													<p className='text-sm text-muted-foreground'>
														{player.wins} {player.wins === 1 ? 'win' : 'wins'} ·{' '}
														{player.gamesPlayed}{' '}
														{player.gamesPlayed === 1
															? 'game played'
															: 'games played'}
													</p>
												</div>
											</div>
											<div className='flex items-center gap-3 text-sm text-muted-foreground'>
												<span>{player.winRate.toFixed(0)}% win rate</span>
											</div>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</section>
				)}

				{recentGames.length > 0 && (
					<section className='space-y-4'>
						<h2 className='text-xl font-semibold text-foreground'>
							Recent games
						</h2>
						<Card>
							<CardContent className='py-6'>
								<ul className='space-y-4'>
									{recentGames.map((game) => (
										<li
											key={`${game.date}-${game.word}`}
											className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
										>
											<div className='flex items-center gap-3'>
												<PlayerAvatar
													name={game.winnerInfo.name}
													pictureUrl={game.winnerInfo.pictureUrl}
													size='sm'
												/>
												<div>
													<p className='font-semibold text-foreground'>
														{game.word}
													</p>
													<p className='text-sm text-muted-foreground'>
														Won by {game.winnerInfo.name} in{' '}
														{formatAttempts(game.attempts)}
													</p>
												</div>
											</div>
											<div className='flex items-center gap-2 text-sm text-muted-foreground'>
												<span>{game.formattedDate}</span>
											</div>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</section>
				)}
			</div>
		</Page>
	)
}

export default Records
