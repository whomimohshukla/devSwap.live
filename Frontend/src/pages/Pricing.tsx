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
        </div>
      </div>
    </section>
  );
};

export default Pricing;
