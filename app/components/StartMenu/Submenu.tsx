'use client';

import { COLORS } from '@/app/lib/constants';
import StartMenuItem from './StartMenuItem';
import type { SubmenuProps } from './types';

export default function Submenu({
	type,
	onLaunchApp,
	onShowSettings,
	onClose,
}: SubmenuProps) {
	const handleItemClick = (action: () => void) => {
		action();
		onClose();
	};

	const renderProgramsSubmenu = () => (
		<>
			<StartMenuItem
				icon='🖼️'
				text='Paint.exe'
				hasArrow={false}
				onHover={() => {}}
				onClick={() => handleItemClick(() => onLaunchApp('paint'))}
			/>
			<StartMenuItem
				icon='💣'
				text='Minesweeper.exe'
				hasArrow={false}
				onHover={() => {}}
				onClick={() => handleItemClick(() => onLaunchApp('minesweeper'))}
			/>
			<StartMenuItem
				icon='📝'
				text='Notepad.exe'
				hasArrow={false}
				onHover={() => {}}
				onClick={() => handleItemClick(() => onLaunchApp('notepad'))}
			/>
			<StartMenuItem
				icon='🖥️'
				text='My Computer'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() => onLaunchApp('file-explorer', { path: '/' }))
				}
			/>
			<StartMenuItem
				icon='🗂️'
				text='File Explorer'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('file-explorer', { path: '/My Documents' })
					)
				}
			/>
		</>
	);

	const renderDocumentsSubmenu = () => (
		<>
			<StartMenuItem
				icon='📁'
				text='My Documents'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('file-explorer', { path: '/My Documents' })
					)
				}
			/>
			<div
				style={{
					height: 1,
					margin: '4px 0',
					borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
				}}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_1.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', { 
							fileName: 'Project_1.txt',
							filePath: '/My Computer/My Documents/Project_1.txt',
							content: `Project Name: [Your Project]
Tech Stack: Next.js, TypeScript, Tailwind
GitHub: [repo-url]

Description:
[Your project description here]

Key Features:
- Feature 1
- Feature 2
- Feature 3`
						})
					)
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_2.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', { 
							fileName: 'Project_2.txt',
							filePath: '/My Computer/My Documents/Project_2.txt',
							content: 'Project 2 details... (to be filled in Phase 6)'
						})
					)
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_3.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', { 
							fileName: 'Project_3.txt',
							filePath: '/My Computer/My Documents/Project_3.txt',
							content: 'Project 3 details... (to be filled in Phase 6)'
						})
					)
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_4.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', { 
							fileName: 'Project_4.txt',
							filePath: '/My Computer/My Documents/Project_4.txt',
							content: 'Project 4 details... (to be filled in Phase 6)'
						})
					)
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_5.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', { 
							fileName: 'Project_5.txt',
							filePath: '/My Computer/My Documents/Project_5.txt',
							content: 'Project 5 details... (to be filled in Phase 6)'
						})
					)
				}
			/>
			<div
				style={{
					height: 1,
					margin: '4px 0',
					borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
				}}
			/>
			<StartMenuItem
				icon='📋'
				text='About.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						onLaunchApp('notepad', {
							fileName: 'About.txt',
							filePath: '/My Computer/My Documents/About.txt',
							content: 'Windows 3.1 Portfolio Prototype\n\nBuilt with Next.js and TypeScript\nMade by Steve (AI Assistant)\n\nFeatures:\n- Window Management\n- File System\n- Classic Applications\n- Boot Sequence\n- Easter Eggs',
							readOnly: true,
						})
					)
				}
			/>
		</>
	);

	const renderSettingsSubmenu = () => (
		<>
			<StartMenuItem
				icon='🎨'
				text='Change Background Color'
				hasArrow={false}
				onHover={() => {}}
				onClick={() => handleItemClick(onShowSettings)}
			/>
			<StartMenuItem
				icon='🔊'
				text='Sound'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						alert('Sound settings not available in this version.')
					)
				}
			/>
			<StartMenuItem
				icon='🖥️'
				text='Display'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() =>
						alert('Display settings not available in this version.')
					)
				}
			/>
		</>
	);

	const getSubmenuContent = () => {
		switch (type) {
			case 'programs':
				return renderProgramsSubmenu();
			case 'documents':
				return renderDocumentsSubmenu();
			case 'settings':
				return renderSettingsSubmenu();
			default:
				return null;
		}
	};

	return (
		<div
			style={{
				position: 'absolute',
				left: '100%',
				top: 0,
				width: 180,
				backgroundColor: COLORS.WIN_GRAY,
				border: `2px solid ${COLORS.BORDER_LIGHT}`,
				borderTopColor: COLORS.BORDER_HIGHLIGHT,
				borderLeftColor: COLORS.BORDER_HIGHLIGHT,
				borderBottomColor: COLORS.BORDER_DARK,
				borderRightColor: COLORS.BORDER_DARK,
				boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
				fontFamily: 'MS Sans Serif, sans-serif',
				fontSize: 14,
			}}
		>
			{getSubmenuContent()}
		</div>
	);
}
