export type Cursor = {
	y: number
	x: number
}

export type GameTile = {
	variant: 'empty' | 'correct' | 'present' | 'absent' | string
	children: string
	cursor: Cursor
	user?: {
		id?: string
		name?: string
		image?: string
	}
}

export type GameGrid = GameTile[][]

export type GameStatus = 'new' | 'won' | 'lost'
