// src/services/aiService.ts
// AI service using Gemini as the primary provider. OpenAI removed per project configuration.

// Minimal Gemini chat helper using runtime require to avoid TS compile dependency
async function callGeminiChat(
	systemText: string,
	userText: string,
	model = GEMINI_MODEL
): Promise<string> {
	if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	// @ts-ignore
	const { GoogleGenerativeAI } = require("@google/generative-ai");
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const m = genAI.getGenerativeModel({ model });
	const prompt = `${systemText}\n\nUser:\n${userText}`;
	const result = await m.generateContent([{ text: prompt }]);
	const text = result?.response?.text?.();
	if (!text) throw new Error("Gemini returned no content");
	return text as string;
}

// General-purpose assistant for in-session Q&A and topic outlines
export async function generateAssistantAnswer(params: {
	question?: string;
	mode?: "qa" | "topic";
	topic?: string;
	depth?: "short" | "medium" | "deep";
	context?: string; // optional session context (transcript/notes)
}): Promise<{
	answer: string;
	meta?: {
		fallback?: boolean;
		reason?: string;
		model?: string;
		cooldownMs?: number;
		cooldownUntil?: number;
		provider?: string;
	};
}> {
	const mode = params.mode || "qa";
	const depth = params.depth || "medium";
	const contextBlock = params.context
		? `\nContext (may be partial):\n${params.context}\n`
		: "";

	const userContent =
		mode === "topic"
			? `Create a compact topic outline for ${
					params.topic || "General CS Topic"
			  } at ${depth} depth. Include bullets for: Overview, Core Concepts, Examples, Practice Tasks, Resources.`
			: `${params.question}`;

	const system = `You are a concise, friendly coding assistant inside a live pair-programming app. Provide step-by-step, practical help. If the user asks for debugging, propose minimal repro, logging, and docs links.${contextBlock}`;

	if (AI_DISABLE) {
		throw Object.assign(new Error("AI disabled by env"), {
			error: { code: "ai_disabled" },
		});
	}

	// Primary provider routing: Gemini first if selected
	if (AI_PROVIDER === "gemini") {
		try {
			const content = await callGeminiChat(
				system,
				userContent,
				GEMINI_MODEL
			);
			return {
				answer: content,
				meta: { model: GEMINI_MODEL, provider: "gemini" },
			};
		} catch (err: any) {
			// Fall back to OpenRouter if configured
			if (OPENROUTER_API_KEY) {
				try {
					const content = await callOpenRouterChat([
						{ role: "system", content: system },
						{ role: "user", content: userContent },
					]);
					return {
						answer: content,
						meta: { model: OPENROUTER_MODEL, provider: "openrouter" },
					};
				} catch (_) {
					/* continue to minimal fallback */
				}
			}
		}
	}

	// If explicitly using OpenRouter as primary
	if (AI_PROVIDER === "openrouter" && OPENROUTER_API_KEY) {
		try {
			const content = await callOpenRouterChat([
				{ role: "system", content: system },
				{ role: "user", content: userContent },
			]);
			return {
				answer: content,
				meta: { model: OPENROUTER_MODEL, provider: "openrouter" },
			};
		} catch (_) {
			/* continue to minimal fallback */
		}
	}

	// Final minimal fallback if all providers fail or are unavailable
	const minimal =
		mode === "topic"
			? `Topic Outline: ${
					params.topic || "General"
			  }\n- Overview\n- Core Concepts\n- Examples\n- Practice Tasks\n- Resources`
			: "Try: isolate a minimal repro, add console logs/breakpoints, and verify API usage in docs.";
	return {
		answer: minimal,
		meta: { fallback: true, reason: "unavailable", provider: "none" },
	};
}
// Provider/model configuration
const AI_PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase(); // 'gemini' | 'openrouter'
const AI_DISABLE = (process.env.AI_DISABLE || "").toLowerCase() === "true";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL =
	process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

async function callOpenRouterChat(
	messages: { role: "system" | "user" | "assistant"; content: string }[],
	model = OPENROUTER_MODEL
): Promise<string> {
	if (!OPENROUTER_API_KEY)
		throw new Error("OpenRouter API key not configured");
	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0.2,
		}),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`OpenRouter error ${res.status}: ${text}`);
	}
	const data = await res.json();
	const content = data?.choices?.[0]?.message?.content;
	if (!content) throw new Error("OpenRouter returned no content");
	return content as string;
}

