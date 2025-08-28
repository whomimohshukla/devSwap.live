import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { roadmaps } from '../lib/roadmaps';
import type { Roadmap } from '../lib/roadmaps';

const Roadmaps: React.FC = () => {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | Roadmap['level']>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roadmaps.filter((r) => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      const matchesLevel = level === 'all' || r.level === level;
      return matchesQuery && matchesLevel;
    });
  }, [query, level]);

  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Roadmaps</h1>
        <p className="text-gray-400 mb-6">Curated paths to become a Frontend, Backend, or Full-Stack developer. Progress step-by-step with resources.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roadmaps (e.g., frontend, auth, react)"
            className="flex-1 rounded border border-[#25282c] bg-[#0f1113] px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="rounded border border-[#25282c] bg-[#0f1113] px-3 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link key={r.id} to={`/roadmaps/${r.id}`} className="group block rounded-lg border border-[#25282c] bg-[#0f1113] p-5 hover:border-teal-500 transition">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold mb-2 group-hover:text-teal-400">{r.title}</div>
                <span className="ml-3 rounded bg-teal-600/20 px-2 py-0.5 text-[10px] text-teal-300 border border-teal-600/30 capitalize">{r.level}</span>
              </div>
              <div className="text-sm text-gray-400">{r.description}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.tags.slice(0,4).map(tag => (
                  <span key={tag} className="rounded bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 border border-[#25282c]">{tag}</span>
                ))}
              </div>
              <div className="mt-4">
                <span className="inline-block rounded bg-teal-600 px-3 py-1.5 text-sm text-black group-hover:bg-teal-500">Open roadmap →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
