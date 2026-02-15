import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageSquare, Mic, FileText, BarChart3, Shield, Mail } from 'lucide-react';
import '../styles/settings-pages.css';

const faqs = [
    {
        question: 'How do I start a mock interview?',
        answer: 'Upload your resume from the Dashboard, fill in your target role and company details, then click "Confirm & Start Interview". The AI interviewer will guide you through the process.',
        icon: Mic,
    },
    {
        question: 'What file formats are supported for resume upload?',
        answer: 'Currently, we support PDF files only. The maximum file size is 10MB. Make sure your resume is in a readable PDF format for the best parsing results.',
        icon: FileText,
    },
    {
        question: 'What\'s the difference between Technical and Non-Technical interviews?',
        answer: 'Technical interviews focus on coding, system design, and problem-solving questions relevant to your target role. Non-Technical interviews focus on behavioral, situational, and communication questions — with voice mode enabled by default.',
        icon: MessageSquare,
    },
    {
        question: 'How does voice mode work?',
        answer: 'Voice mode uses your browser\'s built-in Speech Recognition to capture what you say and converts it to text. The AI\'s responses are read aloud using Text-to-Speech. Voice mode works best in Chrome or Edge browsers. You can toggle between voice and text mode anytime during the interview.',
        icon: Mic,
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes. Your resume and interview data are stored securely and associated only with your account. We use JWT tokens for authentication. You can delete your account and all associated data from the Settings page at any time.',
        icon: Shield,
    },
    {
        question: 'How is my interview performance tracked?',
        answer: 'The Analytics section tracks your interview sessions, including the number of questions answered, topics covered, and areas for improvement identified by the AI. This feature is continuously being enhanced.',
        icon: BarChart3,
    },
];

export default function HelpCenter() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <div className="settings-page">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="settings-page-title">Help Centre</h1>
                <p className="settings-page-subtitle">Frequently asked questions and support</p>

                {/* FAQ */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title">
                            <HelpCircle size={16} />
                            FAQ
                        </h3>
                    </div>

                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                                <button className="faq-question" onClick={() => toggle(i)}>
                                    <div className="faq-question-left">
                                        <div className="faq-icon">
                                            <faq.icon size={14} />
                                        </div>
                                        <span>{faq.question}</span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`faq-chevron ${openIndex === i ? 'rotated' : ''}`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            className="faq-answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <p>{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title">
                            <Mail size={16} />
                            Still need help?
                        </h3>
                    </div>
                    <p className="help-contact-text">
                        If you can't find the answer you're looking for, reach out to us and we'll get back to you as soon as possible.
                    </p>
                    <a href="mailto:support@interprep.com" className="help-contact-btn">
                        <Mail size={14} />
                        Contact Support
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
