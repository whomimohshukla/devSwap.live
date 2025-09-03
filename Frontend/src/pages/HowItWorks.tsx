import React from 'react';
import Seo from '../components/common/Seo';
import { Rocket } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    { title: 'Create your profile', desc: 'List skills you can teach and skills you want to learn.' },
    { title: 'Get matched', desc: 'Our engine suggests partners with complementary skills.' },
    { title: 'Book a session', desc: 'Schedule a real-time swap with voice/video and collaboration.' },
    { title: 'Practice and review', desc: 'Complete tasks, exchange feedback, and track progress.' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='How It Works | DevSwap'
        description='See how DevSwap works: create a profile, get matched, book real-time sessions, and track progress with guided learning.'
        canonical='/how-it-works'
      />
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Rocket className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>How It Works</h1>
          </div>
          <div className='grid sm:grid-cols-2 gap-6'>
            {steps.map((s, i) => (
              <div key={i} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-emerald-400 text-sm mb-2'>Step {i + 1}</div>
                <h3 className='text-white font-semibold mb-2'>{s.title}</h3>
                <p className='text-white/70 text-sm'>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Onboarding Tips */}
          <div className='mt-10 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Onboarding Tips</h2>
            <ul className='grid md:grid-cols-3 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Add 3–5 skills you can teach and 3 you want to learn.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Write a short bio with your time zone and availability.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Bookmark roadmaps that align with your goals.</li>
            </ul>
          </div>

          {/* Best Practices */}
          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Set an agenda', d: 'Define 2–3 objectives before each session.' },
              { t: 'Share resources', d: 'Links, notes, and snippets help future you.' },
              { t: 'Reflect', d: 'End with action items and schedule the next swap.' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <h3 className='text-white font-semibold'>{x.t}</h3>
                <p className='text-white/70 text-sm mt-1'>{x.d}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Try your first swap</div>
              <div className='text-white/70 text-sm'>Create your profile and get matched now.</div>
            </div>
            <a href='/register' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Get Started</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
