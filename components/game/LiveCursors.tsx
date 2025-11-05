import React from 'react'
import { motion } from 'framer-motion'
import type { UserPayload } from '@/party/types'
import { useUser } from '@clerk/clerk-react'

interface LiveCursorsProps {
	activeUsers: Array<UserPayload>
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ activeUsers }) => {
	const { user } = useUser()

	// Filter out users without cursor data and the current user
	const usersWithCursors = activeUsers.filter(
		(u) => u.id !== user?.id && u.cursor,
	)

	if (usersWithCursors.length === 0) return null

	return (
		<div className='fixed inset-0 pointer-events-none z-50'>
			{usersWithCursors.map((u) => {
				if (!u.cursor) return null

				return (
					<motion.div
						key={u.id}
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							x: u.cursor.x,
							y: u.cursor.y,
						}}
						transition={{
							opacity: { duration: 0.2 },
							x: { type: 'spring', stiffness: 250, damping: 30 },
							y: { type: 'spring', stiffness: 250, damping: 30 },
						}}
						className='absolute top-0 left-0 flex flex-col items-center'
						style={{ transform: 'translate(-50%, -50%)' }}
					>
						{/* Cursor pointer */}
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M6 2L18 12L13 13.5L16 20L13.5 22L10 14.5L6 18L6 2Z'
								fill='white'
								stroke='#000000'
								strokeWidth='1.5'
							/>
						</svg>

						{/* User identifier */}
						<div className='mt-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded-md whitespace-nowrap'>
							<div className='flex items-center gap-1.5'>
								<div className='w-4 h-4 rounded-full overflow-hidden'>
									<img
										src={u.avatarUrl}
										alt={u.name || 'User'}
										className='w-full h-full object-cover'
									/>
								</div>
								<span>{u.name || 'User'}</span>
							</div>
						</div>
					</motion.div>
				)
			})}
		</div>
	)
}

export default LiveCursors
