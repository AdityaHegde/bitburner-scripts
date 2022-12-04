import { NS } from "../types/gameTypes";
import { getThreadsForScript } from "./getThreadsForScript";

export function runActionScriptOnServer(
  ns: NS, script: string,
  server: string, targetServer: string,
) {
  ns.killall(server);

  const threads = getThreadsForScript(ns, server, script);
  if (threads === 0) return;

  ns.exec(script, server, threads, targetServer);
}
