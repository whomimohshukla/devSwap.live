import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useAssistantStore } from "../../lib/assistant";
import { aiAPI } from "../../lib/api";

function useCurrentSessionId() {
	const { pathname } = useLocation();
	return useMemo(() => {
		const m = pathname.match(/^\/sessions\/(.+?)\/room/);
		return m ? m[1] : undefined;
	}, [pathname]);
}

const AssistantBar: React.FC = () => {
	const sessionId = useCurrentSessionId();
	const {
		isOpen,
		input,
		messages,
		loading,
		cooldownMs,
		model,
		setOpen,
		setInput,
		addMessage,
		clear,
		setLoading,
		setCooldown,
		setModel,
	} = useAssistantStore();

	const canSend = !loading && cooldownMs <= 0 && input.trim().length > 0;

	const onSend = async () => {
		if (!canSend) return;
		const text = input.trim();
		const now = Date.now();
		addMessage({ id: `${now}-u`, role: "user", text, t: now });
		setInput("");
		try {
			setLoading(true);
			const { data } = await aiAPI.assist({
				question: text,
				mode: "qa",
				depth: "medium",
				sessionId,
				includeContext: true,
			});
			const answer = data?.answer || "No answer";
			const meta = data?.meta || {};
			addMessage({
				id: `${Date.now()}-a`,
				role: "assistant",
				text: answer,
				t: Date.now(),
				meta,
			});
			if (typeof meta.cooldownMs === "number" && meta.cooldownMs > 0)
				setCooldown(Number(meta.cooldownMs));
			if (meta.model) setModel(String(meta.model));
		} catch (e: any) {
			const msg = e?.response?.data?.message || "Failed to get answer";
			addMessage({
				id: `${Date.now()}-e`,
				role: "assistant",
				text: msg,
				t: Date.now(),
				meta: { error: true },
			});
		} finally {
			setLoading(false);
		}
	};

	const copyLast = async () => {
		if (!messages.length) return;
		const last = messages[messages.length - 1];
		try {
			await navigator.clipboard.writeText(last.text);
		} catch {}
	};

	// Cooldown ticker to update the visible countdown every second
	useEffect(() => {
		if (cooldownMs <= 0) return;
		const id = setInterval(() => {
			useAssistantStore.setState((s) => ({
				cooldownMs: Math.max(0, s.cooldownMs - 1000),
			}));
		}, 1000);
		return () => clearInterval(id);
	}, [cooldownMs]);

	return (
		<div className='sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-4'>
			<div className='rounded-xl border border-gray-800 bg-[#0b0c0d]'>
				<div className='flex items-center justify-between px-3 py-2'>
					<button
						onClick={() => setOpen(!isOpen)}
						className='inline-flex items-center gap-2 text-sm font-semibold text-white'
					>
						<span className='inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]' />
						AI Assistant
						{isOpen ? (
							<ChevronUp className='w-4 h-4' />
						) : (
							<ChevronDown className='w-4 h-4' />
						)}
					</button>
					<div className='flex items-center gap-2'>
						{!isOpen && (
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") onSend();
								}}
								placeholder='Ask about JS, React, etc.'
								className='hidden md:block w-72 bg-black/40 border border-gray-800 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-600'
							/>
						)}
						<button
							onClick={onSend}
							disabled={!canSend}
							className='px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded text-sm inline-flex items-center gap-1'
						>
							<Send className='w-4 h-4' />
							{cooldownMs > 0
								? `Cooldown ${Math.ceil(cooldownMs / 1000)}s`
								: loading
								? "Asking…"
								: "Ask"}
						</button>
					</div>
				</div>
				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className='px-3 pb-3 border-t border-gray-800'
						>
							<div className='flex items-center gap-2 mt-3'>
								<input
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") onSend();
									}}
									className='flex-1 bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-600'
									placeholder='Describe your question clearly…'
								/>
								<button
									onClick={onSend}
									disabled={!canSend}
									className='px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded text-sm inline-flex items-center gap-1'
								>
									<Send className='w-4 h-4' />
									{cooldownMs > 0
										? `Cooldown ${Math.ceil(cooldownMs / 1000)}s`
										: loading
										? "Asking…"
										: "Ask"}
								</button>
								<button
									onClick={copyLast}
									disabled={!messages.length}
									className='px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white rounded text-sm inline-flex items-center gap-1'
									title='Copy last response'
								>
									<Copy className='w-4 h-4' /> Copy
								</button>
								<button
									onClick={clear}
									disabled={!messages.length}
									className='px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white rounded text-sm inline-flex items-center gap-1'
									title='Clear history'
								>
									<Trash2 className='w-4 h-4' /> Clear
								</button>
							</div>
							{/* History */}
							<div className='mt-3 max-h-60 overflow-auto space-y-2'>
								{messages.length === 0 && !loading && (
									<div className='text-xs text-gray-500'>
										Tip: Ask specific, concise questions for best
										results.
									</div>
								)}
								{messages.map((m) => (
									<div key={m.id} className='text-sm text-gray-200'>
										<span className='text-xs text-gray-500 mr-2'>
											{new Date(m.t).toLocaleTimeString(undefined, {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
										<span
											className={`font-semibold mr-2 ${
												m.role === "user"
													? "text-emerald-300"
													: "text-teal-300"
											}`}
										>
											{m.role === "user" ? "You" : "Assistant"}:
										</span>
										<span className='whitespace-pre-wrap'>
											{m.text}
										</span>
									</div>
								))}
							</div>
							{/* Footer meta */}
							<div className='mt-2 text-xs text-gray-500 flex items-center justify-between'>
								<div>{model && <span>Model: {model}</span>}</div>
								{cooldownMs > 0 && (
									<div>
										Cooldown active — please wait{" "}
										{Math.ceil(cooldownMs / 1000)}s
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default AssistantBar;
