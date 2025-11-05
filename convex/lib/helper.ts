import { GameTile } from '../../lib/types'

export function findLastNonEmptyTile(row: GameTile[]) {
	return row.reduce<GameTile | null>(
		(acc, tile) => (tile.children ? tile : acc),
		null,
	)
}

export function getRowWord(row: GameTile[]) {
	return row
		.map((x) => x.children.trim())
		.filter(Boolean)
		.join('')
}

export function getNextRow(row: GameTile[], secret: string) {
	// Count occurrences of each letter in the secret word
	const letterCounts: Record<string, number> = {}
	for (let i = 0; i < secret.length; i++) {
		const letter = secret[i]
		letterCounts[letter] = (letterCounts[letter] || 0) + 1
	}

	let result: GameTile[] = [...row]

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
