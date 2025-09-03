import React from 'react';
import Seo from '../components/common/Seo';
import { Mail, Phone, Clock, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section className='py-16 bg-[#0b0c0d]'>
      <Seo
        title='Contact | DevSwap'
        description="Get in touch with the DevSwap team. We're here to help with support, partnerships, and feedback."
        canonical='/contact'
      />
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
              <Mail className='w-5 h-5 text-emerald-500' />
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>Contact Us</h1>
          </div>
          <p className='text-white/80 mb-6'>We'd love to hear from you. Reach out and we'll get back within 1-2 business days.</p>

          {/* Contact Methods */}
          <div className='grid md:grid-cols-3 gap-6'>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <div className='flex items-center gap-2 text-white font-semibold mb-1'><Mail className='w-4 h-4 text-emerald-400'/> Email</div>
              <a href='mailto:hello@devswap.live' className='text-emerald-400 text-sm'>hello@devswap.live</a>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <div className='flex items-center gap-2 text-white font-semibold mb-1'><Phone className='w-4 h-4 text-emerald-400'/> Phone</div>
              <div className='text-white/80 text-sm'>+1 (555) 123-4567</div>
            </div>
            <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
              <div className='flex items-center gap-2 text-white font-semibold mb-1'><Clock className='w-4 h-4 text-emerald-400'/> Support Hours</div>
              <div className='text-white/80 text-sm'>Mon–Fri, 9:00–18:00 (UTC)</div>
            </div>
          </div>

          {/* Contact Form */}
          <form className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c] space-y-4' onSubmit={(e) => e.preventDefault()}>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-white text-sm mb-1'>Name</label>
                <input className='w-full px-3 py-2 rounded-lg bg-[#0f1113] border border-[#25282c] text-white outline-none focus:border-emerald-500' placeholder='Your name' />
              </div>
              <div>
                <label className='block text-white text-sm mb-1'>Email</label>
                <input type='email' className='w-full px-3 py-2 rounded-lg bg-[#0f1113] border border-[#25282c] text-white outline-none focus:border-emerald-500' placeholder='you@example.com' />
              </div>
            </div>
            <div>
              <label className='block text-white text-sm mb-1'>Subject</label>
              <input className='w-full px-3 py-2 rounded-lg bg-[#0f1113] border border-[#25282c] text-white outline-none focus:border-emerald-500' placeholder='How can we help?' />
            </div>
            <div>
              <label className='block text-white text-sm mb-1'>Message</label>
              <textarea rows={5} className='w-full px-3 py-2 rounded-lg bg-[#0f1113] border border-[#25282c] text-white outline-none focus:border-emerald-500' placeholder='Write your message...' />
            </div>
            <button type='submit' className='inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>
              <Send className='w-4 h-4'/>
              Send Message
            </button>
          </form>

          {/* Office */}
          <div className='mt-8 p-6 rounded-xl bg-[#25282c] border border-[#25282c] flex items-start gap-3'>
            <MapPin className='w-5 h-5 text-emerald-400 mt-1'/>
            <div>
              <div className='text-white font-semibold'>Office</div>
              <div className='text-white/70 text-sm'>Silicon Valley, CA (remote-first team)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
