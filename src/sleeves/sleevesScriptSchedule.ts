import type { NS } from "$src/types/gameTypes";
import { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";

export const SleeveScript = "sleeves.js";
export const SleeveScore = 750;

export function getSleeveScriptSchedule(ns: NS) {
  return new ScriptSchedule(ns, SleeveScript, [], SleeveScore);
}
