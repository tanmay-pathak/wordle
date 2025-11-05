import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { internalAction, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'

export const generateAndSaveAboutWord = internalAction({
	args: {
		id: v.id('secretWord'),
		word: v.string(),
	},
	handler: async (ctx, { word, id }) => {
		const result = await generateObject({
			model: google('gemini-2.0-flash-lite-preview-02-05'),
			prompt: `You are a wordle game expert. Todays word was ${word}. Write something short, fun and quirky about the word. Explain the word in a way that is fun and quirky.`,
			schema: z.object({
				aboutWord: z.string(),
			}),
		})

		await ctx.runMutation(internal.ai.saveAboutWord, {
			id: id,
			aboutWord: result.object.aboutWord,
		})
	},
})

export const saveAboutWord = internalMutation({
	args: {
		id: v.id('secretWord'),
		aboutWord: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			aboutWord: args.aboutWord,
		})
	},
})

export const generateReminderMessage = internalAction({
	args: {
		participants: v.array(v.string()),
	},
	handler: async (_ctx, { participants }) => {
		let prompt =
			"You are a fun and quirky assistant for a daily word game called Wordle with Friends. Write a short, engaging quirky reminder message encouraging people to play today's game."

		const participantCount = participants.length
		if (participantCount > 0) {
			const participantList = participants.join(', ')
			prompt += ` Looks like ${participantList} ${participantCount === 1 ? 'is' : 'are'} already on the case! Gently nudge others to join the fun without being pushy. No need to mention the full name - just use their first name.`
		} else {
			prompt +=
				' No one has played yet today, so be extra encouraging for someone to be the first!'
		}

		const result = await generateObject({
			model: google('gemini-2.0-flash-lite-preview-02-05'),
			prompt: prompt,
			schema: z.object({
				reminderMessage: z.string(),
			}),
		})

		return result.object.reminderMessage
	},
})

export const generateTrashTalk = internalAction({
	args: {
		guessedWord: v.string(),
		gameId: v.id('game'),
		date: v.string(),
	},
	handler: async (ctx, { guessedWord, gameId, date }) => {
		const prompt = `You are a fun and quirky assistant for a daily word game called Wordle with Friends (wordle clone). Write a short, engaging trash talk message to show the user when they guessed incorrectly. The user guessed the word "${guessedWord}". The message should be fun and super sassy. Ensure it is safe for work.`

		const result = await generateObject({
			model: google('gemini-2.0-flash-lite-preview-02-05'),
			prompt: prompt,
			schema: z.object({
				trashTalk: z.string(),
			}),
		})

		await ctx.runMutation(internal.ai.saveTrashTalk, {
			gameId,
			date,
			trashTalk: result.object.trashTalk,
		})
	},
})

export const saveTrashTalk = internalMutation({
	args: {
		gameId: v.id('game'),
		date: v.string(),
		trashTalk: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.gameId, {
			trashTalk: args.trashTalk,
		})
	},
})
