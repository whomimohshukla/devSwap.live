import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { learnTopics } from '../lib/learn';
import type { LearnTopic, LearnLesson } from '../lib/learn';

const LearnIndex: React.FC = () => {
  const [query, setQuery] = useState('');
  const filtered: LearnTopic[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learnTopics as LearnTopic[];
    return (learnTopics as LearnTopic[]).filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.lessons.some((l) => l.title.toLowerCase().includes(q))
    );
  }, [query]);
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-gray-400 mb-6">Browse curated, hands-on tutorials with examples, quizzes, and practice tasks. Choose a path and start coding.</p>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded border border-[#25282c] bg-[#0f1113] p-4">
            <div className="font-semibold mb-2">How it works</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>1. Pick a topic or learning path</li>
              <li>2. Read short lessons with examples</li>
              <li>3. Try code in the embedded runner</li>
              <li>4. Take quick quizzes to check understanding</li>
              <li>5. Practice with tasks and mini-projects</li>
            </ul>
          </div>
          <div className="rounded border border-[#25282c] bg-[#0f1113] p-4">
            <div className="font-semibold mb-2">Recommended paths</div>
            <ul className="space-y-2 text-sm text-teal-300">
              <li><Link to="/learn/javascript" className="hover:underline">JavaScript Foundations</Link></li>
              <li><Link to="/learn/react" className="hover:underline">Frontend with React</Link></li>
              <li><Link to="/learn/nodejs" className="hover:underline">Backend with Node & Express</Link></li>
              <li><Link to="/learn/fullstack" className="hover:underline">MERN Full-Stack</Link></li>
            </ul>
          </div>
          <div className="rounded border border-[#25282c] bg-[#0f1113] p-4">
            <div className="font-semibold mb-2">Tips to learn faster</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Code along with examples, not just read</li>
              <li>• Aim for small, daily wins (15–30 min)</li>
              <li>• Repeat quizzes until you score 100%</li>
              <li>• Build small projects as you go</li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics and lessons (e.g., hooks, arrays, express)"
            className="w-full rounded border border-[#25282c] bg-[#0f1113] px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t: LearnTopic) => {
            const preview = t.lessons.slice(0, 3) as LearnLesson[];
            return (
              <Link key={t.id} to={`/learn/${t.id}`} className="group block rounded-lg border border-[#25282c] bg-[#0f1113] p-5 hover:border-teal-500 transition">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold mb-2 group-hover:text-teal-400">{t.title}</div>
                  <span className="ml-3 rounded bg-teal-600/20 px-2 py-0.5 text-[10px] text-teal-300 border border-teal-600/30">{t.lessons.length} lessons</span>
                </div>
                <div className="text-sm text-gray-400">{t.description}</div>

                {preview.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {preview.map((l: LearnLesson) => (
                      <li key={l.slug} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span className="truncate">{l.title}</span>
                        <span className="ml-auto text-[10px] text-gray-500">{l.estMinutes}m</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 border border-[#25282c]">Beginner</span>
                  <span className="rounded bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 border border-[#25282c]">Interactive</span>
                  <span className="rounded bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 border border-[#25282c]">Quizzes</span>
                </div>

                <div className="mt-4">
                  <span className="inline-block rounded bg-teal-600 px-3 py-1.5 text-sm text-black group-hover:bg-teal-500">Start learning →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearnIndex;
