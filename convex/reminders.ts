import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, internalQuery } from './_generated/server'

const getTodaysDate = () => {
	return new Date()
		.toLocaleString('en-US', { timeZone: 'America/Regina' })
		.split(',')[0]
}

export const getGameStatusAndParticipants = internalQuery({
	args: { date: v.string() },
	handler: async (ctx, args) => {
		const game = await ctx.db
			.query('game')
			.withIndex('by_date', (q) => q.eq('date', args.date))
			.unique()

		if (!game || game.finished) {
			return { finished: true, participants: [] as string[] }
		}

		const participants: Set<string> = new Set()
		if (game.data) {
			for (const row of game.data) {
				for (const cell of row) {
					if (cell.user && cell.user.name) {
						participants.add(cell.user.name)
					}
				}
			}
		}

		return { finished: false, participants: Array.from(participants) }
	},
})

export const sendDailyReminder = internalAction({
	args: { date: v.optional(v.string()) },
	handler: async (ctx, { date }) => {
		const reminderDate = date ?? getTodaysDate()
		console.log(`Checking game status for reminder: ${reminderDate}`)

		const { finished, participants } = await ctx.runQuery(
			internal.reminders.getGameStatusAndParticipants,
			{ date: reminderDate },
		)

		if (finished) {
			console.log(
				`Game for ${reminderDate} is already finished. No reminder sent.`,
			)
			return
		}

		console.log(
			`Game for ${reminderDate} is ongoing. Generating reminder message.`,
		)
		const reminderMessage: string = await ctx.runAction(
			internal.ai.generateReminderMessage,
			{
				participants: participants,
			},
		)

		console.log(`Sending reminder: "${reminderMessage}"`)
		await ctx.runAction(internal.slackNotifier.sendReminderMessage, {
			date: reminderDate,
			message: reminderMessage,
		})
	},
})

export const sendStartReminder = internalAction({
	args: { date: v.string() },
	handler: async (ctx, { date }) => {
		await ctx.runAction(internal.slackNotifier.sendReminderMessage, {
			date,
			message: 'Game starts in 15 minutes. Get ready.',
		})
	},
})
