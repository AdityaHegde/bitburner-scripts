import type { ClusterReservations } from "$src/servers/clusters/assigner/clusterAssigner";
import type { HackJob } from "$src/servers/hack/hackJob";
import type { Resource } from "$src/servers/resource";
import { ResourceState } from "$src/servers/resource";

export class ClusterGroup {
  public reservations: ClusterReservations = [];
  public remainingThreads: Array<number>;

  public resources: Array<Array<Resource>>;

  private states = new Map<number, ResourceState>();
  private returnedCount = 0;

  public init(hackJob: HackJob) {
    this.remainingThreads = [...hackJob.threads];
    this.resources = new Array<Array<Resource>>(hackJob.operations.length);
  }

  public clear(hackJob: HackJob) {
    this.remainingThreads = [...hackJob.threads];
    this.reservations = [];
  }

  public addResource(resource: Resource, oprnIdx: number) {
    this.states.set(resource.commPortWrapper.port, ResourceState.Started);
    this.resources[oprnIdx].push(resource);
  }

  public reset() {
    this.returnedCount = 0;
    for (const port of this.states.keys()) {
      this.states.set(port, ResourceState.Started);
    }
  }

  public resourceReturned(resource: Resource): boolean {
    const state = this.states.get(resource.commPortWrapper.port);
    if (state !== ResourceState.Started) return false;

    this.states.set(resource.commPortWrapper.port, ResourceState.Returned);
    this.returnedCount++;

    return this.returnedCount === this.states.size;
  }
}
