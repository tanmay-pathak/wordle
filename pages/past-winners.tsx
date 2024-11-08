import Loading from "@/components/loading";
import Page from "@/components/page";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const PastWinners = () => {
	const winners = useQuery(api.winners.get);

	if (winners === undefined) {
		return <Loading />;
	}

	if (winners === null) {
		return <>No data found</>;
	}

	return (
		<Page>
			<section className="prose prose-sm sm:prose-lg max-w-none">
				<h1>Past Winners</h1>
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-gray-500 uppercase tracking-wider"
							>
								Date
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-gray-500 uppercase tracking-wider"
							>
								Players
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{winners.map((winner, index) => (
							<tr key={index}>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{winner.date}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex flex-wrap gap-1">
									{winner.players.map((player, index) => (
										<span key={index}>
											{player}
											{index < winner.players.length - 1 && ","}
										</span>
									))}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</Page>
	);
};

export default PastWinners;
