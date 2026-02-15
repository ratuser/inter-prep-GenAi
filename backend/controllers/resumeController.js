const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const Resume = require('../models/Resume');

// Multer config — only allow PDF
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.userId}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('resume');

// @desc    Upload a resume (PDF only)
// @route   POST /api/resume/upload
const uploadResume = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            if (err.message === 'Only PDF files are allowed') {
                return res.status(400).json({ message: 'Only PDF files are allowed' });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size must be under 10MB' });
            }
            return res.status(500).json({ message: 'Upload failed' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const resume = await Resume.findOneAndUpdate(
                { userId: req.userId },
                {
                    userId: req.userId,
                    originalName: req.file.originalname,
                    filePath: req.file.path,
                    status: 'uploaded',
                    targetRole: '',
                    targetCompany: '',
                    experience: '',
                    interviewType: 'technical',
                    parsedData: {},
                },
                { upsert: true, new: true, returnDocument: 'after' }
            );

            res.status(201).json({
                message: 'Resume uploaded successfully',
                resume: {
                    id: resume._id,
                    originalName: resume.originalName,
                    status: resume.status,
                },
            });
        } catch (error) {
            console.error('Resume upload error:', error);
            res.status(500).json({ message: 'Server error during upload' });
        }
    });
};

// @desc    Check if user has a resume uploaded
// @route   GET /api/resume/status
const getResumeStatus = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.json({ hasResume: false });
        }

        res.json({
            hasResume: true,
            resume: {
                id: resume._id,
                originalName: resume.originalName,
                status: resume.status,
                targetRole: resume.targetRole,
                targetCompany: resume.targetCompany,
                experience: resume.experience,
                interviewType: resume.interviewType,
                parsedData: resume.parsedData,
            },
        });
    } catch (error) {
        console.error('Resume status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper: extract structured info from raw PDF text
function extractResumeData(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract name (usually first non-empty line)
    const name = lines[0] || '';

    // Extract email
    const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.]+/i);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract skills — look for common skill section headers
    const skillsSection = rawText.match(/(?:skills|technologies|tech stack|technical skills)[:\s]*([^\n]*(?:\n(?![A-Z][a-z]*:)[^\n]*)*)/i);
    let skills = [];
    if (skillsSection) {
        skills = skillsSection[1]
            .split(/[,|•·▪▸►●\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 50);
    }

    // Extract experience section
    const expSection = rawText.match(/(?:experience|work history|employment)[:\s]*\n?([\s\S]*?)(?=\n\s*(?:education|skills|projects|certifications|awards|references|$))/i);
    const experienceText = expSection ? expSection[1].trim().substring(0, 500) : '';

    // Extract education section
    const eduSection = rawText.match(/(?:education|academic|qualifications)[:\s]*\n?([\s\S]*?)(?=\n\s*(?:experience|skills|projects|certifications|awards|references|$))/i);
    const education = eduSection ? eduSection[1].trim().substring(0, 300) : '';

    return { name, email, phone, skills, experienceText, education, rawText: rawText.substring(0, 3000) };
}

// @desc    Parse PDF and save job details
// @route   POST /api/resume/analyse
const analyseResume = async (req, res) => {
    try {
        const { targetRole, targetCompany, experience, interviewType } = req.body;

        if (!targetRole || !targetCompany || !experience) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
        }

        // Parse the PDF (pdf-parse v2 API)
        const pdfBuffer = fs.readFileSync(resume.filePath);
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        const rawText = pdfData.text || '';

        // Extract structured data
        const parsedData = extractResumeData(rawText);

        // Update resume
        resume.targetRole = targetRole;
        resume.targetCompany = targetCompany;
        resume.experience = experience;
        resume.interviewType = interviewType || 'technical';
        resume.status = 'analysed';
        resume.parsedData = parsedData;
        await resume.save();

        res.json({
            message: 'Resume analysed successfully',
            parsedData: {
                name: parsedData.name,
                email: parsedData.email,
                phone: parsedData.phone,
                skills: parsedData.skills,
                experienceText: parsedData.experienceText,
                education: parsedData.education,
            },
        });
    } catch (error) {
        console.error('Resume analyse error:', error);
        res.status(500).json({ message: 'Server error during analysis' });
    }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Delete the uploaded file
        const fs = require('fs');
        if (resume.filePath && fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        await Resume.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadResume, getResumeStatus, analyseResume, deleteResume };
