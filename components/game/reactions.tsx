'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'

const EMOJIS = ['🎉', '🔥', '💯', '🚀', '⭐', '❤️', '👏', '🎊', '💪', '🎯', '😀', '😍', '🤣', '👍', '👎']

interface ReactionAnimationProps {
	emoji: string
	userName: string
	userAvatar: string
	onComplete: () => void
}

function ReactionAnimation({ emoji, userName, userAvatar, onComplete }: ReactionAnimationProps) {
	const [particles] = useState(() => {
		// Generate 20 particles with random positions and properties
		const count = 20
		return Array.from({ length: count }, (_, i) => {
			const x = Math.random() * 100
			const y = Math.random() * 100
			return {
				id: i,
				x,
				y,
				scale: 0.5 + Math.random() * 1.5,
				rotation: Math.random() * 360,
				rotationEnd: Math.random() * 720 - 360,
				duration: 1.5 + Math.random() * 0.5,
				delay: Math.random() * 0.2,
			}
		})
	})

	useEffect(() => {
		const maxDuration = Math.max(...particles.map((p) => p.duration + p.delay))
		const timer = setTimeout(() => {
			onComplete()
		}, (maxDuration + 0.5) * 1000)

		return () => clearTimeout(timer)
	}, [onComplete, particles])

	return (
		<div className='fixed inset-0 pointer-events-none z-[100] overflow-hidden'>
			{/* User info badge */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: [0, 1, 0], y: [20, 0, -20] }}
				exit={{ opacity: 0 }}
				transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
				className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/70 dark:bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 z-[101]'
			>
				<img
					src={userAvatar}
					alt={userName}
					className='w-6 h-6 rounded-full'
				/>
				<span className='text-white dark:text-black text-sm font-semibold'>
					{userName}
				</span>
			</motion.div>

			{/* Emoji particles */}
			{particles.map((particle) => (
				<motion.div
					key={particle.id}
					initial={{
						opacity: 0,
						scale: 0,
						x: `${particle.x}vw`,
						y: `${particle.y}vh`,
						rotate: particle.rotation,
					}}
					animate={{
						opacity: [0, 1, 1, 0],
						scale: [0, particle.scale, particle.scale, particle.scale * 1.1],
						rotate: particle.rotationEnd,
					}}
					exit={{ opacity: 0 }}
					transition={{
						duration: particle.duration,
						delay: particle.delay,
						ease: [0.4, 0, 0.2, 1],
					}}
					className='absolute text-2xl sm:text-3xl md:text-4xl will-change-transform'
					style={{
						left: 0,
						top: 0,
						transformOrigin: 'center center',
					}}
				>
					{emoji}
				</motion.div>
			))}
		</div>
	)
}

interface Reaction {
	id: string
	emoji: string
	userId: string
	userName: string
	userAvatar: string
}

interface ReactionsProps {
	socket: { send: (data: string) => void } | null
	reactions: Array<Reaction>
	setReactions: React.Dispatch<React.SetStateAction<Array<Reaction>>>
	currentUserId: string | undefined
	currentUserName: string | undefined
	currentUserAvatar: string | undefined
}

export default function Reactions({
	socket,
	reactions,
	setReactions,
	currentUserId,
	currentUserName,
	currentUserAvatar,
}: ReactionsProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleEmojiClick = (emoji: string) => {
		if (!socket || !currentUserId || !currentUserName || !currentUserAvatar) return

		// Send reaction to PartyKit
		socket.send(
			JSON.stringify({
				type: 'reaction',
				payload: {
					emoji,
					userId: currentUserId,
					userName: currentUserName,
					userAvatar: currentUserAvatar,
				},
			}),
		)

		// Show local reaction immediately
		const reactionId = `${Date.now()}-${Math.random()}`
		setReactions((prev) => [
			...prev,
			{
				id: reactionId,
				emoji,
				userId: currentUserId,
				userName: currentUserName,
				userAvatar: currentUserAvatar,
			},
		])

		setTimeout(() => {
			setReactions((prev) => prev.filter((r) => r.id !== reactionId))
		}, 2000)

		setIsOpen(false)
	}

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button
						size='icon'
						className='fixed bottom-4 right-4 z-50 rounded-full bg-brand-orange text-white shadow-xl hover:bg-brand-orange/90 hover:scale-110 transition-all duration-200 w-14 h-14'
					>
						<Smile className='size-6' />
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-md'>
					<div className='py-4'>
						<h3 className='text-lg font-semibold mb-4 text-center'>
							Pick a reaction
						</h3>
						<div className='grid grid-cols-5 gap-3'>
							{EMOJIS.map((emoji) => (
								<button
									key={emoji}
									onClick={() => handleEmojiClick(emoji)}
									className='text-3xl sm:text-4xl hover:scale-125 transition-transform duration-200 p-2 rounded-lg hover:bg-accent'
								>
									{emoji}
								</button>
							))}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<AnimatePresence>
				{reactions.map((reaction) => (
					<ReactionAnimation
						key={reaction.id}
						emoji={reaction.emoji}
						userName={reaction.userName}
						userAvatar={reaction.userAvatar}
						onComplete={() => {
							setReactions((prev) =>
								prev.filter((r) => r.id !== reaction.id),
							)
						}}
					/>
				))}
			</AnimatePresence>
		</>
	)
}

