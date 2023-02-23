import { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";
import type { NS } from "$src/types/gameTypes";

export const CorpScript = "/mechanics/corp.js";
export const CorpScore = 1000;

export function getCorpScriptSchedule(ns: NS): ScriptSchedule {
  return new ScriptSchedule(ns, CorpScript, [], CorpScore);
}
