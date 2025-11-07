import type * as Party from 'partykit/server'
import type { UserPayload, Message } from './types'

export default class Server implements Party.Server {
	options: Party.ServerOptions = { hibernate: true }
	party: Party.Party

	constructor(party: Party.Party) {
		this.party = party
	}

	updateUsers() {
		const presenceMessage = JSON.stringify(this.getPresenceMessage())
		for (const connection of this.party.getConnections<UserPayload>()) {
			connection.send(presenceMessage)
		}
	}

	getPresenceMessage(): Message {
		const users = new Map<string, UserPayload>()
		for (const connection of this.party.getConnections<UserPayload>()) {
			const user = connection.state
			if (user) users.set(user.id, user)
		}
		return {
			type: 'presence',
			payload: { users: Array.from(users.values()) },
		} satisfies Message
	}

	onMessage(message: string, sender: Party.Connection<UserPayload>) {
		const userMessage = JSON.parse(message) as Message
		if (userMessage.type === 'add-user') {
			sender.setState(userMessage.payload)
			this.updateUsers()
		} else if (userMessage.type === 'remove-user') {
			sender.setState(null)
			this.updateUsers()
		} else if (userMessage.type === 'update-cursor') {
			const currentState = sender.state
			if (currentState) {
				// Update only the cursor while preserving other user data
				sender.setState({
					...currentState,
					cursor: userMessage.payload.cursor,
				})
				this.updateUsers()
			}
		} else if (userMessage.type === 'reaction') {
			// Broadcast reaction to all connected clients
			const reactionMessage = JSON.stringify(userMessage)
			for (const connection of this.party.getConnections<UserPayload>()) {
				connection.send(reactionMessage)
			}
		}
	}

	onClose() {
		this.updateUsers()
	}

	onError() {
		this.updateUsers()
	}
}

Server satisfies Party.Worker
