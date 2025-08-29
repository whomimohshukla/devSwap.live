export type RoadmapStep = {
	id: string;
	title: string;
	description?: string;
	resources?: { label: string; href: string }[];
};

export type RoadmapStage = {
	id: string;
	title: string;
	summary?: string;
	steps: RoadmapStep[];
};

export type Roadmap = {
	id: string;
	title: string;
	level: "beginner" | "intermediate" | "advanced";
	description: string;
	tags: string[];
	stages: RoadmapStage[];
};

// Re-export dataset from data folder so consumers can continue to import from
// '@/lib/roadmaps' while the source of truth lives in '@/data/roadmaps'.
export { roadmaps } from "../data/roadmaps";
