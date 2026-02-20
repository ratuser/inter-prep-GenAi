import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Loader2, Mic, MicOff, Volume2, VolumeX, Keyboard, AudioLines } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/interview.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check browser support for Speech APIs
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSynthesis = window.speechSynthesis;

export default function InterviewChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [resumeInfo, setResumeInfo] = useState(null);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Voice mode state
    const [voiceMode, setVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping, transcript]);

    // Initialize speech recognition
    useEffect(() => {
        if (SpeechRecognition) {
            setVoiceSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const t = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += t;
                    } else {
                        interim += t;
                    }
                }
                setTranscript(final || interim);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setTranscript('');
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (_) { }
            }
            speechSynthesis?.cancel();
        };
    }, []);

    // Speak text aloud using SpeechSynthesis
    const speakText = (text) => {
        if (!speechSynthesis) return;

        // Clean markdown formatting so TTS reads naturally
        const cleanText = text
            .replace(/```[\s\S]*?```/g, ' code snippet ')   // code blocks → "code snippet"
            .replace(/`([^`]+)`/g, '$1')                     // inline `code` → just the word
            .replace(/\*\*([^*]+)\*\*/g, '$1')               // **bold** → plain
            .replace(/\*([^*]+)\*/g, '$1')                   // *italic* → plain
            .replace(/#{1,6}\s?/g, '')                       // ### headings → plain
            .replace(/[-*•]\s/g, ', ')                       // bullet points → commas
            .replace(/\n+/g, '. ')                           // newlines → sentence breaks
            .replace(/\s{2,}/g, ' ')                         // collapse extra spaces
            .trim();

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1;
        utterance.pitch = 1;

        // Try to pick a good English voice
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
            || voices.find(v => v.lang === 'en-US')
            || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

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

                // Set voice mode default based on interview type
                if (resumeData.resume.interviewType === 'non-technical' && SpeechRecognition) {
                    setVoiceMode(true);
                }

                // Send first message to AI to start
                setIsAiTyping(true);
                const chatRes = await fetch(`${API_BASE}/interview/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: 'Start the interview.',
                        conversationHistory: [],
                    }),
                });

                const chatData = await chatRes.json();
                setMessages([{ role: 'ai', content: chatData.message }]);
                setIsAiTyping(false);

                // Speak the AI's first message if voice mode
                if (resumeData.resume.interviewType === 'non-technical' && SpeechRecognition) {
                    // Small delay to let voices load
                    setTimeout(() => speakText(chatData.message), 500);
                }

                inputRef.current?.focus();
            } catch (err) {
                console.error('Init interview error:', err);
                setIsAiTyping(false);
            }
        };

        initInterview();
    }, [navigate]);

    // Start listening
    const startListening = () => {
        if (!recognitionRef.current || isAiTyping || isSpeaking) return;
        speechSynthesis?.cancel(); // stop any ongoing speech
        setTranscript('');
        setIsListening(true);
        try {
            recognitionRef.current.start();
        } catch (_) {
            // Already started
        }
    };

    // Stop listening and send the transcript
    const stopListeningAndSend = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);

        // Use the transcript as the message
        if (transcript.trim()) {
            const userMessage = transcript.trim();
            setTranscript('');
            sendMessageText(userMessage);
        } else {
            setTranscript('');
        }
    };

    // Core message sender
    const sendMessageText = async (text) => {
        const newMessages = [...messages, { role: 'user', content: text }];
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
                    message: text,
                    conversationHistory: newMessages,
                }),
            });

            if (res.status === 429) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: '⏳ AI is rate limited right now. Please wait 10-15 seconds and tap "Retry" below.',
                    isRetryable: true,
                    retryText: text,
                }]);
                setIsAiTyping(false);
                return;
            }

            const data = await res.json();
            const aiMessage = data.message || 'Sorry, I encountered an error. Please try again.';
            setMessages(prev => [...prev, { role: 'ai', content: aiMessage }]);

            // Check if interview is complete
            if (data.interviewComplete) {
                setInterviewComplete(true);
                // Save completed interview to database
                try {
                    const saveRes = await fetch(`${API_BASE}/interview/complete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({ feedbackMessage: aiMessage }),
                    });
                    if (!saveRes.ok) {
                        const errData = await saveRes.json();
                        console.error('Failed to save interview:', errData);
                    }
                } catch (saveErr) {
                    console.error('Save interview error:', saveErr);
                }
            }

            // Speak AI response aloud
            speakText(aiMessage);
        } catch (err) {
            const errorMsg = 'Sorry, I encountered an error. Please try again.';
            setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        } finally {
            setIsAiTyping(false);
            inputRef.current?.focus();
        }
    };

    const sendMessage = () => {
        if (!input.trim() || isAiTyping || interviewComplete) return;
        sendMessageText(input.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleVoiceMode = () => {
        if (!voiceSupported) return;
        const newMode = !voiceMode;
        setVoiceMode(newMode);
        if (!newMode) {
            // Switching to text — stop any voice activity
            speechSynthesis?.cancel();
            setIsSpeaking(false);
            if (isListening) {
                recognitionRef.current?.stop();
                setIsListening(false);
                setTranscript('');
            }
        }
    };

    const stopSpeaking = () => {
        speechSynthesis?.cancel();
        setIsSpeaking(false);
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = (user.fullName || 'You').split(' ')[0];

    return (
        <div className="interview-chat-page">
            {/* Header */}
            <div className="chat-header">
                <button className="chat-back-btn" onClick={() => {
                    speechSynthesis?.cancel();
                    navigate('/dashboard');
                }}>
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
                        <span className={`chat-status ${isAiTyping ? 'typing' : isSpeaking ? 'speaking' : 'online'}`}>
                            {isAiTyping ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Online'}
                        </span>
                    </div>
                </div>

                {/* Voice/Text mode toggle */}
                {voiceSupported && (
                    <button
                        className={`voice-mode-toggle ${voiceMode ? 'voice-active' : ''}`}
                        onClick={toggleVoiceMode}
                        title={voiceMode ? 'Switch to text mode' : 'Switch to voice mode'}
                    >
                        {voiceMode ? <Keyboard size={16} /> : <AudioLines size={16} />}
                        <span>{voiceMode ? 'Text' : 'Voice'}</span>
                    </button>
                )}
            </div>

            {/* Voice mode banner */}
            <AnimatePresence>
                {voiceMode && (
                    <motion.div
                        className="voice-mode-banner"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <AudioLines size={14} />
                        <span>Voice mode — tap the mic to speak, AI will respond aloud</span>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                {msg.isRetryable && (
                                    <button
                                        className="retry-btn"
                                        onClick={() => {
                                            setMessages(prev => prev.filter((_, idx) => idx !== i));
                                            sendMessageText(msg.retryText);
                                        }}
                                    >
                                        🔄 Retry
                                    </button>
                                )}
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

                {/* Live transcript while listening */}
                {isListening && transcript && (
                    <motion.div
                        className="chat-message user"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="message-avatar">
                            <User size={16} />
                        </div>
                        <div className="message-content">
                            <div className="message-sender">{firstName}</div>
                            <div className="message-text transcript-preview">{transcript}</div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
                {interviewComplete ? (
                    /* Interview complete state */
                    <div className="interview-complete-bar">
                        <span className="complete-text">🎯 Interview Complete</span>
                        <button
                            className="back-to-dashboard-btn"
                            onClick={() => {
                                speechSynthesis?.cancel();
                                navigate('/dashboard');
                            }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : voiceMode ? (
                    /* Voice mode input */
                    <div className="voice-input-area">
                        {isSpeaking && (
                            <button className="stop-speaking-btn" onClick={stopSpeaking}>
                                <VolumeX size={16} />
                                Stop
                            </button>
                        )}
                        <button
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListeningAndSend : startListening}
                            disabled={isAiTyping || isSpeaking}
                        >
                            <div className="mic-btn-inner">
                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </div>
                            {isListening && (
                                <div className="mic-pulse-ring" />
                            )}
                        </button>
                        <span className="mic-hint">
                            {isAiTyping ? 'AI is thinking...'
                                : isSpeaking ? 'AI is speaking...'
                                    : isListening ? 'Listening... tap to send'
                                        : 'Tap to speak'}
                        </span>
                    </div>
                ) : (
                    /* Text mode input */
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}
