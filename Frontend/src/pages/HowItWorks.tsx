import React from 'react';
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
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
