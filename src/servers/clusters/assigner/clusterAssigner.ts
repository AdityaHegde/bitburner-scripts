import type { ClusterData } from "$src/servers/clusters/data/clusterData";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import type { HackJob } from "$src/servers/hack/hackJob";
import { HackType, HackTypeToMemMap } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { Target } from "$src/servers/target";
import { TargetState } from "$src/servers/target";
import type { Logger } from "$src/utils/logger/logger";

export type ClusterReservation = [
  clusterData: ClusterData,
  index: number,
  resources: Array<[Resource, number, HackType]>,
];
export type ClusterReservations = Array<ClusterReservation>;

export class ClusterAssigner {
  public constructor(
    protected readonly logger: Logger,
    protected readonly clusterData: ClusterData,
    protected readonly target: Target,
    protected readonly hackJob: HackJob,
  ) {
    this.clusterData.groups[0].init(hackJob);
  }

  /**
   * Reserves resources from given clusterData
   */
  public reserveServers(clusterData: ClusterData): boolean {
    let resources: Array<[Resource, number, HackType]>;
    const ratio = this.hackJob.compressForMem(
      clusterData.threads * HackTypeToMemMap[HackType.Grow],
    );
    this.hackJob.ratio = ratio;
    const group = this.clusterData.groups[0];
    group.remainingThreads = [...this.hackJob.threads];

    this.log(clusterData, ratio);

    // this is used to squeeze in weaken into currently used servers
    let firstReturnIndex = -1;

    for (let i = 0; i < this.hackJob.operations.length; i++) {
      let index = firstReturnIndex === -1 ? 0 : firstReturnIndex;
      [group.remainingThreads[i], resources, index] = this.reserveServersForType(
        clusterData,
        group.remainingThreads[i],
        this.hackJob.operations[i],
        index,
      );

      if (firstReturnIndex === -1) {
        firstReturnIndex = index;
      }

      if (resources.length > 0) {
        group.reservations.push([clusterData, i, resources]);
      }
    }

    return (
      group.remainingThreads.every((threads) => threads <= 0) ||
      (this.hackJob.operations[0] === HackType.SharePower && group.reservations.length > 0)
    );
  }

  /**
   * Assigns the reserved resources.
   */
  public assign() {
    const resourceShards = new Map<Resource, ClusterData>();
    for (const group of this.clusterData.groups) {
      if (
        group.remainingThreads.some((threads) => threads > 0) &&
        group.reservations.length > 0 &&
        this.hackJob.operations[0] !== HackType.SharePower
      )
        continue;

      this.assignReservations(group, resourceShards);
    }

    for (const [resource, clusterData] of resourceShards) {
      resource.release();
      clusterData.add(resource);
    }
    this.clusterData.runs = this.hackJob.runs;

    this.clear();
  }

  public clear(freeUp = false) {
    for (const group of this.clusterData.groups) {
      if (freeUp) {
        this.freeUpReservations(group.reservations);
      }
      group.clear(this.hackJob);
    }
    if (freeUp) {
      this.clusterData.groups = this.clusterData.groups.slice(0, 1);
    }
  }

  /**
   * Reserves resources for a given hack type
   */
  protected reserveServersForType(
    clusterData: ClusterData,
    threads: number,
    hackType: HackType,
    index = 0,
    dir = 1,
  ): [number, Array<[Resource, number, HackType]>, number] {
    const resources = new Array<[Resource, number, HackType]>();

    let i = index;
    for (; i >= 0 && i < clusterData.sortedResources.length && threads > 0; i += dir) {
      const resource = clusterData.sortedResources[i];
      if (!resource.isFree()) continue;

      const assignedThreads = this.reserveResource(resource, hackType, threads);
      if (assignedThreads <= 0) continue;

      threads -= assignedThreads;
      resources.push([resource, assignedThreads, hackType]);
    }

    return [threads, resources, Math.max(i - dir, 0)];
  }

  protected assignReservations(group: ClusterGroup, resourceShards: Map<Resource, ClusterData>) {
    group.resources = new Array<Array<Resource>>(this.hackJob.operations.length)
      .fill(undefined)
      .map(() => []);

    for (const [cluster, oprnIdx, resources] of group.reservations) {
      const hackType = this.hackJob.operations[oprnIdx];

      for (const [resource, threads] of resources) {
        let addedResource: Resource;
        cluster.remove(resource);

        if (threads !== resource.threads[hackType]) {
          addedResource = resource.split(threads, hackType);
          // add the original resource to be updated in cluster
          resourceShards.set(resource, cluster);
        } else {
          addedResource = resource;
          // all the resource was consumed. remove from updated if present
          if (resourceShards.has(resource)) resourceShards.delete(resource);
        }

        this.addToCluster(addedResource, hackType);
        group.addResource(addedResource, oprnIdx);
      }
    }
  }

  protected reserveResource(resource: Resource, hackType: HackType, threads: number): number {
    const assignedThreads = Math.min(
      threads,
      Math.floor((resource.mem - resource.reservedMem) / HackTypeToMemMap[hackType]),
    );
    if (assignedThreads <= 0) return -1;
    resource.reserve(assignedThreads, hackType);
    return assignedThreads;
  }

  protected freeUpReservations(reservations: ClusterReservations) {
    for (const [, , resources] of reservations) {
      for (const [resource, threads, hackType] of resources) {
        resource.freeUp(threads, hackType);
      }
    }
  }

  protected addToCluster(addedResource: Resource, hackType: HackType) {
    addedResource.claim(hackType);
    if (addedResource.startScripts() === 0) {
      this.logger.error("FailedToStart", {
        resource: addedResource.server,
        port: addedResource.commPortWrapper.port,
        hackType: HackType[hackType],
        threads: addedResource.threads[hackType],
      });
    }
    // TODO: deal with split resource in assigned cluster
    this.clusterData.add(addedResource, true);
  }

  protected log(clusterData: ClusterData, ratio: number) {
    this.logger.log("ReserveServers", {
      target: this.target.resource.server,
      state: TargetState[this.target.state],
      availableMem: clusterData.threads * HackTypeToMemMap[HackType.Grow],
      memNeeded: this.hackJob.memNeeded,
      threads: this.hackJob.threads,
      runs: this.hackJob.runs,
      percent: this.hackJob.percent,
      ratio,
    });
  }
}
