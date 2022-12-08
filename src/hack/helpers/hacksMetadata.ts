import { NS } from "../../types/gameTypes";
import { HackType, ScriptToMemMap } from "./hackTypes";
import { HackOrchestratorScript } from "../../constants";

export interface ServerStats {
  reqLevel: number;
  minSecurity: number;
  security?: number;
  maxMoney: number;
  money?: number;
  rates: [number, number, number];
  mem?: number;

  targetServer?: Record<string, Record<number, number>>;
}

export type HackTargetServer = {
  targetServer: string;
  type: HackType;
};
export interface HackMetadata {
  serverStats: Record<string, ServerStats>;
  targets: Array<HackTargetServer>;
}

export const HackMetadataFile = "hack.txt";

export function newHackMetadata(): HackMetadata {
  return {
    serverStats: {},
    targets: [],
  };
}

export function getHackMetadata(ns: NS): HackMetadata {
  const metadataString = ns.read(HackMetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export function saveHackMetadata(ns: NS, hackMetadata: HackMetadata) {
  ns.write(HackMetadataFile, JSON.stringify(hackMetadata), "w");
}

export function newServerStats(ns: NS, server: string): ServerStats {
  return {
    reqLevel: ns.getServerRequiredHackingLevel(server),
    minSecurity: ns.getServerMinSecurityLevel(server),
    maxMoney: ns.getServerMaxMoney(server),
    rates: [
      ns.getServerGrowth(server),
      0.05, // constant as of now
      0.01,
    ],
    targetServer: {},
  };
}

export function fillServerStats(
  ns: NS,
  server: string,
  serverStats: ServerStats
) {
  serverStats.security = ns.getServerSecurityLevel(server);
  serverStats.money = ns.getServerMoneyAvailable(server);
  serverStats.mem = ns.getServerMaxRam(server);
  ns.ps(server).forEach((processInfo) => {
    // subtract memory of non-hack script
    if (processInfo.filename in ScriptToMemMap) return;
    serverStats.mem -=
      ns.getScriptRam(processInfo.filename, server) * processInfo.threads;
  });
  serverStats.rates[HackType.Hack] = ns.hackAnalyze(server);
}
