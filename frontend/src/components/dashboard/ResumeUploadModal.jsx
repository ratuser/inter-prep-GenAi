import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, AlertCircle, Briefcase, Building2, Clock, Sparkles, User, Mail, Phone, Code, GraduationCap, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const STEPS = {
    UPLOAD: 'upload',
    SUCCESS: 'success',
    DETAILS: 'details',
    ANALYSING: 'analysing',
    CONFIRM: 'confirm',
};

const experienceOptions = [
    'Fresher (0 years)',
    '1-2 years',
    '3-5 years',
    '5-8 years',
    '8+ years',
];

export default function ResumeUploadModal({ isOpen, onClose, onComplete }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [targetCompany, setTargetCompany] = useState('');
    const [experience, setExperience] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const fileInputRef = useRef(null);

    const resetState = useCallback(() => {
        setStep(STEPS.UPLOAD);
        setDragOver(false);
        setUploading(false);
        setUploadedFile(null);
        setError('');
        setTargetRole('');
        setTargetCompany('');
        setExperience('');
        setParsedData(null);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFile = async (file) => {
        setError('');

        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed. Please select a .pdf file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be under 10MB.');
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('resume', file);

            const res = await fetch(`${API_BASE}/resume/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');

            setUploadedFile({ name: file.name, size: file.size });
            setStep(STEPS.SUCCESS);
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleAnalyse = async () => {
        if (!targetRole.trim() || !targetCompany.trim() || !experience) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setStep(STEPS.ANALYSING);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/resume/analyse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ targetRole, targetCompany, experience }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Analysis failed');

            // Show scanning animation for a moment, then move to confirmation
            setTimeout(() => {
                setParsedData(data.parsedData);
                setStep(STEPS.CONFIRM);
            }, 2500);
        } catch (err) {
            setError(err.message);
            setStep(STEPS.DETAILS);
        }
    };

    const handleConfirmAndStart = () => {
        if (onComplete) onComplete();
        handleClose();
        navigate('/dashboard/interview');
    };

    const handleReupload = () => {
        resetState();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    if (!isOpen) return null;

    const stepLabels = ['Upload', 'Confirm', 'Details', 'Analyse', 'Review'];
    const stepKeys = [STEPS.UPLOAD, STEPS.SUCCESS, STEPS.DETAILS, STEPS.ANALYSING, STEPS.CONFIRM];
    const currentIdx = stepKeys.indexOf(step);

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className={`modal-container ${step === STEPS.CONFIRM ? 'modal-wide' : ''}`}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button className="modal-close-btn" onClick={handleClose}>
                        <X size={18} />
                    </button>

                    {/* Step indicators */}
                    <div className="modal-steps">
                        {stepLabels.map((label, i) => (
                            <div
                                key={label}
                                className={`modal-step-dot ${i <= currentIdx ? 'active' : ''} ${i < currentIdx ? 'completed' : ''}`}
                            >
                                <div className="modal-step-circle">{i < currentIdx ? '✓' : i + 1}</div>
                                <span className="modal-step-label">{label}</span>
                            </div>
                        ))}
                        <div className="modal-step-line" />
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Upload */}
                        {step === STEPS.UPLOAD && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="modal-step-content"
                            >
                                <h2 className="modal-title">Upload Your Resume</h2>
                                <p className="modal-subtitle">Upload your resume in PDF format to get started</p>

                                <div
                                    className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />

                                    {uploading ? (
                                        <div className="upload-spinner">
                                            <div className="spinner" />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="upload-icon-wrapper">
                                                <Upload size={32} />
                                            </div>
                                            <p className="upload-text">
                                                Drag & drop your PDF here, or <span className="upload-link">browse</span>
                                            </p>
                                            <p className="upload-hint">PDF only • Max 10MB</p>
                                        </>
                                    )}
                                </div>

                                {error && (
                                    <motion.div
                                        className="upload-error"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 2: Success */}
                        {step === STEPS.SUCCESS && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="modal-step-content"
                            >
                                <div className="success-container">
                                    <motion.div
                                        className="success-check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                                    >
                                        <CheckCircle size={48} />
                                    </motion.div>
                                    <motion.h2
                                        className="modal-title"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Upload Successful!
                                    </motion.h2>
                                    <motion.div
                                        className="uploaded-file-info"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <FileText size={18} />
                                        <div>
                                            <div className="uploaded-file-name">{uploadedFile?.name}</div>
                                            <div className="uploaded-file-size">{formatFileSize(uploadedFile?.size || 0)}</div>
                                        </div>
                                    </motion.div>
                                    <motion.button
                                        className="modal-continue-btn"
                                        onClick={() => setStep(STEPS.DETAILS)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Continue
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Details Form */}
                        {step === STEPS.DETAILS && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="modal-step-content"
                            >
                                <h2 className="modal-title">Tell Us More</h2>
                                <p className="modal-subtitle">Help us tailor the analysis to your goals</p>

                                <div className="details-form">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Briefcase size={14} />
                                            Target Role
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Frontend Developer"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Building2 size={14} />
                                            Target Company
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Google"
                                            value={targetCompany}
                                            onChange={(e) => setTargetCompany(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Clock size={14} />
                                            Work Experience
                                        </label>
                                        <select
                                            className="form-input form-select"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                        >
                                            <option value="">Select experience</option>
                                            {experienceOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        className="upload-error"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <button className="analyse-btn" onClick={handleAnalyse}>
                                    <Sparkles size={18} />
                                    Analyse Resume
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 4: Analysing */}
                        {step === STEPS.ANALYSING && (
                            <motion.div
                                key="analysing"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="modal-step-content"
                            >
                                <div className="scanning-container">
                                    <div className="scanning-doc">
                                        <FileText size={64} className="scanning-doc-icon" />
                                        <motion.div
                                            className="scanning-line"
                                            animate={{ y: [0, 120, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </div>
                                    <motion.h2
                                        className="modal-title scanning-title"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        Scanning Your Resume...
                                    </motion.h2>
                                    <p className="modal-subtitle">
                                        Extracting your profile for <strong>{targetRole}</strong> at <strong>{targetCompany}</strong>
                                    </p>
                                    <div className="scanning-dots">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="scanning-dot"
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Confirm extracted data */}
                        {step === STEPS.CONFIRM && parsedData && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="modal-step-content"
                            >
                                <h2 className="modal-title">We Found Your Profile</h2>
                                <p className="modal-subtitle">Please confirm the extracted information</p>

                                <div className="parsed-info-grid">
                                    {parsedData.name && (
                                        <motion.div className="parsed-info-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                            <div className="parsed-info-icon"><User size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Name</div>
                                                <div className="parsed-info-value">{parsedData.name}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {parsedData.email && (
                                        <motion.div className="parsed-info-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                            <div className="parsed-info-icon"><Mail size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Email</div>
                                                <div className="parsed-info-value">{parsedData.email}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {parsedData.phone && (
                                        <motion.div className="parsed-info-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <div className="parsed-info-icon"><Phone size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Phone</div>
                                                <div className="parsed-info-value">{parsedData.phone}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {parsedData.education && (
                                        <motion.div className="parsed-info-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                            <div className="parsed-info-icon"><GraduationCap size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Education</div>
                                                <div className="parsed-info-value">{parsedData.education.substring(0, 100)}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {parsedData.skills && parsedData.skills.length > 0 && (
                                        <motion.div className="parsed-info-card parsed-info-wide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                            <div className="parsed-info-icon"><Code size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Skills</div>
                                                <div className="parsed-skills-tags">
                                                    {parsedData.skills.slice(0, 10).map((skill, i) => (
                                                        <span key={i} className="skill-tag">{skill}</span>
                                                    ))}
                                                    {parsedData.skills.length > 10 && (
                                                        <span className="skill-tag skill-tag-more">+{parsedData.skills.length - 10} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {parsedData.experienceText && (
                                        <motion.div className="parsed-info-card parsed-info-wide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                            <div className="parsed-info-icon"><Briefcase size={16} /></div>
                                            <div>
                                                <div className="parsed-info-label">Experience</div>
                                                <div className="parsed-info-value parsed-info-exp">{parsedData.experienceText.substring(0, 150)}...</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="confirm-actions">
                                    <button className="reupload-btn" onClick={handleReupload}>
                                        <RotateCcw size={16} />
                                        Re-upload
                                    </button>
                                    <button className="analyse-btn confirm-start-btn" onClick={handleConfirmAndStart}>
                                        <Sparkles size={18} />
                                        Confirm & Start Interview
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
