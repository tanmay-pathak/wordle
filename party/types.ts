export type UserPayload = {
	id: string
	avatarUrl: string
	name?: string | null | undefined
	cursor?: {
		x: number
		y: number
	}
}

export type Message =
	| { type: 'remove-user'; payload: Pick<UserPayload, 'id'> }
	| { type: 'add-user'; payload: UserPayload }
	| { type: 'update-cursor'; payload: Pick<UserPayload, 'id' | 'cursor'> }
	| { type: 'presence'; payload: { users: Array<UserPayload> } }
