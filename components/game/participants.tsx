import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { Users, UserPlus } from 'lucide-react'
import type { UserPayload } from '@/party/types'

interface ParticipantsProps {
	activeUsers: Array<UserPayload>
}

const Participants: React.FC<ParticipantsProps> = ({ activeUsers = [] }) => {
	// Map to the format expected by AnimatedTooltip
	const tooltipItems = activeUsers.map((p, index) => ({
		id: index,
		name: p.name ?? 'Unknown User',
		image: p.avatarUrl ?? '',
	}))

	const onlineCount = tooltipItems.length

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className='mb-3 sm:mb-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-zinc-700 transition-all duration-300 overflow-hidden'
		>
			<div className='p-4 sm:p-5'>
				{/* Unified Header Section */}
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
							className='relative'
						>
							<div className='bg-brand-orange p-2.5 rounded-lg shadow-md'>
								<Users className='w-5 h-5 text-white' />
							</div>
							{onlineCount > 0 && (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
									className='absolute -top-1 -right-1 bg-brand-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800'
								>
									{onlineCount}
								</motion.div>
							)}
						</motion.div>
						<div>
							<motion.p
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.35 }}
								className='text-sm font-semibold text-zinc-800 dark:text-zinc-100'
							>
								Online Players
							</motion.p>
							<motion.p
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 }}
								className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'
							>
								{onlineCount === 0
									? 'Waiting for players...'
									: onlineCount === 1
										? '1 player active'
										: `${onlineCount} players active`}
							</motion.p>
						</div>
					</div>
				</div>

				{/* Active Users Avatars Section */}
				<AnimatePresence mode='wait'>
					{onlineCount > 0 ? (
						<motion.div
							key='users-list'
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							className='overflow-hidden'
						>
							<div className='flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-700/50 rounded-lg border border-gray-200 dark:border-zinc-600'>
								<div className='flex items-center gap-2 min-w-0 flex-1'>
									<div className='relative flex-shrink-0'>
										<div className='h-2 w-2 bg-brand-orange rounded-full animate-pulse shadow-lg shadow-brand-orange/50'></div>
										<div className='absolute inset-0 h-2 w-2 bg-brand-orange rounded-full animate-ping opacity-75'></div>
									</div>
									<span className='text-xs font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap'>
										Active Now
									</span>
								</div>
								<div className='flex items-center gap-2 flex-shrink-0'>
									<div className='flex items-center min-w-0'>
										<AnimatedTooltip items={tooltipItems} />
									</div>
									{onlineCount > 5 && (
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.5 }}
											className='text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-1 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-600'
										>
											+{onlineCount - 5}
										</motion.div>
									)}
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key='empty-state'
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ delay: 0.2 }}
							className='flex flex-col items-center justify-center py-6 px-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-gray-300 dark:border-zinc-600'
						>
							<motion.div
								animate={{ y: [0, -5, 0] }}
								transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
								className='mb-2'
							>
								<UserPlus className='w-8 h-8 text-zinc-400 dark:text-zinc-500' />
							</motion.div>
							<p className='text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center'>
								No players online
							</p>
							<p className='text-xs text-zinc-400 dark:text-zinc-500 text-center mt-1'>
								Invite friends to join!
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	)
}

export default Participants
