import { create } from "zustand";

export interface PartnerInfo {
	id?: string;
	name?: string;
	avatarUrl?: string;
	skills?: string[];
	timezone?: string;
}

interface MatchState {
	searching: boolean;
	matchedPartner: PartnerInfo | null;
	setSearching: (s: boolean) => void;
	setMatchedPartner: (p: PartnerInfo | null) => void;
	reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
	searching: false,
	matchedPartner: null,
	setSearching: (s) => set({ searching: s }),
	setMatchedPartner: (p) => set({ matchedPartner: p }),
	reset: () => set({ searching: false, matchedPartner: null }),
}));
