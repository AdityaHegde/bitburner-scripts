import type { NS } from "$src/types/gameTypes";
import { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";

export const GangScript = "/mechanics/gangs.js";
export const GangScore = 800;

export function getGangScriptSchedule(ns: NS) {
  return new ScriptSchedule(ns, GangScript, [], GangScore);
}
