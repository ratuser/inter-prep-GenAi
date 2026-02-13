import { motion } from 'framer-motion';
import { Mic, FileText, BarChart3, Target, Brain, Zap, Clock, Award, TrendingUp, CheckCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = (user.fullName || 'User').split(' ')[0];

    const stats = [
        { label: 'Total Interviews', value: '24', change: '+3 this week', icon: Mic, color: 'emerald' },
        { label: 'Questions Practiced', value: '156', change: '+12 this week', icon: Brain, color: 'teal' },
        { label: 'Average Score', value: '78%', change: '+5% improvement', icon: TrendingUp, color: 'green' },
        { label: 'Day Streak', value: '7', change: 'Keep it up!', icon: Zap, color: 'lime' },
    ];

    const progress = [
        { name: 'Technical', value: 72, color: 'emerald' },
        { name: 'Behavioral', value: 58, color: 'teal' },
        { name: 'System Design', value: 41, color: 'green' },
        { name: 'Communication', value: 85, color: 'lime' },
    ];

    const recentActivity = [
        { title: 'React Hooks Deep Dive', time: '2 hours ago', score: '85%', icon: Brain },
        { title: 'System Design: URL Shortener', time: '1 day ago', score: '72%', icon: Target },
        { title: 'Behavioral: Leadership', time: '2 days ago', score: '91%', icon: Award },
        { title: 'JavaScript Closures', time: '3 days ago', score: '68%', icon: Brain },
        { title: 'API Design Patterns', time: '4 days ago', score: '76%', icon: Target },
    ];

    const quickActions = [
        { label: 'Start Practice', icon: Mic, desc: 'Begin a mock interview' },
        { label: 'Upload Resume', icon: FileText, desc: 'Get AI feedback' },
        { label: 'View Analytics', icon: BarChart3, desc: 'Track your progress' },
    ];

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
                        {recentActivity.map((item, i) => (
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
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
                {quickActions.map((action, i) => (
                    <motion.button
                        key={action.label}
                        className="quick-action-btn"
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                    >
                        <div className="quick-action-icon">
                            <action.icon size={24} />
                        </div>
                        <span className="quick-action-label">{action.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                            {action.desc}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}
