import React from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: 'Why can’t I join a session?',
      a: 'Ensure your browser has mic/camera permissions granted. Also check that the backend and signaling server are running and you are authenticated.'
    },
    {
      q: 'The AI summary fails with 401/invalid_project.',
      a: 'Omit OPENAI_ORG and OPENAI_PROJECT in your .env unless your account requires them. Only OPENAI_API_KEY is needed for most users.'
    },
    {
      q: 'I accepted a request but the session is not marked completed.',
      a: 'Leaving the room triggers a backend endSession call. Make sure you click Leave or wait for the peer to end as well.'
    },
    {
      q: 'How do I contribute new lessons?',
      a: 'Add entries to src/lib/learn.ts or submit MDX content once the MDX pipeline is enabled. Include summary, sections, examples, and a quiz.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">FAQ</h1>
        <p className="text-gray-400 mb-6">Common issues and tips.</p>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded border border-[#25282c] bg-[#0f1113] p-5">
              <div className="font-semibold mb-1">{f.q}</div>
              <div className="text-gray-300">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
