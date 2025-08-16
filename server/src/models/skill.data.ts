// src/types/skill.ts
export type SkillName =
	| "React"
	| "NextJS"
	| "Node"
	| "Express"
	| "MongoDB"
	| "TypeScript"
	| "JavaScript"
	| "TailwindCSS"
	| "GraphQL"
	| "CSS"
	| "HTML"
	| string; // allow extension

// Centralized source of truth for skill levels
export const SKILL_LEVELS = [
	"Beginner",
	"Intermediate",
	"Advanced",
] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];
