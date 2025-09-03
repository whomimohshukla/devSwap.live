import React from 'react';
import { Scale } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Scale className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Terms of Service</h1>
          </div>
          <p className='text-white/80'>By using DevSwap.live you agree to our acceptable use policy, community guidelines, and subscription terms. This is a placeholder. Provide your legal content here.</p>
          <div className='mt-8 grid md:grid-cols-2 gap-6'>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>Summary</h2>
              <p className='text-white/70 text-sm'>Use DevSwap responsibly, respect others, and follow applicable laws. Some features require a paid plan.</p>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>Eligibility</h2>
              <p className='text-white/70 text-sm'>You must be 13+ (or the age of digital consent in your region). For business use, you warrant you have authority to bind the entity.</p>
            </div>
          </div>

          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'User Responsibilities', d: 'Provide accurate info, maintain account security, and use the service for lawful purposes.' },
              { t: 'Prohibited Uses', d: 'No harassment, spam, scraping, reverse engineering, or unlawful content.' },
              { t: 'Content & IP', d: 'You own your content. You grant us a limited license to operate and improve the service.' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{x.t}</div>
                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
              </div>
            ))}
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Subscriptions & Billing</h2>
            <ul className='grid md:grid-cols-2 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Plans auto-renew unless cancelled before renewal.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Taxes may apply based on your location.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Refunds follow our refund policy where applicable.</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>We may change pricing with prior notice.</li>
            </ul>
          </div>

          <div className='mt-8 grid md:grid-cols-2 gap-6'>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h3 className='text-white font-semibold'>Termination</h3>
              <p className='text-white/70 text-sm mt-1'>You can close your account anytime. We may suspend or terminate for violations or risk to the platform or community.</p>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h3 className='text-white font-semibold'>Disclaimers & Liability</h3>
              <p className='text-white/70 text-sm mt-1'>Service is provided “as is”. To the fullest extent permitted by law, we disclaim warranties and limit liability.</p>
            </div>
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c]'>
            <h3 className='text-white font-semibold'>Contact</h3>
            <p className='text-white/70 text-sm mt-1'>Questions about these terms? Reach us at <span className='text-emerald-400'>legal@devswap.live</span>.</p>
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Looking for Privacy or Cookies?</div>
              <div className='text-white/70 text-sm'>Read how we protect your data and use cookies.</div>
            </div>
            <div className='flex gap-3'>
              <a href='/privacy' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Privacy Policy</a>
              <a href='/cookies' className='px-5 py-3 rounded-lg bg-[#15181b] text-white border border-[#25282c] hover:border-emerald-500/40 transition'>Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;
