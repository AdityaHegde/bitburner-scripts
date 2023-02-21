import { validateFlags } from "$src/utils/validateFlags";
import type { NS } from "$src/types/gameTypes";

export enum BackFillMode {
  None = "None",
  Exp = "Exp",
  Power = "Power",
}

export type RunnerFlags = {
  noPurchase: boolean;
  corp: boolean;
  gang: boolean;
  sleeves: boolean;
  maxMem: number;
  backfill: BackFillMode;
};

export function validateRunnerFlags(ns: NS) {
  return validateFlags<RunnerFlags>(ns, [
    ["boolean", "noPurchase", "No purchasing.", false],
    ["boolean", "corp", "Enable corp.", false],
    ["boolean", "gang", "Enable gang.", false],
    ["boolean", "sleeves", "Enable sleeves.", false],
    ["number", "maxMem", "Max player server mem.", Number.MAX_SAFE_INTEGER],
    ["string", "backfill", "Backfill mode.", BackFillMode.Exp],
  ]);
}
