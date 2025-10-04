'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemContext } from '../../../lib/FileSystemContext';

// MSN Messenger color scheme
const MSN_COLORS = {
	HEADER_GRADIENT_START: '#4e9cdb',
	HEADER_GRADIENT_END: '#2e7cbb',
	BACKGROUND: '#ffffff',
	USER_BUBBLE: '#e5f2ff', // Light blue
	BOT_BUBBLE: '#f0f0f0', // Light gray
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
	// No props needed for now
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

// MSN Sounds (placeholder for now)
const MSN_SOUNDS = {
	messageReceived: '/sounds/msn-message.mp3',
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
		// Sound files don't exist yet - ignore silently
	}
};

export default function Chatbot({}: ChatbotProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const { rootItems } = useFileSystemContext();

	// Load chat history from localStorage
	useEffect(() => {
		const saved = localStorage.getItem('chatbot-history');
		if (saved) {
			try {
				const parsedMessages = JSON.parse(saved).map((msg: any) => ({
					...msg,
					timestamp: new Date(msg.timestamp),
				}));
				setMessages(parsedMessages);
			} catch (error) {
				console.error('Error loading chat history:', error);
			}
		} else {
			// Welcome message
			const welcomeMessage: Message = {
				id: 'welcome',
				role: 'assistant',
				content:
					"*Claude Bot has signed in* \n\nHey there! 😊 Welcome to this awesome retro portfolio! I'm here to help you explore all the cool features. This place is packed with working Windows 3.1 apps, easter eggs, and tons of interactive stuff! :D\n\nWhat would you like to check out first?",
				timestamp: new Date(),
			};
			setMessages([welcomeMessage]);
		}
	}, []);

	// Save to localStorage when messages change
	useEffect(() => {
		if (messages.length > 0) {
			localStorage.setItem('chatbot-history', JSON.stringify(messages));
		}
	}, [messages]);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isTyping]);

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

		if (message.role === 'assistant') {
			playSound('messageReceived');
		} else if (message.role === 'user') {
			playSound('messageSent');
		}
	};

	const sendMessage = async (userMessage: string) => {
		if (!userMessage.trim()) return;

		// Add user message immediately
		addMessage({ role: 'user', content: userMessage });
		setInputValue('');
		setIsTyping(true);

		try {
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
				contextMessage,
				...messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				{ role: 'user' as const, content: userMessage },
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
			console.error('Chat error:', error);
			addMessage({
				role: 'assistant',
				content: 'Oops! Connection error. Try again? 😅',
			});
		} finally {
			setIsTyping(false);
		}
	};

	// NUDGE Feature - The star of the show!
	const sendNudge = () => {
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

		// Play sound and add system message
		playSound('nudge');
		addMessage({ role: 'system', content: '🔔 You sent a Nudge!' });
	};

	const sendWink = () => {
		sendMessage(';)');
	};

	const clearChat = () => {
		if (confirm('Clear all messages?')) {
			setMessages([]);
			localStorage.removeItem('chatbot-history');
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
					<span className='font-semibold text-sm'>Claude Bot</span>
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
						<div className='mb-4'>
							<div className='text-lg mb-2'>💬 Welcome to MSN Messenger!</div>
							<p className='text-sm'>
								I'm your friendly portfolio guide. Try asking:
							</p>
						</div>
						<div className='space-y-2 text-sm'>
							<button
								onClick={() => sendMessage("What's cool about this portfolio?")}
								className='block mx-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
							>
								💻 "What's cool about this portfolio?"
							</button>
							<button
								onClick={() => sendMessage('Show me the best features')}
								className='block mx-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
							>
								✨ "Show me the best features"
							</button>
							<button
								onClick={() => sendMessage('What apps can I try?')}
								className='block mx-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
							>
								🎮 "What apps can I try?"
							</button>
							<button
								onClick={() => sendMessage('Tell me about the tech stack')}
								className='block mx-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
							>
								🔧 "Tell me about the tech stack"
							</button>
							<button
								onClick={() => sendMessage('Any easter eggs? ;)')}
								className='block mx-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
							>
								🥚 "Any easter eggs? ;)"
							</button>
						</div>
					</div>
				)}

				{messages.map((message) => (
					<div key={message.id} className='mb-4'>
						{message.role === 'system' ? (
							<div className='text-center text-gray-500 italic text-sm'>
								{parseEmoticons(message.content)}
							</div>
						) : (
							<div
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div className='max-w-[70%]'>
									<div className='text-xs text-gray-600 mb-1'>
										{message.role === 'user' ? 'You say:' : 'Claude Bot says:'}
									</div>
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
							Claude Bot is typing<span className='animate-pulse'>...</span>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className='border-t p-3 bg-white'>
				<div className='flex items-center gap-2 mb-2'>
					<input
						type='text'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={(e) =>
							e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)
						}
						placeholder='Type a message...'
						maxLength={500}
						disabled={isTyping}
						className='flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
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
