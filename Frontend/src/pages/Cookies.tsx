import React from 'react';
import { Cookie } from 'lucide-react';

const Cookies: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Cookie className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Cookie Policy</h1>
          </div>
          <p className='text-white/80'>We use essential cookies for authentication and to remember preferences. Adjust your browser settings to manage cookies. This is placeholder content; replace with your policy.</p>
        </div>
      </div>
    </section>
  );
};

export default Cookies;
