import { HackGroupSize } from "$src/constants";
import { ClusterAssigner } from "$src/servers/clusters/assigner/clusterAssigner";
import type { ClusterData } from "$src/servers/clusters/data/clusterData";
import { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import { HackType, HackTypeToMemMap } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";

export class BatchClusterAssigner extends ClusterAssigner {
  /**
   * Reserves resources from given clusterData
   */
  public reserveServers(clusterData: ClusterData): boolean {
    this.hackJob.ratio = 1;

    let assigned = false;
    let group = this.clusterData.groups[0];
    let count = 0;

    this.log(clusterData, 1);

    // TODO: overlap hacks from 4 groups into a single process
    while (count < HackGroupSize && this.assignGroup(clusterData, group)) {
      if (assigned) {
        // the 1st group is already in clusterData,
        // so start pushing only from 2nd successful assign
        this.clusterData.groups.push(group);
      }
      assigned = true;
      group = new ClusterGroup();
      count++;
    }

    this.freeUpReservations(group.reservations);
    group.clear(this.hackJob);

    return assigned;
  }

  private assignGroup(clusterData: ClusterData, group: ClusterGroup) {
    group.remainingThreads = [...this.hackJob.threads];

    let index = this.singleProcessAssign(clusterData, group, this.hackJob.hackIdx);
    if (index === -1) return false;
    index = this.singleProcessAssign(clusterData, group, this.hackJob.growIdx, index);
    if (index === -1) return false;

    const assignedResources = group.reservations.map(([, , resources]) => resources[0][0]);
    index = clusterData.sortedResources.length - 1;

    for (let oprnIdx = 0; oprnIdx < this.hackJob.operations.length; oprnIdx++) {
      if (this.hackJob.operations[oprnIdx] !== HackType.Weaken) continue;

      for (const assignedResource of assignedResources) {
        const assignedThreads = this.reserveResource(
          assignedResource,
          HackType.Weaken,
          group.remainingThreads[oprnIdx],
        );
        if (assignedThreads < 0) continue;

        group.remainingThreads[oprnIdx] -= assignedThreads;
        group.reservations.push([
          clusterData,
          oprnIdx,
          [[assignedResource, assignedThreads, HackType.Weaken]],
        ]);

        if (group.remainingThreads[oprnIdx] <= 0) break;
      }
      if (group.remainingThreads[oprnIdx] <= 0) continue;

      let resources: Array<[Resource, number, HackType]>;
      [group.remainingThreads[oprnIdx], resources, index] = this.reserveServersForType(
        clusterData,
        group.remainingThreads[oprnIdx],
        HackType.Weaken,
        index,
        -1,
      );

      if (resources.length > 0) {
        group.reservations.push([clusterData, oprnIdx, resources]);
      }
    }

    return group.remainingThreads.every((threads) => threads <= 0);
  }

  /**
   * search through the resource that can fit an entire process of the action
   */
  private singleProcessAssign(
    clusterData: ClusterData,
    group: ClusterGroup,
    oprnIdx: number,
    startIndex = 0,
  ): number {
    const hackType = this.hackJob.operations[oprnIdx];
    let i = startIndex;

    // TODO: perf: loop through only free resources
    for (
      ;
      i >= 0 && i < clusterData.sortedResources.length && group.remainingThreads[oprnIdx] > 0;
      i++
    ) {
      const resource = clusterData.sortedResources[i];
      if (
        !resource.isFree() ||
        Math.floor((resource.mem - resource.reservedMem) / HackTypeToMemMap[hackType]) <
          group.remainingThreads[oprnIdx]
      )
        continue;

      resource.reserve(group.remainingThreads[oprnIdx], hackType);
      group.reservations.push([
        clusterData,
        oprnIdx,
        [[resource, group.remainingThreads[oprnIdx], hackType]],
      ]);
      group.remainingThreads[oprnIdx] = 0;
      return i;
    }

    return -1;
  }
}
