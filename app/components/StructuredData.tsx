'use client';

import Script from 'next/script';

export default function StructuredData() {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Jean François Gutierrez',
		url: 'https://fran-ai.dev',
		image: 'https://fran-ai.dev/og-image.png',
		sameAs: [
			'https://www.linkedin.com/in/jeanfrancoisgutierrez',
			'https://github.com/franzuzz',
			'https://twitter.com/franzuzz',
		],
		jobTitle: 'AI Engineer & Developer Relations',
		description:
			'AI Engineer and Developer Relations professional specializing in machine learning, LLMs, and developer tools.',
		knowsAbout: [
			'Artificial Intelligence',
			'Machine Learning',
			'Large Language Models',
			'Developer Relations',
			'Software Engineering',
			'Next.js',
			'TypeScript',
			'Python',
		],
		worksFor: {
			'@type': 'Organization',
			name: 'Independent',
		},
	};

	const websiteData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Jean François Gutierrez Portfolio',
		url: 'https://fran-ai.dev',
		description:
			'Interactive Windows 3.1 portfolio showcasing AI/ML projects and technical expertise',
		author: {
			'@type': 'Person',
			name: 'Jean François Gutierrez',
		},
	};

	const portfolioData = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: 'Windows 3.1 Interactive Portfolio',
		description:
			'A fully functional Windows 3.1 OS simulation showcasing real AI/ML projects including Real-Time AI Narrator, LLM Arena, YouClip, and more.',
		author: {
			'@type': 'Person',
			name: 'Jean François Gutierrez',
		},
		keywords:
			'AI, Machine Learning, Portfolio, Interactive, Windows 3.1, Next.js, TypeScript',
		programmingLanguage: ['TypeScript', 'Python'],
		url: 'https://fran-ai.dev',
	};

	return (
		<>
			<Script
				id='structured-data-person'
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<Script
				id='structured-data-website'
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
			/>
			<Script
				id='structured-data-portfolio'
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioData) }}
			/>
		</>
	);
}
