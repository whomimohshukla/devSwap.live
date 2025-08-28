import React from 'react';
import SidebarNavigation from './SidebarNavigation';

type TopicLite = {
  id: string;
  title: string;
  lessons: { slug: string; title: string; estMinutes: number }[];
};

interface DocLayoutProps {
  topic: TopicLite;
  currentSlug?: string;
  children: React.ReactNode;
}

const DocLayout: React.FC<DocLayoutProps> = ({ topic, currentSlug, children }) => {
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <aside className="md:sticky md:top-4 h-max">
            <SidebarNavigation topic={topic} currentSlug={currentSlug} />
          </aside>
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocLayout;