// Respect rate limits: small retry helper honoring Retry-After and adding jitter
async function callWithRetries<T>(
	fn: () => Promise<T>,
	attempts = 2
): Promise<T> {
	let lastErr: any;
	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (err: any) {
			lastErr = err;
			const status = err?.status || err?.code;
			// If account has insufficient quota, bail out immediately so we can fallback fast
			if (err?.error?.code === "insufficient_quota") {
				throw err;
			}
			// 429 or transient 5xx -> retry with backoff
			if (status === 429 || (typeof status === "number" && status >= 500)) {
				// Honor Retry-After if present
				let waitMs = 0;
				const ra = err?.headers?.get
					? err.headers.get("retry-after")
					: err?.headers?.["retry-after"];
				if (ra) {
					const sec = Number(ra);
					if (!Number.isNaN(sec) && sec > 0) waitMs = sec * 1000;
				}
				// base backoff: 500ms, 1000ms, 2000ms + jitter
				if (!waitMs) waitMs = Math.pow(2, i) * 500;
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

function tryParseJsonFromContent(content: string) {
	try {
		return JSON.parse(content);
	} catch {
		// attempt to extract JSON block from possible markdown/code-fenced response
		const match = content.match(/\{[\s\S]*\}/);
		if (match) {
			try {
				return JSON.parse(match[0]);
			} catch {
				return null;
			}
		}
		return null;
	}
}

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

// (Optional) Cooldown could be reintroduced if provider rate-limits need special handling.

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
		if (AI_DISABLE) {
			throw Object.assign(new Error("AI disabled by env"), {
				error: { code: "ai_disabled" },
			});
		}
		// Gemini primary
		try {
			const system =
				"You are an expert educational designer creating personalized lesson plans for peer-to-peer skill sharing sessions.";
			const content = await callGeminiChat(system, prompt, GEMINI_MODEL);
			const lessonPlan = tryParseJsonFromContent(content);
			if (!lessonPlan) throw new Error("Failed to parse lesson plan JSON");
			return lessonPlan;
		} catch (e) {
			// Optional OpenRouter fallback
			if (OPENROUTER_API_KEY) {
				try {
					const content = await callOpenRouterChat([
						{
							role: "system",
							content:
								"You are an expert educational designer creating personalized lesson plans for peer-to-peer skill sharing sessions.",
						},
						{ role: "user", content: prompt },
					]);
					const lessonPlan = tryParseJsonFromContent(content);
					if (lessonPlan) return lessonPlan;
				} catch (_) {
					/* ignore */
				}
			}
			throw e;
		}
	} catch (error) {
		console.error("Error generating lesson plan:", error);

		// Fallback lesson plan
		return {
			title: `${request.teacherSkill} Learning Session`,
			objectives: [
				`Learn fundamental concepts of ${request.teacherSkill}`,
				`Practice hands-on ${request.teacherSkill} exercises`,
				`Share knowledge of ${request.learnerSkill}`,
			],
			activities: [
				{
					type: "discussion",
					description: "Introduction and goal setting",
					duration: 10,
					resources: [],
				},
				{
					type: "explanation",
					description: `${request.teacherName} explains ${request.teacherSkill} basics`,
					duration: 20,
					resources: ["Documentation", "Code examples"],
				},
				{
					type: "practice",
					description: "Hands-on practice with guidance",
					duration: 25,
					resources: ["Code editor", "Practice exercises"],
				},
				{
					type: "discussion",
					description: "Q&A and knowledge exchange",
					duration: 15,
					resources: [],
				},
			],
			assessments: ["Practical demonstration", "Peer feedback"],
			nextSteps: [
				"Continue practicing with provided resources",
				"Schedule follow-up session if needed",
			],
		};
	}
}

export async function generateSessionSummary(request: SessionSummaryRequest) {
	const prompt = `
Generate a comprehensive summary for a completed skill-swap session:

Session Details:
- Participants: ${request.participants.join(", ")}
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
			throw Object.assign(new Error("AI disabled by env"), {
				error: { code: "ai_disabled" },
			});
		}
		// Gemini primary
		try {
			const system =
				"You are an educational analyst creating insightful summaries of peer learning sessions.";
			const content = await callGeminiChat(system, prompt, GEMINI_MODEL);
			return content || "Session completed successfully.";
		} catch (e) {
			// Optional OpenRouter fallback
			if (OPENROUTER_API_KEY) {
				try {
					const content = await callOpenRouterChat([
						{
							role: "system",
							content:
								"You are an educational analyst creating insightful summaries of peer learning sessions.",
						},
						{ role: "user", content: prompt },
					]);
					return content || "Session completed successfully.";
				} catch (_) {
					/* ignore */
				}
			}
			throw e;
		}
	} catch (error) {
		console.error("Error generating session summary:", error);
		return `Session Summary:
- Participants: ${request.participants.join(", ")}
- Skills exchanged: ${request.teacherSkill} and ${request.learnerSkill}
- Duration: ${request.duration} minutes
- Session completed successfully with knowledge exchange between participants.`;
	}
}

export async function generateSkillAssessment(
	skill: string,
	level: string,
	responses: string[]
) {
	const prompt = `
Assess the skill level for ${skill} based on these responses:
${responses.join("\n")}

Current claimed level: ${level}

Provide:
1. Actual skill level assessment (Beginner/Intermediate/Advanced)
2. Strengths identified
3. Areas for improvement
4. Recommended learning path
`;

	try {
		// Gemini primary
		try {
			const system =
				"You are a technical skill assessor providing constructive feedback.";
			const content = await callGeminiChat(system, prompt, GEMINI_MODEL);
			return content || "Assessment completed.";
		} catch (e) {
			// Optional OpenRouter fallback
			if (OPENROUTER_API_KEY) {
				try {
					const content = await callOpenRouterChat([
						{
							role: "system",
							content:
								"You are a technical skill assessor providing constructive feedback.",
						},
						{ role: "user", content: prompt },
					]);
					return content || "Assessment completed.";
				} catch (_) {
					/* ignore */
				}
			}
			throw e;
		}
	} catch (error) {
		console.error("Error generating skill assessment:", error);
		return "Skill assessment completed. Continue practicing to improve your abilities.";
	}
}
