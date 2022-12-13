import type { NS } from "../../types/gameTypes";
import { HackScriptToType, HackTypeToScript, ScriptToMemMap } from "./hackTypes";

export function getThreadsForScript(ns: NS, server: string, script: string, mem: number): number {
  if (!(script in ScriptToMemMap)) return 1;
  const hackScriptMem = ScriptToMemMap[script];
  return Math.floor(mem / hackScriptMem);
}

export function reconcileHackScripts(
  ns: NS,
  server: string,
  targets: Record<number, Record<string, number>>,
) {
  ns.ps(server).forEach((processInfo) => {
    if (!(processInfo.filename in HackScriptToType)) return;
    const type = HackScriptToType[processInfo.filename];
    const serverArg = processInfo.args[0] as string;
    if (
      type in targets &&
      serverArg in targets[type] &&
      processInfo.threads === targets[type][serverArg]
    ) {
      delete targets[type];
    } else {
      ns.kill(processInfo.pid);
    }
  });

  for (const type in targets) {
    for (const targetServer in targets[type]) {
      ns.exec(HackTypeToScript[type], server, targets[type][targetServer], targetServer);
    }
  }
}
