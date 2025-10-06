'use client';
import React, { useState } from 'react';
import { PORTFOLIO_ITEMS, PortfolioItem } from '@/app/lib/portfolioData';

export default function Portfolio() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isGridView, setIsGridView] = useState(false);

	const currentItem = PORTFOLIO_ITEMS[currentIndex];

	const goNext = () => {
		setCurrentIndex((prev) => (prev + 1) % PORTFOLIO_ITEMS.length);
	};

	const goPrev = () => {
		setCurrentIndex((prev) =>
			prev === 0 ? PORTFOLIO_ITEMS.length - 1 : prev - 1
		);
	};

	const jumpTo = (index: number) => {
		setCurrentIndex(index);
		setIsGridView(false);
	};

	// Keyboard navigation
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
			if (e.key === 'g' || e.key === 'G') setIsGridView((prev) => !prev);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	if (isGridView) {
		return (
			<div className='h-full flex flex-col bg-[#C0C0C0]'>
				{/* Grid View Header */}
				<div className='h-10 bg-[#808080] flex items-center justify-between px-3 border-b-2 border-white'>
					<div className='flex items-center gap-2'>
						<button
							onClick={() => setIsGridView(false)}
							className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
						>
							◀ Back
						</button>
						<span className='text-white text-sm font-bold'>
							Grid View - All Projects
						</span>
					</div>
					<span className='text-white text-xs'>
						{PORTFOLIO_ITEMS.length} items
					</span>
				</div>

				{/* Grid */}
				<div className='flex-1 overflow-auto p-4'>
					<div className='grid grid-cols-3 gap-4'>
						{PORTFOLIO_ITEMS.map((item, index) => (
							<button
								key={item.id}
								onClick={() => jumpTo(index)}
								className='bg-white border-2 border-[#808080] hover:border-blue-500 p-2 text-left transition-all hover:shadow-lg'
							>
								<div className='aspect-video bg-[#000080] flex items-center justify-center text-white text-4xl mb-2'>
									{item.icon}
								</div>
								<div className='text-xs font-bold truncate'>{item.title}</div>
								<div className='text-xs text-gray-600 truncate'>
									{item.tagline}
								</div>
								<div className='text-xs text-gray-500 mt-1'>
									{item.type === 'project' && '💻 Project'}
									{item.type === 'achievement' && '🏆 Achievement'}
									{item.type === 'video' && '🎥 Video'}
									{item.type === 'talk' && '🎤 Talk'}
									{' • '}
									{item.year}
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full flex flex-col bg-[#C0C0C0]'>
			{/* Top Controls */}
			<div className='h-12 bg-[#808080] flex items-center justify-between px-3 border-b-2 border-white'>
				<div className='flex items-center gap-2'>
					<button
						onClick={goPrev}
						className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-sm'
						title='Previous (←)'
					>
						◀
					</button>
					<span className='text-white text-sm px-3 bg-[#000080] py-1 min-w-[60px] text-center'>
						{currentIndex + 1} / {PORTFOLIO_ITEMS.length}
					</span>
					<button
						onClick={goNext}
						className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-sm'
						title='Next (→)'
					>
						▶
					</button>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={() => setIsGridView(true)}
						className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
						title='Grid View (G)'
					>
						🔳 Grid
					</button>
					<span className='text-white text-xs'>
						{currentItem.icon} {currentItem.type.toUpperCase()}
					</span>
				</div>
			</div>

			{/* Main Display Area */}
			<div className='flex-1 overflow-auto p-4'>
				<div className='max-w-4xl mx-auto'>
					{/* Media Display */}
					<div className='bg-black border-4 border-[#808080] mb-4 aspect-video flex items-center justify-center'>
						<MediaViewer item={currentItem} />
					</div>

					{/* Info Panel */}
					<div className='bg-white border-2 border-[#808080] p-4'>
						{/* Title */}
						<div className='flex items-start justify-between mb-3'>
							<div>
								<h2 className='text-xl font-bold mb-1'>
									{currentItem.icon} {currentItem.title}
								</h2>
								<p className='text-sm text-gray-600 italic'>
									{currentItem.tagline}
								</p>
							</div>
							<span className='bg-[#000080] text-white px-2 py-1 text-xs'>
								{currentItem.year}
							</span>
						</div>

						{/* Description */}
						<p className='text-sm mb-3 leading-relaxed'>
							{currentItem.description}
						</p>

						{/* Tech Stack */}
						{currentItem.tech && currentItem.tech.length > 0 && (
							<div className='mb-3'>
								<div className='text-xs font-bold text-gray-600 mb-1'>
									🛠️ Tech Stack:
								</div>
								<div className='flex flex-wrap gap-1'>
									{currentItem.tech.map((tech) => (
										<span
											key={tech}
											className='bg-[#C0C0C0] border border-[#808080] px-2 py-0.5 text-xs'
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Impact */}
						{currentItem.impact && (
							<div className='mb-3'>
								<div className='text-xs font-bold text-gray-600 mb-1'>
									⚡ Impact:
								</div>
								<div className='bg-yellow-100 border border-yellow-400 px-2 py-1 text-sm'>
									{currentItem.impact}
								</div>
							</div>
						)}

						{/* Links */}
						{currentItem.links && (
							<div className='flex flex-wrap gap-2'>
								{currentItem.links.github && (
									<a
										href={currentItem.links.github}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										🔗 GitHub
									</a>
								)}
								{currentItem.links.demo && (
									<a
										href={currentItem.links.demo}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										▶ Live Demo
									</a>
								)}
								{currentItem.links.npm && (
									<a
										href={currentItem.links.npm}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										📦 NPM
									</a>
								)}
								{currentItem.links.video && (
									<a
										href={currentItem.links.video}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										📺 Full Video
									</a>
								)}
								{currentItem.links.docs && (
									<a
										href={currentItem.links.docs}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										📄 Docs
									</a>
								)}
								{currentItem.links.certificate && (
									<a
										href={currentItem.links.certificate}
										target='_blank'
										rel='noopener noreferrer'
										className='px-3 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white active:border-inset text-xs'
									>
										🏅 Certificate
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Thumbnail Strip */}
			<div className='h-24 bg-[#808080] border-t-2 border-white overflow-x-auto'>
				<div className='flex gap-2 p-2 h-full'>
					{PORTFOLIO_ITEMS.map((item, index) => (
						<button
							key={item.id}
							onClick={() => jumpTo(index)}
							className={`flex-shrink-0 w-28 h-full border-2 ${
								index === currentIndex
									? 'border-blue-500 bg-blue-100'
									: 'border-[#404040] bg-white hover:border-blue-300'
							} p-1 transition-all`}
							title={item.title}
						>
							<div className='h-full flex flex-col items-center justify-center'>
								<div className='text-2xl mb-1'>{item.icon}</div>
								<div className='text-[10px] font-bold truncate w-full text-center'>
									{item.title}
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

// Media Viewer Component
function MediaViewer({ item }: { item: PortfolioItem }) {
	if (item.media.type === 'youtube' && item.media.source) {
		return (
			<iframe
				className='w-full h-full'
				src={`https://www.youtube.com/embed/${item.media.source}`}
				title={item.title}
				allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
				allowFullScreen
			/>
		);
	}

	if (item.media.type === 'video' && item.media.source) {
		return (
			<video className='w-full h-full' controls>
				<source src={item.media.source} type='video/mp4' />
				Your browser does not support the video tag.
			</video>
		);
	}

	if (item.media.type === 'gif') {
		return (
			<img
				src={item.media.thumbnail}
				alt={item.title}
				className='w-full h-full object-contain'
			/>
		);
	}

	// Default: image or fallback
	return (
		<div className='w-full h-full flex items-center justify-center'>
			{item.media.thumbnail ? (
				<img
					src={item.media.thumbnail}
					alt={item.title}
					className='max-w-full max-h-full object-contain'
				/>
			) : (
				<div className='text-white text-6xl'>{item.icon}</div>
			)}
		</div>
	);
}
