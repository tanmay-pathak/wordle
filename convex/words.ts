import { v } from 'convex/values'
import { internal } from './_generated/api'
import {
	internalAction,
	internalMutation,
	internalQuery,
} from './_generated/server'

export const assignDailyWord = internalAction({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const unassignedWord = await ctx.runQuery(internal.words.findUnassignedWord)

		if (!unassignedWord) {
			console.error('CRON: No unassigned words left to assign for tomorrow.')
			return null
		}

		const today = new Date()
		const todayDateStr = today.toLocaleDateString('en-US', {
			timeZone: 'America/Regina',
		})

		const wordForToday = await ctx.runQuery(internal.words.getWordByDate, {
			date: todayDateStr,
		})

		if (wordForToday) {
			console.warn(
				`CRON: A word (${wordForToday.word}) is already assigned for ${todayDateStr}. Skipping assignment.`,
			)
			return null
		}

		await ctx.runMutation(internal.words.assignWordToDate, {
			wordId: unassignedWord._id,
			date: todayDateStr,
		})

		await ctx.scheduler.runAfter(0, internal.ai.generateAndSaveAboutWord, {
			id: unassignedWord._id,
			word: unassignedWord.word,
		})

		console.log(
			`CRON: Successfully assigned word "${unassignedWord.word}" to date ${todayDateStr}`,
		)
		return null
	},
})

export const findUnassignedWord = internalQuery({
	args: {},
	handler: async (ctx) => {
		const unassignedWords = await ctx.db
			.query('secretWord')
			.withIndex('by_assigned', (q) => q.eq('assigned', false))
			.collect()

		if (unassignedWords.length === 0) {
			return null
		}

		const randomIndex = Math.floor(Math.random() * unassignedWords.length)
		return unassignedWords[randomIndex]
	},
})

export const getWordByDate = internalQuery({
	args: { date: v.string() },
	handler: async (ctx, { date }) => {
		return await ctx.db
			.query('secretWord')
			.withIndex('by_date', (q) => q.eq('date', date))
			.first()
	},
})

export const assignWordToDate = internalMutation({
	args: {
		wordId: v.id('secretWord'),
		date: v.string(),
	},
	handler: async (ctx, { wordId, date }) => {
		await ctx.db.patch(wordId, {
			assigned: true,
			date: date,
		})
	},
})
