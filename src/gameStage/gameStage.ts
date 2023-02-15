import type { NS } from "$src/types/gameTypes";

export enum GameStage {
  Early,
  Mid,
}

export const GameStageToRunner: Record<GameStage, string> = {
  [GameStage.Early]: "runner.js",
  [GameStage.Mid]: "midGame.js",
};

export function getGameStage(ns: NS) {
  // if (ns.fileExists(FormulaName, "home")) return GameStage.Mid;
  // TODO: restart hacks when formula has been bought
  // TODO: make the formula scheduler to select the correct percent based on available server
  return GameStage.Early;
}
