// src/services/aiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface LessonPlanRequest {
	teacherSkill: string;
	learnerSkill: string;
	teacherLevel: string;
	learnerLevel: string;
	teacherName: string;
	learnerName: string;
}

interface SessionSummaryRequest {
	sessionId: string;
	teacherSkill: string;
	learnerSkill: string;
	sessionNotes: string;
	duration: number;
	participants: string[];
}

export async function generateLessonPlan(request: LessonPlanRequest) {
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
		const response = await openai.chat.completions.create({
			model: "gpt-4",
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
			max_tokens: 1500
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No content received from OpenAI");
		}

		// Parse JSON response
		const lessonPlan = JSON.parse(content);
		return lessonPlan;
	} catch (error) {
		console.error("Error generating lesson plan:", error);
		
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

export async function generateSessionSummary(request: SessionSummaryRequest) {
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
		const response = await openai.chat.completions.create({
			model: "gpt-4",
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
			max_tokens: 800
		});

		return response.choices[0]?.message?.content || "Session completed successfully.";
	} catch (error) {
		console.error("Error generating session summary:", error);
		return `Session Summary:
- Participants: ${request.participants.join(', ')}
- Skills exchanged: ${request.teacherSkill} and ${request.learnerSkill}
- Duration: ${request.duration} minutes
- Session completed successfully with knowledge exchange between participants.`;
	}
}

export async function generateSkillAssessment(skill: string, level: string, responses: string[]) {
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
	} catch (error) {
		console.error("Error generating skill assessment:", error);
		return "Skill assessment completed. Continue practicing to improve your abilities.";
	}
}
