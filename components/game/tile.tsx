import { FC } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { GameTile } from '@/lib/types'

export type TileProps = GameTile & {
	delay?: number
	size?: number
	image?: string
}

const Tile: FC<TileProps> = ({ size = 50, ...props }) => {
	// Different animations based on variant
	const getAnimation = () => {
		if (props.variant === 'correct') {
			return {
				initial: { scale: 1, opacity: 0.5 },
				animate: {
					scale: [1, 1.1, 1],
					opacity: [0.5, 1, 1],
					backgroundColor: ['transparent', '#10b981'], // Transition to green
					borderColor: ['#6b7280', '#10b981'],
				},
				transition: {
					duration: 0.6,
					delay: props.delay,
					times: [0, 0.5, 1],
					ease: 'easeInOut',
				},
			}
		} else if (props.variant === 'present') {
			return {
				initial: { scale: 1, opacity: 0.5 },
				animate: {
					scale: [1, 1.1, 1],
					opacity: [0.5, 1, 1],
					backgroundColor: ['transparent', '#f59e0b'], // Transition to yellow
					borderColor: ['#6b7280', '#f59e0b'],
				},
				transition: {
					duration: 0.6,
					delay: props.delay,
					times: [0, 0.5, 1],
					ease: 'easeInOut',
				},
			}
		} else if (props.variant === 'absent') {
			return {
				initial: { scale: 1, opacity: 0.5 },
				animate: {
					scale: [1, 1.1, 1],
					opacity: [0.5, 1, 1],
					backgroundColor: ['transparent', '#6b7280'], // Transition to gray
					borderColor: ['#6b7280', '#6b7280'],
				},
				transition: {
					duration: 0.6,
					delay: props.delay,
					times: [0, 0.5, 1],
					ease: 'easeInOut',
				},
			}
		} else if (props.variant === 'empty' && props.children) {
			// Pop animation for when a letter is entered
			return {
				initial: { scale: 0.8 },
				animate: { scale: 1 },
				transition: { type: 'spring', stiffness: 500, damping: 15 },
			}
		}

		return {}
	}

	const animation = getAnimation()

	return (
		<div
			className={clsx(
				'relative preserve-3d',
				'origin-center scale-90 sm:scale-100 lg:scale-110',
				'size-13 sm:size-16 lg:size-19',
			)}
			style={{ perspective: 500 }}
		>
			{/* @ts-expect-error - Framer Motion types are not compatible with React 19 */}
			<motion.div
				{...animation}
				className={clsx(
					'grid select-none place-items-center border-2 text-xl uppercase md:text-2xl lg:text-3xl',
					'shadow-sm rounded-md',
					'dark:text-white',
					{
						'border-green-500 bg-green-500 text-white':
							props.variant === 'correct',
						'border-yellow-500 bg-yellow-500 text-white':
							props.variant === 'present',
						'border-gray-500 bg-gray-500 text-white':
							props.variant === 'absent',
						'border-gray-400 dark:border-gray-500 md:border-[2.5px] border-opacity-50 dark:border-opacity-40':
							props.variant === 'empty' && props.children,
						'border-gray-300 dark:border-gray-600 border-opacity-30 dark:border-opacity-20':
							props.variant === 'empty' && !props.children,
					},
				)}
				style={{ height: size, width: size }}
			>
				{props.variant !== 'empty' ? (
					<motion.span
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: (props.delay ?? 0) + 0.3,
							type: 'spring',
							stiffness: 500,
							damping: 15,
						}}
						className='font-semibold'
					>
						{props.children}
					</motion.span>
				) : (
					<span className='font-semibold'>{props.children}</span>
				)}
			</motion.div>

			{props.image && (
				<motion.img
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: (props.delay ?? 0) + 0.1, type: 'spring' }}
					className='absolute -top-1 -right-0 size-4 sm:size-5 sm:right-2 md:right-3.2 lg:right-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm'
					src={props.image}
					alt='User avatar'
				/>
			)}
		</div>
	)
}

export default Tile
