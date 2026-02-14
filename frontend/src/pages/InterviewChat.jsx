import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/interview.css';

const API_BASE = 'http://localhost:5000/api';

export default function InterviewChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [resumeInfo, setResumeInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping]);

    // Load resume info and start interview
    useEffect(() => {
        const initInterview = async () => {
            try {
                const token = localStorage.getItem('token');

                // Get resume data
                const resumeRes = await fetch(`${API_BASE}/resume/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const resumeData = await resumeRes.json();

                if (!resumeData.hasResume || resumeData.resume.status !== 'analysed') {
                    navigate('/dashboard');
                    return;
                }

                setResumeInfo(resumeData.resume);

                // Send first message to AI to start
                setIsAiTyping(true);
                const chatRes = await fetch(`${API_BASE}/interview/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: 'Hello, I am ready for the interview. Please introduce yourself and start.',
                        conversationHistory: [],
                    }),
                });

                const chatData = await chatRes.json();
                setMessages([{ role: 'ai', content: chatData.message }]);
                setIsAiTyping(false);
                inputRef.current?.focus();
            } catch (err) {
                console.error('Init interview error:', err);
                setIsAiTyping(false);
            }
        };

        initInterview();
    }, [navigate]);

    const sendMessage = async () => {
        if (!input.trim() || isAiTyping) return;

        const userMessage = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setInput('');
        setIsAiTyping(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/interview/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: newMessages,
                }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.message }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsAiTyping(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = (user.fullName || 'You').split(' ')[0];

    return (
        <div className="interview-chat-page">
            {/* Header */}
            <div className="chat-header">
                <button className="chat-back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} />
                </button>
                <div className="chat-header-info">
                    <div className="chat-header-avatar">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="chat-header-title">
                            Mock Interview
                            {resumeInfo && (
                                <span className="chat-header-role">{resumeInfo.targetRole} at {resumeInfo.targetCompany}</span>
                            )}
                        </h2>
                        <span className={`chat-status ${isAiTyping ? 'typing' : 'online'}`}>
                            {isAiTyping ? 'Thinking...' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            className={`chat-message ${msg.role === 'ai' ? 'ai' : 'user'}`}
                            initial={{ opacity: 0, y: 15, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <div className="message-avatar">
                                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className="message-content">
                                <div className="message-sender">
                                    {msg.role === 'ai' ? 'AI Interviewer' : firstName}
                                </div>
                                <div className="message-text">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isAiTyping && (
                    <motion.div
                        className="chat-message ai"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="message-avatar">
                            <Bot size={16} />
                        </div>
                        <div className="message-content">
                            <div className="message-sender">AI Interviewer</div>
                            <div className="typing-indicator">
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Type your answer..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isAiTyping}
                />
                <button
                    className={`chat-send-btn ${input.trim() && !isAiTyping ? 'active' : ''}`}
                    onClick={sendMessage}
                    disabled={!input.trim() || isAiTyping}
                >
                    {isAiTyping ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
                </button>
            </div>
        </div>
    );
}
