import { useCallback, useEffect } from 'react'
import { match } from 'ts-pattern'
import { always } from 'ramda'
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { GameTile } from '@/lib/types'

export const MAPPABLE_KEYS = {
	backspace: <Delete className='size-5 sm:size-6' />,
	enter: 'ENTER',
} as const

export type MappableKeys = keyof typeof MAPPABLE_KEYS

export function isMappableKey(key: string): key is MappableKeys {
	return key in MAPPABLE_KEYS
}

const KEYS = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
	['enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
]

export const VALID_KEYS = KEYS.flatMap((row) =>
	row.map((key) => key.toLowerCase()),
).filter(Boolean)

function isValidKey(key: string) {
	return VALID_KEYS.includes(key)
}

type Props = {
	onKeyPress: (key: string) => void
	disabled?: boolean
	usedKeys: Record<string, GameTile[]>
}

export default function Keyboard({ onKeyPress, disabled, usedKeys }: Props) {
	useEffect(() => {
		function onKeyUp(e: KeyboardEvent) {
			if (isValidKey(e.key.toLowerCase())) {
				onKeyPress(e.key.toLowerCase())
			}
		}

		document.addEventListener('keyup', onKeyUp)

		return () => {
			document.removeEventListener('keyup', onKeyUp)
		}
	}, [onKeyPress])

	function propEqLoose(propName: string, value: any) {
		return (obj: any) => obj[propName] == value
	}

	const getKeyColors = useCallback(
		(key: string) => {
			if (key in usedKeys) {
				const tiles = usedKeys[key]

				const tile =
					tiles.find(propEqLoose('variant', 'correct')) ??
					tiles.find(propEqLoose('variant', 'present')) ??
					tiles.find(propEqLoose('variant', 'absent'))

				return {
					color: tile?.variant ? 'white' : 'rgb(55 65 81)',
					background: match(tile?.variant ?? 'empty')
						.with('absent', always('rgb(75 85 99)'))
						.with('correct', always('rgb(34 197 94)'))
						.with('present', always('rgb(234 179 8)'))
						.otherwise(always('')),
				}
			}

			return {}
		},
		[usedKeys],
	)

	// Different styles for special keys
	const getKeyClasses = (key: string) => {
		const baseClasses =
			'relative flex items-center justify-center h-10 sm:h-12 md:h-14 rounded-lg md:text-lg sm:text-base text-[10px] font-bold transition-all shadow-sm active:shadow-inner active:translate-y-0.5'

		if (key === 'enter') {
			return `${baseClasses} bg-indigo-500 hover:bg-indigo-600 text-white px-1 sm:px-2 min-w-[3.5rem] sm:min-w-[4rem]`
		} else if (key === 'backspace') {
			return `${baseClasses} bg-rose-500 hover:bg-rose-600 text-white px-1 sm:px-2 min-w-[3rem] sm:min-w-[3.5rem]`
		} else {
			return `${baseClasses} bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 px-0.5 sm:px-1 min-w-[1.75rem] sm:min-w-[2.25rem]`
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='mx-auto grid h-min select-none gap-0.5 sm:gap-1 md:gap-1.5 px-1 sm:px-4 max-w-3xl pb-1 sm:pb-2 mb-safe'
		>
			{KEYS.map((row, i) => (
				<div
					className='flex touch-manipulation justify-evenly gap-0.5 md:gap-1'
					key={`row-${i}`}
				>
					{row.map((key, j) =>
						key === '' ? (
							<div key={`empty-${j}`} className='w-2' />
						) : (
							<motion.button
								whileTap={{ scale: 0.95 }}
								className={getKeyClasses(key.toLowerCase())}
								disabled={disabled}
								key={key}
								onClick={onKeyPress.bind(null, key.toLowerCase())}
								style={
									disabled
										? { opacity: 0.5, cursor: 'not-allowed' }
										: getKeyColors(key.toLowerCase())
								}
							>
								{isMappableKey(key) ? MAPPABLE_KEYS[key] : key}
							</motion.button>
						),
					)}
				</div>
			))}
		</motion.div>
	)
}
