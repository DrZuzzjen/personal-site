'use client';
<<<<<<< HEAD

import React, { useState } from 'react';
import { COLORS } from '@/app/lib/constants';

export default function TV() {
	const [currentChannel, setCurrentChannel] = useState(1);
	const [isOn, setIsOn] = useState(true);

	const channels = [
		{ number: 1, name: 'Portfolio Channel', content: '📺 Welcome to the Windows 3.1 Portfolio Experience!' },
		{ number: 2, name: 'Tech News', content: '💻 Latest in retro computing and web development' },
		{ number: 3, name: 'Music Videos', content: '🎵 Classic 90s hits and synthwave' },
		{ number: 4, name: 'Demo Reel', content: '🎬 Project demonstrations and code walkthroughs' },
		{ number: 5, name: 'Static', content: '📻 [Static noise and interference]' },
	];

	const currentShow = channels.find(ch => ch.number === currentChannel) || channels[0];

	const changeChannel = (direction: 'up' | 'down') => {
		if (direction === 'up') {
			setCurrentChannel(prev => prev >= channels.length ? 1 : prev + 1);
		} else {
			setCurrentChannel(prev => prev <= 1 ? channels.length : prev - 1);
		}
=======
import { useState, useEffect, useRef } from 'react';
import { COLORS } from '@/app/lib/constants';

export default function TV() {
	const [currentVideo, setCurrentVideo] = useState(0);
	const [volume, setVolume] = useState(50);
	const [isChangingChannel, setIsChangingChannel] = useState(false);
	const [isPoweredOn, setIsPoweredOn] = useState(true);
	const [isPlaying, setIsPlaying] = useState(true);

	// Curated playlist of retro/nostalgic videos
	const playlistVideos = [
		'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
		'A_MjCqQoLLA', // Hey Ya! - Outkast
		'9bZkp7q19f0', // PSY - GANGNAM STYLE
		'hTWKbfoikeg', // Smash Mouth - All Star
		'L_jWHffIx5E', // Smash Mouth - All Star (but every word is somebody)
	];

	const nextChannel = () => {
		if (!isPoweredOn) return;

		setIsChangingChannel(true);
		setTimeout(() => {
			setCurrentVideo((prev) => (prev + 1) % playlistVideos.length);
			setIsChangingChannel(false);
		}, 500);
	};

	const prevChannel = () => {
		if (!isPoweredOn) return;

		setIsChangingChannel(true);
		setTimeout(() => {
			setCurrentVideo(
				(prev) => (prev - 1 + playlistVideos.length) % playlistVideos.length
			);
			setIsChangingChannel(false);
		}, 500);
	};

	const togglePower = () => {
		setIsPoweredOn(!isPoweredOn);
	};

	const togglePlayPause = () => {
		if (!isPoweredOn) return;
		setIsPlaying(!isPlaying);
	};

	// Wood grain style for the TV cabinet
	const woodStyle = {
		background: `
      linear-gradient(90deg,
        #5a3a1a 0%,
        #6b4423 25%,
        #5a3a1a 50%,
        #6b4423 75%,
        #5a3a1a 100%
      )
    `,
		backgroundSize: '100% 100%',
		boxShadow: `
      0 8px 16px rgba(0,0,0,0.4),
      inset 0 2px 4px rgba(255,255,255,0.1),
      inset 0 -2px 6px rgba(0,0,0,0.3)
    `,
		borderRadius: '12px',
		border: '4px solid #4a2f1a',
		padding: '40px',
		position: 'relative' as const,
	};

	// Screen bezel style
	const bezelStyle = {
		backgroundColor: '#1a1a1a',
		padding: '24px',
		borderRadius: '8px',
		boxShadow: `
      inset 0 0 30px rgba(0,0,0,0.9),
      inset 0 4px 8px rgba(0,0,0,0.8)
    `,
		border: '3px solid #0a0a0a',
		position: 'relative' as const,
	};

	// Control knob style
	const knobStyle = {
		width: '40px',
		height: '40px',
		borderRadius: '50%',
		background: `
      radial-gradient(circle at 30% 30%,
        #aaa,
        #666 40%,
        #333
      )
    `,
		border: '2px solid #444',
		boxShadow: `
      0 2px 4px rgba(0,0,0,0.5),
      inset 0 1px 2px rgba(255,255,255,0.3)
    `,
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '12px',
		fontWeight: 'bold',
		color: '#fff',
		userSelect: 'none' as const,
		transition: 'transform 0.1s ease',
	};

	const buttonStyle = {
		...knobStyle,
		width: '60px',
		borderRadius: '6px',
		fontSize: '10px',
		padding: '4px 8px',
	};

	// Generate the YouTube embed URL
	const generateVideoUrl = () => {
		const videoId = playlistVideos[currentVideo];
		const autoplay = isPoweredOn && isPlaying ? '1' : '0';
		return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1`;
>>>>>>> master
	};

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
<<<<<<< HEAD
				backgroundColor: COLORS.WIN_GRAY,
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'monospace',
			}}
		>
			{/* TV Header */}
			<div
				style={{
					backgroundColor: COLORS.WIN_BLACK,
					color: COLORS.TEXT_WHITE,
					padding: '8px 12px',
					fontSize: '14px',
					fontWeight: 'bold',
					borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
				}}
			>
				📺 Retro TV - Channel {currentChannel}: {currentShow.name}
			</div>

			{/* TV Screen */}
			<div
				style={{
					flex: 1,
					backgroundColor: isOn ? '#001122' : '#000000',
					margin: '12px',
					border: `4px solid ${COLORS.WIN_BLACK}`,
					borderRadius: '8px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{isOn ? (
					<div
						style={{
							color: '#00ff00',
							fontSize: '18px',
							textAlign: 'center',
							padding: '20px',
							textShadow: '0 0 10px #00ff00',
							fontFamily: 'monospace',
						}}
					>
						{currentShow.content}
						<div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
							Use the remote control below to change channels
						</div>
					</div>
				) : (
					<div style={{ color: '#333', fontSize: '24px' }}>
						📺 [TV is OFF]
					</div>
				)}
			</div>

			{/* Remote Control */}
			<div
				style={{
					backgroundColor: COLORS.WIN_GRAY,
					padding: '12px',
					borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
					display: 'flex',
					justifyContent: 'center',
					gap: '8px',
					flexWrap: 'wrap',
				}}
			>
				<button
					onClick={() => setIsOn(!isOn)}
					style={{
						padding: '6px 12px',
						backgroundColor: isOn ? '#ff4444' : '#44ff44',
						color: COLORS.TEXT_WHITE,
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontWeight: 'bold',
					}}
				>
					{isOn ? '⏻ OFF' : '⏻ ON'}
				</button>
				
				<button
					onClick={() => changeChannel('down')}
					disabled={!isOn}
					style={{
						padding: '6px 12px',
						backgroundColor: isOn ? COLORS.WIN_BLUE : COLORS.BORDER_SHADOW,
						color: COLORS.TEXT_WHITE,
						border: 'none',
						borderRadius: '4px',
						cursor: isOn ? 'pointer' : 'not-allowed',
					}}
				>
					CH ▼
				</button>
				
				<button
					onClick={() => changeChannel('up')}
					disabled={!isOn}
					style={{
						padding: '6px 12px',
						backgroundColor: isOn ? COLORS.WIN_BLUE : COLORS.BORDER_SHADOW,
						color: COLORS.TEXT_WHITE,
						border: 'none',
						borderRadius: '4px',
						cursor: isOn ? 'pointer' : 'not-allowed',
					}}
				>
					CH ▲
				</button>

				{channels.map(channel => (
					<button
						key={channel.number}
						onClick={() => setCurrentChannel(channel.number)}
						disabled={!isOn}
						style={{
							padding: '4px 8px',
							backgroundColor: 
								currentChannel === channel.number 
									? COLORS.WIN_BLUE_LIGHT 
									: isOn ? COLORS.WIN_GRAY : COLORS.BORDER_SHADOW,
							color: COLORS.TEXT_BLACK,
							border: `1px solid ${COLORS.BORDER_SHADOW}`,
							borderRadius: '3px',
							cursor: isOn ? 'pointer' : 'not-allowed',
							fontSize: '12px',
						}}
					>
						{channel.number}
					</button>
				))}
			</div>
		</div>
	);
}
=======
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: COLORS.WIN_GRAY,
				padding: '20px',
				overflow: 'hidden',
			}}
		>
			<div style={woodStyle}>
				{/* Rabbit Ear Antenna */}
				<div
					style={{
						position: 'absolute',
						top: -50,
						left: '50%',
						transform: 'translateX(-50%)',
						display: 'flex',
						gap: '100px',
						zIndex: 10,
					}}
				>
					{/* Left antenna */}
					<div
						style={{
							width: '3px',
							height: '70px',
							background: 'linear-gradient(to bottom, #999, #666)',
							transform: 'rotate(-20deg)',
							transformOrigin: 'bottom',
							borderRadius: '2px',
							boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: -6,
								left: -3,
								width: '8px',
								height: '8px',
								borderRadius: '50%',
								background: 'radial-gradient(circle at 30% 30%, #bbb, #666)',
							}}
						/>
					</div>

					{/* Right antenna */}
					<div
						style={{
							width: '3px',
							height: '70px',
							background: 'linear-gradient(to bottom, #999, #666)',
							transform: 'rotate(20deg)',
							transformOrigin: 'bottom',
							borderRadius: '2px',
							boxShadow: '-2px 0 4px rgba(0,0,0,0.3)',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: -6,
								left: -3,
								width: '8px',
								height: '8px',
								borderRadius: '50%',
								background: 'radial-gradient(circle at 30% 30%, #bbb, #666)',
							}}
						/>
					</div>
				</div>

				{/* Screen Bezel */}
				<div style={bezelStyle}>
					{/* Screen Content */}
					<div
						style={{
							width: '640px',
							height: '480px',
							position: 'relative',
							borderRadius: '4px',
							overflow: 'hidden',
							backgroundColor: '#000',
						}}
					>
						{isPoweredOn ? (
							<>
								{isChangingChannel ? (
									/* Static Noise */
									<div
										style={{
											position: 'absolute',
											inset: 0,
											background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(255,255,255,0.1) 2px,
                        rgba(255,255,255,0.1) 4px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(255,255,255,0.05) 2px,
                        rgba(255,255,255,0.05) 4px
                      ),
                      radial-gradient(circle, #333 0%, #000 100%)
                    `,
											animation: 'staticNoise 0.1s infinite',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: 'white',
											fontFamily: 'monospace',
											fontSize: '24px',
											textAlign: 'center',
										}}
									>
										<div>
											📺
											<br />
											CHANGING CHANNEL...
										</div>
									</div>
								) : (
									/* YouTube Video */
									<iframe
										width='640'
										height='480'
										src={generateVideoUrl()}
										title='Retro TV'
										frameBorder='0'
										allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
										allowFullScreen
										style={{
											border: 'none',
											filter: 'contrast(1.2) saturate(0.9) sepia(0.1)',
										}}
									/>
								)}

								{/* CRT Scan Lines Overlay */}
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(0,0,0,0.1) 2px,
                      rgba(0,0,0,0.1) 4px
                    )
                  `,
										pointerEvents: 'none',
									}}
								/>
							</>
						) : (
							/* Power Off Screen */
							<div
								style={{
									position: 'absolute',
									inset: 0,
									backgroundColor: '#000',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#333',
									fontSize: '48px',
								}}
							>
								⚫
							</div>
						)}
					</div>
				</div>

				{/* Control Panel */}
				<div
					style={{
						marginTop: '30px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: '20px',
					}}
				>
					{/* Volume Control */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
						}}
					>
						<span
							style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
						>
							🔊 VOL
						</span>
						<button
							onClick={() => setVolume((v) => Math.max(0, v - 10))}
							style={{
								...knobStyle,
								width: '30px',
								height: '30px',
								fontSize: '16px',
							}}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform = 'scale(0.95)')
							}
							onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
						>
							◄
						</button>
						<div
							style={{
								width: '120px',
								height: '8px',
								backgroundColor: '#333',
								borderRadius: '4px',
								position: 'relative',
								border: '1px solid #666',
							}}
						>
							<div
								style={{
									width: `${volume}%`,
									height: '100%',
									backgroundColor: '#4a9eff',
									borderRadius: '4px',
									background: 'linear-gradient(90deg, #4a9eff, #66b3ff)',
								}}
							/>
						</div>
						<button
							onClick={() => setVolume((v) => Math.min(100, v + 10))}
							style={{
								...knobStyle,
								width: '30px',
								height: '30px',
								fontSize: '16px',
							}}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform = 'scale(0.95)')
							}
							onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
						>
							►
						</button>
						<span style={{ color: '#fff', fontSize: '12px', minWidth: '35px' }}>
							{volume}%
						</span>
					</div>

					{/* Channel Control */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
						}}
					>
						<span
							style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
						>
							📺 CH
						</span>
						<button
							onClick={prevChannel}
							style={{
								...knobStyle,
								width: '30px',
								height: '30px',
								fontSize: '16px',
							}}
							disabled={!isPoweredOn}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform = 'scale(0.95)')
							}
							onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
						>
							◄
						</button>
						<div
							style={{
								color: '#fff',
								fontSize: '18px',
								fontWeight: 'bold',
								minWidth: '40px',
								textAlign: 'center',
								fontFamily: 'monospace',
								backgroundColor: '#000',
								padding: '4px 8px',
								borderRadius: '4px',
								border: '2px inset #666',
							}}
						>
							{isPoweredOn ? String(currentVideo + 1).padStart(2, '0') : '--'}
						</div>
						<button
							onClick={nextChannel}
							style={{
								...knobStyle,
								width: '30px',
								height: '30px',
								fontSize: '16px',
							}}
							disabled={!isPoweredOn}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform = 'scale(0.95)')
							}
							onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
						>
							►
						</button>
					</div>
				</div>

				{/* Power and Control Buttons */}
				<div
					style={{
						marginTop: '20px',
						display: 'flex',
						justifyContent: 'center',
						gap: '20px',
					}}
				>
					<button
						onClick={togglePower}
						style={{
							...buttonStyle,
							backgroundColor: isPoweredOn ? '#ff4444' : '#444',
							color: isPoweredOn ? '#fff' : '#999',
						}}
						onMouseDown={(e) =>
							(e.currentTarget.style.transform = 'scale(0.95)')
						}
						onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
					>
						🔌 POWER
					</button>
					<button
						onClick={togglePlayPause}
						style={{
							...buttonStyle,
							opacity: isPoweredOn ? 1 : 0.5,
						}}
						disabled={!isPoweredOn}
						onMouseDown={(e) =>
							(e.currentTarget.style.transform = 'scale(0.95)')
						}
						onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
					>
						{isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}
					</button>
				</div>

				{/* Status Bar */}
				<div
					style={{
						marginTop: '15px',
						padding: '8px 12px',
						backgroundColor: '#000',
						borderRadius: '4px',
						border: '2px inset #666',
						color: '#4a9eff',
						fontSize: '12px',
						fontFamily: 'monospace',
						textAlign: 'center',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
						whiteSpace: 'nowrap',
					}}
				>
					{isPoweredOn
						? isChangingChannel
							? 'SCANNING CHANNELS...'
							: `Now Playing: Channel ${currentVideo + 1} • ${getVideoTitle(
									currentVideo
							  )}`
						: 'POWER OFF'}
				</div>
			</div>

			<style jsx>{`
				@keyframes staticNoise {
					0% {
						opacity: 0.8;
					}
					25% {
						opacity: 0.9;
					}
					50% {
						opacity: 0.7;
					}
					75% {
						opacity: 0.95;
					}
					100% {
						opacity: 0.8;
					}
				}
			`}</style>
		</div>
	);

	function getVideoTitle(index: number): string {
		const titles = [
			'Rick Astley - Never Gonna Give You Up',
			'Hey Ya! - Outkast',
			'PSY - GANGNAM STYLE',
			'Smash Mouth - All Star',
			'Smash Mouth - All Star (Somebody)',
		];
		return titles[index] || `Video ${index + 1}`;
	}
}
>>>>>>> master
