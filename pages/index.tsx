import Grid from "@/components/game/grid";
import Keyboard from "@/components/game/keyboard";
import Loading from "@/components/loading";
import Page from "@/components/page";
import { api } from "@/convex/_generated/api";
import { NUMBER_OF_LETTERS, NUMBER_OF_TRIES } from "@/convex/constants";
import { SignUpButton } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/router";
import { prop, flatten, reject, propEq, groupBy } from "ramda";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const Index = () => {
	const currentDate = new Date()
		.toLocaleString("en-US", { timeZone: "America/Regina" })
		.split(",")[0];
	let gameData = useQuery(api.game.get, { date: currentDate });
	const secretWord = useQuery(api.secretWord.get);
	const { isAuthenticated } = useConvexAuth();
	const router = useRouter();

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

	if (isAuthenticated) {
		router.push("/game");
	}

	return (
		<Page>
			{people && people.length > 0 && (
				<div className="mb-2 sm:mb-0">
					<div className="prose prose-sm sm:prose-lg max-w-none">
						<h4 className="text-center">Played Today</h4>
					</div>
					<div className="flex flex-row items-center justify-center w-full">
						{/* @ts-ignore Type issue */}
						<AnimatedTooltip items={people} />
					</div>
				</div>
			)}
			<div className="flex flex-col justify-between sm:gap-10 min-h-[75vh]">
				<div className="absolute top-35 sm:top-20 inset-0 flex items-center justify-center bg-opacity-100 z-20 mx-4">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
						<section className="prose prose-sm sm:prose-lg max-w-none mb-4">
							<h1>Welcome to Wordle with Friends</h1>
							<p>
								Wordle with Friends is a simple yet addictive word puzzle game with the same{" "}
								<a href="/info">rules</a> as the classic game Wordle.
							</p>
							<h3>How is Wordle with Friends different from Wordle?</h3>
							<ol>
								<li>
									You play alongside your mates in <b>real-time</b>. You know
									who to blame if you lose. 😜
								</li>
								<li>
									You have to guess a <b>{NUMBER_OF_LETTERS}</b> letter word
									within <b>{NUMBER_OF_TRIES}</b> guesses.
								</li>
							</ol>
							<p>Good luck and have fun!</p>
						</section>
						<div className="flex justify-center">
							<SignUpButton mode="modal" forceRedirectUrl={`/game`}>
								<button
									type="button"
									className="text-white shadow bg-black hover:bg-black/90 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
								>
									Sign In
								</button>
							</SignUpButton>
						</div>
					</div>
				</div>
				<Grid data={gameData.data} />
				{/* @ts-ignore FIXME: Its okay */}
				<Keyboard onKeyPress={() => null} usedKeys={usedKeys} disabled={true} />
			</div>
		</Page>
	);
};

export default Index;
