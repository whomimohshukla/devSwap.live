import React from "react";
import Seo from "../components/common/Seo";
import { Shield } from "lucide-react";

const Privacy: React.FC = () => {
    return (
        <section className='py-16 bg-[#0b0c0d]'>
            <Seo
                title='Privacy Policy | DevSwap'
                description='Learn how DevSwap collects, uses, and protects your data. Read about cookies, storage, third parties, and your privacy rights.'
                canonical='/privacy'
            />
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

                    {/* Overview */}
                    <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c] text-white/80'>
                        <h2 className='text-white text-2xl font-bold mb-2'>Overview</h2>
                        <p className='text-sm'>We collect the minimum data needed to operate DevSwap.live, improve the product, and keep your account secure. You control cookie preferences and can request access or deletion at any time.</p>
                    </div>

                    {/* Data We Collect */}
                    <div className='mt-8 grid md:grid-cols-3 gap-6'>
                        {[
                            { t: 'Account', d: 'Email, password (hashed), name/handle, avatar, time zone.' },
                            { t: 'Profile', d: 'Skills you can teach/learn, bio, availability, roadmaps saved.' },
                            { t: 'Usage', d: 'Session metadata, device/browser info, and aggregated analytics.' },
                        ].map((x) => (
                            <div key={x.t} className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                                <div className='text-white font-semibold'>{x.t}</div>
                                <div className='text-white/70 text-sm mt-1'>{x.d}</div>
                            </div>
                        ))}
                    </div>

                    {/* How We Use Data */}
                    <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
                        <h2 className='text-white text-2xl font-bold mb-3'>How We Use Data</h2>
                        <ul className='grid md:grid-cols-2 gap-4 text-white/80 text-sm'>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Provide core functionality (auth, matching, sessions)</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Improve performance and reliability of the platform</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Detect, prevent, and respond to security incidents</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Communicate important updates related to your account</li>
                        </ul>
                    </div>

                    {/* Storage & Retention */}
                    <div className='mt-8 grid md:grid-cols-2 gap-6'>
                        <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                            <h3 className='text-white font-semibold'>Storage & Retention</h3>
                            <p className='text-white/70 text-sm mt-1'>We store data in secure cloud regions and retain it only as long as necessary for the purposes described or as required by law. You can request deletion of your account and associated personal data.</p>
                        </div>
                        <div className='p-6 rounded-xl bg-[#25282c] border border-[#25282c]'>
                            <h3 className='text-white font-semibold'>Third Parties</h3>
                            <p className='text-white/70 text-sm mt-1'>We use vetted subprocessors (e.g., hosting, analytics) under data protection agreements. We do not sell your personal data.</p>
                        </div>
                    </div>

                    {/* Your Rights */}
                    <div className='mt-8 p-6 rounded-xl bg-[#15181b] border border-[#25282c]'>
                        <h2 className='text-white text-2xl font-bold mb-3'>Your Rights</h2>
                        <ul className='grid md:grid-cols-2 gap-4 text-white/80 text-sm'>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Access and receive a copy of your data</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Correct inaccurate or incomplete data</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Delete your data (subject to legal exceptions)</li>
                            <li className='p-4 rounded-lg bg-[#25282c] border border-[#25282c]'>Object to or restrict certain processing</li>
                        </ul>
                        <p className='text-white/60 text-xs mt-3'>Contact: <span className='text-emerald-400'>privacy@devswap.live</span></p>
                    </div>

                    {/* CTA */}
                    <div className='mt-8 p-6 rounded-xl bg-[#0f1113] border border-[#25282c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                        <div>
                            <div className='text-white text-xl font-semibold'>Manage your preferences</div>
                            <div className='text-white/70 text-sm'>Update cookie choices or request data access/deletion.</div>
                        </div>
                        <a href='/contact' className='px-5 py-3 rounded-lg bg-[#00ef68] text-[#0b0c0d] font-semibold hover:opacity-90 transition'>Contact Privacy</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Privacy;
