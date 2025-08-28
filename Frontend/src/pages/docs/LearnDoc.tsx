import React from 'react';
import { Link } from 'react-router-dom';

const LearnDoc: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">Learn Section</h1>
        <p className="text-gray-400 mb-6">Guided, W3Schools/GFG-like learning with interactive code examples and quizzes.</p>

        <div className="space-y-6">
          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Topics and Lessons</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Browse topics at <Link to="/learn" className="text-teal-400 underline">/learn</Link>.</li>
              <li>Each topic has multiple lessons with summaries and sections.</li>
              <li>Estimated time and level badges help you plan your learning.</li>
            </ul>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Interactive Playground</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Many lessons include a Try it block where you can run HTML/CSS/JS demos inline.</li>
              <li>Future upgrade: richer sandbox with editor and presets.</li>
            </ul>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Quizzes and Progress</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Quick quiz questions check understanding.</li>
              <li>Planned: track progress, bookmarks, and streaks.</li>
            </ul>
          </section>

          <div className="text-sm text-gray-400">See also: <Link to="/docs/faq" className="text-teal-400 underline">FAQ</Link></div>
        </div>
      </div>
    </div>
  );
};

export default LearnDoc;
