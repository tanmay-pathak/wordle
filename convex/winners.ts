import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("winners").order("desc").take(15);
	},
});

export const set = mutation({
	args: {
		date: v.string(),
		word: v.string(),
		attempts: v.number(),
		players: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("winners", {
			...args,
		});
	},
});
