import { Html, Head, Main, NextScript } from 'next/document'

let title = 'Wordle with Friends'
let description =
	'Join your friends, climb the leaderboards, and conquer Wordle with Friends together!'
let url = 'https://wordle.tanmaypathak.com'
let ogimage = 'https://r2.tanmaypathak.com/wordle-og-image.jpg'
let sitename = 'wordle.tanmaypathak.com'
const icon = '/favicon.ico'

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<meta charSet='utf-8' />

				<meta property='title' content={title} />
				<meta property='description' content={description} />
				<meta property='og:title' content={title} />
				<meta property='og:description' content={description} />
				<meta property='og:image' content={ogimage} />
				<meta property='og:url' content={url} />
				<meta property='og:site_name' content={sitename} />
				<meta property='og:locale' content={'en_US'} />
				<meta property='og:type' content={'website'} />
				<meta property='icon' content={icon} />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={title} />
				<meta name='twitter:description' content={description} />
				<meta name='twitter:image' content={ogimage} />

				<link rel='icon' type='image/png' href='/images/favicon.png' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover, height=device-height'
				/>
				<meta
					name='theme-color'
					content='#18181b'
					media='(prefers-color-scheme: dark)'
				/>
				<meta name='theme-color' content='#f4f4f5' />
				<link rel='apple-touch-icon' href='/images/icon-maskable-512.png' />
				<link rel='manifest' href='/manifest.json' />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
