import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI();

export type HintApiResponse = {
	hint: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<HintApiResponse>,
) {
	const word = String(req.query.word);
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant within the Wordle game. Your task is to provide a hint to the user to help them guess the given word. Make sure the hint is not easy. Return just the hint with no other text or explanation.",
			},
			{ role: "user", content: word },
		],
		model: "gpt-4o",
	});
	const hint = completion.choices[0].message.content;

	if (!hint) {
		res.status(500);
		return;
	}

	res.status(200).json({ hint });
}
