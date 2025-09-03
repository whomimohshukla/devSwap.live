import React from 'react';
import { Mail } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Mail className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Contact Us</h1>
          </div>
          <p className='text-white/80 mb-6'>We'd love to hear from you. Reach out and we'll get back within 1-2 business days.</p>
          <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
            <div className='text-white/80 text-sm'>Email</div>
            <a href='mailto:hello@devswap.live' className='text-emerald-400 font-medium'>hello@devswap.live</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
