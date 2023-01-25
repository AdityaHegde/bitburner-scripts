import {
  HackBatchPercents,
  WeakenThreadsPerGrowCall,
  WeakenThreadsPerHackCall,
} from "$src/constants";
import { HackJob } from "$src/servers/hack/hackJob";
import type { HackTypesData } from "$src/servers/hack/hackTypes";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { NS, Player, Server } from "$src/types/gameTypes";

export function HackWeakenGrowWeaken(
  ns: NS,
  resource: Resource,
  threadsOfMax?: HackTypesData,
): HackJob {
  const player = ns.getPlayer();
  const server = ns.getServer(resource.server);
  // set the server to min difficulty for calculations
  server.hackDifficulty = server.minDifficulty;

  if (!resource.growThreads) {
    resource.fillGrowThreads(server, player);
  }

  const { percent, threads } = getPercentAndThreads(ns, resource, server, player, threadsOfMax);

  const hackJob = new HackJob(
    [HackType.Hack, HackType.Weaken, HackType.Grow, HackType.Weaken],
    threads,
    -1,
  );
  const chance = ns.formulas.hacking.hackChance(server, player);
  hackJob.scoreOverride =
    (chance * resource.maxMoney * percent * 100) /
    (resource.times[HackType.Weaken] * hackJob.totalThreads);

  return hackJob;
}

function getPercentAndThreads(
  ns: NS,
  resource: Resource,
  server: Server,
  player: Player,
  threadsOfMax: HackTypesData,
) {
  let percent: number;
  let threads: Array<number>;

  for (let i = 0; i < HackBatchPercents.length; i++) {
    percent = HackBatchPercents[i];

    const hacks = Math.ceil(percent / ns.formulas.hacking.hackPercent(server, player));
    const hacksWeakens = Math.ceil(hacks / WeakenThreadsPerHackCall);
    const grows = resource.growThreads[i];
    const growsWeakens = Math.ceil(grows / WeakenThreadsPerGrowCall);

    threads = [hacks, hacksWeakens, grows, growsWeakens];

    if (
      !threadsOfMax ||
      (hacks <= threadsOfMax[HackType.Hack] && grows <= threadsOfMax[HackType.Grow])
    )
      break;
  }

  return { percent, threads };
}
