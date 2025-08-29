import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AssistantRole = "user" | "assistant" | "system";

export interface AssistantMessage {
	id: string;
	role: AssistantRole;
	text: string;
	t: number; // timestamp
	meta?: Record<string, any>;
}

interface AssistantState {
	isOpen: boolean;
	input: string;
	messages: AssistantMessage[];
	loading: boolean;
	cooldownMs: number;
	model?: string;
	setOpen: (open: boolean) => void;
	setInput: (v: string) => void;
	addMessage: (msg: AssistantMessage) => void;
	clear: () => void;
	setLoading: (v: boolean) => void;
	setCooldown: (ms: number) => void;
	setModel: (m?: string) => void;
}

// Consent-aware storage wrapper (duplicate of auth.ts approach)
const consentedStorage = {
	getItem: (name: string): string | null => {
		try {
			const consent = localStorage.getItem("cookieConsent");
			if (consent !== "accepted") return null;
			return localStorage.getItem(name);
		} catch {
			return null;
		}
	},
	setItem: (name: string, value: string): void => {
		try {
			const consent = localStorage.getItem("cookieConsent");
			if (consent !== "accepted") return; // do not persist without consent
			localStorage.setItem(name, value);
		} catch {
			// no-op
		}
	},
	removeItem: (name: string): void => {
		try {
			localStorage.removeItem(name);
		} catch {
			// no-op
		}
	},
};

export const useAssistantStore = create<AssistantState>()(
	persist(
		(set) => ({
			isOpen: false,
			input: "",
			messages: [],
			loading: false,
			cooldownMs: 0,
			model: undefined,
			setOpen: (open: boolean) => set({ isOpen: open }),
			setInput: (v: string) => set({ input: v }),
			addMessage: (msg: AssistantMessage) =>
				set((s) => ({ messages: [...s.messages, msg] })),
			clear: () => set({ messages: [] }),
			setLoading: (v: boolean) => set({ loading: v }),
			setCooldown: (ms: number) => set({ cooldownMs: ms }),
			setModel: (m?: string) => set({ model: m }),
		}),
		{
			name: "assistant-storage",
			storage: consentedStorage as any,
			partialize: (s) => ({
				isOpen: s.isOpen,
				input: s.input,
				messages: s.messages,
			}),
		}
	)
);
