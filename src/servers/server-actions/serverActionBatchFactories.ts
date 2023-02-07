import type { NS, Player, Server } from "$src/types/gameTypes";
import type { ServerData } from "$src/servers/serverData";
import {
  ServerActionBatch,
  ServerActionBatchMode,
} from "$src/servers/server-actions/serverActionBatch";
import {
  HackBatchPercents,
  HackGroupSize,
  HackGrowthPercent,
  HackPercent,
  Second,
  ServerWeakenAmount,
  WeakenThreadsPerGrowCall,
  WeakenThreadsPerHackCall,
} from "$src/constants";
import {
  ServerActionType,
  ServerActionTypeToMemMap,
} from "$src/servers/server-actions/serverActionType";
import { config } from "$src/config";

export function getWeaken(ns: NS, target: ServerData): ServerActionBatch {
  const calls = Math.ceil((target.security - target.minSecurity) / ServerWeakenAmount);
  return new ServerActionBatch(
    ServerActionBatchMode.Prep,
    target,
    [ServerActionType.Weaken],
    [calls],
    1,
  );
}

export function getGrowWeaken(ns: NS, target: ServerData): ServerActionBatch {
  const grows = Math.ceil(
    ns.growthAnalyze(target.name, target.maxMoney / Math.max(target.money, 1)),
  );
  const weakens = Math.ceil(grows / WeakenThreadsPerGrowCall);
  return new ServerActionBatch(
    ServerActionBatchMode.Prep,
    target,
    [ServerActionType.Grow, ServerActionType.Weaken],
    [grows, weakens],
    1,
  );
}

export function getEarlyHackWeakenGrowWeaken(ns: NS, target: ServerData): ServerActionBatch {
  let hacks = Math.ceil(HackPercent / target.rate);
  const hacksPerRun = Math.floor(hacks / HackGroupSize);
  hacks = hacksPerRun * HackGroupSize;
  const grows = Math.ceil(
    ns.growthAnalyze(target.name, Math.max(1, 1 / (1 - HackGrowthPercent)), target.cores),
  );
  const hacksWeakens = Math.ceil(hacks / WeakenThreadsPerHackCall);
  const growsWeakens = Math.ceil(grows / WeakenThreadsPerGrowCall);
  return new ServerActionBatch(
    ServerActionBatchMode.Hack,
    target,
    [
      ServerActionType.Hack,
      ServerActionType.Weaken,
      ServerActionType.Grow,
      ServerActionType.Weaken,
    ],
    [hacksPerRun, hacksWeakens, grows, growsWeakens],
    -1,
    [HackGroupSize, 1, 1, 1],
  );
}

export function getExperienceBatch(target: ServerData, enable: boolean): ServerActionBatch {
  const batch = new ServerActionBatch(
    ServerActionBatchMode.BackFill,
    target,
    [ServerActionType.Experience],
    [-1],
    -1,
  );
  batch.score = 1;
  batch.enabled = config.backFillExp && enable;
  return batch;
}

export function getSharePowerBatch(target: ServerData): ServerActionBatch {
  const batch = new ServerActionBatch(
    ServerActionBatchMode.BackFill,
    target,
    [ServerActionType.SharePower],
    [-1],
    -1,
  );
  batch.score = 2;
  batch.enabled = config.backFillPower;
  return batch;
}

export function getHackWeakenGrowWeaken(
  ns: NS,
  target: ServerData,
  maxServerMem = 0,
): ServerActionBatch {
  const player = ns.getPlayer();
  const server = ns.getServer(target.name);
  // set the server to min difficulty for calculations
  server.hackDifficulty = server.minDifficulty;

  if (!target.growThreads) {
    target.fillGrowThreads(server, player);
  }

  const [percent, threads] = getPercentAndThreads(ns, target, server, player, maxServerMem);

  const batch = new ServerActionBatch(
    ServerActionBatchMode.Hack,
    target,
    [
      ServerActionType.Hack,
      ServerActionType.Weaken,
      ServerActionType.Grow,
      ServerActionType.Weaken,
    ],
    threads,
    -1,
  );
  const chance = ns.formulas.hacking.hackChance(server, player);
  batch.percent = percent;
  batch.enabled = !config.prepOnly;
  if (target.times[ServerActionType.Hack] < Second) {
    // sub second hacks add too much to processing
    batch.score = 0;
    batch.enabled = false;
  } else {
    batch.score =
      (chance * target.maxMoney * percent * 100) /
      (target.times[ServerActionType.Weaken] * batch.memNeeded);
  }

  return batch;
}

function getPercentAndThreads(
  ns: NS,
  serverData: ServerData,
  server: Server,
  player: Player,
  maxServerMem: number,
): [number, Array<number>] {
  let percent: number;
  let threads: Array<number>;

  for (let i = 0; i < HackBatchPercents.length; i++) {
    percent = HackBatchPercents[i];

    const hacks = Math.ceil(percent / ns.formulas.hacking.hackPercent(server, player));
    const hacksWeakens = Math.ceil(hacks / WeakenThreadsPerHackCall);
    const grows = serverData.growThreads[i];
    const growsWeakens = Math.ceil(grows / WeakenThreadsPerGrowCall);

    threads = [hacks, hacksWeakens, grows, growsWeakens];

    if (
      !maxServerMem ||
      (hacks <= Math.floor(maxServerMem / ServerActionTypeToMemMap[ServerActionType.Hack]) &&
        grows <= Math.floor(maxServerMem / ServerActionTypeToMemMap[ServerActionType.Grow]))
    )
      break;
  }

  return [percent, threads];
}
