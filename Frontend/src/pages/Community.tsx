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

          {/* Guidelines */}
          <div className='mt-10 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Community Guidelines</h2>
            <ul className='grid md:grid-cols-3 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Be respectful and constructive.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Share resources with clear context.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>No harassment or spam. Report issues.</li>
            </ul>
          </div>

          {/* Channels */}
          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Announcements', d: 'Product updates and release notes' },
              { t: 'Learning Groups', d: 'Weekly study sessions by topic' },
              { t: 'Events', d: 'Workshops, AMAs, and community meetups' },
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
              <div className='text-white text-xl font-semibold'>Join the conversation</div>
              <div className='text-white/70 text-sm'>Introduce yourself and find your first partner.</div>
            </div>
            <a href='/register' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Get Started</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
