import type { ReferenceHackData } from "$src/ports/packets/hackRequestPacket";
import { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import { binaryInsert } from "$src/utils/arrayUtils";
import type { Logger } from "$src/utils/logger/logger";

export class ClusterData {
  public threads = 0;
  public freeCount = 0;
  public sortedResources: Array<Resource> = [];
  public groups: Array<ClusterGroup> = [new ClusterGroup()];
  public runs: number;
  public startedCount = 0;
  public returnedCount = 0;
  public stoppedCount = 0;
  private serverNameMap = new Map<string, Resource>();

  public constructor(private readonly logger: Logger) {}

  public add(resource: Resource, skipMerge = false) {
    this.threads += resource.threads[HackType.Grow];
    if (
      !skipMerge &&
      this.serverNameMap.has(resource.server) &&
      this.serverNameMap.get(resource.server) !== resource
    ) {
      this.serverNameMap.get(resource.server).merge(resource);
    } else {
      this.serverNameMap.set(resource.server, resource);
      binaryInsert(this.sortedResources, resource, (mid, ele) => ele.mem - mid.mem);
    }
  }

  public remove(resource: Resource, prevThreads = resource.threads[HackType.Grow]) {
    const index = this.sortedResources.indexOf(resource);
    if (index === -1) return;
    this.threads -= prevThreads;
    this.serverNameMap.delete(resource.server);
    this.sortedResources.splice(index, 1);
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
