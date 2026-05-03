import { create } from "zustand";
import type { PoemWithStats } from "./database.types";

type NowPlayingState = {
  poem: PoemWithStats | null;
  playing: boolean;
  progress: number; // 0..1
  duration: number; // seconds (real audio duration once loaded)
  // A monotonically-increasing token + value the player watches; bumping it
  // tells the audio element to seek even if the same fraction is requested
  // twice in a row.
  seekRequest: { token: number; value: number };
  setPoem: (poem: PoemWithStats | null) => void;
  // play(poem) sets the poem AND starts playing. Used by every "play this
  // poem" button across the app so callers don't have to remember the dance.
  play: (poem: PoemWithStats) => void;
  setPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  setDuration: (v: number) => void;
  toggle: () => void;
  seek: (fraction: number) => void;
};

export const useNowPlaying = create<NowPlayingState>((set) => ({
  poem: null,
  playing: false,
  progress: 0,
  duration: 0,
  seekRequest: { token: 0, value: 0 },
  setPoem: (poem) =>
    set((s) => {
      // No-op if it's already the current poem — avoids resetting playback
      // when the user opens the reader for a poem that's already playing.
      if (s.poem?.id === poem?.id) return s;
      return { poem, progress: 0, duration: 0, playing: false };
    }),
  play: (poem) =>
    set((s) => {
      // Same poem: just resume.
      if (s.poem?.id === poem.id) return { playing: true };
      return { poem, progress: 0, duration: 0, playing: true };
    }),
  setPlaying: (v) => set({ playing: v }),
  setProgress: (v) => set({ progress: v }),
  setDuration: (v) => set({ duration: v }),
  toggle: () => set((s) => ({ playing: !s.playing })),
  seek: (fraction) =>
    set((s) => ({
      seekRequest: { token: s.seekRequest.token + 1, value: fraction },
    })),
}));
