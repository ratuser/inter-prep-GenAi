import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../../styles/dashboard.css';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-wrapper">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
            >
                <Menu size={20} />
            </button>

            <main className="dashboard-main">
                <TopBar />
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
