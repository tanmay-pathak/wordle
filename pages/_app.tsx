import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'
import { ConvexReactClient } from 'convex/react'
import { Toaster } from 'react-hot-toast'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const convex = new ConvexReactClient(
	process.env.NEXT_PUBLIC_CONVEX_URL as string,
)

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ClerkProvider
			publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
		>
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					disableTransitionOnChange
				>
					<Toaster />
					<Component {...pageProps} />
				</ThemeProvider>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	)
}
