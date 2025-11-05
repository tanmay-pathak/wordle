import { TileProps } from './tile'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type TileVariant = 'empty' | 'correct' | 'present' | 'absent' | 'default'

const MiniTile = ({
	variant,
	children,
	image,
}: {
	variant: TileVariant
	children: React.ReactNode
	image?: string
}) => {
	const variantClasses: Record<TileVariant, string> = {
		empty: 'bg-transparent border-border',
		correct: 'bg-green-500 border-green-500 text-white',
		present: 'bg-yellow-500 border-yellow-500 text-white',
		absent: 'bg-gray-500 border-gray-500 text-white',
		default: 'bg-background border-border',
	}

	return (
		<div
			className={cn(
				'w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center rounded text-lg sm:text-xl font-bold uppercase relative',
				variantClasses[variant || 'default'],
			)}
		>
			{children}
			{image && (
				<div className='absolute -top-1 -right-1 size-3 sm:size-4 rounded-full overflow-hidden border border-background'>
					<Image
						src={image}
						alt='Player'
						width={20}
						height={20}
						className='w-full h-full object-cover'
					/>
				</div>
			)}
		</div>
	)
}

type MiniGridProps = {
	data: TileProps[][] | null | undefined
	attempts: number
}

export const MiniGrid = ({ data, attempts }: MiniGridProps) => {
	if (!data) {
		return (
			<div className='text-xs text-muted-foreground'>Game data unavailable</div>
		)
	}

	// Only show rows up to the number of attempts
	const relevantRows = data.slice(0, attempts)

	return (
		<div className='flex flex-col space-y-2 mx-auto'>
			{relevantRows.map((row, i) => (
				<div key={`mini-row-${i}`} className='flex space-x-2'>
					{row.map((tile, j) => {
						// Ensure the variant is one of our valid types
						const safeVariant: TileVariant =
							tile.variant === 'correct' ||
							tile.variant === 'present' ||
							tile.variant === 'absent' ||
							tile.variant === 'empty'
								? (tile.variant as TileVariant)
								: 'default'

						return (
							<MiniTile
								key={`mini-tile-${i}-${j}`}
								variant={safeVariant}
								image={tile.user?.image}
							>
								{tile.children}
							</MiniTile>
						)
					})}
				</div>
			))}
		</div>
	)
}
