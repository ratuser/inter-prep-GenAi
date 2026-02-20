const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Resume = require('../models/Resume');

// Multer config — memory storage for cloud compatibility
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
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
                    pdfBuffer: req.file.buffer,
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

// ──────────────────────────────────────────────
// Skill keyword dictionaries for categorization
// ──────────────────────────────────────────────
const SKILL_CATEGORIES = {
    frontend: [
        'html', 'css', 'javascript', 'typescript', 'react', 'reactjs', 'react.js',
        'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'svelte', 'next.js', 'nextjs',
        'nuxt', 'nuxtjs', 'gatsby', 'tailwind', 'tailwindcss', 'bootstrap', 'sass',
        'scss', 'less', 'styled-components', 'material-ui', 'mui', 'chakra ui',
        'ant design', 'redux', 'zustand', 'mobx', 'jquery', 'framer motion',
        'three.js', 'threejs', 'd3', 'd3.js', 'gsap', 'pwa', 'responsive design',
        'figma', 'webflow', 'handlebars', 'ejs', 'pug', 'shadcn',
    ],
    backend: [
        'node', 'nodejs', 'node.js', 'express', 'expressjs', 'express.js',
        'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot',
        'rails', 'ruby on rails', 'laravel', 'asp.net', '.net', 'dotnet',
        'nestjs', 'nest.js', 'koa', 'hapi', 'fastify', 'gin', 'echo',
        'fiber', 'actix', 'rocket', 'rest api', 'restful', 'graphql',
        'grpc', 'websocket', 'socket.io', 'microservices', 'serverless',
        'passport', 'jwt', 'oauth', 'api gateway',
    ],
    database: [
        'mongodb', 'mongoose', 'mysql', 'postgresql', 'postgres', 'sqlite',
        'redis', 'cassandra', 'dynamodb', 'firebase', 'firestore', 'supabase',
        'mariadb', 'oracle', 'sql server', 'mssql', 'neo4j', 'couchdb',
        'elasticsearch', 'prisma', 'sequelize', 'typeorm', 'knex',
        'sql', 'nosql', 'database design', 'data modeling',
    ],
    devops: [
        'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'google cloud',
        'heroku', 'vercel', 'netlify', 'digitalocean', 'terraform', 'ansible',
        'jenkins', 'ci/cd', 'cicd', 'github actions', 'gitlab ci', 'circleci',
        'travis ci', 'nginx', 'apache', 'linux', 'ubuntu', 'bash', 'shell',
        'powershell', 'cloudflare', 'load balancer', 'prometheus', 'grafana',
        'datadog', 'new relic', 'elk stack', 'vagrant',
    ],
    languages: [
        'python', 'java', 'c', 'c++', 'cpp', 'c#', 'csharp', 'go', 'golang',
        'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'perl', 'r',
        'matlab', 'haskell', 'elixir', 'erlang', 'lua', 'dart', 'objective-c',
        'assembly', 'fortran', 'cobol', 'solidity',
    ],
    buildTools: [
        'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'turbopack',
        'babel', 'gulp', 'grunt', 'npm', 'yarn', 'pnpm', 'lerna', 'nx',
        'turborepo', 'make', 'cmake', 'maven', 'gradle', 'pip', 'poetry',
        'cargo', 'composer',
    ],
    testing: [
        'jest', 'mocha', 'chai', 'jasmine', 'cypress', 'playwright',
        'selenium', 'puppeteer', 'testing library', 'react testing library',
        'enzyme', 'vitest', 'supertest', 'pytest', 'junit', 'phpunit',
        'rspec', 'postman', 'insomnia', 'storybook', 'unit testing',
        'integration testing', 'e2e testing', 'tdd', 'bdd',
    ],
};

// Helper: smarter name extraction
function extractName(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    // Headers/labels to skip
    const skipPatterns = [
        /^(resume|curriculum vitae|cv|portfolio|profile|personal info|contact)/i,
        /^(page|http|www\.|@)/i,
        /^\d/,               // lines starting with numbers
        /^[^a-zA-Z]/,        // lines not starting with a letter
    ];

    for (const line of lines.slice(0, 8)) {
        // Skip obviously non-name lines
        if (skipPatterns.some(p => p.test(line))) continue;
        // Skip if it looks like an email or URL
        if (line.includes('@') || line.includes('http') || line.includes('www.')) continue;
        // Skip very long lines (likely a paragraph, not a name)
        if (line.length > 60) continue;
        // Skip lines with too many words (names are usually 2-4 words)
        const wordCount = line.split(/\s+/).length;
        if (wordCount > 5) continue;
        // Good candidate — a short line with 1-4 words at the top
        if (wordCount >= 1 && wordCount <= 4) {
            return line;
        }
    }
    return lines[0] || '';
}

// Helper: extract and categorize skills
function extractAndCategorizeSkills(rawText) {
    const categorized = {
        frontend: [],
        backend: [],
        database: [],
        devops: [],
        languages: [],
        buildTools: [],
        testing: [],
        other: [],
    };

    // Try to find a skills section first
    const skillsSectionMatch = rawText.match(
        /(?:skills|technologies|tech stack|technical skills|core competencies|proficiencies|tools?\s*(?:&|and)\s*technologies)[:\s]*\n?([\s\S]*?)(?=\n\s*(?:experience|work\s*history|employment|education|academic|projects|certifications|awards|references|achievements|publications|interests|hobbies)\b|$)/i
    );

    let skillTokens = [];

    if (skillsSectionMatch) {
        // Split skill section into tokens
        skillTokens = skillsSectionMatch[1]
            .split(/[,|•·▪▸►●✦★☆\n;]/g)
            .map(s => s.replace(/[-–—:]/g, ' ').trim())
            .filter(s => s.length > 0 && s.length < 60);
    }

    // Also scan the entire text for known skills (catches skills outside the section)
    const lowerText = rawText.toLowerCase();

    const matched = new Set();

    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
        for (const keyword of keywords) {
            // Word-boundary match in the full text
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lowerText)) {
                // Normalize the display name (capitalize first letter of each word)
                const displayName = keyword
                    .split(/\s+/)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                if (!matched.has(keyword.toLowerCase())) {
                    matched.add(keyword.toLowerCase());
                    categorized[category].push(displayName);
                }
            }
        }
    }

    // Any tokens from the skills section that weren't categorized go to "other"
    if (skillsSectionMatch) {
        for (const token of skillTokens) {
            const lowerToken = token.toLowerCase().trim();
            if (lowerToken.length < 2) continue;
            if (!matched.has(lowerToken)) {
                // Check if any known keyword is a substring
                let found = false;
                for (const keywords of Object.values(SKILL_CATEGORIES)) {
                    for (const kw of keywords) {
                        if (lowerToken === kw || lowerToken.includes(kw)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found && token.trim().length > 1) {
                    categorized.other.push(token.trim());
                }
            }
        }
    }

    return categorized;
}

// Helper: extract structured info from raw PDF text
function extractResumeData(rawText) {
    // Extract name (smarter approach)
    const name = extractName(rawText);

    // Extract email
    const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[\w.]+/i);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract and categorize skills
    const skills = extractAndCategorizeSkills(rawText);

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
        if (!resume.pdfBuffer) {
            return res.status(400).json({ message: 'No PDF data found. Please re-upload your resume.' });
        }
        const parser = new PDFParse({ data: resume.pdfBuffer });
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

        await Resume.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadResume, getResumeStatus, analyseResume, deleteResume };
