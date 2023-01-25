import { HackJobSelector } from "$src/runner/hackJobSelector/hackJobSelector";
import type { Cluster } from "$src/servers/clusters/cluster";
import { getBatchCluster, getGenericCluster } from "$src/servers/clusters/factories";
import { HackWeakenGrowWeaken } from "$src/servers/hack/formulaHackJob";
import type { HackJob } from "$src/servers/hack/hackJob";
import { HackJobFactory } from "$src/servers/hack/hackJobFactory";
import { Target, TargetState, TargetType } from "$src/servers/target";

export class BatchHackJobSelector extends HackJobSelector {
  public createClusterForTarget(target: Target, freeCluster: Cluster): Cluster {
    target.fill();
    this.calculateHackTypeSet(target, freeCluster);

    if (target.state === TargetState.Hacking) {
      return getBatchCluster(this.ns, this.logger, this.servers, target);
    }
    return getGenericCluster(this.ns, this.logger, this.servers, target);
  }

  protected calculateHackTypeSet(target: Target, freeCluster: Cluster) {
    if (target.hackJob?.runs === -1 || target.hackJob?.runs > 0) return;
    target.hackJob = undefined;

    let hackJob: HackJob;

    switch (target.type) {
      case TargetType.Money:
        hackJob = this.getHackJobForMoney(target, freeCluster);
        break;

      case TargetType.Sharing:
        hackJob = this.getHackJobForSharePower(target, freeCluster);
        break;
    }

    if (
      hackJob.growIdx >= 0 &&
      (freeCluster.data.sortedResources.length === 0 ||
        hackJob.threads[hackJob.growIdx] >
          freeCluster.data.sortedResources[0].threads[hackJob.growIdx])
    ) {
      // if grows cannot be fit in one server do not run
      target.score = 0;
    } else {
      // use the new score
      target.score = hackJob.getScore(target.resource);
    }
    target.hackJob.setPeriod(target.resource);
  }

  private getHackJobForMoney(target: Target, freeCluster: Cluster) {
    const hackJob = HackWeakenGrowWeaken(
      target.ns,
      target.resource,
      freeCluster.data.sortedResources[0]?.threads,
    );

    if (target.resource.security > target.resource.minSecurity) {
      target.hackJob = HackJobFactory.Weaken(target.ns, target.resource);
      target.state = TargetState.Weakening;
    } else if (target.resource.money < target.resource.maxMoney) {
      target.hackJob = HackJobFactory.GrowWeaken(target.ns, target.resource);
      target.state = TargetState.Growing;
    } else {
      target.hackJob = hackJob;
      target.state = TargetState.Hacking;
    }

    return hackJob;
  }

  private getHackJobForSharePower(target: Target, freeCluster: Cluster) {
    const hackJob = HackJobFactory.SharePower(this.ns, freeCluster.data.threads);
    target.hackJob = hackJob;
    return hackJob;
  }
}
