import React, { useMemo, useCallback } from "react";
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	Position,
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import type { Roadmap, RoadmapStage, RoadmapStep } from "../../lib/roadmaps";
import { useNavigate } from "react-router-dom";

type Props = {
	roadmap: Roadmap;
};

const COLUMN_WIDTH = 320;
const ROW_HEIGHT = 110;

export const RoadmapGraph: React.FC<Props> = ({ roadmap }) => {
	const navigate = useNavigate();

	const { nodes, edges } = useMemo(() => {
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		roadmap.stages.forEach((stage: RoadmapStage, sIdx: number) => {
			// Stage label node (header) spanning column
			const stageNodeId = `stage-${stage.id}`;
			nodes.push({
				id: stageNodeId,
				position: { x: sIdx * COLUMN_WIDTH, y: -70 },
				data: { label: stage.title },
				type: "input",
				style: {
					background: "#0f1113",
					color: "#e5e7eb",
					border: "1px solid #25282c",
					padding: 8,
					borderRadius: 8,
					width: 260,
					textAlign: "center",
				},
			});

			let previousStepNodeId: string | null = null;

			stage.steps.forEach((step: RoadmapStep, idx: number) => {
				const id = `s${sIdx}-step-${step.id}`;
				const x = sIdx * COLUMN_WIDTH;
				const y = idx * ROW_HEIGHT;
				const hasResource = step.resources && step.resources.length > 0;
				nodes.push({
					id,
					position: { x, y },
					data: { label: step.title },
					sourcePosition: Position.Right,
					targetPosition: Position.Left,
					style: {
						background: hasResource ? "#11312a" : "#0f1113",
						color: hasResource ? "#86efac" : "#e5e7eb",
						border: `1px solid ${hasResource ? "#134e4a" : "#25282c"}`,
						padding: 12,
						borderRadius: 10,
						width: 260,
						boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
						cursor: hasResource ? "pointer" : "default",
					},
				});

				// Connect steps within the same stage
				if (previousStepNodeId) {
					edges.push({
						id: `${previousStepNodeId}->${id}`,
						source: previousStepNodeId,
						target: id,
						animated: false,
						style: { stroke: "#374151" },
					});
				} else {
					// Connect stage header to first step
					edges.push({
						id: `${stageNodeId}->${id}`,
						source: stageNodeId,
						target: id,
						animated: false,
						style: { stroke: "#374151" },
					});
				}
				previousStepNodeId = id;
			});

			// Connect last step of this stage to first step of next stage
			const nextStage = roadmap.stages[sIdx + 1];
			if (
				nextStage &&
				stage.steps.length > 0 &&
				nextStage.steps.length > 0
			) {
				const lastOfThis = `s${sIdx}-step-${
					stage.steps[stage.steps.length - 1].id
				}`;
				const firstOfNext = `s${sIdx + 1}-step-${nextStage.steps[0].id}`;
				edges.push({
					id: `${lastOfThis}->${firstOfNext}`,
					source: lastOfThis,
					target: firstOfNext,
					animated: true,
					style: { stroke: "#10b981" },
				});
			}
		});

		return { nodes, edges };
	}, [roadmap]);

	const onNodeClick = useCallback(
		(_: any, node: Node) => {
			const [stageIdxStr] = (node.id.match(/^s(\d+)-step-/) || []).slice(1);
			if (!stageIdxStr) return;
			const sIdx = Number(stageIdxStr);
			const stage = roadmap.stages[sIdx];
			const step = stage?.steps.find(
				(st) => `s${sIdx}-step-${st.id}` === node.id
			);
			if (!step || !step.resources || step.resources.length === 0) return;

			const res = step.resources[0];
			// internal link vs external
			if (res.href.startsWith("/")) {
				navigate(res.href);
			} else {
				window.open(res.href, "_blank");
			}
		},
		[navigate, roadmap]
	);

	return (
		<div
			style={{ width: "100%", height: 540 }}
			className='rounded-lg border border-[#25282c] bg-[#0b0c0d]'
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				onNodeClick={onNodeClick}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={16}
					size={1}
					color='#2a2e33'
				/>
				<MiniMap
					pannable
					zoomable
					nodeColor={() => "#1f2937"}
					maskColor='rgba(0,0,0,0.4)'
				/>
				<Controls />
			</ReactFlow>
		</div>
	);
};

export default RoadmapGraph;
