import Page from "@/components/page";
import { NUMBER_OF_LETTERS, NUMBER_OF_TRIES } from "@/convex/constants";

const Info = () => {
	return (
		<Page>
			<section className="prose prose-sm sm:prose-lg max-w-none">
				<h1>How to Play tudle</h1>
				<p>
					The objective is to guess a hidden {NUMBER_OF_LETTERS}-letter word
					within {NUMBER_OF_TRIES} attempts. Here are the rules:
				</p>
				<ol>
					<li>
						Each guess must be a valid {NUMBER_OF_LETTERS}-letter word. Hit the
						enter button to submit.
					</li>
					<li>
						After each guess, the color of the tiles will change to show how
						close your guess was to the word.
					</li>
				</ol>
				<h2 className="text-xl font-semibold mb-2">Tile Colors</h2>
				<ul className="list-disc list-inside mb-4">
					<li>
						<span className="font-bold">Green:</span> The letter is in the word
						and in the correct spot.
					</li>
					<li>
						<span className="font-bold">Yellow:</span> The letter is in the word
						but in the wrong spot.
					</li>
					<li>
						<span className="font-bold">Gray:</span> The letter is not in the
						word in any spot.
					</li>
				</ul>
				<p>
					You have {NUMBER_OF_TRIES} attempts to guess the correct word. Use the
					feedback from the tile colors to make your next guess. Good luck and
					have fun!
				</p>
				<p>
					While you are here, checkout my other{" "}
					<a href="https://dub.sh/tanmay-portfolio">projects</a>.
				</p>
			</section>
		</Page>
	);
};

export default Info;
