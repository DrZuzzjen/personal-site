import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WindowProvider } from './lib/WindowContext';
import { FileSystemProvider } from './lib/FileSystemContext';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Windows 3.1 Portfolio',
	description: 'A fully functional Windows 3.1 OS simulation portfolio',
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
				<WindowProvider>
					<FileSystemProvider>{children}</FileSystemProvider>
				</WindowProvider>
			</body>
		</html>
	);
}
