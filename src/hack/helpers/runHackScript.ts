import { NS } from "../../types/gameTypes";
import { HackType, HackTypeToScript, ScriptToMemMap } from "./hackTypes";

export function getThreadsForScript(
  ns: NS,
  server: string,
  script: string,
  mem: number
): number {
  if (!(script in ScriptToMemMap)) return 1;
  const hackScriptMem = ScriptToMemMap[script];
  return Math.floor(mem / hackScriptMem);
}

export function runHackScriptOnServer(
  ns: NS,
  type: HackType,
  server: string,
  targetServer: string,
  threads: number
) {
  if (threads === 0) {
    return;
  }
  const script = HackTypeToScript[type];
  ns.ps(server).forEach((processInfo) => {
    if (!(processInfo.filename in ScriptToMemMap)) return;
    ns.kill(processInfo.pid);
  });
  ns.exec(script, server, threads, targetServer);
}
