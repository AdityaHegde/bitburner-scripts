import type { BatchTarget } from "$scripts/hack/helpers/batching/batchTarget";
import type { NS } from "$scripts/types/gameTypes";
import { ScriptToMemMap } from "$scripts/hack/helpers/hackTypes";
import { BatchCoordinatorScript } from "$scripts/constants";
import { getGHWBatchTarget } from "$scripts/hack/helpers/batching/batchTarget";

const GrowTimeMulti = 4;
const WeakenTimeMulti = 3.2;

export type ServerPermStats = {
  server: string;
  reqLevel: number;
  minSecurity: number;
  maxMoney: number;
  maxMem: number;
  memOffset: number;
};

export type ServerTempStats = {
  security?: number;
  money?: number;
  rates?: [number, number, number];
  times?: [number, number, number];
  mem?: number;
  cores?: number;
};

export type ServerBatchStats = {
  batchMem?: number;
  batchScore?: number;
};

export type ServerStats = ServerPermStats & ServerTempStats & ServerBatchStats;

export function newServerStats(ns: NS, server: string): ServerStats {
  return {
    server,
    reqLevel: ns.getServerRequiredHackingLevel(server),
    minSecurity: ns.getServerMinSecurityLevel(server),
    maxMoney: ns.getServerMaxMoney(server),
    maxMem: ns.getServerMaxRam(server),
    memOffset: 0,
  };
}

export type ServerState = {
  prepTarget?: Record<string, Record<number, number>>;
  batchTarget?: BatchTarget;
};

export function newServerState(): ServerState {
  return {
    prepTarget: {},
  };
}

export function fillServerStats(ns: NS, serverStats: ServerStats) {
  const server = serverStats.server;

  serverStats.security = ns.getServerSecurityLevel(server);
  serverStats.money = ns.getServerMoneyAvailable(server);

  serverStats.mem = serverStats.maxMem;
  ns.ps(server).forEach((processInfo) => {
    // subtract memory of non-hack script only
    if (processInfo.filename in ScriptToMemMap || processInfo.filename === BatchCoordinatorScript)
      return;
    serverStats.mem -= ns.getScriptRam(processInfo.filename, server) * processInfo.threads;
  });

  serverStats.cores = 1;

  const hackTime = ns.getHackTime(server);
  serverStats.times = [hackTime * GrowTimeMulti, hackTime * WeakenTimeMulti, hackTime];

  if (serverStats.money > 0 && serverStats.maxMoney > 0) {
    serverStats.rates = [ns.getServerGrowth(server), 0.05, ns.hackAnalyze(server)];
  } else {
    serverStats.rates = [0, 0, 0];
  }

  const batch = getGHWBatchTarget(ns, serverStats);
  serverStats.batchMem = batch.mem;
  serverStats.batchScore = batch.score;
}
