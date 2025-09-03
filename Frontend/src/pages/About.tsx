import React from 'react';
import { Code2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Code2 className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>About DevSwap.live</h1>
          </div>
          <p className='text-white/80 text-lg leading-relaxed'>
            DevSwap.live is a peer-to-peer learning platform for developers. We connect builders
            who want to exchange skills through real-time sessions, curated roadmaps, and an
            AI-assisted learning experience.
          </p>
          <div className='grid md:grid-cols-3 gap-6 mt-10'>
            {[
              { title: 'Community First', desc: 'Grow faster by pairing with complementary skills.' },
              { title: 'Real-time Collab', desc: 'Sessions with voice, video, and interactive tools.' },
              { title: 'Guided Learning', desc: 'Roadmaps and practice to level up with focus.' },
            ].map((item) => (
              <div key={item.title} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <h3 className='text-white font-semibold mb-2'>{item.title}</h3>
                <p className='text-white/70 text-sm'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
