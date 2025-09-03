import React from "react";
import { Shield } from "lucide-react";

const Privacy: React.FC = () => {
    return (
        <section className='py-16 bg-[#0b0c0d]'>
            <div className='w-full px-4 sm:px-6 lg:px-8'>
                <div className='mx-auto max-w-3xl'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
                            <Shield className='w-5 h-5 text-emerald-500' />
                        </div>
                        <h1 className='text-3xl md:text-4xl font-bold text-white'>Privacy Policy</h1>
                    </div>
                    <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c] text-white/80'>
                        <p className='mb-4 text-sm'>
                            DevSwap uses cookies and local storage to remember your preferences
                            and improve your experience. Authentication may use a combination of
                            secure httpOnly cookies and an access token stored in local storage
                            (only if you have accepted cookies). If you decline, we will not
                            store your token or persist app state in local storage.
                        </p>
                        <h2 className='text-white font-semibold mt-6 mb-2'>What We Store</h2>
                        <ul className='list-disc pl-6 text-sm text-white/80 space-y-1'>
                            <li>Session cookies (httpOnly) for secure authentication with the server</li>
                            <li>Access token in local storage (only if you have accepted cookies)</li>
                            <li>Basic app preferences (only if you have accepted cookies)</li>
                        </ul>
                        <h2 className='text-white font-semibold mt-6 mb-2'>Your Choices</h2>
                        <ul className='list-disc pl-6 text-sm text-white/80 space-y-1'>
                            <li>Accept cookies to enable persistence and smoother login</li>
                            <li>Decline cookies to prevent local storage persistence</li>
                            <li>You can change your decision anytime by clearing site data in your browser</li>
                        </ul>
                        <p className='mt-6 text-sm text-white/70'>
                            For questions or requests related to your data, please contact
                            <span className='text-emerald-400'> support@devswap.live</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Privacy;
