const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    pdfBuffer: {
        type: Buffer,
    },
    targetRole: {
        type: String,
        default: '',
    },
    targetCompany: {
        type: String,
        default: '',
    },
    experience: {
        type: String,
        default: '',
    },
    interviewType: {
        type: String,
        enum: ['technical', 'non-technical'],
        default: 'technical',
    },
    status: {
        type: String,
        enum: ['uploaded', 'analysing', 'analysed'],
        default: 'uploaded',
    },
    parsedData: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        skills: {
            frontend: [{ type: String }],
            backend: [{ type: String }],
            database: [{ type: String }],
            devops: [{ type: String }],
            languages: [{ type: String }],
            buildTools: [{ type: String }],
            testing: [{ type: String }],
            other: [{ type: String }],
        },
        experienceText: { type: String, default: '' },
        education: { type: String, default: '' },
        rawText: { type: String, default: '' },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Resume', resumeSchema);
