'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemContext } from '../../../lib/FileSystemContext';
import { useWindowContext } from '../../../lib/WindowContext';
import { getBrowserContext } from '../../../lib/personality';
import type { AppType, Window as WindowType } from '../../../lib/types';
import type { Action } from '@/app/lib/ai/agents/casual-agent';

// MSN Messenger color scheme
const MSN_COLORS = {
	HEADER_GRADIENT_START: '#4e9cdb',
	HEADER_GRADIENT_END: '#2e7cbb',
	BACKGROUND: '#ffffff',
	USER_BUBBLE: '#e5f2ff', // Light blue
	BOT_BUBBLE: '#d4f4dd', // Light green
	TEXT: '#000000',
	TEXT_META: '#666666', // Timestamps
	ONLINE_GREEN: '#7ea04d',
	BUTTON_HOVER: '#ffcc00',
};

// Classic MSN Emoticons
const MSN_EMOTICONS: Record<string, string> = {
	':)': '🙂',
	':(': '🙁',
	':D': '😃',
	':P': '😛',
	';)': '😉',
	':O': '😮',
	'(Y)': '👍', // Thumbs up
	'(N)': '👎', // Thumbs down
	'<3': '❤️',
	'8)': '😎',
	":'(": '😢',
	'>:(': '😠',
};

interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	delivered?: boolean;
}

interface ChatbotProps {
	windowId?: string; // Window ID to check minimized state and trigger notifications
}

const parseEmoticons = (text: string): string => {
	let parsed = text;
	Object.entries(MSN_EMOTICONS).forEach(([code, emoji]) => {
		// Use word boundaries to avoid replacing parts of words
		const regex = new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
		parsed = parsed.replace(regex, emoji);
	});
	return parsed;
};

// MSN Sounds
const MSN_SOUNDS = {
	messageReceived: '/sounds/type.mp3', // Typing sound for AI messages
	messageSent: '/sounds/msn-send.mp3',
	nudge: '/sounds/msn-nudge.mp3',
	userOnline: '/sounds/msn-online.mp3',
};

const playSound = (soundKey: keyof typeof MSN_SOUNDS) => {
	try {
		const audio = new Audio(MSN_SOUNDS[soundKey]);
		audio.volume = 0.3;
		audio.play().catch(() => {
			// Ignore if sound fails (user hasn't interacted yet)
		});
	} catch (error) {
		// Sound files don't exist - ignore silently
	}
};

// Helper: Get window configuration for opening apps
const getAppConfig = (
	appName: string
): Omit<WindowType, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'> | null => {
	const configs: Record<
		string,
		Omit<WindowType, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>
	> = {
		paint: {
			title: 'Paint.exe',
			appType: 'paint',
			position: { x: 100, y: 100 },
			size: { width: 520, height: 420 },
			icon: 'PT',
			content: {},
		},
		minesweeper: {
			title: 'Minesweeper.exe',
			appType: 'minesweeper',
			position: { x: 120, y: 120 },
			size: { width: 360, height: 320 },
			icon: 'MS',
			content: {
				rows: 9,
				cols: 9,
				mines: 10,
				difficulty: 'beginner',
				firstClickSafe: true,
			},
		},
		snake: {
			title: 'Snake.exe',
			appType: 'snake',
			position: { x: 140, y: 140 },
			size: { width: 860, height: 600 },
			icon: 'SN',
			content: {},
		},
		notepad: {
			title: 'Notepad',
			appType: 'notepad',
			position: { x: 160, y: 160 },
			size: { width: 480, height: 320 },
			icon: 'NP',
			content: {
				filePath: null,
				fileName: 'Untitled.txt',
				body: '',
				readOnly: false,
			},
		},
		camera: {
			title: 'Camera',
			appType: 'camera',
			position: { x: 180, y: 180 },
			size: { width: 720, height: 580 },
			icon: 'CM',
			content: { isActive: false, hasPermission: false, error: null },
		},
		tv: {
			title: 'TV.exe',
			appType: 'tv',
			position: { x: 200, y: 200 },
			size: { width: 800, height: 600 },
			icon: 'TV',
			content: {},
		},
		browser: {
			title: 'Browser',
			appType: 'browser',
			position: { x: 220, y: 220 },
			size: { width: 900, height: 650 },
			icon: 'BR',
			content: { url: 'https://infobae.com/' },
		},
		mycomputer: {
			title: 'My Computer',
			appType: 'mycomputer',
			position: { x: 240, y: 240 },
			size: { width: 700, height: 500 },
			icon: 'MC',
			content: { path: '/My Computer' },
		},
		explorer: {
			title: 'File Explorer',
			appType: 'explorer',
			position: { x: 260, y: 260 },
			size: { width: 700, height: 500 },
			icon: 'EX',
			content: { path: '/C:/Users/Guest' },
		},
		chatbot: {
			title: 'MSN Messenger',
			appType: 'chatbot',
			position: { x: 280, y: 280 },
			size: { width: 600, height: 500 },
			icon: 'MSN',
			content: {},
		},
		portfolio: {
			title: 'Portfolio Media Center',
			appType: 'portfolio',
			position: { x: 300, y: 300 },
			size: { width: 900, height: 700 },
			icon: 'PF',
			content: {},
		},
		terminal: {
			title: 'Terminal',
			appType: 'terminal',
			position: { x: 320, y: 320 },
			size: { width: 800, height: 600 },
			icon: 'TRM',
			content: {},
		},
	};

	return configs[appName] || null;
};

