const Groq = require('groq-sdk');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
                error.message?.includes('rate_limit');

            if (isRateLimit && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limited — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
                await sleep(delay);
                continue;
            }
            throw error;
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

        // Flatten categorized skills for the prompt
        const allSkills = parsedData.skills
            ? Object.values(parsedData.skills).flat().slice(0, 12).join(', ')
            : '';

        // Determine which question we're on based on conversation history
        // Each AI message = 1 question. The first "Start the interview" triggers Q1.
        const history = conversationHistory || [];
        const aiMessageCount = history.filter(m => m.role === 'ai').length;
        const questionNumber = aiMessageCount + 1; // Next question to ask

        // Interview structure (10 questions total):
        // Q1-Q3: Technical concept questions
        // Q4-Q7: Pseudo code / "what's the output" questions
        // Q8:    Behavioral question
        // Q9:    One final technical question
        // Q10:   Comprehensive feedback & performance summary
        const isNonTech = interviewType === 'non-technical';

        let questionInstruction;
        if (isNonTech) {
            // Non-technical has its own flow
            if (questionNumber <= 8) {
                questionInstruction = `This is question ${questionNumber} of 9. Ask a behavioral/soft-skill question.`;
            } else {
                questionInstruction = `The interview is NOW OVER (all 8 questions done). Do NOT ask another question. Provide a COMPREHENSIVE PERFORMANCE SUMMARY:

1. Overall Rating: X/10 (give an honest numerical score)
2. Question-by-Question Analysis: Briefly mention what went well or poorly in each answer
3. Key Strengths: 2-3 things the candidate did well
4. Areas to Improve: 2-3 specific weaknesses with actionable advice
5. Recommended Courses & Certifications: Suggest 2-3 REAL courses from Coursera, Udemy, LinkedIn Learning, or other platforms that would help the candidate improve on their weak areas. Include the course name and platform.
6. Final Verdict: hire/maybe/no-hire recommendation with reasoning

End your response with exactly: "🎯 Interview complete."`;
            }
        } else {
            // Technical interview structure
            if (questionNumber <= 3) {
                questionInstruction = `This is question ${questionNumber} of 9. Ask a TECHNICAL CONCEPT question — theory, architecture, or how something works. Topics should be based on the candidate's skills: ${allSkills}. Do NOT give code. Just ask a conceptual question.`;
            } else if (questionNumber <= 7) {
                questionInstruction = `This is question ${questionNumber} of 9. Ask a PSEUDO CODE / OUTPUT question — show a short code snippet (5-10 lines max) and ask "What will be the output?" or "What does this code do?" or "Find the bug." Use languages/frameworks the candidate knows: ${allSkills}.`;
            } else if (questionNumber === 8) {
                questionInstruction = `This is question ${questionNumber} of 9. Ask ONE behavioral question — teamwork, problem-solving approach, handling deadlines, or a challenging project experience. This is the only behavioral question in this interview.`;
            } else if (questionNumber === 9) {
                questionInstruction = `This is the LAST question (${questionNumber}/9). Ask one final technical question — can be system design, optimization, or a tricky concept.`;
            } else {
                questionInstruction = `The interview is NOW OVER (all 9 questions done). Do NOT ask another question. Provide a COMPREHENSIVE PERFORMANCE SUMMARY:

1. Overall Rating: X/10 (give an honest numerical score)
2. Question-by-Question Analysis: Briefly mention what went well or poorly in each answer
3. Key Strengths: 2-3 things the candidate did well
4. Areas to Improve: 2-3 specific weaknesses with actionable advice
5. Recommended Courses & Certifications: Suggest 2-3 REAL courses from Coursera, Udemy, LinkedIn Learning, or other platforms that would help the candidate improve on their weak areas. Include the course name and platform.
6. Final Verdict: hire/maybe/no-hire recommendation with reasoning

End your response with exactly: "🎯 Interview complete."`;
            }
        }

        const sessionSeed = Math.floor(Math.random() * 10000);

        const systemPrompt = `You are a professional interviewer conducting a ${isNonTech ? 'NON-TECHNICAL behavioral' : 'TECHNICAL'} interview for ${targetRole} at ${targetCompany}.
Candidate: ${experience} experience. Skills: ${allSkills || 'N/A'}.
Session ID: ${sessionSeed} (use this to vary your questions — NEVER repeat questions from previous sessions)

CURRENT INSTRUCTION: ${questionInstruction}

RULES:
- Ask ONE question at a time. Keep questions concise (2-3 sentences max).
- ${isNonTech ? 'Only behavioral/soft-skill questions. No coding.' : 'If the candidate says they don\'t know a topic, switch to another skill immediately.'}
- Give brief feedback on the previous answer before asking the next question.
- Do NOT number your questions like "Question 1:" — just ask naturally.
- IMPORTANT: Ask UNIQUE, CREATIVE questions every session. Cover different sub-topics, edge cases, and difficulty levels. Avoid generic or common interview questions.`;



        // Build messages array for Groq
        const messages = [
            { role: 'system', content: systemPrompt },
        ];

        // Add conversation history (send more history for better context)
        const trimmedHistory = history.slice(-8);
        for (const msg of trimmedHistory) {
            messages.push({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content,
            });
        }

        // Add the current user message
        messages.push({
            role: 'user',
            content: message || 'Start the interview.',
        });

        // Call Groq API with retry
        const chatCompletion = await callWithRetry(() =>
            groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_completion_tokens: questionNumber >= 10 ? 1000 : 300,
            })
        );

        const aiResponse = chatCompletion.choices[0]?.message?.content || 'No response generated.';
        const interviewComplete = questionNumber >= 10;

        res.json({
            message: aiResponse,
            role: 'ai',
            questionNumber,
            interviewComplete,
        });
    } catch (error) {
        console.error('Interview chat error:', error.message || error);
        if (error.status) console.error('Status:', error.status);

        const isRateLimit =
            error.status === 429 ||
            error.message?.includes('429') ||
            error.message?.includes('rate_limit');

        if (isRateLimit) {
            return res.status(429).json({
                message: 'AI service is rate limited. Please wait a few seconds and try again.',
            });
        }

        res.status(500).json({ message: 'AI service error. Please try again.' });
    }
};

