import type { NS } from "$src/types/gameTypes";

export enum GameStage {
  Early,
  Mid,
}

export const GameStageToRunner: Record<GameStage, string> = {
  [GameStage.Early]: "earlyGame.js",
  [GameStage.Mid]: "midGame.js",
};

export function getGameStage(ns: NS) {
  return GameStage.Early;
}
