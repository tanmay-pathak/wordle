import { Download, Info, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";

const Appbar = () => {
	const router = useRouter();
	const { user } = useUser();
	const links = [
		...(user
			? [{ label: "winner", icon: <Trophy />, href: "/past-winners" }]
			: []),
		{ label: "download", icon: <Download />, href: "/download" },
		{ label: "question", icon: <Info />, href: "/info" },
	];

	return (
		<div className="fixed top-0 left-0 z-30 w-full bg-zinc-900 pt-safe">
			<header className="border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto flex h-20 max-w-screen-md items-center justify-between px-6">
					<Link href="/">
						<h1 className="font-medium text-xl sm:text-2xl">
							Wordle with Friends
						</h1>
					</Link>

					<nav className="flex items-center space-x-6">
						{/* Hide here if dont need it for mobile */}
						<div className="">
							<div className="flex items-center space-x-6">
								{links.map(({ label, href, icon }) => (
									<Link
										key={label}
										href={href}
										className={`text-sm ${
											router.pathname === href
												? "text-indigo-500 dark:text-indigo-400"
												: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
										}`}
									>
										{icon}
									</Link>
								))}
							</div>
						</div>
						{user ? (
							<UserButton />
						) : (
							<SignInButton>
								<User className="size-7 rounded-full bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 cursor-pointer" />
							</SignInButton>
						)}
					</nav>
				</div>
			</header>
		</div>
	);
};

export default Appbar;
