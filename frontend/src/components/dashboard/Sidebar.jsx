import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Search, LayoutDashboard, Mic, BarChart3, Clock, UserCircle, Settings, HelpCircle, LogOut } from 'lucide-react';

const mainNav = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Practice', icon: Mic, path: '/dashboard/practice' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { name: 'History', icon: Clock, path: '/dashboard/history' },
];

const settingsNav = [
    { name: 'Profile', icon: UserCircle, path: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    { name: 'Help Centre', icon: HelpCircle, path: '/dashboard/help' },
];

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initials = (user.fullName || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const handleNav = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo" onClick={() => handleNav('/dashboard')} style={{ cursor: 'pointer' }}>
                    <div className="sidebar-logo-icon">
                        <Sparkles size={16} color="#fff" />
                    </div>
                    <span className="sidebar-logo-text">
                        Inter<span className="gradient-text">Prep</span>
                    </span>
                </div>

                {/* Search */}
                <div className="sidebar-search">
                    <Search size={14} className="sidebar-search-icon" />
                    <input
                        className="sidebar-search-input"
                        type="text"
                        placeholder="Search..."
                    />
                </div>

                {/* Main Navigation */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Dashboard</div>
                    <nav className="sidebar-nav">
                        {mainNav.map((item) => (
                            <button
                                key={item.name}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => handleNav(item.path)}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Settings</div>
                    <nav className="sidebar-nav">
                        {settingsNav.map((item) => (
                            <button
                                key={item.name}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => handleNav(item.path)}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.fullName || 'User'}</div>
                        <div className="sidebar-user-email">{user.email || ''}</div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}
