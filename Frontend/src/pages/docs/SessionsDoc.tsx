import React from 'react';
import { Link } from 'react-router-dom';

const SessionsDoc: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">Sessions</h1>
        <p className="text-gray-400 mb-6">Understand how to start, join, and complete sessions.</p>

        <div className="space-y-6">
          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Starting or Joining</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>From Matches, accept a request to auto-create a session.</li>
              <li>Use the Join Session button or Sessions page to enter the room.</li>
              <li>Grant microphone/camera permissions when prompted.</li>
            </ul>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">In the Room</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Toggle mic/cam, share your screen, use push-to-talk.</li>
              <li>Chat and see participants; reconnect if network changes.</li>
              <li>Device selection is remembered for next time.</li>
            </ul>
          </section>

          <section className="rounded border border-[#25282c] bg-[#0f1113] p-5">
            <h2 className="text-xl font-semibold mb-2">Ending and Summary</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Click Leave. The app calls the backend to mark the session ended.</li>
              <li>On the Sessions page, expand a card and generate an AI summary.</li>
              <li>Add personal notes; duration auto-computes from start/end times.</li>
            </ul>
          </section>

          <div className="text-sm text-gray-400">
            Next: <Link to="/docs/learn" className="text-teal-400 underline">Learn</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsDoc;
