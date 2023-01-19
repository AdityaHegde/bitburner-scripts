import {
  HackGroupSize,
  HackPercent,
  ServerWeakenAmount,
  WeakenThreadsPerGrowCall,
  WeakenThreadsPerHackCall,
} from "$src/constants";
import { HackJob } from "$src/servers/hack/hackJob";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { NS } from "$src/types/gameTypes";

export class HackJobFactory {
  public static Weaken(ns: NS, resource: Resource): HackJob {
    const calls = Math.ceil((resource.security - resource.minSecurity) / ServerWeakenAmount);
    return new HackJob([HackType.Weaken], [calls], 1);
  }

  public static GrowWeaken(ns: NS, resource: Resource): HackJob {
    const grows = Math.ceil(ns.growthAnalyze(resource.server, resource.maxMoney / resource.money));
    const weakens = Math.ceil(grows / WeakenThreadsPerGrowCall);
    return new HackJob([HackType.Grow, HackType.Weaken], [grows, weakens], 1);
  }

  public static HackGrowWeaken(ns: NS, resource: Resource): HackJob {
    const hacks = Math.ceil((1 - HackPercent) / resource.rate);
    const grows = Math.ceil(
      ns.growthAnalyze(
        resource.server,
        Math.max(1, 1 / (1 - hacks * resource.rate)),
        resource.cores,
      ),
    );
    const weakens = Math.ceil(grows / WeakenThreadsPerGrowCall + hacks / WeakenThreadsPerHackCall);
    return new HackJob(
      [HackType.Hack, HackType.Grow, HackType.Weaken],
      [hacks, grows, weakens],
      -1,
    );
  }

  public static EarlyHackGrowWeaken(
    ns: NS,
    resource: Resource,
    hacks = Math.ceil((1 - HackPercent) / resource.rate),
  ): HackJob {
    const hacksPerRun = Math.floor(hacks / HackGroupSize);
    hacks = hacksPerRun * HackGroupSize;
    const grows = Math.ceil(
      ns.growthAnalyze(
        resource.server,
        Math.max(1, 1 / (1 - hacks * resource.rate)),
        resource.cores,
      ),
    );
    const weakens = Math.ceil(grows / WeakenThreadsPerGrowCall + hacks / WeakenThreadsPerHackCall);
    return new HackJob(
      [HackType.Hack, HackType.Grow, HackType.Weaken],
      [hacksPerRun, grows, weakens],
      -1,
      [HackGroupSize, 1, 1],
    );
  }
}
