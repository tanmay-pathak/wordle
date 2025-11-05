import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { Users } from 'lucide-react'
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
			className='mb-3 sm:mb-4 bg-gradient-to-br from-white/90 to-white/70 dark:from-zinc-800/90 dark:to-zinc-800/70 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl border border-white/20 dark:border-zinc-700/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden'
		>
			{/* Stats Section */}
			<div className='p-3'>
				{/* Online Users */}
				<div className='flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2.5 border border-green-200 dark:border-green-800'>
					<div className='bg-green-100 dark:bg-green-800 p-1.5 rounded-md'>
						<Users className='w-3.5 h-3.5 text-green-600 dark:text-green-400' />
					</div>
					<div>
						<p className='text-xs font-medium text-zinc-700 dark:text-zinc-300'>
							Online
						</p>
						<p className='text-lg font-bold text-green-600 dark:text-green-400'>
							{onlineCount}
						</p>
					</div>
				</div>

				{/* Active Users Avatars */}
				{onlineCount > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className='flex items-center justify-between mt-3 p-2.5 bg-zinc-50/50 dark:bg-zinc-700/30 rounded-lg border border-zinc-200/50 dark:border-zinc-600/50'
					>
						<div className='flex items-center gap-1.5'>
							<div className='h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse'></div>
							<span className='text-xs text-zinc-600 dark:text-zinc-400 font-medium'>
								Active Players
							</span>
						</div>
						<div className='flex items-center'>
							<AnimatedTooltip items={tooltipItems} />
						</div>
					</motion.div>
				)}
			</div>
		</motion.div>
	)
}

export default Participants
