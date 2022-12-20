import type { NS } from "../../types/gameTypes";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { isPlayerServer } from "$scripts/utils/isPlayerServer";
import type { HackTargetMetadata } from "$scripts/metadata/hackTargetMetadata";

export const Cracks: Array<string> = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "RelaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

export function collectCracks(ns: NS, existing: Array<number>): Array<number> {
  for (let i = existing[existing.length - 1] ?? 0; i < Cracks.length; i++) {
    if (ns.fileExists(Cracks[i], "home")) {
      existing.push(i);
    } else {
      // cracks are available in order
      break;
    }
  }
  return existing;
}

export function runCracks(ns: NS, cracks: Array<number>, server: string, requiredPorts: number) {
  for (let i = 0; i < requiredPorts && i < cracks.length; i++) {
    // using the map CrackTypeToMethod to run the command does not add to script mem
    // hence using the methods directly to not exploit
    switch (cracks[i]) {
      case 0:
        ns.brutessh(server);
        break;

      case 1:
        ns.ftpcrack(server);
        break;

      case 2:
        ns.relaysmtp(server);
        break;

      case 3:
        ns.httpworm(server);
        break;

      case 4:
        ns.sqlinject(server);
        break;
    }
  }
}

export function crackNPCServer(ns: NS, metadata: HackTargetMetadata, server: string): boolean {
  const requiredPorts = ns.getServerNumPortsRequired(server);

  if (requiredPorts > metadata.cracks.length) return false;

  runCracks(ns, metadata.cracks, server, requiredPorts);
  ns.nuke(server);

  return true;
}

export function nukeServers(ns: NS, hackTargetMetadata: HackTargetMetadata): Array<string> {
  hackTargetMetadata.cracks = collectCracks(ns, hackTargetMetadata.cracks);

  const cracked = [];
  let i = 0;
  for (; i < hackTargetMetadata.newServers.length; i++) {
    const server = hackTargetMetadata.newServers[i];
    if (!isPlayerServer(server) && !crackNPCServer(ns, hackTargetMetadata, server)) {
      // newServers are in order of required hack level
      // so any server not cracked means successive ones are not cracked either
      break;
    }

    // copy all scripts
    copyScriptToServer(ns, server);
    cracked.push(server);
  }
  if (i > 0) {
    hackTargetMetadata.newServers = hackTargetMetadata.newServers.splice(i);
  }

  return cracked;
}
