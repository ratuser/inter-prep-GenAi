import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, FileText, BarChart3, Target, Brain, Zap, Clock, Award, TrendingUp } from 'lucide-react';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import ResumeUploadModal from '../components/dashboard/ResumeUploadModal';

const API_BASE = 'http://localhost:5000/api';

const iconMap = { Mic, Brain, TrendingUp, Zap, Target, Award };

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = (user.fullName || 'User').split(' ')[0];

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [progress, setProgress] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Failed to fetch dashboard data');

                const data = await res.json();

                // Map icon strings back to components
                setStats(data.stats.map(s => ({ ...s, icon: iconMap[s.icon] || Mic })));
                setProgress(data.progress);
                setRecentActivity(data.recentActivity.map(a => ({ ...a, icon: iconMap[a.icon] || Brain })));
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                // Fallback to empty state
                setStats([
                    { label: 'Total Interviews', value: '0', change: 'Start practicing!', icon: Mic, color: 'emerald' },
                    { label: 'Questions Practiced', value: '0', change: 'No questions yet', icon: Brain, color: 'teal' },
                    { label: 'Average Score', value: '0%', change: 'N/A', icon: TrendingUp, color: 'green' },
                    { label: 'Day Streak', value: '0', change: 'Start today!', icon: Zap, color: 'lime' },
                ]);
                setProgress([
                    { name: 'Technical', value: 0, color: 'emerald' },
                    { name: 'Behavioral', value: 0, color: 'teal' },
                    { name: 'System Design', value: 0, color: 'green' },
                    { name: 'Communication', value: 0, color: 'lime' },
                ]);
                setRecentActivity([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        fetchResumeStatus();
    }, []);

    const fetchResumeStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/resume/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setResumeUploaded(data.hasResume && data.resume?.status === 'analysed');
        } catch (err) {
            console.error('Resume status error:', err);
        }
    };

    const handleQuickAction = (label) => {
        if (label === 'Start Practice') {
            if (resumeUploaded) {
                navigate('/dashboard/interview');
            }
            // disabled — tooltip handles the UX
        } else if (label === 'Upload Resume') {
            setShowUploadModal(true);
        } else if (label === 'View Analytics') {
            // TODO: Navigate to analytics page
            console.log('Navigating to analytics...');
        }
    };

    const quickActions = [
        {
            label: 'Start Practice',
            icon: Mic,
            desc: resumeUploaded ? 'Begin a mock interview' : 'Upload resume first',
            disabled: !resumeUploaded,
            variant: 'primary',
        },
        { label: 'Upload Resume', icon: FileText, desc: 'Upload & analyse your resume', variant: 'default' },
        { label: 'View Analytics', icon: BarChart3, desc: 'Track your progress', variant: 'default' },
    ];

    if (loading) return <DashboardSkeleton />;

    return (
        <div>
            {/* Welcome Banner */}
            <motion.div
                className="welcome-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="welcome-title">
                    Good {getGreeting()}, {firstName}! 👋
                </h1>
                <p className="welcome-subtitle">
                    Ready to ace your next interview? Let's keep the momentum going.
                </p>
            </motion.div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card"
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                    >
                        <div className="stat-card-header">
                            <div className={`stat-card-icon ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="stat-card-change positive">
                                {stat.change}
                            </span>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Progress + Activity Grid */}
            <div className="dashboard-grid">
                {/* Interview Progress */}
                <motion.div
                    className="dash-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="dash-card-title">Interview Progress</h3>
                    {progress.map((item) => (
                        <div key={item.name} className="progress-item">
                            <div className="progress-label">
                                <span className="progress-name">{item.name}</span>
                                <span className="progress-value">{item.value}%</span>
                            </div>
                            <div className="progress-track">
                                <motion.div
                                    className={`progress-fill ${item.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    className="dash-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h3 className="dash-card-title">Recent Activity</h3>
                    <div className="activity-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, i) => (
                                <div key={i} className="activity-item">
                                    <div className="activity-icon">
                                        <item.icon size={16} />
                                    </div>
                                    <div className="activity-info">
                                        <div className="activity-title">{item.title}</div>
                                        <div className="activity-time">
                                            <Clock size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                            {item.time}
                                        </div>
                                    </div>
                                    <div className="activity-score">{item.score}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                No interviews yet. Start practicing to see your activity here!
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
                {quickActions.map((action, i) => (
                    <motion.div
                        key={action.label}
                        className="quick-action-wrapper"
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                    >
                        <button
                            className={`quick-action-btn ${action.variant === 'primary' ? 'primary' : ''} ${action.disabled ? 'disabled' : ''}`}
                            onClick={() => !action.disabled && handleQuickAction(action.label)}
                            disabled={action.disabled}
                        >
                            <div className="quick-action-icon">
                                <action.icon size={24} />
                            </div>
                            <span className="quick-action-label">{action.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                                {action.desc}
                            </span>
                        </button>
                        {action.disabled && (
                            <div className="quick-action-tooltip">Upload & analyse your resume first</div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Resume Upload Modal */}
            <ResumeUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onComplete={() => {
                    setResumeUploaded(true);
                    fetchResumeStatus();
                }}
            />
        </div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}
