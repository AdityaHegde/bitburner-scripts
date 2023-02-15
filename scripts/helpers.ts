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
import { CodingContractsProcessor } from "$src/coding-contracts/codingContractsProcessor";
import { CodingContractScanner } from "$src/coding-contracts/codingContractScanner";
import { CodingContractSolver } from "$src/coding-contracts/codingContractSolver";

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

async function purchaseCrack(ns: NS, logger: Logger, serverDataList: ServerDataList) {
  const cracks = new CracksPurchaser(ns, logger, serverDataList, new ExploitedTORAutomation());
  cracks.init();
  return cracks.purchase();
}

async function runCodingContracts(ns: NS, logger: Logger, serverDataList: ServerDataList) {
  const contracts = new CodingContractsProcessor(
    ns,
    new CodingContractScanner(ns, logger, serverDataList.allServers),
    new CodingContractSolver(ns, logger),
  );
  return contracts.process();
}

export type HelpersFlags = {
  server: string;
  factions: boolean;
  cracks: boolean;
  contracts: boolean;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<HelpersFlags>(ns, [
    ["string", "server", "Connect to this server.", ""],
    ["boolean", "factions", "Join initial factions.", false],
    ["boolean", "cracks", "Purchase cracks.", false],
    ["boolean", "contracts", "Search and run coding contracts.", false],
  ]);
  if (!ok) {
    return;
  }

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

  if (flags.cracks) {
    return purchaseCrack(ns, logger, serverDataList);
  }

  if (flags.contracts) {
    return runCodingContracts(ns, logger, serverDataList);
  }
}
