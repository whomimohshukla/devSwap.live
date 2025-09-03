import React from 'react';
import { FileText } from 'lucide-react';

const Blog: React.FC = () => {
  const posts = [
    { title: 'Welcome to DevSwap.live', date: '2025-01-01', excerpt: 'Why we built DevSwap and how to get the most out of it.' },
    { title: 'Learning in Pairs', date: '2025-02-10', excerpt: 'The benefits of peer-to-peer learning for developers.' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <FileText className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Blog</h1>
          </div>
          <div className='space-y-4'>
            {posts.map((p) => (
              <article key={p.title} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white/60 text-xs mb-1'>{p.date}</div>
                <h3 className='text-white font-semibold'>{p.title}</h3>
                <p className='text-white/70 text-sm mt-1'>{p.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
