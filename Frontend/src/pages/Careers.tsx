import React from 'react';
import { Briefcase } from 'lucide-react';

const Careers: React.FC = () => {
  const jobs = [
    { role: 'Full-Stack Engineer', type: 'Remote', desc: 'Work across the stack to build core learning experiences.' },
    { role: 'Product Designer', type: 'Remote', desc: 'Craft beautiful, accessible, and functional interfaces.' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Briefcase className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Careers</h1>
          </div>
          <p className='text-white/80 mb-6'>Were a small team building the future of peer-to-peer learning. Join us.</p>
          <div className='grid gap-4'>
            {jobs.map((j) => (
              <div key={j.role} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-white font-semibold'>{j.role}</h3>
                    <p className='text-white/70 text-sm mt-1'>{j.desc}</p>
                  </div>
                  <span className='text-emerald-400 text-sm'>{j.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
