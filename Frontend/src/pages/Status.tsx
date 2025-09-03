import React from 'react';
import { Activity } from 'lucide-react';

const Status: React.FC = () => {
  const services = [
    { name: 'API', status: 'Operational' },
    { name: 'Realtime', status: 'Operational' },
    { name: 'Media/RTC', status: 'Operational' },
    { name: 'Website', status: 'Operational' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Activity className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Status</h1>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {services.map((s) => (
              <div key={s.name} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{s.name}</div>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' />
                  <span className='text-white/80 text-sm'>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Status;
