import type { GameState } from "$server/game/gameState";
import type { Patch } from "immer";
import { applyPatches, enablePatches } from "immer";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

enablePatches();

export const { update, set, subscribe } = writable<GameState>({
  resources: {},
  targets: {},
  clusters: [],
});

const gameStateReducers = {
  init(state: GameState) {
    set(state);
  },

  update(patches: Array<Patch>) {
    update((state) => applyPatches(state, patches));
  },
};

export const gameStore: Readable<GameState> & typeof gameStateReducers = {
  subscribe,
  ...gameStateReducers,
};
