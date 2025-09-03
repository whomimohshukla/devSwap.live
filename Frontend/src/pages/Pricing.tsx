import React from 'react';
import { Tag } from 'lucide-react';

const Pricing: React.FC = () => {
  const tiers = [
    { name: 'Free', price: '$0', features: ['Community access', 'Basic matching', 'Public sessions'] },
    { name: 'Pro', price: '$9/mo', features: ['Priority matching', 'Private sessions', 'Session recordings'] },
    { name: 'Team', price: '$29/mo', features: ['Team spaces', 'Org roadmaps', 'Advanced analytics'] },
  ];
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Tag className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Pricing</h1>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {tiers.map((t) => (
              <div key={t.name} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-emerald-400 text-sm mb-1'>{t.name}</div>
                <div className='text-white text-3xl font-bold mb-4'>{t.price}</div>
                <ul className='space-y-2'>
                  {t.features.map((f) => (
                    <li key={f} className='text-white/80 text-sm'>• {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className='mt-10 grid md:grid-cols-3 gap-6'>
            {[
              { t: 'No credit card for Free', d: 'Start pairing with the community immediately.' },
              { t: 'Upgrade anytime', d: 'Move to Pro or Team without losing your history.' },
              { t: 'Cancel anytime', d: 'Your plan adjusts at the next billing cycle.' },
            ].map((x) => (
              <div key={x.t} className='p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
                <div className='text-white font-semibold'>{x.t}</div>
                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className='mt-10 p-6 rounded-xl bg-[#0f1113] border border-[#25282c]'>
            <h2 className='text-white text-2xl font-bold mb-4'>Feature Comparison</h2>
            <div className='grid md:grid-cols-3 gap-6'>
              {[
                { plan: 'Free', items: ['Community sessions', 'Basic matching', 'Public notes'] },
                { plan: 'Pro', items: ['Private sessions', 'Priority matching', 'Session recordings'] },
                { plan: 'Team', items: ['Team spaces', 'Org roadmaps', 'Advanced analytics'] },
              ].map((col) => (
                <div key={col.plan} className='p-5 rounded-lg bg-[#25282c] border border-[#25282c]'>
                  <div className='text-emerald-400 text-sm mb-1'>{col.plan}</div>
                  <ul className='space-y-2'>
                    {col.items.map((i) => (
                      <li key={i} className='text-white/80 text-sm'>• {i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className='mt-10 grid md:grid-cols-2 gap-6'>
            {[
              { q: 'Can I change plans later?', a: 'Yes, upgrades or downgrades take effect on the next billing cycle.' },
              { q: 'Is there a free trial?', a: 'You can start on Free and upgrade anytime. Trials may be offered during promos.' },
              { q: 'Do you offer discounts?', a: 'We provide student and nonprofit discounts—contact support.' },
              { q: 'What payment methods are supported?', a: 'Major cards are supported. Invoices available for Team.' },
            ].map((f) => (
              <div key={f.q} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                <div className='text-white font-semibold'>{f.q}</div>
                <div className='text-white/70 text-sm mt-1'>{f.a}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className='mt-10 p-6 rounded-xl bg-[#15181b] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
              <div className='text-white text-xl font-semibold'>Choose your plan</div>
              <div className='text-white/70 text-sm'>Start for free. Upgrade when you need more power.</div>
            </div>
            <a href='/register' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Get Started</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
