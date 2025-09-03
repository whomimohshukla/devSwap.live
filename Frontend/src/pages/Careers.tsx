import React from 'react';
import Seo from '../components/common/Seo';
import { Briefcase } from 'lucide-react';

const Careers: React.FC = () => {
  const jobs = [
    { role: 'Full-Stack Engineer', type: 'Remote', desc: 'Work across the stack to build core learning experiences.' },
    { role: 'Product Designer', type: 'Remote', desc: 'Craft beautiful, accessible, and functional interfaces.' },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='Careers | DevSwap'
        description='Join DevSwap and help build the future of peer-to-peer learning. See open roles and our hiring process.'
        canonical='/careers'
      />
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Briefcase className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Careers</h1>
          </div>
          <p className='text-white/80 mb-6'>We're a small team building the future of peer-to-peer learning. Join us.</p>
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

          {/* Benefits */}
          <div className='mt-10'>
            <h2 className='text-white text-2xl font-bold mb-3'>Benefits</h2>
            <div className='grid md:grid-cols-3 gap-4'>
              {[
                { t: 'Remote-first', d: 'Work from anywhere with flexible hours.' },
                { t: 'Learning stipend', d: 'Budget for courses, books, and events.' },
                { t: 'Wellness', d: 'Health coverage and mental wellness days.' },
              ].map((b) => (
                <div key={b.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                  <div className='text-white font-semibold'>{b.t}</div>
                  <div className='text-white/70 text-sm mt-1'>{b.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Process */}
          <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Our Hiring Process</h2>
            <ol className='grid md:grid-cols-4 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'><span className='text-white font-medium'>1. Apply</span><br/>Share your resume/portfolio.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'><span className='text-white font-medium'>2. Intro chat</span><br/>30 min call to learn more.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'><span className='text-white font-medium'>3. Practical task</span><br/>A short, real-world exercise.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'><span className='text-white font-medium'>4. Team chat</span><br/>Meet the team and discuss.</li>
            </ol>
          </div>

          {/* Culture */}
          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Ownership', d: 'You’ll ship impactful work and help shape the product.' },
              { t: 'Curiosity', d: 'We value learning in public and sharing knowledge.' },
              { t: 'Empathy', d: 'We build with and for our community of learners.' },
            ].map((c) => (
              <div key={c.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <h3 className='text-white font-semibold'>{c.t}</h3>
                <p className='text-white/70 text-sm mt-1'>{c.d}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Don’t see your role?</div>
              <div className='text-white/70 text-sm'>Tell us how you can help build DevSwap.</div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Reach Out</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
