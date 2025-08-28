import React from 'react';
import { Link } from 'react-router-dom';

const DocsIndex: React.FC = () => {
  const items = [
    { title: 'Getting Started', to: '/docs/getting-started', desc: 'Install, configure env, and run DevSwap.live locally.' },
    { title: 'Sessions', to: '/docs/sessions', desc: 'How sessions work: joining, media, ending, and AI summary.' },
    { title: 'Learn', to: '/docs/learn', desc: 'W3Schools/GFG-like Learn section: topics, lessons, playground, quizzes.' },
    { title: 'FAQ', to: '/docs/faq', desc: 'Common questions and troubleshooting.' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">Documentation</h1>
        <p className="text-gray-400 mb-8">Guides to help you get productive with DevSwap.live.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="block rounded-lg border border-[#25282c] bg-[#0f1113] p-5 hover:border-teal-500">
              <div className="text-lg font-semibold mb-1">{it.title}</div>
              <div className="text-sm text-gray-400">{it.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsIndex;
