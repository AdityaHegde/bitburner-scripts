import type { NS } from "$src/types/gameTypes";
import { validateFlags } from "$src/utils/validateFlags";
import { runTerminalCommand } from "$src/automation/exploits/terminal";
import { getMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { ServerDataList } from "$src/servers/serverDataList";
import { Logger } from "$src/utils/logger/logger";
import { asyncWait } from "$server/utils/asyncUtils";
import { CracksPurchaser } from "$src/purchaser/CracksPurchaser";
import { ExploitedTORAutomation } from "$src/automation/exploits/ExploitedTORAutomation";

const FactionServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];

async function joinInitialFactions(serverDataList: ServerDataList) {
  for (const factionServer of FactionServers) {
    connectToServer(serverDataList, "home", factionServer);
    runTerminalCommand("backdoor");
    await asyncWait(10000);
    runTerminalCommand("home");
  }
}

function connectToServer(serverDataList: ServerDataList, fromServer: string, toServer: string) {
  const path = serverDataList.serverDataNameMap[fromServer].getPathTo(toServer);
  for (const step of path) {
    if (step.name === fromServer) continue;
    runTerminalCommand(`connect ${step.name}`);
  }
}

async function breakBitNode(ns: NS, serverDataList: ServerDataList) {
  await connectToServer(serverDataList, "home", "w0r1d_d43m0n");
  await runTerminalCommand(`backdoor`);
}

async function purchaseCrack(ns: NS, logger: Logger, serverDataList: ServerDataList) {
  const cracks = new CracksPurchaser(ns, logger, serverDataList, new ExploitedTORAutomation());
  cracks.init();
  return cracks.purchase();
}

export type HelpersFlags = {
  server: string;
  factions: boolean;
  bitnode: boolean;
  cracks: boolean;
  karma: boolean;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<HelpersFlags>(ns, [
    ["string", "server", "Connect to this server.", ""],
    ["boolean", "factions", "Join initial factions.", false],
    ["boolean", "bitnode", "Break the bitnode.", false],
    ["boolean", "cracks", "Purchase cracks.", false],
    ["boolean", "karma", "Print the karma.", false],
  ]);
  if (!ok) return;

  const metadata = getMetadata(ns);
  const cracks = new Cracks(ns);
  const logger = Logger.ConsoleLogger(ns, "Connect");
  const serverDataList = new ServerDataList(ns, logger, cracks, metadata.newServers);

  if (flags.server) {
    return connectToServer(serverDataList, ns.getHostname(), flags.server);
  }

  if (flags.factions) {
    return joinInitialFactions(serverDataList);
  }

  if (flags.bitnode) {
    return breakBitNode(ns, serverDataList);
  }

  if (flags.cracks) {
    return purchaseCrack(ns, logger, serverDataList);
  }

  if (flags.karma) {
    ns.tprintf("%s\n", (ns as any).heart.break);
  }
}
