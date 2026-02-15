const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry helper with exponential backoff for rate-limited API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(fn, maxRetries = 3, baseDelay = 2000) {
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

        // Build the system prompt based on interview type
        const isNonTech = interviewType === 'non-technical';

        const systemPrompt = `You are an expert interviewer at ${targetCompany} conducting a mock interview for the role of ${targetRole}.

CANDIDATE PROFILE:
- Name: ${parsedData.name || 'Not provided'}
- Experience Level: ${experience}
- Skills: ${parsedData.skills?.join(', ') || 'Not listed'}
- Experience: ${parsedData.experienceText || 'Not provided'}
- Education: ${parsedData.education || 'Not provided'}

YOUR BEHAVIOR:
1. Act as a professional, friendly interviewer
2. Ask ONE question at a time — never stack multiple questions
3. Start with a brief intro, then ask your first question
${isNonTech
                ? `4. Focus ONLY on behavioral, situational, communication, and leadership questions
5. Ask about teamwork, conflict resolution, problem-solving scenarios, and past experiences
6. Do NOT ask any coding, technical, or algorithm questions
7. Evaluate communication clarity, confidence, and structured thinking (e.g. STAR method)`
                : `4. Mix technical questions (based on their skills) with behavioral questions
5. Include coding concepts, system design, and problem-solving questions relevant to ${targetRole}`}
6. After the candidate answers, give brief constructive feedback, then ask the next question
7. Tailor difficulty to their experience level (${experience})
8. Keep responses concise — max 3-4 sentences per turn
9. After about 8-10 exchanges, wrap up the interview with a summary of their performance
10. Be encouraging but honest — point out areas to improve

IMPORTANT: You are interviewing for ${targetRole} at ${targetCompany}. Make it feel like a real interview.${isNonTech ? ' This is a NON-TECHNICAL interview — focus entirely on soft skills and behavioral questions.' : ''}`;

        // Build conversation for Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: systemPrompt,
        });

        // Gemini requires history to start with 'user' role — drop any leading 'model' entries
        let history = (conversationHistory || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const chat = model.startChat({ history });

        // Use retry wrapper for the Gemini API call
        const result = await callWithRetry(() =>
            chat.sendMessage(message || 'Hello, I am ready for the interview. Please introduce yourself and start.')
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
