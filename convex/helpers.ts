import { v } from 'convex/values'

export const cursorValidator = v.object({ x: v.number(), y: v.number() })

export const cellValidator = v.object({
	variant: v.string(),
	children: v.string(),
	cursor: cursorValidator,
	delay: v.optional(v.number()),
	size: v.optional(v.number()),
	user: v.optional(
		v.object({
			id: v.string(),
			name: v.string(),
			image: v.string(),
			email: v.string(),
		}),
	),
})

export const getBasicGame = (letters: number, tries: number) => {
	const data = Array.from({ length: tries }, (_, y) =>
		Array.from({ length: letters }, (_, x) => ({
			variant: 'empty',
			children: '',
			cursor: { x, y },
		})),
	)

	return data
}

export function getNextRow(row: any[], secret: string) {
	// Count occurrences of each letter in the secret word
	const letterCounts: Record<string, number> = {}
	for (let i = 0; i < secret.length; i++) {
		const letter = secret[i]
		letterCounts[letter] = (letterCounts[letter] || 0) + 1
	}

	let result = [...row]

	// First pass: Mark correct positions and consume letter counts
	const availableCounts = { ...letterCounts }
	row.forEach((_, i) => {
		let tile = { ...row[i] }

		if (tile.variant !== 'empty') {
			result[i] = tile
			return
		}

		const letter = tile.children

		// If letter is in correct position
		if (secret[i] === letter) {
			result[i] = { ...tile, variant: 'correct' }
			availableCounts[letter] = Math.max(0, availableCounts[letter] - 1)
		} else {
			result[i] = { ...tile, variant: 'empty' } // Will be processed in second pass
		}
	})

	// Second pass: Mark present/absent for remaining letters
	row.forEach((_, i) => {
		if (result[i].variant !== 'empty') {
			return // Already processed as correct
		}

		let tile = { ...row[i] }
		const letter = tile.children

		// If letter exists in secret and we have available instances
		if (letter in letterCounts && availableCounts[letter] > 0) {
			result[i] = { ...tile, variant: 'present' }
			availableCounts[letter] = Math.max(0, availableCounts[letter] - 1)
		} else {
			result[i] = { ...tile, variant: 'absent' }
		}
	})

	return result
}
