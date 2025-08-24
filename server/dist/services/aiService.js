"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLessonPlan = generateLessonPlan;
exports.generateSessionSummary = generateSessionSummary;
exports.generateSkillAssessment = generateSkillAssessment;
// src/services/aiService.ts
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG || process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_PROJECT,
});
// Prefer env-configurable models with safe defaults
const LESSON_MODEL = process.env.OPENAI_MODEL_LESSON || 'gpt-4o-mini';
const SUMMARY_MODEL = process.env.OPENAI_MODEL_SUMMARY || 'gpt-4o-mini';
const AI_DISABLE = (process.env.AI_DISABLE || '').toLowerCase() === 'true';
// Respect rate limits: small retry helper honoring Retry-After and adding jitter
async function callWithRetries(fn, attempts = 2) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch (err) {
            lastErr = err;
            const status = err?.status || err?.code;
            // If account has insufficient quota, bail out immediately so we can fallback fast
            if (err?.error?.code === 'insufficient_quota') {
                throw err;
            }
            // 429 or transient 5xx -> retry with backoff
            if (status === 429 || (typeof status === 'number' && status >= 500)) {
                // Honor Retry-After if present
                let waitMs = 0;
                const ra = err?.headers?.get ? err.headers.get('retry-after') : err?.headers?.['retry-after'];
                if (ra) {
                    const sec = Number(ra);
                    if (!Number.isNaN(sec) && sec > 0)
                        waitMs = sec * 1000;
                }
                // base backoff: 500ms, 1000ms, 2000ms + jitter
                if (!waitMs)
                    waitMs = Math.pow(2, i) * 500;
                waitMs += Math.floor(Math.random() * 200);
                await new Promise((r) => setTimeout(r, waitMs));
                continue;
            }
            // other errors -> no retry
            throw err;
        }
    }
    throw lastErr;
}
function tryParseJsonFromContent(content) {
    try {
        return JSON.parse(content);
    }
    catch {
        // attempt to extract JSON block from possible markdown/code-fenced response
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            }
            catch {
                return null;
            }
        }
        return null;
    }
}
// Simple cooldown to avoid hammering OpenAI when quota is exceeded
let OPENAI_COOLDOWN_UNTIL = 0;
async function generateLessonPlan(request) {
    const prompt = `
Create a detailed lesson plan for a skill-swap session:

Teacher: ${request.teacherName} (${request.teacherLevel} in ${request.teacherSkill})
Learner: ${request.learnerName} (${request.learnerLevel} in ${request.learnerSkill})

The teacher will teach ${request.teacherSkill} while learning ${request.learnerSkill} from the learner.

Please provide a structured lesson plan with:
1. Clear learning objectives
2. Step-by-step activities with time estimates
3. Practical exercises
4. Assessment methods
5. Next steps for continued learning

Format as JSON with this structure:
{
  "title": "Lesson title",
  "objectives": ["objective1", "objective2"],
  "activities": [
    {
      "type": "explanation|practice|demo|discussion",
      "description": "Activity description",
      "duration": minutes,
      "resources": ["resource1", "resource2"]
    }
  ],
  "assessments": ["assessment method"],
  "nextSteps": ["next step 1", "next step 2"]
}
`;
    try {
        if (AI_DISABLE) {
            throw Object.assign(new Error('AI disabled by env'), { error: { code: 'ai_disabled' } });
        }
        if (Date.now() < OPENAI_COOLDOWN_UNTIL) {
            throw Object.assign(new Error('OpenAI cooldown active'), { error: { code: 'insufficient_quota' } });
        }
        const response = await callWithRetries(() => openai.chat.completions.create({
            model: LESSON_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert educational designer creating personalized lesson plans for peer-to-peer skill sharing sessions."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 900
        }));
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content received from OpenAI");
        }
        // Parse JSON response (robust)
        const lessonPlan = tryParseJsonFromContent(content);
        if (!lessonPlan)
            throw new Error('Failed to parse lesson plan JSON');
        return lessonPlan;
    }
    catch (error) {
        console.error("Error generating lesson plan:", error);
        if (error?.error?.code === 'insufficient_quota') {
            // back off for 5 minutes
            OPENAI_COOLDOWN_UNTIL = Date.now() + 5 * 60 * 1000;
        }
        // Fallback lesson plan
        return {
            title: `${request.teacherSkill} Learning Session`,
            objectives: [
                `Learn fundamental concepts of ${request.teacherSkill}`,
                `Practice hands-on ${request.teacherSkill} exercises`,
                `Share knowledge of ${request.learnerSkill}`
            ],
            activities: [
                {
                    type: "discussion",
                    description: "Introduction and goal setting",
                    duration: 10,
                    resources: []
                },
                {
                    type: "explanation",
                    description: `${request.teacherName} explains ${request.teacherSkill} basics`,
                    duration: 20,
                    resources: ["Documentation", "Code examples"]
                },
                {
                    type: "practice",
                    description: "Hands-on practice with guidance",
                    duration: 25,
                    resources: ["Code editor", "Practice exercises"]
                },
                {
                    type: "discussion",
                    description: "Q&A and knowledge exchange",
                    duration: 15,
                    resources: []
                }
            ],
            assessments: ["Practical demonstration", "Peer feedback"],
            nextSteps: [
                "Continue practicing with provided resources",
                "Schedule follow-up session if needed"
            ]
        };
    }
}
async function generateSessionSummary(request) {
    const prompt = `
Generate a comprehensive summary for a completed skill-swap session:

Session Details:
- Participants: ${request.participants.join(', ')}
- Skills exchanged: ${request.teacherSkill} ↔ ${request.learnerSkill}
- Duration: ${request.duration} minutes
- Session notes: ${request.sessionNotes}

Please provide:
1. Key learning outcomes achieved
2. Skills practiced and demonstrated
3. Challenges encountered and solutions
4. Recommendations for future learning
5. Overall session effectiveness rating

Format as a structured summary that both participants can reference for their learning journey.
`;
    try {
        if (AI_DISABLE) {
            throw Object.assign(new Error('AI disabled by env'), { error: { code: 'ai_disabled' } });
        }
        if (Date.now() < OPENAI_COOLDOWN_UNTIL) {
            throw Object.assign(new Error('OpenAI cooldown active'), { error: { code: 'insufficient_quota' } });
        }
        const response = await callWithRetries(() => openai.chat.completions.create({
            model: SUMMARY_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an educational analyst creating insightful summaries of peer learning sessions."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 500
        }), 2); // reduce retries for faster responses
        return response.choices[0]?.message?.content || "Session completed successfully.";
    }
    catch (error) {
        console.error("Error generating session summary:", error);
        if (error?.error?.code === 'insufficient_quota') {
            // back off for 1 minute
            OPENAI_COOLDOWN_UNTIL = Date.now() + 1 * 60 * 1000;
            // immediate fallback
            return `Session Summary:
- Participants: ${request.participants.join(', ')}
- Skills exchanged: ${request.teacherSkill} and ${request.learnerSkill}
- Duration: ${request.duration} minutes
- Session completed successfully with knowledge exchange between participants.`;
        }
        return `Session Summary:
- Participants: ${request.participants.join(', ')}
- Skills exchanged: ${request.teacherSkill} and ${request.learnerSkill}
- Duration: ${request.duration} minutes
- Session completed successfully with knowledge exchange between participants.`;
    }
}
async function generateSkillAssessment(skill, level, responses) {
    const prompt = `
Assess the skill level for ${skill} based on these responses:
${responses.join('\n')}

Current claimed level: ${level}

Provide:
1. Actual skill level assessment (Beginner/Intermediate/Advanced)
2. Strengths identified
3. Areas for improvement
4. Recommended learning path
`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a technical skill assessor providing constructive feedback."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        return response.choices[0]?.message?.content || "Assessment completed.";
    }
    catch (error) {
        console.error("Error generating skill assessment:", error);
        return "Skill assessment completed. Continue practicing to improve your abilities.";
    }
}
