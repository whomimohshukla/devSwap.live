import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { learnTopics } from "../lib/learn";
import DocLayout from "../components/learn/DocLayout";

// Simple in-browser runner for HTML/CSS/JS examples
function ExampleRunner({
	html = "",
	css = "",
	js = "",
}: {
	html?: string;
	css?: string;
	js?: string;
}) {
	const srcDoc = useMemo(() => {
		return `<!doctype html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
	}, [html, css, js]);
	return (
		<iframe
			title='example'
			className='w-full h-64 rounded border border-[#25282c]'
			srcDoc={srcDoc}
		/>
	);
}

const LearnLesson: React.FC = () => {
	const { topic, slug } = useParams<{ topic: string; slug: string }>();
	const data = learnTopics.find((t) => t.id === topic);
	const lesson = data?.lessons.find((l) => l.slug === slug);
	const [selected, setSelected] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);

	if (!data || !lesson) {
		return (
			<div className='min-h-screen bg-[#0b0c0d] text-gray-200'>
				<div className='max-w-6xl mx-auto px-4 py-10'>
					<div className='text-red-400'>Lesson not found.</div>
					<Link className='text-teal-400 underline' to='/learn'>
						Back to Learn
					</Link>
				</div>
			</div>
		);
	}

	const score =
		submitted && selected !== null && lesson.quiz && lesson.quiz.length > 0
			? selected === lesson.quiz[0].answerIndex
				? 1
				: 0
			: 0;

	return (
		<DocLayout topic={data} currentSlug={lesson.slug}>
			<div className='mb-6'>
				<Link
					className='text-sm text-gray-400 hover:text-teal-400'
					to={`/learn/${data.id}`}
				>
					&larr; {data.title}
				</Link>
			</div>
			<h1 className='text-3xl font-bold mb-2'>{lesson.title}</h1>
			<div className='text-xs text-gray-500 mb-6'>
				{lesson.estMinutes} min • {lesson.level} • {data.title}
			</div>

			<p className='text-gray-300 mb-6'>{lesson.summary}</p>

			<div className='space-y-6'>
				{lesson.sections.map((s) => (
					<div
						key={s.heading}
						className='rounded border border-[#25282c] bg-[#0f1113] p-4'
					>
						<h2 className='text-lg font-semibold mb-2'>{s.heading}</h2>
						<p className='text-gray-300 whitespace-pre-wrap'>{s.body}</p>
					</div>
				))}
			</div>

			{lesson.example && (
				<div className='mt-8'>
					<h3 className='text-xl font-semibold mb-3'>Try it</h3>
					<ExampleRunner
						html={lesson.example.html}
						css={lesson.example.css}
						js={lesson.example.js}
					/>
				</div>
			)}

			{lesson.quiz && lesson.quiz.length > 0 && (
				<div className='mt-10 rounded border border-[#25282c] bg-[#0f1113] p-5'>
					<h3 className='text-xl font-semibold mb-3'>Quick Quiz</h3>
					<div className='mb-4'>{lesson.quiz[0].question}</div>
					<div className='space-y-2'>
						{lesson.quiz[0].options.map((opt, i) => (
							<label
								key={i}
								className={`flex items-center gap-2 cursor-pointer rounded border p-2 ${
									selected === i
										? "border-teal-500 bg-teal-500/10"
										: "border-[#25282c]"
								}`}
							>
								<input
									type='radio'
									name='quiz'
									checked={selected === i}
									onChange={() => setSelected(i)}
								/>
								<span>{opt}</span>
							</label>
						))}
					</div>
					<div className='mt-4 flex items-center gap-4'>
						<button
							className='px-4 py-2 rounded bg-teal-600 hover:bg-teal-500'
							onClick={() => setSubmitted(true)}
							disabled={submitted || selected === null}
						>
							Submit
						</button>
						{submitted && (
							<div className='text-sm'>
								<span className='mr-2'>Score: {score}/1</span>
								<span className='text-gray-400'>
									{lesson.quiz[0].explanation}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			<div className='mt-12 flex justify-between text-sm text-gray-400'>
				<Link to={`/learn/${data.id}`}>Back to {data.title}</Link>
				<Link to={`/learn/${data.id}`}>Next lesson</Link>
			</div>
		</DocLayout>
	);
};

export default LearnLesson;
