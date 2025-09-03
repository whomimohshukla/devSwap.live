import React from 'react';
import Seo from '../components/common/Seo';
import { Cookie } from 'lucide-react';

const Cookies: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='Cookie Policy | DevSwap'
        description='Understand how DevSwap uses cookies for authentication, preferences, and analytics, and how to manage your cookie settings.'
        canonical='/cookies'
      />
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Cookie className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Cookie Policy</h1>
          </div>
          <p className='text-white/80'>We use essential cookies for authentication and to remember preferences. Adjust your browser settings to manage cookies. This is placeholder content; replace with your policy.</p>

          <div className='mt-8 grid md:grid-cols-2 gap-6'>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>What are cookies?</h2>
              <p className='text-white/70 text-sm'>Small text files placed on your device by websites to store information like login state or preferences.</p>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>How we use cookies</h2>
              <p className='text-white/70 text-sm'>To keep you signed in, remember settings, improve performance, and understand usage patterns.</p>
            </div>
          </div>

          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Essential', d: 'Authentication, security, core functionality (cannot be disabled).' },
              { t: 'Preferences', d: 'Theme, language, and UI settings to personalize your experience.' },
              { t: 'Analytics', d: 'Usage metrics to improve features and reliability (aggregated).' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{x.t}</div>
                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
              </div>
            ))}
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Managing preferences</h2>
            <ul className='grid md:grid-cols-2 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Use your browser settings to block or delete cookies.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Disabling essential cookies may break core features.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>You can opt out of analytics where supported.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Preferences are device- and browser-specific.</li>
            </ul>
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Questions about cookies?</div>
              <div className='text-white/70 text-sm'>Contact us and we’ll be happy to help.</div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Contact Support</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cookies;
