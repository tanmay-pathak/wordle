'use client'
import { Home, Trophy, User, Menu, X, LucideGamepad } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const Appbar = () => {
	const router = useRouter()
	const { user } = useUser()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const links = [
		{ label: 'Home', icon: <Home className='h-4 w-4' />, href: '/' },
		...(user
			? [
					{
						label: 'Game',
						icon: <LucideGamepad className='h-4 w-4' />,
						href: '/game',
					},
					{
						label: 'Hall of Fame',
						icon: <Trophy className='h-4 w-4' />,
						href: '/records',
					},
				]
			: []),
	]

	return (
		<div className='fixed top-0 left-0 z-30 w-full pt-safe'>
			<header className='border-b border-white/20 bg-brand-orange shadow-sm'>
				<div className='mx-auto flex h-16 sm:h-20 max-w-[--breakpoint-md] items-center justify-between px-4 sm:px-6'>
					<Link href='/' className='flex gap-2 items-center group'>
						<h1 className='font-bold text-xl sm:text-2xl text-white'>
							Wordle with Friends
						</h1>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex items-center space-x-4'>
						{links.map(({ label, href, icon }) => (
							<Button
								key={label}
								variant='ghost'
								size='sm'
								asChild
								className={`gap-2 text-white hover:bg-white/10 hover:text-white ${
									router.pathname === href ? 'bg-white/20' : ''
								}`}
							>
								<Link href={href}>
									{icon}
									<span>{label}</span>
								</Link>
							</Button>
						))}

						{user ? (
							<div className='text-white items-center flex'>
								<UserButton afterSignOutUrl='/' />
							</div>
						) : (
							<SignInButton mode='modal'>
								<Button
									size='sm'
									variant='ghost'
									className='gap-2 text-white hover:bg-white/10 hover:text-white'
								>
									<User className='h-4 w-4' />
									<span>Sign In</span>
								</Button>
							</SignInButton>
						)}
					</nav>

					{/* Mobile Navigation */}
					<div className='flex items-center md:hidden'>
						{user && (
							<div className='mr-2 text-white'>
								<UserButton afterSignOutUrl='/' />
							</div>
						)}

						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='text-white hover:bg-white/20 hover:text-white'
								>
									{mobileMenuOpen ? (
										<X className='h-5 w-5' />
									) : (
										<Menu className='h-5 w-5' />
									)}
								</Button>
							</SheetTrigger>
							<SheetContent side='top' className='pt-16 sm:pt-20'>
								<nav className='px-2 py-3'>
									<ul className='flex flex-col space-y-2'>
										{links.map(({ label, href, icon }) => (
											<li key={label}>
												<Button
													variant={
														router.pathname === href ? 'secondary' : 'ghost'
													}
													size='sm'
													asChild
													className='w-full justify-start gap-2'
													onClick={() => setMobileMenuOpen(false)}
												>
													<Link href={href}>
														{icon}
														<span>{label}</span>
													</Link>
												</Button>
											</li>
										))}
										{!user && (
											<li className='pt-3 border-t border-border mt-1'>
												<SignInButton mode='modal'>
													<Button size='sm' className='w-full gap-2'>
														<User className='h-4 w-4' />
														<span>Sign In</span>
													</Button>
												</SignInButton>
											</li>
										)}
									</ul>
								</nav>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</header>
		</div>
	)
}

export default Appbar
