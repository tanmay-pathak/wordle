import { VerifyApiResponse } from "@/pages/api/verify/[word]";
import { GameTile } from "./types";
import { without } from "ramda";
import { HintApiResponse } from "@/pages/api/hint/[word]";

export function findLastNonEmptyTile(row: GameTile[]) {
	return row.reduce<GameTile | null>(
		(acc, tile) => (tile.children ? tile : acc),
		null,
	);
}

export function getRowWord(row: GameTile[]) {
	return row
		.map((x) => x.children.trim())
		.filter(Boolean)
		.join("");
}

export function getNextRow(row: GameTile[], secret: string) {
	const indexed: Record<string, number[]> = {};

	for (let i = 0; i < secret.length; i++) {
		const letter = secret[i];
		if (letter in indexed) {
			indexed[letter].push(i);
		} else {
			indexed[letter] = [i];
		}
	}

	let result: GameTile[] = [...row];

	row.forEach((_, i) => {
		let tile = { ...row[i] };

		if (tile.variant !== "empty") {
			result.push(tile);
			return;
		}

		const letter = tile.children;

		if (!(letter in indexed)) {
			result[i] = { ...tile, variant: "absent" };
			return;
		}

		const entries = indexed[letter];

		if (!entries.length) {
			result[i] = { ...tile, variant: "absent" };

			result = result.map((tile) =>
				tile.children === letter && tile.variant === "empty"
					? { ...tile, variant: "absent" }
					: tile,
			);

			return;
		}

		// exists
		if (entries.includes(i)) {
			result[i].variant = "correct";
			const nextIndex = without([i], entries);
			indexed[letter] = nextIndex;
		} else {
			result[i].variant = "present";
		}
	});

	return result;
}

export async function verifyWord(word: string) {
	return await fetch(`/api/verify/${word}`).then(
		(x) => x.json() as Promise<VerifyApiResponse>,
	);
}

export async function getHint(word: string) {
	return await fetch(`/api/hint/${word}`).then(
		(x) => x.json() as Promise<HintApiResponse>,
	);
}
