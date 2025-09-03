import React from 'react';
import { ShieldCheck } from 'lucide-react';

const GDPR: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <ShieldCheck className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>GDPR</h1>
          </div>
          <p className='text-white/80'>We are committed to user privacy and data protection. This placeholder outlines your GDPR stance, data processing, user rights, and contact for DSRs.</p>

          <div className='mt-8 grid md:grid-cols-2 gap-6'>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>Data Controller</h2>
              <p className='text-white/70 text-sm'>DevSwap.live operates as the data controller for personal data processed through our platform.</p>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <h2 className='text-white font-semibold mb-2'>Data We Process</h2>
              <p className='text-white/70 text-sm'>Account info, profile details, skill preferences, session metadata, and limited diagnostics. We avoid processing special category data.</p>
            </div>
          </div>

          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'Legal Bases', d: 'Consent, contract performance, legitimate interests, and compliance with legal obligations.' },
              { t: 'Purposes', d: 'Provide and improve the service, match partners, ensure security, and communicate updates.' },
              { t: 'Retention', d: 'We keep data only as long as necessary for the purposes or as required by law.' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{x.t}</div>
                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
              </div>
            ))}
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-3'>Your Rights</h2>
            <ul className='grid md:grid-cols-2 gap-4 text-white/80 text-sm'>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Access your data</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Rectify inaccuracies</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Erase (right to be forgotten)</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Restrict or object to processing</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Data portability</li>
              <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Withdraw consent at any time</li>
            </ul>
            <p className='text-white/60 text-xs mt-3'>To exercise rights, contact: <span className='text-emerald-400'>privacy@devswap.live</span></p>
          </div>

          <div className='mt-8 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'International Transfers', d: 'Where data is transferred internationally, we use appropriate safeguards (e.g., SCCs).' },
              { t: 'Security', d: 'We apply technical and organizational measures to protect your data.' },
              { t: 'Subprocessors', d: 'We work with vetted providers to deliver the service. List available on request.' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{x.t}</div>
                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
              </div>
            ))}
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
            <h3 className='text-white font-semibold'>Changes & Contact</h3>
            <p className='text-white/70 text-sm mt-1'>We may update this notice from time to time. For questions or complaints, reach us at <span className='text-emerald-400'>privacy@devswap.live</span> or contact your local data protection authority.</p>
          </div>

          <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Request your data</div>
              <div className='text-white/70 text-sm'>Submit a Data Subject Request (DSR) to access or delete your data.</div>
            </div>
            <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Start a DSR</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GDPR;
