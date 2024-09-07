import Grid from "@/components/game/grid";
import Keyboard, { isMappableKey } from "@/components/game/keyboard";
import Loading from "@/components/loading";
import Page from "@/components/page";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { api } from "@/convex/_generated/api";
import { NUMBER_OF_LETTERS } from "@/convex/constants";
import {
	findLastNonEmptyTile,
	getHint,
	getNextRow,
	getRowWord,
	verifyWord,
} from "@/lib/helper";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { MessageCircleQuestion } from "lucide-react";
import { prop, flatten, reject, propEq, groupBy } from "ramda";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
	const currentDate = new Date()
		.toLocaleString("en-US", { timeZone: "America/Regina" })
			.split(",")[0];
	let gameData = useQuery(api.game.get, { date: currentDate });
	const secretWord = useQuery(api.secretWord.get);
	const setGameData = useMutation(api.game.set);
	const setWordAsUsed = useMutation(api.secretWord.setUsed);
	const deleteGame = useMutation(api.game.deleteGame);
	const setWinners = useMutation(api.winners.set);
	const [hasWon, setHasWon] = useState(false);
	const { user } = useUser();

	const handleNewCharacter = async (key: string) => {
		if (!gameData || gameData.finished) {
			return;
		}

		const row = gameData.data[gameData.cursor.y];
		const tile = row[gameData.cursor.x];
		const isLastColumn = gameData.cursor.x === NUMBER_OF_LETTERS - 1;

		gameData.data[gameData.cursor.y][gameData.cursor.x] = {
			...tile,
			children: key,
			user: {
				id: user?.id,
				name: `${user?.firstName} ${user?.lastName}`,
				image: user?.imageUrl,
			},
		};

		let newX = gameData.cursor.x;
		if (!isLastColumn) {
			newX = gameData.cursor.x + 1;
		}

		const newData = {
			...gameData,
			cursor: { x: newX, y: gameData.cursor.y },
		};
		gameData = newData;
		return await setGameData(newData);
	};

	const handleDeleteCharacter = async () => {
		if (!gameData) {
			return;
		}

		const lastNonEmptyTile = findLastNonEmptyTile(
			gameData.data[gameData.cursor.y],
		);

		if (!lastNonEmptyTile) {
			// nothing to to here if there's no non-empty tile
			return;
		}

		// set cursor to lastNonEmptyTile's cursor
		gameData.cursor = lastNonEmptyTile.cursor;
		lastNonEmptyTile.user = undefined;
		const { y, x } = gameData.cursor;
		const target = gameData.data[y][x];

		target.children = "";
		target.variant = "empty";
		const newData = {
			...gameData,
			cursor: lastNonEmptyTile.cursor,
		};
		gameData = newData;
		setHasWon(false);
		return await setGameData(newData);
	};

	const handleEnter = async (): Promise<
		| { status: "win"; guess: string; attempts: number }
		| { status: "loss"; guess: string; attempts: number }
		| { status: "playing" }
	> => {
		if (!gameData) {
			return { status: "playing" };
		}

		const grid = gameData.data;
		const cursor = gameData.cursor;

		if (gameData.cursor.x !== grid[0].length - 1) {
			return { status: "playing" };
		}

		const guessWord = getRowWord(grid[cursor.y]);

		if (guessWord.length !== NUMBER_OF_LETTERS) {
			return {
				status: "playing",
			};
		}

		try {
			const result = await verifyWord(guessWord);

			if (!result.valid) {
				toast.error(`Not in word list: ${guessWord}`);
				return {
					status: "playing",
				};
			}
		} catch (error) {
			console.log("Failed to verify word: %e", error);
		}

		const won = secretWord?.word === guessWord;

		const attempts = cursor.y + 1;
		const isLastRow = cursor.y === grid.length - 1;

		const newRow = getNextRow(grid[cursor.y], secretWord?.word as string); // should not be null or undefined

		gameData.data[cursor.y] = newRow;

		const newData = {
			...gameData,
			cursor: {
				x: isLastRow ? cursor.x : 0,
				y: isLastRow ? cursor.y : cursor.y + 1,
			},
			finished: won || isLastRow,
			attempts,
		};

		await setGameData(newData);

		return {
			status: !isLastRow && !won ? "playing" : won ? "win" : "loss",
			guess: guessWord,
			attempts,
		};
	};

	const handleKeyPress = async (key: string) => {
		if (!isMappableKey(key)) {
			return await handleNewCharacter(key);
		}

		switch (key) {
			case "backspace":
				await handleDeleteCharacter();
				break;
			case "enter":
				const result = await handleEnter();
				let userNames: string[] = [];
				if (gameData?.data) {
					gameData.data.forEach((row) => {
						row.forEach((tile) => {
							// @ts-expect-error FIXME: Its okay
							if (tile.user) {
								// @ts-expect-error FIXME: Its okay
								userNames.push(`${tile.user.name}`);
							}
						});
					});
					// unique username
					userNames = userNames.filter(
						(value, index, self) => self.indexOf(value) === index,
					);
				}
				switch (result.status) {
					case "win":
						toast.promise(
							setWinners({
								attempts: result.attempts,
								date: currentDate,
								players: userNames,
								word: secretWord?.word as string, // should not be null or undefined
							}),
							{
								loading: "Saving...",
								success: `You won in ${result.attempts} attempts!`,
								error: "Failed to save your win.",
							},
						);
						setHasWon(true);
						// @ts-expect-error Will not be null or undefined
						await setWordAsUsed({ _id: secretWord._id });
						break;
					case "loss":
						toast.error(`You lost! The word was: ${secretWord?.word}`);
						// @ts-expect-error Will not be null or undefined
						await setWordAsUsed({ _id: secretWord._id });
						break;
				}
				break;
		}
	};

	if (gameData === undefined || secretWord === undefined) {
		return <Loading />;
	}

	if (gameData === null || secretWord === null) {
		return <>No data found</>;
	}

	function getUsedKeys(gameData: { data: any[] }): any {
		const grid = prop("data", gameData);
		const flattenedGrid = flatten(grid);
		const filteredGrid = reject(propEq("children", ""), flattenedGrid);
		return groupBy(prop("children"), filteredGrid);
	}

	const usedKeys = getUsedKeys(gameData);

	const people = gameData.data
		.flatMap((row) => {
			return row.map((tile) => {
				// @ts-expect-error FIXME: Its okay
				if (tile.user) {
					return {
						// @ts-expect-error FIXME: Its okay
						id: tile.user?.id,
						// @ts-expect-error FIXME: Its okay
						name: tile.user?.name,
						// @ts-expect-error FIXME: Its okay
						image: tile.user?.image,
					};
				}
			});
		})
		.filter(
			(a, index, self) =>
				a !== undefined && self.findIndex((b) => b?.id === a?.id) === index,
		);

	const [isHintLoading, setIsHintLoading] = useState(false);

	const handleHint = async () => {
		setIsHintLoading(true);
		try {
			const { hint } = await getHint(secretWord.word);
			toast.success(`Your hint is: ${hint}`, { duration: 10000 });
		} catch (error) {
			console.error("Error fetching hint:", error);
			toast.error("Failed to get hint. Please try again.");
		} finally {
			setIsHintLoading(false);
		}
	};

	return (
		<Page>
			{people && people.length > 0 && (
				<div className="mb-2 sm:mb-0">
					<div className="prose prose-sm sm:prose-lg max-w-none">
						<h4 className="text-center">Played Today:</h4>
					</div>
					<div className="flex flex-row items-center justify-center w-full">
						{/* @ts-ignore Type issue */}
						<AnimatedTooltip items={people} />
					</div>
				</div>
			)}
			<div className="flex justify-center my-1">
				<button
					className="flex gap-1 items-center"
					onClick={handleHint}
					disabled={isHintLoading}
				>
					{isHintLoading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Loading...
						</>
					) : (
						<>
							Need a hint? <MessageCircleQuestion />
						</>
					)}
				</button>
			</div>
			<div className="flex flex-col justify-between gap-2 sm:gap-10 min-h-[65vh]">
				{gameData.finished && (
					<div className="absolute top-35 sm:top-20 inset-0 flex items-center justify-center bg-opacity-100 z-20 mx-4">
						<div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
							<section className="prose prose-sm sm:prose-lg max-w-none mb-4">
								{hasWon ? (
									<>
										<h1>Congratulations! 🎉</h1>
										<p>
											You won in <b>{gameData.attempts}</b> attempts!
										</p>
										<figcaption className="mb-4">
											For the first week of launch you can restart the game.
										</figcaption>
									</>
								) : (
									<>
										<h1>Game over 😔</h1>
										<figcaption className="mb-4">
											No worries. For the first week of launch you can restart
											the game.
										</figcaption>
									</>
								)}
								<div className="flex justify-center">
									<button
										type="button"
										className="text-white shadow bg-black hover:bg-black/90 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
										/* @ts-ignore FIXME: Its okay */
										onClick={() => deleteGame({ _id: gameData?._id })}
									>
										Restart Game
									</button>
								</div>
							</section>
						</div>
					</div>
				)}
				<Grid data={gameData.data} />
				<Keyboard
					onKeyPress={handleKeyPress}
					usedKeys={usedKeys}
					disabled={gameData.finished}
				/>
			</div>
		</Page>
	);
};

export default Index;
