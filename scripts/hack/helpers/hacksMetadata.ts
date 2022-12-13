import type { NS } from "../../types/gameTypes";
import { HackType, ScriptToMemMap } from "./hackTypes";

export interface ServerStats {
  server?: string;
  reqLevel: number;
  minSecurity: number;
  security?: number;
  maxMoney: number;
  money?: number;
  rates?: [number, number, number];
  times?: [number, number, number];
  securities?: [number, number, number];
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
    targetServer: {},
  };
}

export function fillServerStats(ns: NS, server: string, serverStats: ServerStats) {
  const multipliers = ns.getPlayer().mults;

  serverStats.security = ns.getServerSecurityLevel(server);
  serverStats.money = ns.getServerMoneyAvailable(server);

  serverStats.mem = ns.getServerMaxRam(server);
  if (server === "home") {
    // adhoc space in home to run stuff
    serverStats.mem -= 8;
  }

  ns.ps(server).forEach((processInfo) => {
    // subtract memory of non-hack script
    if (processInfo.filename in ScriptToMemMap) return;
    serverStats.mem -= ns.getScriptRam(processInfo.filename, server) * processInfo.threads;
  });

  serverStats.times = [
    ns.getGrowTime(server) * multipliers.hacking_speed,
    ns.getWeakenTime(server) * multipliers.hacking_speed,
    ns.getHackTime(server) * multipliers.hacking_speed,
  ];

  if (serverStats.money > 0 && serverStats.maxMoney > 0) {
    serverStats.rates = [
      ns.growthAnalyze(server, serverStats.maxMoney / serverStats.money) * multipliers.hacking_grow,
      0.05,
      ns.hackAnalyze(server) * multipliers.hacking_money,
    ];
  } else {
    serverStats.rates = [0, 0, 0];
  }

  serverStats.securities = [
    ns.growthAnalyzeSecurity(1, server),
    0,
    ns.hackAnalyzeSecurity(1, server),
  ];
}
