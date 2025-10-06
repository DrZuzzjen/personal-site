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
			<div className='flex-1 overflow-auto p-3'>
				<div className='h-full flex flex-col'>
					{/* Media Display */}
					<div className='bg-black border-4 border-[#808080] mb-3 flex-shrink-0' style={{ height: '45%' }}>
						<MediaViewer item={currentItem} />
					</div>

					{/* Info Panel */}
					<div className='bg-[#C0C0C0] border-4 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 flex-1 overflow-auto'>
						{/* Title Bar */}
						<div className='bg-[#000080] text-white px-2 py-1 mb-2 flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<span className='text-lg'>{currentItem.icon}</span>
								<span className='font-bold text-sm'>{currentItem.title}</span>
							</div>
							<span className='text-xs bg-[#C0C0C0] text-black px-2 py-0.5'>
								{currentItem.year}
							</span>
						</div>

						{/* Tagline */}
						<div className='bg-white border-2 border-[#808080] p-2 mb-2'>
							<p className='text-xs italic text-gray-700'>
								{currentItem.tagline}
							</p>
						</div>

						{/* Description */}
						<div className='bg-white border-2 border-[#808080] p-2 mb-2'>
							<p className='text-xs leading-relaxed text-black'>
								{currentItem.description}
							</p>
						</div>

						{/* Tech Stack */}
						{currentItem.tech && currentItem.tech.length > 0 && (
							<div className='mb-2'>
								<div className='bg-[#808080] text-white px-2 py-0.5 text-xs font-bold mb-1'>
									🛠️ Tech Stack
								</div>
								<div className='bg-white border-2 border-[#808080] p-2'>
									<div className='flex flex-wrap gap-1'>
										{currentItem.tech.map((tech) => (
											<span
												key={tech}
												className='bg-[#000080] text-white px-2 py-0.5 text-[10px]'
											>
												{tech}
											</span>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Impact */}
						{currentItem.impact && (
							<div className='mb-2'>
								<div className='bg-[#808080] text-white px-2 py-0.5 text-xs font-bold mb-1'>
									⚡ Impact
								</div>
								<div className='bg-yellow-200 border-2 border-yellow-600 px-2 py-1 text-xs text-black font-bold'>
									{currentItem.impact}
								</div>
							</div>
						)}

						{/* Links */}
						{currentItem.links && (
							<div>
								<div className='bg-[#808080] text-white px-2 py-0.5 text-xs font-bold mb-1'>
									🔗 Links
								</div>
								<div className='bg-white border-2 border-[#808080] p-2 flex flex-wrap gap-1'>
									{currentItem.links.github && (
										<a
											href={currentItem.links.github}
											target='_blank'
											rel='noopener noreferrer'
											className='px-2 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white text-[10px] text-black'
										>
											GitHub
										</a>
									)}
									{currentItem.links.demo && (
										<a
											href={currentItem.links.demo}
											target='_blank'
											rel='noopener noreferrer'
											className='px-2 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white text-[10px] text-black'
										>
											Demo
										</a>
									)}
									{currentItem.links.linkedin && (
										<a
											href={currentItem.links.linkedin}
											target='_blank'
											rel='noopener noreferrer'
											className='px-2 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white text-[10px] text-black'
										>
											LinkedIn
										</a>
									)}
									{currentItem.links.huggingface && (
										<a
											href={currentItem.links.huggingface}
											target='_blank'
											rel='noopener noreferrer'
											className='px-2 py-1 bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] hover:border-t-[#404040] hover:border-l-[#404040] hover:border-r-white hover:border-b-white text-[10px] text-black'
										>
											HuggingFace
										</a>
									)}
								</div>
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
								<div className='text-[10px] font-bold truncate w-full text-center text-black'>
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
