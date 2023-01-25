import type { Cluster } from "$src/servers/clusters/cluster";
import { getGenericCluster } from "$src/servers/clusters/factories";
import { HackJobFactory } from "$src/servers/hack/hackJobFactory";
import type { Servers } from "$src/servers/servers";
import { Target, TargetState } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export class HackJobSelector {
  public constructor(
    protected readonly ns: NS,
    protected readonly logger: Logger,
    protected readonly servers: Servers,
  ) {}

  public createClusterForTarget(target: Target, freeCluster: Cluster): Cluster {
    target.fill();
    this.calculateHackTypeSet(target, freeCluster);

    return getGenericCluster(this.ns, this.logger, this.servers, target);
  }

  protected calculateHackTypeSet(target: Target, freeCluster: Cluster) {
    if (target.hackJob?.runs === -1 || target.hackJob?.runs > 0) return;
    target.hackJob = undefined;

    if (target.resource.security > target.resource.minSecurity) {
      target.hackJob = HackJobFactory.Weaken(target.ns, target.resource);
      target.state = TargetState.Weakening;
    } else if (target.resource.money < target.resource.maxMoney) {
      target.hackJob = HackJobFactory.GrowWeaken(target.ns, target.resource);
      target.state = TargetState.Growing;
    } else {
      target.hackJob = HackJobFactory.EarlyHackGrowWeaken(target.ns, target.resource);
      target.state = TargetState.Hacking;
    }
    target.hackJob.setPeriod(target.resource);
  }
}
