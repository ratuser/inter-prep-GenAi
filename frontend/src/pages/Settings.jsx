import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/settings-pages.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Settings() {
    const navigate = useNavigate();

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Delete account
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage('Password changed successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.message || 'Failed to change password');
            }
        } catch {
            setMessage('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/delete-account`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth');
            } else {
                const data = await res.json();
                setMessage(data.message || 'Failed to delete account');
            }
        } catch {
            setMessage('Network error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="settings-page">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="settings-page-title">Settings</h1>
                <p className="settings-page-subtitle">Manage your account security</p>

                {/* Change Password */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title">
                            <Lock size={16} />
                            Change Password
                        </h3>
                    </div>

                    <div className="settings-field-list">
                        <div className="settings-field">
                            <span className="settings-field-label">Current Password</span>
                            <div className="settings-password-wrap">
                                <input
                                    className="settings-field-input"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <button className="settings-eye-btn" onClick={() => setShowCurrent(!showCurrent)}>
                                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="settings-field">
                            <span className="settings-field-label">New Password</span>
                            <div className="settings-password-wrap">
                                <input
                                    className="settings-field-input"
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <button className="settings-eye-btn" onClick={() => setShowNew(!showNew)}>
                                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="settings-field">
                            <span className="settings-field-label">Confirm New Password</span>
                            <input
                                className="settings-field-input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button className="settings-save-btn" onClick={handleChangePassword} disabled={saving}>
                            <Save size={14} />
                            {saving ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>

                    {message && (
                        <motion.div
                            className={`settings-message ${message.includes('successfully') ? 'success' : 'error'}`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {message}
                        </motion.div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="settings-card danger-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title danger-title">
                            <AlertTriangle size={16} />
                            Danger Zone
                        </h3>
                    </div>

                    <p className="danger-desc">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                        <button className="danger-btn" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={14} />
                            Delete Account
                        </button>
                    ) : (
                        <motion.div
                            className="danger-confirm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <p className="danger-confirm-text">
                                Type <strong>DELETE</strong> to confirm:
                            </p>
                            <input
                                className="settings-field-input danger-input"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                autoFocus
                            />
                            <div className="danger-confirm-actions">
                                <button
                                    className="settings-cancel-btn"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="danger-confirm-btn"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                                >
                                    <Trash2 size={14} />
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
