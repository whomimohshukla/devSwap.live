import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roadmaps } from '../lib/roadmaps';
import type { Roadmap, RoadmapStage, RoadmapStep } from '../lib/roadmaps';
import RoadmapGraph from '../components/roadmaps/RoadmapGraph';

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`rounded bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 border border-[#25282c] ${className || ''}`}>{children}</span>
);

const Roadmap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const data = roadmaps.find((r) => r.id === id) as Roadmap | undefined;
  const [view, setView] = useState<'graph' | 'list'>('graph');

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded border border-[#25282c] bg-[#0f1113] p-8 text-center">
            <div className="text-xl font-semibold mb-2">Roadmap not found</div>
            <p className="text-gray-400 mb-4">The roadmap you are looking for does not exist.</p>
            <Link to="/roadmaps" className="inline-block rounded bg-teal-600 px-3 py-1.5 text-sm text-black hover:bg-teal-500">Back to roadmaps</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link to="/roadmaps" className="text-sm text-teal-300 hover:underline">← All roadmaps</Link>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <Badge className="capitalize">{data.level}</Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="text-gray-400">{data.description}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('graph')}
              className={`rounded px-3 py-1.5 text-sm border ${view === 'graph' ? 'bg-teal-600 text-black border-teal-600' : 'bg-[#0f1113] text-gray-300 border-[#25282c]'}`}
            >Graph</button>
            <button
              onClick={() => setView('list')}
              className={`rounded px-3 py-1.5 text-sm border ${view === 'list' ? 'bg-teal-600 text-black border-teal-600' : 'bg-[#0f1113] text-gray-300 border-[#25282c]'}`}
            >List</button>
            {/* roadmap.sh link */}
            <a
              href={`https://roadmap.sh/${id === 'fullstack' ? 'full-stack' : id}`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 rounded px-3 py-1.5 text-sm border bg-[#0f1113] text-teal-300 border-[#25282c] hover:bg-white/5"
            >Open on roadmap.sh ↗</a>
          </div>
        </div>

        {view === 'graph' ? (
          <div className="mb-8">
            <RoadmapGraph roadmap={data} />
          </div>
        ) : null}

        <div className={`space-y-6 ${view === 'list' ? '' : 'opacity-90'}`}>
          {data.stages.map((stage: RoadmapStage, sIdx: number) => (
            <div key={stage.id} className="rounded-lg border border-[#25282c] bg-[#0f1113]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#25282c]">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-teal-600/20 text-teal-300 text-xs border border-teal-600/30">{sIdx + 1}</div>
                <div>
                  <div className="text-lg font-semibold">{stage.title}</div>
                  {stage.summary && <div className="text-xs text-gray-400">{stage.summary}</div>}
                </div>
              </div>
              <ul className="divide-y divide-[#25282c]">
                {stage.steps.map((step: RoadmapStep, idx: number) => (
                  <li key={step.id} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-white/5 text-white/70 text-[10px]">{idx + 1}</div>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          {step.description && <div className="text-xs text-gray-400">{step.description}</div>}
                        </div>
                      </div>
                      {step.resources && step.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-4">
                          {step.resources.map((res) => (
                            <Link key={res.href} to={res.href} className="rounded bg-teal-600/20 px-2 py-0.5 text-[10px] text-teal-300 border border-teal-600/30 hover:bg-teal-600/30">{res.label}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
