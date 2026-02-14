const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

        const { parsedData, targetRole, targetCompany, experience } = resume;

        // Build the system prompt
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
4. Mix technical questions (based on their skills) with behavioral questions
5. After the candidate answers, give brief constructive feedback, then ask the next question
6. Tailor difficulty to their experience level (${experience})
7. Keep responses concise — max 3-4 sentences per turn
8. After about 8-10 exchanges, wrap up the interview with a summary of their performance
9. Be encouraging but honest — point out areas to improve

IMPORTANT: You are interviewing for ${targetRole} at ${targetCompany}. Make it feel like a real interview.`;

        // Build conversation for Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: systemPrompt,
        });

        const chat = model.startChat({
            history: (conversationHistory || []).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessage(message || 'Hello, I am ready for the interview. Please introduce yourself and start.');
        const aiResponse = result.response.text();

        res.json({
            message: aiResponse,
            role: 'ai',
        });
    } catch (error) {
        console.error('Interview chat error:', error.message || error);
        if (error.status) console.error('Status:', error.status);
        if (error.errorDetails) console.error('Details:', JSON.stringify(error.errorDetails));
        res.status(500).json({ message: 'AI service error. Please try again.' });
    }
};

module.exports = { chatWithAI };
