import { NS } from "../types/gameTypes";
import { getThreadsForScript } from "./getThreadsForScript";

export function runActionScriptOnServer(
  ns: NS, script: string,
  server: string, targetServer: string,
) {
  ns.killall(server);
  ns.exec(
    script, server,
    getThreadsForScript(ns, server, script),
    targetServer,
  );
}
