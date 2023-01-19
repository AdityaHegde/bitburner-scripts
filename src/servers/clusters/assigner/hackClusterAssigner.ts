import { HackGroupSize } from "$src/constants";
import { ClusterAssigner } from "$src/servers/clusters/assigner/clusterAssigner";
import type { ClusterData } from "$src/servers/clusters/data/clusterData";
import { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";

export class HackClusterAssigner extends ClusterAssigner {
  public reserveServers(clusterData: ClusterData): boolean {
    let group = clusterData.groups[0];
    let leadGroup = group;
    let groupIdx = 0;

    while (groupIdx < clusterData.groups.length) {
      if (groupIdx % HackGroupSize === 0) leadGroup = group;
      this.reserveServersForGroup(group, leadGroup, clusterData);

      if (group.remainingThreads.every((threads) => threads > 0)) {
        group = new ClusterGroup();
        clusterData.groups.push(group);
      }
      groupIdx++;
    }

    return this.clusterData.groups[0].remainingThreads.every((threads) => threads <= 0);
  }

  public assign() {
    const resourceShards = new Map<Resource, ClusterData>();

    for (const group of this.clusterData.groups) {
      if (group.remainingThreads.some((threads) => threads > 0)) continue;

      for (let i = 0; i < this.hackJob.operations.length; i++) {
        this.assignReservations(group, resourceShards);
      }
    }

    for (const [resource, clusterData] of resourceShards) {
      // any resource that was split and not fully consumed add it to this cluster.
      // TODO: manage shards better
      clusterData.remove(resource);
    }
    this.clusterData.runs = this.hackJob.runs;

    this.clear();
  }

  private reserveServersForGroup(
    group: ClusterGroup,
    leadGroup: ClusterGroup,
    clusterData: ClusterData,
    index = 0,
  ) {
    let resources: Array<[Resource, number]>;

    if (group === leadGroup) {
      [group.remainingThreads[this.hackJob.hackIdx], resources, index] = this.reserveServersForType(
        clusterData,
        group.remainingThreads[this.hackJob.hackIdx],
        HackType.Hack,
        index,
      );
      if (resources.length > 0) {
        group.reservations.push([clusterData, this.hackJob.hackIdx, resources]);
      }
    } else {
      group.remainingThreads[this.hackJob.hackIdx] =
        leadGroup.remainingThreads[this.hackJob.hackIdx];
    }

    for (let oprnIndex = 0; oprnIndex < this.hackJob.operations.length; oprnIndex++) {
      if (oprnIndex === this.hackJob.hackIdx) continue;

      [group.remainingThreads[oprnIndex], resources, index] = this.reserveServersForType(
        clusterData,
        group.remainingThreads[oprnIndex],
        this.hackJob.operations[oprnIndex],
        index,
      );
      if (resources.length > 0) {
        group.reservations.push([clusterData, oprnIndex, resources]);
      }
    }

    return index;
  }
}
