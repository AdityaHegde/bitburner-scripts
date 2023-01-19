import type { ClusterData } from "$src/servers/clusters/data/clusterData";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import type { HackJob } from "$src/servers/hack/hackJob";
import type { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { Target } from "$src/servers/target";
import { TargetState } from "$src/servers/target";
import type { Logger } from "$src/utils/logger";

export type ClusterReservation = [
  clusterData: ClusterData,
  index: number,
  resources: Array<[Resource, number]>,
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
    let index = 0;
    let resources: Array<[Resource, number]>;
    const ratio = this.hackJob.compressForMem(clusterData.threads * this.hackJob.maxMem);
    this.hackJob.ratio = ratio;
    const group = this.clusterData.groups[0];
    group.remainingThreads = [...this.hackJob.threads];

    this.logger.log("ReserveServers", {
      target: this.target.resource.server,
      state: TargetState[this.target.state],
      availableMem: clusterData.threads * this.hackJob.maxMem,
      maxMem: this.hackJob.maxMem,
      memNeeded: this.hackJob.memNeeded,
      threads: this.hackJob.threads,
      runs: this.clusterData.runs,
      ratio,
    });

    for (let i = 0; i < this.hackJob.operations.length; i++) {
      [group.remainingThreads[i], resources, index] = this.reserveServersForType(
        clusterData,
        group.remainingThreads[i],
        this.hackJob.operations[i],
        index,
      );

      if (resources.length > 0) {
        group.reservations.push([clusterData, i, resources]);
      }
    }
    return group.remainingThreads.every((threads) => threads <= 0);
  }

  /**
   * Assigns the reserved resources.
   */
  public assign() {
    const resourceShards = new Map<Resource, ClusterData>();
    this.assignReservations(this.clusterData.groups[0], resourceShards);
    // Any remaining resources from resourceShards is not added anywhere.
    // This is to prevent infinite sharding.
    // TODO: manage shards better

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
  ): [number, Array<[Resource, number]>, number] {
    const resources = new Array<[Resource, number]>();

    let i = index;
    for (; i < clusterData.sortedResources.length && threads > 0; i++) {
      const resource = clusterData.sortedResources[i];
      if (!resource.isFree()) continue;
      const assignedThreads = Math.min(
        threads,
        resource.threads[hackType] - resource.reservedThreads,
      );
      if (assignedThreads <= 0) continue;
      threads -= assignedThreads;
      resources.push([resource, assignedThreads]);
      resource.reserve(assignedThreads);
    }

    return [threads, resources, Math.max(i - 1, 0)];
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
          this.clusterData.addSplitResourcePairs(resource, addedResource);
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

  protected freeUpReservations(reservations: ClusterReservations) {
    for (const [, , resources] of reservations) {
      for (const [resource, threads] of resources) {
        resource.freeUp(threads);
      }
    }
  }

  protected addToCluster(addedResource: Resource, hackType: HackType) {
    addedResource.claim(hackType);
    addedResource.startScripts();
    this.clusterData.add(addedResource);
  }
}
