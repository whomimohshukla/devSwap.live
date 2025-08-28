import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { learnTopics } from '../lib/learn';
import type { LearnTopic as LearnTopicType, LearnLesson as LearnLessonType } from '../lib/learn';
import DocLayout from '../components/learn/DocLayout';

const LearnTopic: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const data = learnTopics.find((t: LearnTopicType) => t.id === topic);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0b0c0d] text-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-red-400">Topic not found.</div>
          <Link className="text-teal-400 underline" to="/learn">Back to Learn</Link>
        </div>
      </div>
    );
  }

  return (
    <DocLayout topic={data}>
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-gray-400 mb-6">{data.description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.lessons.map((l: LearnLessonType) => (
          <Link key={l.slug} to={`/learn/${data.id}/${l.slug}`} className="block rounded border border-[#25282c] bg-[#0f1113] p-4 hover:border-teal-500">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[15px]">{l.title}</div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded bg-[#0b0c0d] px-2 py-0.5 border border-[#25282c]">{l.estMinutes}m</span>
                <span className="rounded bg-[#0b0c0d] px-2 py-0.5 border border-[#25282c] capitalize">{l.level}</span>
              </div>
            </div>
            {l.summary && (
              <div className="mt-2 text-xs text-gray-400 line-clamp-2">{l.summary}</div>
            )}
          </Link>
        ))}
      </div>
    </DocLayout>
  );
};

export default LearnTopic;
