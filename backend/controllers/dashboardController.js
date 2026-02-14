const Interview = require('../models/Interview');

// @desc    Get dashboard stats for the logged-in user
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all interviews for this user
        const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

        const totalInterviews = interviews.length;
        const totalQuestions = interviews.reduce((sum, i) => sum + i.questionsCount, 0);
        const averageScore = totalInterviews > 0
            ? Math.round(interviews.reduce((sum, i) => sum + i.score, 0) / totalInterviews)
            : 0;

        // Calculate day streak (consecutive days with at least one interview)
        const streak = calculateStreak(interviews);

        // Weekly change calculations
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const thisWeekInterviews = interviews.filter(i => new Date(i.createdAt) >= oneWeekAgo);
        const lastWeekInterviews = interviews.filter(i => {
            const d = new Date(i.createdAt);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        const thisWeekQuestions = thisWeekInterviews.reduce((sum, i) => sum + i.questionsCount, 0);
        const thisWeekAvgScore = thisWeekInterviews.length > 0
            ? Math.round(thisWeekInterviews.reduce((sum, i) => sum + i.score, 0) / thisWeekInterviews.length)
            : 0;
        const lastWeekAvgScore = lastWeekInterviews.length > 0
            ? Math.round(lastWeekInterviews.reduce((sum, i) => sum + i.score, 0) / lastWeekInterviews.length)
            : 0;
        const scoreDiff = thisWeekAvgScore - lastWeekAvgScore;

        const stats = [
            {
                label: 'Total Interviews',
                value: String(totalInterviews),
                change: `+${thisWeekInterviews.length} this week`,
                icon: 'Mic',
                color: 'emerald',
            },
            {
                label: 'Questions Practiced',
                value: String(totalQuestions),
                change: `+${thisWeekQuestions} this week`,
                icon: 'Brain',
                color: 'teal',
            },
            {
                label: 'Average Score',
                value: `${averageScore}%`,
                change: `${scoreDiff >= 0 ? '+' : ''}${scoreDiff}% improvement`,
                icon: 'TrendingUp',
                color: 'green',
            },
            {
                label: 'Day Streak',
                value: String(streak),
                change: streak > 0 ? 'Keep it up!' : 'Start today!',
                icon: 'Zap',
                color: 'lime',
            },
        ];

        // Progress per category
        const categories = ['technical', 'behavioral', 'system-design', 'communication'];
        const colorMap = {
            'technical': 'emerald',
            'behavioral': 'teal',
            'system-design': 'green',
            'communication': 'lime',
        };
        const nameMap = {
            'technical': 'Technical',
            'behavioral': 'Behavioral',
            'system-design': 'System Design',
            'communication': 'Communication',
        };

        const progress = categories.map(cat => {
            const catInterviews = interviews.filter(i => i.category === cat);
            const avgScore = catInterviews.length > 0
                ? Math.round(catInterviews.reduce((sum, i) => sum + i.score, 0) / catInterviews.length)
                : 0;
            return {
                name: nameMap[cat],
                value: avgScore,
                color: colorMap[cat],
            };
        });

        // Recent activity (last 5)
        const iconMap = {
            'technical': 'Brain',
            'behavioral': 'Award',
            'system-design': 'Target',
            'communication': 'Brain',
        };

        const recentActivity = interviews.slice(0, 5).map(i => ({
            title: i.title,
            time: getRelativeTime(i.createdAt),
            score: `${i.score}%`,
            icon: iconMap[i.category] || 'Brain',
        }));

        res.json({ stats, progress, recentActivity });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};

// Helper: calculate consecutive day streak
function calculateStreak(interviews) {
    if (interviews.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD) sorted desc
    const uniqueDates = [...new Set(
        interviews.map(i => {
            const d = new Date(i.createdAt);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
    )].sort().reverse();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Streak must start from today or yesterday
    if (uniqueDates[0] !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        if (uniqueDates[0] !== yesterdayStr) return 0;
    }

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i - 1]);
        const prev = new Date(uniqueDates[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Helper: relative time string
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}

module.exports = { getDashboardStats };
