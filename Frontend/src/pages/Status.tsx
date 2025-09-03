import React from 'react';
import Seo from '../components/common/Seo';
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
      <Seo
        title='Status | DevSwap'
        description='Real-time status and uptime for DevSwap services, including API, realtime, media/RTC, and website.'
        canonical='/status'
      />
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

          {/* Uptime Summary */}
          <div className='mt-10 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Uptime (last 90 days)</h2>
            <div className='grid md:grid-cols-4 gap-4'>
              {[
                { k: 'API', v: '99.97%' },
                { k: 'Realtime', v: '99.95%' },
                { k: 'Media/RTC', v: '99.90%' },
                { k: 'Website', v: '99.99%' },
              ].map((u) => (
                <div key={u.k} className='p-5 rounded-lg bg-[#25282c] border border-[#25282c] flex items-center justify-between'>
                  <div className='text-white'>{u.k}</div>
                  <div className='text-emerald-400 text-sm font-semibold'>{u.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History */}
          <div className='mt-8'>
            <h2 className='text-white text-2xl font-bold mb-3'>Recent Incidents</h2>
            <div className='space-y-3'>
              {[
                { date: '2025-08-20', title: 'Realtime latency spike', status: 'Resolved' },
                { date: '2025-07-02', title: 'API degraded performance', status: 'Resolved' },
              ].map((i) => (
                <div key={i.title} className='p-5 rounded-xl bg-[#25282c] border border-[#25282c] flex items-center justify-between'>
                  <div>
                    <div className='text-white font-medium'>{i.title}</div>
                    <div className='text-white/60 text-xs'>{i.date}</div>
                  </div>
                  <div className='text-emerald-400 text-sm'>{i.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Subscribe to updates</div>
              <div className='text-white/70 text-sm'>Get email notifications about incidents and maintenance.</div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Subscribe</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Status;
