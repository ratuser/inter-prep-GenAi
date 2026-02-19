const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry helper with exponential backoff for rate-limited API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(fn, maxRetries = 5, baseDelay = 5000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit =
                error.status === 429 ||
                error.message?.includes('429') ||
                error.message?.includes('RESOURCE_EXHAUSTED');

            if (isRateLimit && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt); // 2s, 4s, 8s
                console.log(`Rate limited — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
                await sleep(delay);
                continue;
            }
            throw error; // not a rate limit or out of retries
        }
    }
}

// @desc    Chat with AI interviewer
// @route   POST /api/interview/chat
const chatWithAI = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        const userId = req.userId;

        // Get the user's resume data
        const resume = await Resume.findOne({ userId });
        if (!resume || resume.status !== 'analysed') {
            return res.status(400).json({ message: 'Please upload and analyse your resume first.' });
        }

        const { parsedData, targetRole, targetCompany, experience, interviewType } = resume;

        // Build a MINIMAL system prompt to save tokens (free tier)
        const isNonTech = interviewType === 'non-technical';
        const topSkills = (parsedData.skills || []).slice(0, 5).join(', ');

        const systemPrompt = `You are interviewing a candidate for ${targetRole} at ${targetCompany}. Experience: ${experience}. Skills: ${topSkills || 'N/A'}.
Rules: Ask ONE question at a time. Keep responses to 2-3 sentences. ${isNonTech ? 'Only behavioral/soft-skill questions, NO coding.' : 'Mix technical and behavioral questions.'} Give brief feedback after each answer. After 8 exchanges, summarize performance.`;

        // DEBUG: Log what we're sending to Gemini
        console.log('\n===== GEMINI REQUEST =====');
        console.log('System prompt length:', systemPrompt.length, 'chars');
        console.log('System prompt:', systemPrompt);
        console.log('History messages:', (conversationHistory || []).length);
        console.log('User message:', message);
        console.log('==========================\n');

        // Build conversation for Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: systemPrompt,
        });

        // Cap history to last 4 messages to save tokens
        let trimmedHistory = (conversationHistory || []).slice(-4);

        // Gemini requires history to start with 'user' role — drop any leading 'model' entries
        let history = trimmedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const chat = model.startChat({ history });

        // Use retry wrapper for the Gemini API call
        const result = await callWithRetry(() =>
            chat.sendMessage(message || 'Start the interview.')
        );
        const aiResponse = result.response.text();

        res.json({
            message: aiResponse,
            role: 'ai',
        });
    } catch (error) {
        console.error('Interview chat error:', error.message || error);
        if (error.status) console.error('Status:', error.status);
        if (error.errorDetails) console.error('Details:', JSON.stringify(error.errorDetails));

        const isRateLimit =
            error.status === 429 ||
            error.message?.includes('429') ||
            error.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit) {
            return res.status(429).json({
                message: 'AI service is rate limited. Please wait a few seconds and try again.',
            });
        }

        res.status(500).json({ message: 'AI service error. Please try again.' });
    }
};

module.exports = { chatWithAI };
