import React from 'react';
import { LifeBuoy } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <LifeBuoy className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Help Center</h1>
          </div>
          <div className='space-y-4'>
            {[
              { q: 'How do I get matched?', a: 'Complete your profile and list skills you can teach and learn. Our engine suggests partners.' },
              { q: 'How do sessions work?', a: 'Schedule a time, then meet in the session room with voice/video and collaboration tools.' },
              { q: 'Is there a free plan?', a: 'Yes, you can start free and upgrade anytime.' },
            ].map((item) => (
              <div key={item.q} className='p-5 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-medium'>{item.q}</div>
                <div className='text-white/70 text-sm mt-1'>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Help;
