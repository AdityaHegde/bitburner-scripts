import { Metadata } from "../../types/Metadata";
import {
  fillServerStats,
  HackMetadata,
  HackTargetServer,
  ServerStats,
} from "./hacksMetadata";
import { NS } from "../../types/gameTypes";
import { Heap } from "../../utils/heap";
import { HackType, HackTypeToScript, ScriptToMemMap } from "./hackTypes";
import { Logger } from "../../utils/logger";
import { getThreadsForScript } from "./runHackScript";

const SecurityOffset = 5;
const MoneyHighThreshold = 0.75;
const MoneyLowThreshold = 0.5;

export type HackTargetHeapEntry = {
  server: string;
  stats: ServerStats;
  score: number;
};

// TODO: use formula API
function getHackTargetHeapEntry(
  server: string,
  hackMetadata: HackMetadata
): HackTargetHeapEntry {
  const stats = hackMetadata.serverStats[server];
  const hackRate = stats.rates[HackType.Hack] || 0.01;
  return {
    server,
    stats,
    score: (stats.maxMoney * hackRate) / stats.minSecurity,
  };
}

function getHackTargetType(
  entry: HackTargetHeapEntry
): [type: HackType, threads: number] {
  const securityDiff =
    entry.stats.security - (entry.stats.minSecurity + SecurityOffset);
  const moneyDiff =
    entry.stats.maxMoney * MoneyHighThreshold - entry.stats.money;
  if (securityDiff > 0) {
    return [
      HackType.Weaken,
      Math.ceil(securityDiff / entry.stats.rates[HackType.Weaken]),
    ];
  } else if (moneyDiff > 0) {
    return [
      HackType.Grow,
      Math.ceil(moneyDiff / entry.stats.rates[HackType.Grow]),
    ];
  } else {
    return [
      HackType.Hack,
      Math.floor(MoneyLowThreshold / entry.stats.rates[HackType.Hack]),
    ];
  }
}

function getHackTargetForEntry(
  ns: NS,
  logger: Logger,
  hackMetadata: HackMetadata,
  servers: Array<string>,
  entry: HackTargetHeapEntry
): HackTarget {
  // eslint-disable-next-line prefer-const
  let [type, threads] = getHackTargetType(entry);
  if (threads === 1) return undefined;
  const script = HackTypeToScript[type];
  logger.log(ns, "Targeting", {
    target: entry.server,
    type,
    threads,
  });

  const assignedServers = new Array<[string, number]>();
  // TODO: better assignment
  // TODO: support different targets from a server
  while (threads >= 0 && servers.length > 0) {
    const server = servers.shift();
    const serverThreads = getThreadsForScript(
      ns,
      server,
      script,
      hackMetadata.serverStats[server].mem
    );
    if (serverThreads === 0) {
      continue;
    }

    threads -= serverThreads;
    hackMetadata.serverStats[server].mem -=
      ScriptToMemMap[script] * serverThreads;
    logger.log(ns, "Assigning", {
      target: entry.server,
      server,
      threads: serverThreads,
    });
    assignedServers.push([server, serverThreads]);
  }
  return {
    target: entry.server,
    type,
    servers: assignedServers,
  };
}

export type HackTarget = {
  target: string;
  type: HackType;
  servers: Array<[server: string, threads: number]>;
};
export type HackTargets = Array<HackTarget>;
export function getHackTargets(
  ns: NS,
  logger: Logger,
  metadata: Metadata,
  hackMetadata: HackMetadata
): HackTargets {
  const targets = new Array<HackTarget>();
  const hackLevel = ns.getHackingLevel();

  const heap = new Heap<HackTargetHeapEntry>(
    (a, b) => a.score - b.score,
    (a) => a.server
  );

  let servers = new Array<string>();
  for (const server in hackMetadata.serverStats) {
    fillServerStats(ns, server, hackMetadata.serverStats[server]);
    servers.push(server);
    if (hackMetadata.serverStats[server].reqLevel > hackLevel) continue;
    const entry = getHackTargetHeapEntry(server, hackMetadata);
    heap.push(entry);
    logger.log(ns, "Adding", {
      server,
      score: entry.score,
    });
  }
  // TODO: store started servers
  servers = servers.sort(
    (a, b) => hackMetadata.serverStats[a].mem - hackMetadata.serverStats[b].mem
  );

  const newTargetServers = new Array<HackTargetServer>();
  // complete existing targets
  // this is to make sure we get money out of target with invested time to grow/weaken
  for (const { targetServer, type } of hackMetadata.targets) {
    const entry = {
      server: targetServer,
      stats: hackMetadata.serverStats[targetServer],
      score: 0,
    };
    const [newType] = getHackTargetType(entry);
    if (type === HackType.Hack && newType !== HackType.Hack) {
      // remove old target if it was already hacked
      continue;
    }
    newTargetServers.push({ targetServer, type: newType });
    targets.push(
      getHackTargetForEntry(ns, logger, hackMetadata, servers, entry)
    );
  }

  while (servers.length > 0 && !heap.empty()) {
    const entry = heap.pop();
    const target = getHackTargetForEntry(
      ns,
      logger,
      hackMetadata,
      servers,
      entry
    );
    if (!target) continue;
    newTargetServers.push({ targetServer: target.target, type: target.type });
    targets.push(target);
  }

  hackMetadata.targets = newTargetServers;

  return targets;
}
