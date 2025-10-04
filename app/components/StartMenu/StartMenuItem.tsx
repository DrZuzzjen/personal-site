'use client';

import { useState } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { StartMenuItemProps } from './types';

export default function StartMenuItem({
	icon,
	text,
	hasArrow,
	onHover,
	onClick,
}: StartMenuItemProps) {
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseEnter = () => {
		setIsHovered(true);
		onHover();
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	const handleClick = () => {
		onClick();
	};

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				padding: '6px 12px',
				minHeight: 32,
				backgroundColor: isHovered ? COLORS.WIN_BLUE : 'transparent',
				color: isHovered ? COLORS.TEXT_WHITE : COLORS.TEXT_BLACK,
				cursor: 'pointer',
				userSelect: 'none',
			}}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<span
				style={{
					marginRight: 8,
					fontSize: 16,
					width: 20,
					textAlign: 'center',
				}}
			>
				{icon}
			</span>

			<span style={{ flex: 1 }}>{text}</span>

			{hasArrow && (
				<span
					style={{
						marginLeft: 8,
						fontSize: 12,
					}}
				>
					▶
				</span>
			)}
		</div>
	);
}
