import { create } from "zustand";
import type { PoemWithStats } from "./database.types";

type NowPlayingState = {
  poem: PoemWithStats | null;
  playing: boolean;
  progress: number; // 0..1
  setPoem: (poem: PoemWithStats | null) => void;
  setPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  toggle: () => void;
};

export const useNowPlaying = create<NowPlayingState>((set) => ({
  poem: null,
  playing: false,
  progress: 0,
  setPoem: (poem) => set({ poem, progress: 0 }),
  setPlaying: (v) => set({ playing: v }),
  setProgress: (v) => set({ progress: v }),
  toggle: () => set((s) => ({ playing: !s.playing })),
}));
