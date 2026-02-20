import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Mail, Calendar, Shield, Edit3, Save, X, FileText, Briefcase, Building2, Clock, Trash2, Code, MessageCircle } from 'lucide-react';
import '../styles/settings-pages.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Resume state
    const [resume, setResume] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingResume, setDeletingResume] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(stored);
        setFullName(stored.fullName || '');
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/resume/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.hasResume) {
                setResume(data.resume);
            } else {
                setResume(null);
            }
        } catch {
            setResume(null);
        } finally {
            setResumeLoading(false);
        }
    };

    const handleDeleteResume = async () => {
        if (!resume) return;
        setDeletingResume(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/resume/${resume.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setResume(null);
                setShowDeleteConfirm(false);
            }
        } catch {
            // silent fail
        } finally {
            setDeletingResume(false);
        }
    };

    const initials = (user?.fullName || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleSave = async () => {
        if (!fullName.trim() || fullName.trim().length < 2) {
            setMessage('Name must be at least 2 characters');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ fullName: fullName.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                const updated = { ...user, fullName: fullName.trim() };
                setUser(updated);
                localStorage.setItem('user', JSON.stringify(updated));
                setEditing(false);
                setMessage('Profile updated!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.message || 'Failed to update');
            }
        } catch {
            setMessage('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFullName(user?.fullName || '');
        setEditing(false);
        setMessage('');
    };

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <div className="settings-page">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="settings-page-title">Profile</h1>
                <p className="settings-page-subtitle">Manage your personal information and resumes</p>

                {/* Avatar Card */}
                <div className="settings-card profile-hero-card">
                    <div className="profile-hero">
                        <div className="profile-avatar-large">{initials}</div>
                        <div className="profile-hero-info">
                            <h2 className="profile-hero-name">{user?.fullName || 'User'}</h2>
                            <span className="profile-hero-email">{user?.email || ''}</span>
                            <span className="profile-hero-badge">
                                <Shield size={12} />
                                Free Plan
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title">Personal Information</h3>
                        {!editing && (
                            <button className="settings-edit-btn" onClick={() => setEditing(true)}>
                                <Edit3 size={14} />
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="settings-field-list">
                        <div className="settings-field">
                            <span className="settings-field-label">
                                <UserCircle size={14} />
                                Full Name
                            </span>
                            {editing ? (
                                <input
                                    className="settings-field-input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    autoFocus
                                />
                            ) : (
                                <span className="settings-field-value">{user?.fullName || 'Not set'}</span>
                            )}
                        </div>

                        <div className="settings-field">
                            <span className="settings-field-label">
                                <Mail size={14} />
                                Email Address
                            </span>
                            <span className="settings-field-value">{user?.email || 'Not set'}</span>
                        </div>

                        <div className="settings-field">
                            <span className="settings-field-label">
                                <Calendar size={14} />
                                Member Since
                            </span>
                            <span className="settings-field-value">{joinDate}</span>
                        </div>
                    </div>

                    {editing && (
                        <div className="settings-actions">
                            <button className="settings-cancel-btn" onClick={handleCancel} disabled={saving}>
                                <X size={14} />
                                Cancel
                            </button>
                            <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                <Save size={14} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {message && (
                        <motion.div
                            className={`settings-message ${message.includes('updated') ? 'success' : 'error'}`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {message}
                        </motion.div>
                    )}
                </div>

                {/* Resume Section */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <h3 className="settings-card-title">
                            <FileText size={16} />
                            My Resumes
                        </h3>
                    </div>

                    {resumeLoading ? (
                        <div className="resume-loading">Loading...</div>
                    ) : resume ? (
                        <div className="resume-card">
                            <div className="resume-card-top">
                                <div className="resume-card-icon">
                                    <FileText size={20} />
                                </div>
                                <div className="resume-card-info">
                                    <span className="resume-card-name">{resume.originalName || 'Resume.pdf'}</span>
                                    <span className={`resume-card-status ${resume.status}`}>
                                        {resume.status === 'analysed' ? '✓ Analysed' : resume.status === 'analysing' ? '⏳ Analysing' : '📄 Uploaded'}
                                    </span>
                                </div>
                            </div>

                            {resume.status === 'analysed' && (
                                <div className="resume-card-details">
                                    <div className="resume-detail">
                                        <Briefcase size={13} />
                                        <span className="resume-detail-label">Role:</span>
                                        <span>{resume.targetRole}</span>
                                    </div>
                                    <div className="resume-detail">
                                        <Building2 size={13} />
                                        <span className="resume-detail-label">Company:</span>
                                        <span>{resume.targetCompany}</span>
                                    </div>
                                    <div className="resume-detail">
                                        <Clock size={13} />
                                        <span className="resume-detail-label">Experience:</span>
                                        <span>{resume.experience}</span>
                                    </div>
                                    <div className="resume-detail">
                                        {resume.interviewType === 'non-technical' ? <MessageCircle size={13} /> : <Code size={13} />}
                                        <span className="resume-detail-label">Type:</span>
                                        <span style={{ textTransform: 'capitalize' }}>{resume.interviewType || 'technical'}</span>
                                    </div>

                                    {resume.parsedData?.skills?.length > 0 && (
                                        <div className="resume-skills-row">
                                            {resume.parsedData.skills.slice(0, 6).map((skill, i) => (
                                                <span key={i} className="resume-skill-tag">{skill}</span>
                                            ))}
                                            {resume.parsedData.skills.length > 6 && (
                                                <span className="resume-skill-tag more">+{resume.parsedData.skills.length - 6}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="resume-card-actions">
                                {!showDeleteConfirm ? (
                                    <button className="resume-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                                        <Trash2 size={13} />
                                        Delete
                                    </button>
                                ) : (
                                    <AnimatePresence>
                                        <motion.div
                                            className="resume-delete-confirm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <span>Delete this resume?</span>
                                            <button
                                                className="resume-confirm-yes"
                                                onClick={handleDeleteResume}
                                                disabled={deletingResume}
                                            >
                                                {deletingResume ? 'Deleting...' : 'Yes, delete'}
                                            </button>
                                            <button
                                                className="resume-confirm-no"
                                                onClick={() => setShowDeleteConfirm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="resume-empty">
                            <FileText size={24} />
                            <p>No resume uploaded yet</p>
                            <span>Upload one from the Dashboard to get started</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
