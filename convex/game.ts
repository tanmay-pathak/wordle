import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { NUMBER_OF_LETTERS, NUMBER_OF_TRIES } from "./constants";

export const get = query({
	args: {
		date: v.string(),
	},
	handler: async (ctx, { date }) => {
		const existingGame = await ctx.db
			.query("game")
			.withIndex("by_date", (q) => q.eq("date", date))
			.first();

		const newGame = getBasicGame(NUMBER_OF_LETTERS, NUMBER_OF_TRIES);
		const gameObject = {
			data: newGame,
			cursor: { x: 0, y: 0 },
			date: new Date()
				.toLocaleString("en-US", { timeZone: "America/Regina" })
				.split(",")[0],
			finished: false,
			attempts: 0,
			user: undefined,
		};

		return existingGame || gameObject;
	},
});

export const set = mutation({
	args: {
		_id: v.optional(v.id("game")),
		_creationTime: v.optional(v.number()),
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
	},
	handler: async (ctx, args) => {
		if (!args._id) {
			return await ctx.db.insert("game", args);
		}

		return await ctx.db.replace(args._id, {
			...args,
		});
	},
});

export const deleteGame = mutation({
	args: {
		_id: v.optional(v.id("game")),
	},
	handler: async (ctx, args) => {
		if (!args._id) {
			return;
		}

		return await ctx.db.delete(args._id);
	},
});

const getBasicGame = (letters: number, tries: number) => {
	const data = Array.from({ length: tries }, (_, y) =>
		Array.from({ length: letters }, (_, x) => ({
			variant: "empty",
			children: "",
			cursor: { x, y },
		})),
	);

	return data;
};
