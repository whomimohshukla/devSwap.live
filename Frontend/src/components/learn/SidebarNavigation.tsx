import React from 'react';
import { Link } from 'react-router-dom';

// Define a local minimal type to avoid importing types at runtime
type TopicLite = {
  id: string;
  title: string;
  lessons: { slug: string; title: string; estMinutes: number }[];
};

const SidebarNavigation: React.FC<{ topic: TopicLite; currentSlug?: string }> = ({ topic, currentSlug }) => {
  return (
    <nav className="rounded border border-[#25282c] bg-[#0f1113] p-4">
      <div className="text-sm uppercase tracking-wide text-gray-400 mb-3">{topic.title}</div>
      <ul className="space-y-1">
        {topic.lessons.map((l) => {
          const active = currentSlug === l.slug;
          return (
            <li key={l.slug}>
              <Link
                to={`/learn/${topic.id}/${l.slug}`}
                className={`flex items-center justify-between rounded px-2 py-1.5 text-sm hover:text-teal-300 ${active ? 'bg-teal-600/10 text-teal-300' : 'text-gray-300'}`}
              >
                <span>{l.title}</span>
                <span className="text-[10px] text-gray-500">{l.estMinutes}m</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 text-xs text-gray-500">
        <Link to={`/learn/${topic.id}`} className="hover:text-teal-300">Overview</Link>
      </div>
    </nav>
  );
};

export default SidebarNavigation;
