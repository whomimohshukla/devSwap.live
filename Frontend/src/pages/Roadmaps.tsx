import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { roadmaps } from "../lib/roadmaps";
import type { Roadmap } from "../lib/roadmaps";

const Roadmaps: React.FC = () => {
	const [query, setQuery] = useState("");
	const [level, setLevel] = useState<"all" | Roadmap["level"]>("all");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return roadmaps.filter((r) => {
			const matchesQuery =
				!q ||
				r.title.toLowerCase().includes(q) ||
				r.description.toLowerCase().includes(q) ||
				r.tags.some((t) => t.toLowerCase().includes(q));
			const matchesLevel = level === "all" || r.level === level;
			return matchesQuery && matchesLevel;
		});
	}, [query, level]);

	return (
		<div className='min-h-screen bg-[#0b0c0d] text-gray-200'>
			<div className='max-w-6xl mx-auto px-4 py-10'>
				<h1 className='text-3xl font-bold mb-2'>Roadmaps</h1>
				<p className='text-gray-400'>
					Curated paths across Web, Data, AI/ML, Mobile, DevOps, Cloud, and
					Languages.
				</p>

				<div className='mt-4 mb-6 rounded-xl border border-[#25282c] bg-gradient-to-b from-[#0f1113] to-[#0b0c0d] p-4 shadow-[0_0_0_1px_rgba(37,40,44,1)]'>
					<div className='text-sm text-gray-300'>
						<div className='font-medium mb-1 text-gray-200'>
							About this page
						</div>
						<p className='text-gray-400'>
							I’m your developer buddy. These roadmaps guide you
							step-by-step through skills and technologies. Use the
							search and level filters to quickly find a track, then open
							it to explore a visual graph or a structured checklist with
							curated resources.
						</p>
						<ul className='mt-2 list-disc pl-5 space-y-1 text-gray-400'>
							<li>
								<span className='text-gray-300'>Graph/List views:</span>{" "}
								switch between a visual node map and an ordered
								checklist.
							</li>
							<li>
								<span className='text-gray-300'>Resources:</span>{" "}
								hand-picked links for docs, guides, and tutorials.
							</li>
							<li>
								<span className='text-gray-300'>Levels:</span> beginner,
								intermediate, and advanced tracks where available.
							</li>
							<li>
								<span className='text-gray-300'>Tips:</span> start with
								fundamentals, then move to advanced topics at your pace.
							</li>
						</ul>
					</div>
				</div>

				<div className='flex flex-col sm:flex-row gap-3 mb-6'>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Search roadmaps (e.g., frontend, data, react)'
						className='flex-1 rounded-md border border-[#25282c] bg-[#0f1113] px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-600/40'
					/>
					<select
						value={level}
						onChange={(e) => setLevel(e.target.value as any)}
						className='rounded-md border border-[#25282c] bg-[#0f1113] px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-600/40'
					>
						<option value='all'>All levels</option>
						<option value='beginner'>Beginner</option>
						<option value='intermediate'>Intermediate</option>
						<option value='advanced'>Advanced</option>
					</select>
				</div>

				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{filtered.map((r) => (
						<Link
							key={r.id}
							to={`/roadmaps/${r.id}`}
							className='group block rounded-xl border border-[#25282c] bg-gradient-to-b from-[#0f1113] to-[#0b0c0d] p-5 shadow-[0_0_0_1px_rgba(37,40,44,1)] transition duration-200 hover:border-teal-600/60 hover:shadow-[0_0_0_1px_rgba(20,184,166,0.6),0_0_24px_rgba(20,184,166,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/50'
						>
							<div className='flex items-start justify-between gap-3'>
								<div>
									<div className='text-xl font-semibold mb-1 tracking-tight group-hover:text-teal-400'>
										{r.title}
									</div>
									<div className='text-sm text-gray-400'>
										{r.description}
									</div>
								</div>
								<span
									className='ml-3 shrink-0 rounded-full border border-teal-700/40 bg-teal-600/15 px-2.5 py-0.5 text-[10px] font-medium text-teal-300 capitalize'
									title={`Level: ${r.level}`}
								>
									{r.level}
								</span>
							</div>

							<div className='mt-3 flex flex-wrap gap-2'>
								{r.tags.slice(0, 4).map((tag) => (
									<span
										key={tag}
										className='rounded-md border border-[#25282c] bg-[#0b0c0d] px-2 py-0.5 text-[10px] text-gray-400 group-hover:border-teal-700/40 group-hover:text-gray-300'
									>
										{tag}
									</span>
								))}
							</div>

							<div className='mt-4'>
								<span className='inline-flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-black transition-colors group-hover:bg-teal-500'>
									Open roadmap
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 20 20'
										fill='currentColor'
										className='h-4 w-4'
										aria-hidden='true'
									>
										<path
											fillRule='evenodd'
											d='M3 10a.75.75 0 0 1 .75-.75h9.69L10.22 6.03a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z'
											clipRule='evenodd'
										/>
									</svg>
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default Roadmaps;
