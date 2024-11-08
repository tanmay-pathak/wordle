import { NUMBER_OF_LETTERS } from "@/convex/constants";
import { WORDS } from "@/lib/six_letter_words";
import type { NextApiRequest, NextApiResponse } from "next";

export type VerifyApiResponse = {
	valid: boolean;
};

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<VerifyApiResponse>,
) {
	const word = String(req.query.word);

	const valid =
		word && word.length === NUMBER_OF_LETTERS ? WORDS.includes(word.toLowerCase()) : false;

	res.status(200).json({ valid });
}