export default function Chatbot({ windowId }: ChatbotProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [isSending, setIsSending] = useState(false); // Prevent duplicate sends
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const flashingTimerRef = useRef<NodeJS.Timeout | null>(null);
	const proactiveMessageSentRef = useRef<boolean>(false); // Track if we already sent proactive message
	const hasSentContextRef = useRef<boolean>(false);
	const lastNotifiedMessageIdRef = useRef<string | null>(null); // Track last message we notified about

	const { rootItems } = useFileSystemContext();
	const { windows, setWindowFlashing, openWindow, closeWindow } =
		useWindowContext();

	// Load chat history from localStorage OR generate personalized welcome
	useEffect(() => {
		const saved = localStorage.getItem('chatbot-history');
		if (saved) {
			try {
				const parsedMessages = JSON.parse(saved).map((msg: any) => ({
					...msg,
					timestamp: new Date(msg.timestamp),
				}));
				setMessages(parsedMessages);
				console.log(
					'[Chatbot] Restored messages from localStorage:',
					parsedMessages.length
				);
			} catch (error) {
				console.error('Error loading chat history:', error);
			}
		} else {
			// Generate LLM-powered personalized welcome message
			generateWelcomeMessage();
		}
	}, []);

	const generateWelcomeMessage = async () => {
		setIsTyping(true);

		try {
			const browserContext = getBrowserContext();

			const response = await fetch('/api/chat/welcome', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ browserContext }),
			});

			if (!response.ok) {
				throw new Error('Welcome API failed');
			}

			const data = await response.json();

			const welcomeMessage: Message = {
				id: 'welcome',
				role: 'assistant',
				content: data.message,
				timestamp: new Date(),
			};

			setMessages([welcomeMessage]);
			playSound('messageReceived');
		} catch (error) {
			console.error('Error generating welcome:', error);
			// Fallback welcome message
			const fallbackWelcome: Message = {
				id: 'welcome',
				role: 'assistant',
				content: "hey! :)\nwhat's up?",
				timestamp: new Date(),
			};
			setMessages([fallbackWelcome]);
		} finally {
			setIsTyping(false);
		}
	};

	// Save to localStorage when messages change
	useEffect(() => {
		if (messages.length > 0) {
			localStorage.setItem('chatbot-history', JSON.stringify(messages));
			console.log(
				'[Chatbot] Persisted messages to localStorage:',
				messages.length
			);
		}
	}, [messages]);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isTyping]);

	// Cleanup flashing timer on unmount
	useEffect(() => {
		return () => {
			if (flashingTimerRef.current) {
				clearTimeout(flashingTimerRef.current);
			}
		};
	}, []);

	// Watch for new assistant messages and trigger notification if minimized
	useEffect(() => {
		if (!windowId || messages.length === 0) return;

		const lastMessage = messages[messages.length - 1];

		// Only check for assistant messages (skip welcome message with id 'welcome')
		if (lastMessage.role !== 'assistant' || lastMessage.id === 'welcome')
			return;

		// Skip if we already notified about this message
		if (lastNotifiedMessageIdRef.current === lastMessage.id) {
			return;
		}

		// Check if window is minimized
		const currentWindow = windows.find((w) => w.id === windowId);
		const isMinimized = currentWindow?.isMinimized ?? false;

		if (isMinimized) {
			lastNotifiedMessageIdRef.current = lastMessage.id; // Mark as notified
			setWindowFlashing(windowId, true);

			// Stop flashing after 10 seconds
			if (flashingTimerRef.current) {
				clearTimeout(flashingTimerRef.current);
			}
			flashingTimerRef.current = setTimeout(() => {
				setWindowFlashing(windowId, false);
			}, 10000);
		}
	}, [messages, windows, windowId, setWindowFlashing]);

	// Proactive message timer - sends message after random delay if minimized
	useEffect(() => {
		if (!windowId) return;

		const currentWindow = windows.find((w) => w.id === windowId);
		const isMinimized = currentWindow?.isMinimized ?? false;

		// Reset proactive flag when window is restored
		if (!isMinimized && proactiveMessageSentRef.current) {
			proactiveMessageSentRef.current = false;
		}

		// Only start timer if:
		// 1. Window is minimized
		// 2. We have at least welcome message
		// 3. Haven't sent proactive message yet this session
		if (
			!isMinimized ||
			messages.length === 0 ||
			proactiveMessageSentRef.current
		)
			return;

		// Random delay between 25-60 seconds (testing: 10-15s)
		const randomDelay = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;

		const timer = setTimeout(async () => {
			// Double-check still minimized
			const currentWindow = windows.find((w) => w.id === windowId);
			if (currentWindow?.isMinimized) {
				proactiveMessageSentRef.current = true; // Mark as sent

				// Find currently active (focused) window
				const focusedWindow = windows
					.filter((w) => !w.isMinimized && w.id !== windowId)
					.sort((a, b) => b.zIndex - a.zIndex)[0];

				const currentApp = focusedWindow?.appType || null;

				try {
					// Call proactive message API
					const browserContext = getBrowserContext();
					const conversationHistory = messages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					}));

					const response = await fetch('/api/chat/proactive', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							browserContext,
							conversationHistory,
							currentApp,
						}),
					});

					const data = await response.json();
					addMessage({
						role: 'assistant',
						content: data.message || 'hey! :)\nstill there?',
					});
				} catch (error) {
					console.error('Proactive message error:', error);
					// Fallback message
					addMessage({
						role: 'assistant',
						content: 'hey! :)\nstill there?',
					});
				}
			}
		}, randomDelay);

		return () => clearTimeout(timer);
	}, [windows, windowId, messages.length]);

	// Auto-focus input when window is active (not minimized)
	useEffect(() => {
		if (!windowId) return;

		const currentWindow = windows.find((w) => w.id === windowId);
		const isMinimized = currentWindow?.isMinimized ?? false;

		// If window is NOT minimized and NOT typing, focus the input
		if (!isMinimized && !isTyping) {
			// Small delay to ensure DOM is ready
			const focusTimer = setTimeout(() => {
				inputRef.current?.focus();
			}, 50);

			return () => clearTimeout(focusTimer);
		}
	}, [windows, windowId, isTyping, messages.length]); // Re-run when messages change (after bot responds)

	// Build portfolio context for AI
	const getPortfolioContext = () => {
		const myComputerItem = rootItems.find(
			(item) => item.path === '/My Computer'
		);
		const myDocuments = myComputerItem?.children?.find(
			(item) => item.name === 'My Documents'
		);
		const aboutFile = myComputerItem?.children?.find(
			(item) => item.name === 'About.txt'
		);

		const projects =
			myDocuments?.children?.map((file) => ({
				name: file.name,
				content: file.content?.substring(0, 200), // First 200 chars
			})) || [];

		return {
			about: aboutFile?.content || 'Portfolio information not available',
			projects: projects,
		};
	};

	const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
		const newMessage: Message = {
			...message,
			id: `msg-${Date.now()}-${Math.random()}`,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, newMessage]);

		// Play sounds (notification handled by useEffect watcher)
		if (message.role === 'assistant') {
			playSound('messageReceived');
		} else if (message.role === 'user') {
			playSound('messageSent');

			// Reset proactive message flag when user responds (allows new proactive message later)
			proactiveMessageSentRef.current = false;

			// Stop flashing when user sends a message (window is active)
			if (windowId) {
				setWindowFlashing(windowId, false);
				if (flashingTimerRef.current) {
					clearTimeout(flashingTimerRef.current);
					flashingTimerRef.current = null;
				}
			}
		}
	};

	const sendMessage = async (userMessage: string) => {
		if (!userMessage.trim()) return;

		// Prevent duplicate sends
		if (isSending) {
			console.warn(
				'[Chatbot] Message send already in progress, ignoring duplicate'
			);
			return;
		}

		setIsSending(true);

		try {
			// Add user message immediately
			addMessage({ role: 'user', content: userMessage });
			setInputValue('');
			setIsTyping(true);

			// Keep input focused for smooth workflow
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);

			// Build context-enriched message history
			const context = getPortfolioContext();
			const contextMessage = {
				role: 'system' as const,
				content: `Current portfolio context:
About: ${context.about.substring(0, 300)}
Available projects: ${context.projects.map((p) => p.name).join(', ')}
Project details: ${context.projects
					.map((p) => `${p.name}: ${p.content}`)
					.join(' | ')}`,
			};

			const conversationHistory = [
				...messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				{ role: 'user' as const, content: userMessage },
			];

			if (!hasSentContextRef.current) {
				conversationHistory.unshift(contextMessage);
				hasSentContextRef.current = true;
				console.log('[Chatbot] Added portfolio context to first request');
			}

			const response = await fetch('/api/chat-v2', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: conversationHistory,
				}),
			});

			if (!response.ok) {
				throw new Error('API request failed');
			}

			const data = await response.json();

			// Add assistant message
			addMessage({ role: 'assistant', content: data.message });

			// Execute actions (function calling - open/close apps)
			if (data.actions && data.actions.length > 0) {
				data.actions.forEach((action: Action) => {
					try {
						if (action.type === 'openApp' && action.appName) {
							// Check if window already open to prevent duplicates
							const existingWindow = windows.find(
								(w) => w.appType === action.appName
							);
							if (existingWindow) {
								return;
							}

							const appConfig = getAppConfig(action.appName);
							if (appConfig) {
								openWindow(appConfig);
							}
						} else if (action.type === 'closeApp' && action.appName) {
							// Find window by appType and close it
							const windowToClose = windows.find(
								(w) => w.appType === action.appName
							);
							if (windowToClose) {
								closeWindow(windowToClose.id);
							}
						} else if (action.type === 'restart') {
							// Close all windows
							windows.forEach((w) => closeWindow(w.id));
						}
					} catch (error) {
						console.error('Failed to execute action:', action, error);
					}
				});
			}

			// If email was sent, show system message after 2 seconds
			if (data.emailSent && data.systemMessage) {
				setTimeout(() => {
					addMessage({ role: 'system', content: data.systemMessage });

					// Play success sound
					try {
						const sendSound = new Audio('/sounds/msn-send.mp3');
						sendSound.volume = 0.5;
						sendSound.play().catch(() => {
							// Ignore if sound fails
						});
					} catch {
						// Sound file doesn't exist - ignore
					}
				}, 2000);
			}
		} catch (error) {
			console.error('Chat error:', error);
			addMessage({
				role: 'assistant',
				content:
					'Zzzzzzz 😴\n\nOpening Hours: not now\n\n(AI is probably rate-limited, try again later!)',
			});
		} finally {
			setIsTyping(false);
			setIsSending(false); // Reset sending state
		}
	};

	// NUDGE Feature - The star of the show!
	const sendNudge = async () => {
		// Find the window element by traversing up the DOM
		let windowElement: HTMLElement | null = chatContainerRef.current;
		while (
			windowElement &&
			!windowElement.style.position?.includes('absolute')
		) {
			windowElement = windowElement.parentElement;
		}

		if (!windowElement) return;

		const originalTransform = windowElement.style.transform;

		// Shake sequence - make it REALLY shake!
		const shakes = [
			'translate(-15px, -8px) rotate(-2deg)',
			'translate(15px, 8px) rotate(2deg)',
			'translate(-12px, 8px) rotate(-1deg)',
			'translate(12px, -8px) rotate(1deg)',
			'translate(-10px, -12px) rotate(-2deg)',
			'translate(10px, 12px) rotate(2deg)',
			'translate(-8px, -6px) rotate(-1deg)',
			'translate(8px, 6px) rotate(1deg)',
			'translate(0, 0) rotate(0deg)',
		];

		shakes.forEach((transform, i) => {
			setTimeout(() => {
				if (windowElement) {
					windowElement.style.transform = transform;
					if (i === shakes.length - 1) {
						windowElement.style.transform = originalTransform;
					}
				}
			}, i * 80);
		});

		// Play sound and show system message
		playSound('nudge');
		addMessage({ role: 'system', content: '🔔 You sent a Nudge!' });

		// Trigger AI response to the nudge
		setIsTyping(true);

		try {
			const nudgeMessage =
				'**NUDGE RECEIVED** - User just sent you a nudge (shook your window). React casually/funny. Keep it 1-2 lines max.';

			const context = getPortfolioContext();
			const contextMessage = {
				role: 'system' as const,
				content: `Current portfolio context:
About: ${context.about.substring(0, 300)}
Available projects: ${context.projects.map((p) => p.name).join(', ')}`,
			};

			const conversationHistory = [
				contextMessage,
				...messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				{ role: 'user' as const, content: nudgeMessage },
			];

			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: conversationHistory,
				}),
			});

			if (!response.ok) {
				throw new Error('API request failed');
			}

			const data = await response.json();
			addMessage({ role: 'assistant', content: data.message });
		} catch (error) {
			console.error('Nudge response error:', error);
			// Fallback nudge response
			addMessage({
				role: 'assistant',
				content: 'woow! :O\naquí estoy cabrón! 😵',
			});
		} finally {
			setIsTyping(false);
		}
	};

	const sendWink = () => {
		sendMessage(';)');
	};

	const clearChat = () => {
		if (confirm('Clear all messages?')) {
			setMessages([]);
			localStorage.removeItem('chatbot-history');
			hasSentContextRef.current = false;
		}
	};

	const formatTime = (timestamp: Date) => {
		return timestamp.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div
			className='h-full flex flex-col bg-white'
			style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
		>
			{/* MSN Header */}
			<div
				className='h-12 px-3 flex items-center justify-between text-white'
				style={{
					background: `linear-gradient(to bottom, ${MSN_COLORS.HEADER_GRADIENT_START}, ${MSN_COLORS.HEADER_GRADIENT_END})`,
				}}
			>
				<div className='flex items-center gap-2'>
					<div
						className={`w-2 h-2 rounded-full transition-all ${
							isTyping ? 'bg-yellow-400 animate-pulse' : ''
						}`}
						style={{
							backgroundColor: isTyping ? '#fbbf24' : MSN_COLORS.ONLINE_GREEN,
						}}
					/>
					<span className='font-semibold text-sm'>Fran Francois</span>
				</div>
				<div className='text-xs opacity-90'>
					{isTyping ? 'Typing...' : 'Online - "Ask me anything! 💻"'}
				</div>
			</div>

			{/* Chat Messages */}
			<div
				ref={chatContainerRef}
				className='flex-1 p-3 overflow-y-auto relative'
				style={{ backgroundColor: MSN_COLORS.BACKGROUND }}
			>
				{/* Scroll to bottom indicator */}
				{chatContainerRef.current &&
					chatContainerRef.current.scrollTop <
						chatContainerRef.current.scrollHeight -
							chatContainerRef.current.clientHeight -
							50 && (
						<button
							onClick={() =>
								messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
							}
							className='fixed bottom-20 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 z-10'
							style={{ position: 'absolute', bottom: '80px', right: '10px' }}
						>
							↓
						</button>
					)}
				{messages.length === 0 && (
					<div className='text-center text-gray-500 mt-8'>
						<div className='text-sm italic'>Loading chat...</div>
					</div>
				)}

				{messages.map((message) => (
					<div key={message.id} className='mb-4'>
						{message.role === 'system' ? (
							<div
								className='system-message mx-auto max-w-[90%]'
								style={{
									background:
										'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
									borderLeft: '4px solid #00aa00',
									padding: '12px 16px',
									borderRadius: '4px',
									boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
								}}
							>
								<div
									className='system-badge'
									style={{
										fontWeight: 'bold',
										color: '#00aa00',
										fontSize: '10px',
										textTransform: 'uppercase',
										letterSpacing: '1px',
										marginBottom: '4px',
									}}
								>
									System
								</div>
								<div
									className='system-content'
									style={{
										color: '#333',
										fontStyle: 'italic',
										fontSize: '13px',
										lineHeight: '1.4',
									}}
								>
									{parseEmoticons(message.content)}
								</div>
							</div>
						) : (
							<div
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div className='max-w-[70%]'>
									<div
										className='px-3 py-2 rounded-lg text-sm'
										style={{
											backgroundColor:
												message.role === 'user'
													? MSN_COLORS.USER_BUBBLE
													: MSN_COLORS.BOT_BUBBLE,
											color: MSN_COLORS.TEXT,
										}}
									>
										{parseEmoticons(message.content)}
									</div>
									<div className='text-xs text-gray-500 mt-1'>
										{formatTime(message.timestamp)}
									</div>
								</div>
							</div>
						)}
					</div>
				))}

				{isTyping && (
					<div className='flex justify-start mb-4'>
						<div className='text-sm text-gray-500 italic'>
							Fran Francois is typing<span className='animate-pulse'>...</span>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className='border-t p-3 bg-white'>
				<div className='flex items-center gap-2 mb-2'>
					<input
						ref={inputRef}
						type='text'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={(e) =>
							e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)
						}
						placeholder='Type a message...'
						maxLength={500}
						disabled={isTyping}
						className='flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-black'
					/>
					<button
						onClick={() => sendMessage(inputValue)}
						disabled={!inputValue.trim() || isTyping}
						className='px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors'
						style={{ backgroundColor: MSN_COLORS.HEADER_GRADIENT_END }}
					>
						Send
					</button>
				</div>

				{/* Character counter */}
				<div className='text-xs text-gray-400 mb-2 text-right'>
					{inputValue.length}/500
				</div>

				{/* Action Buttons */}
				<div className='flex gap-2 text-sm'>
					<button
						onClick={sendNudge}
						disabled={isTyping}
						className='px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors'
						title='Send a nudge! (shakes the window)'
					>
						🔔 Nudge
					</button>
					<button
						onClick={sendWink}
						disabled={isTyping}
						className='px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50 transition-colors'
					>
						😉 Wink
					</button>
					<button
						onClick={clearChat}
						className='px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300 transition-colors'
					>
						🗑️ Clear
					</button>
					<button
						onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						className='px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 transition-colors'
					>
						😊
					</button>
					<button
						onClick={() =>
							addMessage({
								role: 'system',
								content:
									'💬 MSN Messenger Clone v1.0 - Built with Next.js & Groq AI - Features authentic Windows 3.1 styling, real-time chat, NUDGE window shaking, emoticon parsing, and portfolio context awareness!',
							})
						}
						className='px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition-colors text-xs'
					>
						ℹ️ About
					</button>
				</div>

				{/* Emoji Picker */}
				{showEmojiPicker && (
					<div className='mt-2 p-2 bg-gray-100 rounded text-sm'>
						<div className='grid grid-cols-6 gap-1'>
							{Object.entries(MSN_EMOTICONS).map(([code, emoji]) => (
								<button
									key={code}
									onClick={() => {
										setInputValue((prev) => prev + code);
										setShowEmojiPicker(false);
									}}
									className='p-1 hover:bg-gray-200 rounded text-center'
									title={code}
								>
									{emoji}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
