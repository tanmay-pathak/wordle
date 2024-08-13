import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	secretWord: defineTable({
		word: v.string(),
		used: v.boolean(),
	}),
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
							id: v.optional(v.string()),
							name: v.optional(v.string()),
							image: v.optional(v.string()),
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
	}).index("by_date", ["date"]),
	winners: defineTable({
		date: v.string(),
		word: v.string(),
		players: v.array(v.string()),
		attempts: v.number(),
	}).index("by_date", ["date"]),
});
