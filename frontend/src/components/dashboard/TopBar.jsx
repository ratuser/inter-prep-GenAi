import { Bell, Moon, Globe } from 'lucide-react';

export default function TopBar() {
    return (
        <div className="topbar">
            <div className="topbar-breadcrumb">
                <span>Dashboards</span>
                <span>/</span>
                <span className="topbar-breadcrumb-active">Overview</span>
            </div>
            <div className="topbar-actions">
                <button className="topbar-icon-btn" title="Dark mode">
                    <Moon size={16} />
                </button>
                <button className="topbar-icon-btn" title="Notifications">
                    <Bell size={16} />
                </button>
                <button className="topbar-icon-btn" title="Language">
                    <Globe size={16} />
                </button>
            </div>
        </div>
    );
}
