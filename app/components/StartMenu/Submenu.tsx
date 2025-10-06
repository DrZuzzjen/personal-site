'use client';

import { COLORS } from '@/app/lib/constants';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import StartMenuItem from './StartMenuItem';
import type { SubmenuProps } from './types';

export default function Submenu({
	type,
	onLaunchApp,
	onShowSettings,
	onClose,
}: SubmenuProps) {
	const { getItemByPath } = useFileSystemContext();

	const handleItemClick = (action: () => void) => {
		action();
		onClose();
	};

	// Helper function to get current file content from file system
	const getFileContent = (filePath: string): string => {
		const file = getItemByPath(filePath);
		return file && file.type === 'file' ? file.content || '' : '';
	};
	
	const renderProgramsSubmenu = () => (
		<>
			<StartMenuItem
				icon='🎨'
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
				icon='CMD'
				text='Terminal.exe'
				hasArrow={false}
				onHover={() => {}}
				onClick={() => handleItemClick(() => onLaunchApp('terminal'))}
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
				icon='📁'
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
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/Project_1.txt';
						const currentContent = getFileContent(filePath);
						onLaunchApp('notepad', {
							fileName: 'Project_1.txt',
							filePath: filePath,
							content: currentContent,
						});
					})
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_2.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/Project_2.txt';
						const currentContent = getFileContent(filePath);
						onLaunchApp('notepad', {
							fileName: 'Project_2.txt',
							filePath: filePath,
							content: currentContent,
						});
					})
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_3.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/Project_3.txt';
						const currentContent = getFileContent(filePath);
						onLaunchApp('notepad', {
							fileName: 'Project_3.txt',
							filePath: filePath,
							content: currentContent,
						});
					})
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_4.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/Project_4.txt';
						const currentContent = getFileContent(filePath);
						onLaunchApp('notepad', {
							fileName: 'Project_4.txt',
							filePath: filePath,
							content: currentContent,
						});
					})
				}
			/>
			<StartMenuItem
				icon='📄'
				text='Project_5.txt'
				hasArrow={false}
				onHover={() => {}}
				onClick={() =>
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/Project_5.txt';
						const currentContent = getFileContent(filePath);
						onLaunchApp('notepad', {
							fileName: 'Project_5.txt',
							filePath: filePath,
							content: currentContent,
						});
					})
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
					handleItemClick(() => {
						const filePath = '/C:/Users/Guest/Documents/About.txt';
						const currentContent =
							getFileContent(filePath) ||
							'Windows 3.1 Portfolio Prototype\n\nBuilt with Next.js and TypeScript\nMade by Steve (AI Assistant)\n\nFeatures:\n- Window Management\n- File System\n- Classic Applications\n- Boot Sequence\n- Easter Eggs';
						onLaunchApp('notepad', {
							fileName: 'About.txt',
							filePath: filePath,
							content: currentContent,
							readOnly: true,
						});
					})
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
