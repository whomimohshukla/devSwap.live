import React from 'react';
import Seo from '../components/common/Seo';
import { Code2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='About DevSwap | Peer-to-Peer Learning for Developers'
        description='Learn what DevSwap is about: our mission, values, and milestones building a peer-to-peer learning platform for developers.'
        canonical='/about'
      />
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

          {/* Mission */}
          <div className='mt-12 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Our Mission</h2>
            <p className='text-white/80'>
              Empower every developer to learn by doing and teaching. We believe peer-to-peer
              knowledge exchange is the fastest way to grow practical skills.
            </p>
          </div>

          {/* Values */}
          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { title: 'Ownership', desc: 'We ship, measure, iterate.' },
              { title: 'Craft', desc: 'Quality UX and DX over shortcuts.' },
              { title: 'Inclusivity', desc: 'Welcoming learners at every level.' },
            ].map((v) => (
              <div key={v.title} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-emerald-400 text-sm mb-1'>Value</div>
                <h3 className='text-white font-semibold'>{v.title}</h3>
                <p className='text-white/70 text-sm mt-1'>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className='mt-10'>
            <h2 className='text-white text-2xl font-bold mb-4'>Milestones</h2>
            <div className='space-y-3'>
              {[
                { date: 'Q1 2025', text: 'Launched Roadmaps and Sessions v1' },
                { date: 'Q2 2025', text: 'Introduced AI lesson plans and summaries' },
                { date: 'Q3 2025', text: 'Realtime collaboration and matching upgrades' },
              ].map((m) => (
                <div key={m.text} className='p-5 rounded-xl bg-[#25282c] border border-[#25282c] flex items-center justify-between'>
                  <div className='text-white'>{m.text}</div>
                  <div className='text-emerald-400 text-sm'>{m.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
