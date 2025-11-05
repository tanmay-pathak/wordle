import { v } from 'convex/values'
import { internalAction } from './_generated/server'

const playerInfoValidator = v.object({
	name: v.string(),
	userId: v.string(),
	email: v.string(),
	pictureUrl: v.string(),
})

export const sendSlackMessage = internalAction({
	args: {
		date: v.string(),
		status: v.union(v.literal('win'), v.literal('loss')),
		word: v.string(),
		attempts: v.number(),
		participantInfos: v.array(playerInfoValidator),
		winnerUserId: v.optional(v.string()),
		aboutWord: v.optional(v.string()),
	},
	handler: async (_ctx, args) => {
		const token = process.env.SLACK_BOT_TOKEN
		const channel = process.env.SLACK_CHANNEL_ID

		if (!token || !channel) {
			console.error(
				'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID environment variable not set.',
			)
			throw new Error('Slack environment variables not configured.')
		}

		// Build blocks for better formatting
		const blocks = []

		if (args.status === 'win') {
			const winner = args.participantInfos.find(
				(p) => p.userId === args.winnerUserId,
			)
			const winnerName = winner?.name ?? 'Someone'

			const otherParticipants = args.participantInfos.filter(
				(p) => p.userId !== args.winnerUserId,
			)

			// Header section with emoji
			blocks.push({
				type: 'header',
				text: {
					type: 'plain_text',
					text: `🎉 Wordle with Friends for ${args.date} was solved! 🎉`,
					emoji: true,
				},
			})

			// Main content section
			blocks.push({
				type: 'section',
				fields: [
					{
						type: 'mrkdwn',
						text: `*Word:*\n${args.word}`,
					},
					{
						type: 'mrkdwn',
						text: `*Attempts:*\n${args.attempts}`,
					},
				],
			})

			// Winner section
			blocks.push({
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Winner:* ${winnerName}`,
				},
			})

			// Other participants section (if any)
			if (otherParticipants.length > 0) {
				const otherParticipantNames = otherParticipants
					.map((p) => p.name)
					.join(', ')
				blocks.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*Participants:* ${otherParticipantNames}`,
					},
				})
			}

			// About the word section (if provided)
			if (args.aboutWord) {
				blocks.push({ type: 'divider' })
				blocks.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `💡 *About the word:* ${args.aboutWord}`,
					},
				})
			}
		} else {
			// Loss condition
			// Header section with emoji
			blocks.push({
				type: 'header',
				text: {
					type: 'plain_text',
					text: `😥 Wordle with Friends for ${args.date} wasn't solved 😥`,
					emoji: true,
				},
			})

			// Word section
			blocks.push({
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*The word was:* ${args.word}`,
				},
			})

			// Participants section
			if (args.participantInfos.length > 0) {
				const participantNames = args.participantInfos
					.map((p) => p.name)
					.join(', ')
				blocks.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*Played by:* ${participantNames}`,
					},
				})
			} else {
				blocks.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: 'No one participated today.',
					},
				})
			}

			// Encouragement section
			blocks.push({
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: 'Better luck next time!',
				},
			})

			// About the word section (if provided)
			if (args.aboutWord) {
				blocks.push({ type: 'divider' })
				blocks.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `💡 *About the word:* ${args.aboutWord}`,
					},
				})
			}
		}

		// Generate fallback text for notifications
		let fallbackText =
			args.status === 'win'
				? `🎉 Wordle with Friends for ${args.date} was solved! Word: ${args.word}`
				: `😥 Wordle with Friends for ${args.date} wasn't solved. Word: ${args.word}`

		try {
			const response = await fetch('https://slack.com/api/chat.postMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					channel: channel,
					text: fallbackText,
					blocks: blocks,
				}),
			})

			const result = await response.json()
			if (!result.ok) {
				console.error('Slack API error:', result.error)
			} else {
				console.log('Slack notification sent successfully.')
			}
		} catch (error) {
			console.error('Error sending Slack message:', error)
		}
	},
})

export const sendReminderMessage = internalAction({
	args: {
		date: v.string(),
		message: v.string(),
	},
	handler: async (_ctx, args) => {
		const token = process.env.SLACK_BOT_TOKEN
		const channel = process.env.SLACK_CHANNEL_ID

		if (!token || !channel) {
			console.error(
				'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID environment variable not set.',
			)
			throw new Error('Slack environment variables not configured.')
		}

		const blocks = [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: args.message,
				},
			},
			{
				type: 'context',
				elements: [
					{
						type: 'mrkdwn',
						text: `Wordle with Friends for ${args.date}`,
					},
				],
			},
		]

		const fallbackText = `${args.message} (Wordle with Friends for ${args.date})`

		try {
			const response = await fetch('https://slack.com/api/chat.postMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					channel: channel,
					text: fallbackText,
					blocks: blocks,
				}),
			})

			const result = await response.json()
			if (!result.ok) {
				console.error('Slack API error (Reminder):', result.error)
			} else {
				console.log('Slack reminder sent successfully.')
			}
		} catch (error) {
			console.error('Error sending Slack reminder message:', error)
		}
	},
})

