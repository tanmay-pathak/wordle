'use client'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
	return (
		<div className='flex flex-col h-svh items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800'>
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className='flex flex-col items-center'
			>
				<div className='relative mb-4'>
					<div className='relative flex items-center justify-center'>
						<Skeleton className='size-16 sm:size-20 rounded-full' />
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className='absolute inset-0 flex items-center justify-center'
						>
							<img
								src='/images/icons/icon-128x128.png'
								className='size-8 sm:size-10'
								alt='wordle with friends logo'
							/>
						</motion.div>
					</div>
				</div>
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className='text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-200'
				>
					Wordle with Friends
				</motion.h2>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className='mt-2'
				>
					<Skeleton className='h-4 w-32' />
				</motion.div>
			</motion.div>
		</div>
	)
}

export default Loading
