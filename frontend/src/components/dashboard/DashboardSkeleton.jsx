import { motion } from 'framer-motion';

export default function DashboardSkeleton() {
    return (
        <div className="skeleton-wrapper">
            {/* Welcome Banner Skeleton */}
            <div className="welcome-banner skeleton-banner">
                <div className="skeleton skeleton-title" style={{ width: '45%', height: '1.75rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '65%', height: '0.9rem', marginTop: '0.75rem' }} />
            </div>

            {/* Stat Cards Skeleton */}
            <div className="stat-grid">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="stat-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                        <div className="stat-card-header">
                            <div className="skeleton skeleton-icon" />
                            <div className="skeleton skeleton-badge" />
                        </div>
                        <div className="skeleton skeleton-value" />
                        <div className="skeleton skeleton-label" />
                    </motion.div>
                ))}
            </div>

            {/* Progress + Activity Grid Skeleton */}
            <div className="dashboard-grid">
                {/* Progress Card Skeleton */}
                <div className="dash-card">
                    <div className="skeleton skeleton-card-title" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="progress-item">
                            <div className="progress-label">
                                <div className="skeleton" style={{ width: '30%', height: '0.85rem' }} />
                                <div className="skeleton" style={{ width: '15%', height: '0.8rem' }} />
                            </div>
                            <div className="progress-track">
                                <div className="skeleton skeleton-progress-bar" style={{ width: `${30 + i * 15}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity Card Skeleton */}
                <div className="dash-card">
                    <div className="skeleton skeleton-card-title" />
                    <div className="activity-list">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="activity-item">
                                <div className="skeleton skeleton-activity-icon" />
                                <div className="activity-info">
                                    <div className="skeleton" style={{ width: '70%', height: '0.85rem', marginBottom: '0.35rem' }} />
                                    <div className="skeleton" style={{ width: '40%', height: '0.65rem' }} />
                                </div>
                                <div className="skeleton" style={{ width: '2.5rem', height: '0.85rem', borderRadius: '0.5rem' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="skeleton skeleton-section-title" />
            <div className="quick-actions">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="quick-action-btn" style={{ pointerEvents: 'none' }}>
                        <div className="skeleton skeleton-action-icon" />
                        <div className="skeleton" style={{ width: '60%', height: '0.85rem' }} />
                        <div className="skeleton" style={{ width: '80%', height: '0.65rem' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
