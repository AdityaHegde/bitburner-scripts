import type { HackEntriesState } from "$server/game/gameState";
import type { Patch } from "immer";
import { applyPatches } from "immer";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export const { update, set, subscribe } = writable<HackEntriesState>({
  min: 0,
  max: 0,
  entries: {},
});

const hackEntriesReducers = {
  init(state: HackEntriesState) {
    set(state);
  },

  update(patches: Array<Patch>) {
    update((state) => applyPatches(state, patches));
  },
};

export const hackEntriesStore: Readable<HackEntriesState> & typeof hackEntriesReducers = {
  subscribe,
  ...hackEntriesReducers,
};

// 10 min window
export const HackEntriesWindow = 1000 * 60 * 10;
export const HackEntriesScale = 500;
