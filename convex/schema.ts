import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	secretWord: defineTable({
		word: v.string(),
		date: v.optional(v.string()),
		assigned: v.optional(v.boolean()),
		aboutWord: v.optional(v.string()),
	})
		.index('by_assigned', ['assigned'])
		.index('by_date', ['date']),
	game: defineTable({
		date: v.string(),
		data: v.array(
			v.array(
				v.object({
					variant: v.string(),
					children: v.string(),
					cursor: v.object({
						x: v.number(),
						y: v.number(),
					}),
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
				}),
			),
		),
		cursor: v.object({
			x: v.number(),
			y: v.number(),
		}),
		finished: v.boolean(),
		attempts: v.number(),
                won: v.boolean(),
                wordOfTheDay: v.optional(v.string()),
                aboutWord: v.optional(v.string()),
                submittedUsers: v.optional(v.array(v.string())),
                trashTalk: v.optional(v.string()),
        }).index('by_date', ['date']),
	winners: defineTable({
		date: v.string(),
		word: v.string(),
		attempts: v.number(),
		winnerInfo: v.object({
			name: v.string(),
			userId: v.string(),
			email: v.string(),
			pictureUrl: v.string(),
		}),
		playerInfos: v.array(
			v.object({
				name: v.string(),
				userId: v.string(),
				email: v.string(),
				pictureUrl: v.string(),
			}),
		),
	}).index('by_date', ['date']),
})
