import React from 'react';
import Seo from '../components/common/Seo';
import { LifeBuoy } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='Help Center | DevSwap'
        description='Find answers to common questions about matching, sessions, billing, and more in the DevSwap Help Center.'
        canonical='/help'
      />
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

          {/* More FAQs */}
          <div className='grid md:grid-cols-2 gap-6 mt-8'>
            {[
              { q: 'Can I reschedule a session?', a: 'Yes, you can reschedule or cancel up to 2 hours before start time.' },
              { q: 'Are sessions recorded?', a: 'Pro plans support session recordings with secure access.' },
              { q: 'What if I have a poor connection?', a: 'Switch to audio-only and use collaborative notes to keep progress.' },
              { q: 'How do I report an issue?', a: 'Use the session feedback form or contact support@devswap.live.' },
            ].map((f) => (
              <div key={f.q} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{f.q}</div>
                <div className='text-white/70 text-sm mt-1'>{f.a}</div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Browse by Category</h2>
            <div className='grid md:grid-cols-3 gap-4'>
              {[
                { t: 'Getting Started', d: 'Profiles, matching, and first session' },
                { t: 'Sessions', d: 'Scheduling, tools, and best practices' },
                { t: 'Billing', d: 'Plans, upgrades, and invoices' },
              ].map((c) => (
                <a key={c.t} href='#' className='p-5 rounded-lg bg-[#25282c] border border-[#25282c] hover:border-emerald-500/40 transition'>
                  <div className='text-white font-semibold'>{c.t}</div>
                  <div className='text-white/70 text-sm mt-1'>{c.d}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Still need help?</div>
              <div className='text-white/70 text-sm'>Reach us at <span className='text-emerald-400'>support@devswap.live</span></div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Contact Support</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Help;
