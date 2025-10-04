'use client';

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
	};

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
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