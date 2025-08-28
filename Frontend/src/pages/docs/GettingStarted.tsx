import React from 'react';
import { Link } from 'react-router-dom';

const GettingStarted: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">Getting Started</h1>
        <p className="text-gray-400 mb-6">Quick setup guide for DevSwap.live.</p>

        <div className="space-y-6">
          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Node.js 18+</li>
              <li>MongoDB running locally or a connection string</li>
              <li>Redis running locally (for matching/caching)</li>
              <li>OpenAI API key (optional for AI features)</li>
            </ul>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Install</h2>
            <pre className="bg-black/60 text-gray-200 p-4 rounded text-sm overflow-x-auto"><code>git clone YOUR_REPO_URL
cd DevSwap.live
# Backend
cd Backend && npm install
# Frontend
cd ../Frontend && npm install</code></pre>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Environment</h2>
            <p className="text-gray-300">Copy the env templates and fill values:</p>
            <pre className="bg-black/60 text-gray-200 p-4 rounded text-sm overflow-x-auto"><code># Backend
cp Backend/.env.example Backend/.env
# Frontend
cp Frontend/.env.example Frontend/.env</code></pre>
            <p className="text-gray-400 mt-2">See the project README for detailed variable descriptions.</p>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Run</h2>
            <pre className="bg-black/60 text-gray-200 p-4 rounded text-sm overflow-x-auto"><code># Terminal 1
cd Backend && npm run dev
# Terminal 2
cd Frontend && npm run dev</code></pre>
            <p className="text-gray-300 mt-2">Open the app at http://localhost:5173</p>
          </section>

          <div className="text-sm text-gray-400">
            Next: <Link to="/docs/sessions" className="text-teal-400 underline">Sessions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
