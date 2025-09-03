import React from 'react';
import { Sparkles } from 'lucide-react';

const Features: React.FC = () => {
  const items = [
    { title: 'Smart Matching', desc: 'AI-assisted pairing to find ideal partners to swap skills.' },
    { title: 'Live Sessions', desc: 'Voice, video, and collaborative tools to learn in real-time.' },
    { title: 'Roadmaps', desc: 'Curated, step-by-step paths to master new skills efficiently.' },
    { title: 'Practice & Review', desc: 'Hands-on tasks and feedback loops to retain knowledge.' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Features</h1>
          </div>
          <div className='grid sm:grid-cols-2 gap-6'>
            {items.map((f) => (
              <div key={f.title} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <h3 className='text-white font-semibold mb-2'>{f.title}</h3>
                <p className='text-white/70 text-sm'>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Advanced Capabilities */}
          <div className='mt-10 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Advanced Capabilities</h2>
            <div className='grid md:grid-cols-3 gap-6'>
              {[
                { t: 'AI Lesson Plans', d: 'Personalized outlines for your sessions and self-study.' },
                { t: 'Session Summaries', d: 'Auto-generated recaps and next steps after each swap.' },
                { t: 'Realtime Tools', d: 'Collaborative notes, code snippets, and checklists.' },
              ].map((x) => (
                <div key={x.t} className='p-5 rounded-lg bg-[#25282c] border border-[#25282c]'>
                  <div className='text-emerald-400 text-sm mb-1'>Pro</div>
                  <div className='text-white font-semibold'>{x.t}</div>
                  <div className='text-white/70 text-sm mt-1'>{x.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why DevSwap */}
          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Learn by Doing', d: 'Practice with peers to build durable skills faster.' },
              { t: 'Teach to Master', d: 'Explaining concepts solidifies your understanding.' },
              { t: 'Focused Progress', d: 'Stay on track with structured roadmaps and tasks.' },
            ].map((y) => (
              <div key={y.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <h3 className='text-white font-semibold'>{y.t}</h3>
                <p className='text-white/70 text-sm mt-1'>{y.d}</p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Ready to swap skills?</div>
              <div className='text-white/70 text-sm'>Create your profile and get matched in minutes.</div>
            </div>
            <a href='/register' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Get Started</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
