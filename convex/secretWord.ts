import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const words = (await ctx.db.query("secretWord").collect()).filter(
			(w) => !w.used,
		);

		if (words.length === 0) {
			return null;
		}

		return words[0];
	},
});

export const setUsed = mutation({
	args: {
		_id: v.id("secretWord"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args._id, {
			used: true,
		});
	},
});
