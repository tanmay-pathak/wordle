'use client'
import Image from 'next/image'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

export const AnimatedTooltip = ({
	items,
}: {
	items: { id: number; name: string; image: string }[]
}) => {
	return (
		<div className='flex items-center -space-x-2'>
			{items.map((item) => (
				<TooltipProvider key={item.id}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className='relative group'>
								<Image
									height={100}
									width={100}
									src={item.image}
									alt={item.name}
									className='object-cover m-0! p-0! object-top rounded-full size-8 sm:size-12 border-2 group-hover:scale-105 group-hover:z-30 border-brand-orange/90 relative transition duration-500'
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className='font-bold'>{item.name}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			))}
		</div>
	)
}
