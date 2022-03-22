import { NS } from "../types/gameTypes";
import { GrowScript, HackScript, WeakenScript } from "../types/Hack";

const ScriptToMemMap = {
  [GrowScript]: 1.75,
  [WeakenScript]: 1.75,
  [HackScript]: 1.7,
}

export function getThreadsForScript(ns: NS, server: string, script: string): number {
  if (!(script in ScriptToMemMap)) return 1;
  const hackScriptMem = ScriptToMemMap[script];
  const serverMem = ns.getServerMaxRam(server);
  return Math.floor(serverMem / hackScriptMem);
}
