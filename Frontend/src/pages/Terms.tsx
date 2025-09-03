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
        </div>
      </div>
    </section>
  );
};

export default Terms;
