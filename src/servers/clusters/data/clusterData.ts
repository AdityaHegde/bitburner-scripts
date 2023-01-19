import type { ReferenceHackData } from "$src/ports/portPacket";
import { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import { binaryInsert } from "$src/utils/arrayUtils";
import type { Logger } from "$src/utils/logger";

export class ClusterData {
  public threads = 0;
  public freeCount = 0;
  public sortedResources: Array<Resource> = [];
  public groups: Array<ClusterGroup> = [new ClusterGroup()];
  public runs: number;

  private splitResources = new Map<string, Array<Resource>>();

  private startedCount = 0;
  private returnedCount = 0;
  private stoppedCount = 0;

  public constructor(private readonly logger: Logger) {}

  public add(resource: Resource) {
    this.threads += resource.threads[HackType.Grow];
    binaryInsert(this.sortedResources, resource, (mid, ele) => ele.mem - mid.mem);
  }

  public remove(resource: Resource, prevThreads = resource.threads[HackType.Grow]) {
    const index = this.sortedResources.indexOf(resource);
    if (index === -1) return;
    this.threads -= prevThreads;
    this.sortedResources.splice(index, 1);
  }

  public addSplitResourcePairs(res1: Resource, res2: Resource) {
    if (!this.splitResources.has(res1.server)) {
      this.splitResources.set(res1.server, [res1, res2]);
    } else {
      this.splitResources.get(res1.server).push(res2);
    }
  }

  public mergeSplitResources() {
    for (const splitResources of this.splitResources.values()) {
      const prevThreads = splitResources[0].threads[HackType.Weaken];
      for (let i = 1; i < splitResources.length; i++) {
        this.remove(splitResources[i]);
        splitResources[0].merge(splitResources[i]);
      }
      this.remove(splitResources[0], prevThreads);
      this.add(splitResources[0]);
    }
    this.splitResources.clear();
  }

  public reset() {
    this.returnedCount = 0;
    for (const group of this.groups) {
      group.reset();
    }
  }

  public resourceStarted(resource: Resource): boolean {
    this.startedCount++;
    return this.startedCount === this.sortedResources.length;
  }

  public resourceReturned(resource: Resource, ref: ReferenceHackData): boolean {
    if (!this.groups[ref.groupIndex].resourceReturned(resource)) return false;
    this.returnedCount++;
    return true;
  }

  public allReturned() {
    return this.returnedCount === this.groups.length;
  }

  public resourceStopped(resource: Resource): boolean {
    this.stoppedCount++;
    return this.stoppedCount === this.sortedResources.length;
  }
}
