import Head from "next/head";
import Appbar from "@/components/appbar";

interface Props {
	title?: string;
	children: React.ReactNode;
}

const Page = ({ title, children }: Props) => (
	<>
		{title ? (
			<Head>
				<title>Wordle with Friends | {title}</title>
			</Head>
		) : null}

		<Appbar />

		<main
			/**
			 * Padding top = `appbar` height
			 * Padding bottom = `bottom-nav` height
			 */
			className="mx-auto max-w-screen-md pt-20 px-safe sm:pb-0"
		>
			<div className="p-3">{children}</div>
		</main>
	</>
);

export default Page;
