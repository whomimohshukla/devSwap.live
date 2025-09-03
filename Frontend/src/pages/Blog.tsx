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
          {/* Featured */}
          <div className='p-6 rounded-xl bg-[#15181b] border border-[#25282c] mb-8'>
            <div className='text-white/60 text-xs mb-1'>2025-03-01</div>
            <h2 className='text-white text-2xl font-bold'>What makes peer-to-peer learning sticky</h2>
            <p className='text-white/70 text-sm mt-2'>How teaching reinforces mastery and how DevSwap structures productive swaps.</p>
          </div>

          {/* Posts */}
          <div className='space-y-4'>
            {posts.map((p) => (
              <article key={p.title} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white/60 text-xs mb-1'>{p.date}</div>
                <h3 className='text-white font-semibold'>{p.title}</h3>
                <p className='text-white/70 text-sm mt-1'>{p.excerpt}</p>
              </article>
            ))}
          </div>

          {/* Categories */}
          <div className='mt-10 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Product', d: 'Release notes and improvements' },
              { t: 'Learning', d: 'Guides for effective skill swaps' },
              { t: 'Community', d: 'Stories and highlights from members' },
            ].map((c) => (
              <a key={c.t} href='#' className='p-6 rounded-xl bg-[#25282c] border border-[#25282c] hover:border-emerald-500/40 transition'>
                <div className='text-white font-semibold'>{c.t}</div>
                <div className='text-white/70 text-sm mt-1'>{c.d}</div>
              </a>
            ))}
          </div>

          {/* Subscribe CTA */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Get the latest in your inbox</div>
              <div className='text-white/70 text-sm'>Stories, tips, and updates—no spam.</div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Subscribe</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
