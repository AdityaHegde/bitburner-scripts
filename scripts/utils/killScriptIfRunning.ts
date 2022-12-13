import type { NS } from "../types/gameTypes";

export function killScriptIfRunning(ns: NS, server: string, script: string) {
  const runningScriptInfo = ns.ps(server).find((processInfo) => processInfo.filename === script);
  if (runningScriptInfo) {
    ns.kill(script, server);
  }
}
