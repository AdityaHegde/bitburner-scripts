import type { NS } from "$src/types/gameTypes";
import { validateFlags } from "$src/utils/validateFlags";
import { getMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { ServerDataList } from "$src/servers/serverDataList";
import { Logger } from "$src/utils/logger/logger";
import { init, runTerminalCommand } from "$src/utils/exploits/terminal";

export type ConnectToServerFlags = {
  server: string;
  help: boolean;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<ConnectToServerFlags>(ns, [
    ["string", "server", "Connect to this server.", ""],
    ["boolean", "help", "Print help", false],
  ]);
  if (!ok) {
    return;
  }
  init();

  const metadata = getMetadata(ns);
  const cracks = new Cracks(ns);
  const serverDataList = new ServerDataList(
    ns,
    Logger.ConsoleLogger(ns, "Connect"),
    cracks,
    metadata.newServers,
  );

  const src = ns.getHostname();
  const path = serverDataList.serverDataNameMap[src].getPathTo(flags.server);
  for (const step of path) {
    if (step.name === src) continue;
    runTerminalCommand(`connect ${step.name}`);
  }
}
