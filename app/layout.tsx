import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WindowProvider } from './lib/WindowContext';
import { FileSystemProvider } from './lib/FileSystemContext';
import StructuredData from './components/StructuredData';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Jean François Gutierrez | AI Engineer & DevRel - Interactive Portfolio',
	description: 'AI Engineer and Developer Relations professional. Explore my interactive Windows 3.1 portfolio featuring real projects: AI Narrator, LLM Arena, YouClip, and more. Built with Next.js and TypeScript.',
	keywords: ['AI Engineer', 'Developer Relations', 'DevRel', 'Machine Learning', 'LLM', 'Portfolio', 'Jean François Gutierrez', 'Software Engineer', 'Next.js', 'TypeScript', 'Windows 3.1', 'Interactive Portfolio'],
	authors: [{ name: 'Jean François Gutierrez', url: 'https://fran-ai.dev' }],
	creator: 'Jean François Gutierrez',
	publisher: 'Jean François Gutierrez',
	metadataBase: new URL('https://fran-ai.dev'),
	alternates: {
		canonical: 'https://fran-ai.dev',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://fran-ai.dev',
		title: 'Jean François Gutierrez | AI Engineer & DevRel',
		description: 'AI Engineer and Developer Relations professional. Explore my interactive Windows 3.1 portfolio featuring real AI/ML projects.',
		siteName: 'Jean François Gutierrez Portfolio',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Jean François Gutierrez - AI Engineer Portfolio',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Jean François Gutierrez | AI Engineer & DevRel',
		description: 'AI Engineer and Developer Relations professional. Explore my interactive Windows 3.1 portfolio.',
		creator: '@franzuzz',
		images: ['/og-image.png'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	verification: {
		google: 'your-google-verification-code', // Replace with actual code from Google Search Console
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<StructuredData />
				<WindowProvider>
					<FileSystemProvider>{children}</FileSystemProvider>
				</WindowProvider>
			</body>
		</html>
	);
}
