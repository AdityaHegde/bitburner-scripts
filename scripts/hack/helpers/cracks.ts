import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../types/Metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import type { HackMetadata } from "./hacksMetadata";
import { newServerStats } from "./hacksMetadata";
import { isPlayerServer } from "$scripts/utils/isPlayerServer";

export type CrackType = "BruteSSH" | "FTPCrack" | "RelaySMTP" | "HTTPWorm" | "SQLInject";
export const CrackTypeToFile: Record<CrackType, string> = {
  BruteSSH: "BruteSSH.exe",
  FTPCrack: "FTPCrack.exe",
  RelaySMTP: "relaySMTP.exe",
  HTTPWorm: "HTTPWorm.exe",
  SQLInject: "SQLInject.exe",
};
export const MaxCracksCount = Object.keys(CrackTypeToFile).length;

export const CrackRequiredLevel: Record<CrackType, number> = {
  BruteSSH: 50,
  FTPCrack: 100,
  RelaySMTP: 250,
  HTTPWorm: 500,
  SQLInject: 750,
};

export function collectCracks(ns: NS, metadata: Metadata) {
  // collect available cracks
  for (const crack of Object.keys(CrackTypeToFile)) {
    if (!metadata.cracks[crack] && ns.fileExists(CrackTypeToFile[crack], "home")) {
      metadata.cracks[crack] = true;
    }
  }
}

export function runCracks(ns: NS, cracks: Array<CrackType>, server: string, requiredPorts: number) {
  for (let i = 0; i < requiredPorts && i < cracks.length; i++) {
    // using the map CrackTypeToMethod to run the command does not add to script mem
    // hence using the methods directly to not exploit
    switch (cracks[i]) {
      case "BruteSSH":
        ns.brutessh(server);
        break;

      case "FTPCrack":
        ns.ftpcrack(server);
        break;

      case "RelaySMTP":
        ns.relaysmtp(server);
        break;

      case "HTTPWorm":
        ns.httpworm(server);
        break;

      case "SQLInject":
        ns.sqlinject(server);
        break;
    }
  }
}

export function crackNPCServer(ns: NS, metadata: Metadata, server: string): boolean {
  const requiredPorts = ns.getServerNumPortsRequired(server);
  const cracksAvailable = Object.keys(metadata.cracks) as Array<CrackType>;

  if (requiredPorts > cracksAvailable.length) return false;

  runCracks(ns, cracksAvailable, server, requiredPorts);
  ns.nuke(server);

  return true;
}

export function nukeServers(ns: NS, metadata: Metadata, hackMetadata: HackMetadata): void {
  collectCracks(ns, metadata);

  const remainingServers = [];
  for (const server of metadata.newServers) {
    if (
      // if it is not a new player server
      !isPlayerServer(server) &&
      // or is not cracked
      !crackNPCServer(ns, metadata, server)
    ) {
      remainingServers.push(server);
      // skip the server
      continue;
    }

    // copy all scripts
    copyScriptToServer(ns, server);
    hackMetadata.serverStats[server] ??= newServerStats(ns, server);
    metadata.servers.push(server);
  }
  metadata.newServers = remainingServers;
}
