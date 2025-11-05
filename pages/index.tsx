import Page from '@/components/page'
import Grid from '@/components/game/grid'
import Keyboard from '@/components/game/keyboard'
import Loading from '@/components/loading'
import { api } from '@/convex/_generated/api'
import { NUMBER_OF_LETTERS, NUMBER_OF_TRIES } from '@/convex/constants'
import { SignInButton } from '@clerk/nextjs'
import { useConvexAuth, useQuery } from 'convex/react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { prop, flatten, reject, propEq, groupBy } from 'ramda'

const Index = () => {
	let gameData = useQuery(api.game.get)
	const { isAuthenticated } = useConvexAuth()
	const router = useRouter()

	if (gameData === undefined) {
		return <Loading />
	}

	if (gameData === null) {
		return (
			<div className='flex items-center justify-center h-screen'>
				No data found. Please try again later.
			</div>
		)
	}

	const formattedDate = new Date(gameData.date).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})

	function getUsedKeys(gameData: { data: any[] }): any {
		const grid = prop('data', gameData)
		const flattenedGrid = flatten(grid)
		const filteredGrid = reject(propEq('children', ''), flattenedGrid)
		return groupBy(prop('children'), filteredGrid)
	}

	const usedKeys = getUsedKeys(gameData)

	return (
		<Page>
			<div className='min-h-[calc(100vh-8rem)] flex flex-col'>
				{/* Hero Section */}
				<div className='flex flex-col justify-center items-center px-4 pt-16 md:pt-24 pb-8'>
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center max-w-3xl mx-auto'
					>
						<h1 className='text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
							Wordle with Friends
						</h1>
						<p className='text-xl md:text-2xl mb-8 text-foreground/80'>
							A modern twist on the classic Wordle game! Challenge your
							colleagues, solve daily puzzles, and compete for leaderboard
							glory.
						</p>
						<div className='*:cursor-pointer'>
							{!isAuthenticated ? (
								<SignInButton mode='modal' forceRedirectUrl={`/game`}>
									<Button
										size='lg'
										className='px-8 py-6 text-lg font-semibold rounded-full *:cursor-pointer'
									>
										Play Now
									</Button>
								</SignInButton>
							) : (
								<Button
									size='lg'
									className='px-8 py-6 text-lg font-semibold rounded-full *:cursor-pointer'
									onClick={() => router.push('/game')}
								>
									Continue Playing
								</Button>
							)}
						</div>
					</motion.div>
				</div>

				{/* Game Preview Section */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className='relative py-8 px-4'
				>
					<div className='max-w-2xl mx-auto relative'>
						<div
							className={`pointer-events-none relative ${isAuthenticated ? 'opacity-70' : ''}`}
						>
							<div className={isAuthenticated ? '' : 'opacity-40'}>
								<Grid data={gameData.data} />
								<Keyboard
									onKeyPress={() => null}
									usedKeys={usedKeys}
									disabled={true}
								/>
							</div>

							<div className='absolute inset-0 flex items-center justify-center'>
								<div className='bg-black/60 backdrop-blur-sm px-10 py-8 rounded-2xl text-center'>
									<h3 className='text-2xl md:text-3xl font-bold text-white mb-4'>
										Join the Game!
									</h3>
									<p className='text-white/90 mb-5'>
										{isAuthenticated
											? "Don't miss out on the fun"
											: `Sign in to participate in the ${formattedDate} puzzle`}
									</p>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Features Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className='py-16'
				>
					<div className='max-w-5xl mx-auto px-4'>
						<h2 className='text-3xl font-bold text-center mb-12'>
							How to Play
						</h2>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							<div className='bg-background p-6 rounded-xl shadow-sm border border-border/50 flex flex-col items-center text-center'>
								<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-4'>
									1
								</div>
								<h3 className='text-xl font-semibold mb-3'>Collaborate</h3>
								<p>
									Play alongside your co-workers in real-time - work together or
									compete!
								</p>
							</div>

							<div className='bg-background p-6 rounded-xl shadow-sm border border-border/50 flex flex-col items-center text-center'>
								<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-4'>
									2
								</div>
								<h3 className='text-xl font-semibold mb-3'>Guess Words</h3>
								<p>
									Solve a <b>{NUMBER_OF_LETTERS}-letter</b> word puzzle within{' '}
									<b>{NUMBER_OF_TRIES} tries</b>
								</p>
							</div>

							<div className='bg-background p-6 rounded-xl shadow-sm border border-border/50 flex flex-col items-center text-center'>
								<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-4'>
									3
								</div>
								<h3 className='text-xl font-semibold mb-3'>Get Clues</h3>
								<p>
									After each guess, colored tiles show how close your guess was
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* CTA Section */}
				<div className='py-16 text-center px-4'>
					<h2 className='text-2xl md:text-3xl font-semibold mb-6'>
						{isAuthenticated
							? `Ready to solve the ${formattedDate} puzzle?`
							: 'Ready to join the fun?'}
					</h2>
					{!isAuthenticated ? (
						<SignInButton mode='modal' forceRedirectUrl={`/game`}>
							<Button size='lg' className='px-6 py-5 rounded-full'>
								Sign In to Play
							</Button>
						</SignInButton>
					) : (
						<Button
							size='lg'
							className='px-6 py-5 rounded-full'
							onClick={() => router.push('/game')}
						>
							Play {formattedDate} Puzzle
						</Button>
					)}
				</div>
			</div>
		</Page>
	)
}

export default Index