// @desc    Save completed interview results
// @route   POST /api/interview/complete
const completeInterview = async (req, res) => {
    try {
        const userId = req.userId;
        const { feedbackMessage } = req.body;

        // Get resume info for the interview title
        const resume = await Resume.findOne({ userId });
        if (!resume) {
            return res.status(400).json({ message: 'No resume found.' });
        }

        const { targetRole, targetCompany, interviewType } = resume;

        // Extract score from feedback text (e.g. "7/10" or "7 out of 10")
        let score = 50; // default if we can't parse
        const scoreMatch = feedbackMessage?.match(/(\d+)\s*(?:\/|out of)\s*10/i);
        if (scoreMatch) {
            score = Math.min(parseInt(scoreMatch[1], 10) * 10, 100);
        }

        // Map interviewType to Interview model category
        const categoryMap = {
            'technical': 'technical',
            'non-technical': 'behavioral',
        };
        const category = categoryMap[interviewType] || 'technical';

        const interview = await Interview.create({
            userId,
            title: `${targetRole} at ${targetCompany}`,
            category,
            score,
            questionsCount: 9,
        });

        res.json({
            message: 'Interview saved successfully.',
            interview: {
                id: interview._id,
                title: interview.title,
                score: interview.score,
                category: interview.category,
            },
        });
    } catch (error) {
        console.error('Complete interview error:', error.message || error);
        res.status(500).json({ message: 'Failed to save interview results.' });
    }
};

module.exports = { chatWithAI, completeInterview };
