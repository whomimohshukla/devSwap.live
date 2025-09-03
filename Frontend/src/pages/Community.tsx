import React from 'react';
import { Users } from 'lucide-react';

const Community: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Users className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Community</h1>
          </div>
          <p className='text-white/80'>Join discussions, share resources, and find partners to collaborate with.</p>
          <div className='grid sm:grid-cols-2 gap-6 mt-8'>
            {['General', 'Find a Partner', 'Showcase', 'Help & Support'].map((c) => (
              <div key={c} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{c}</div>
                <div className='text-white/70 text-sm'>Latest topics and threads.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
