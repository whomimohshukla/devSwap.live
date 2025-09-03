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
        </div>
      </div>
    </section>
  );
};

export default Features;
