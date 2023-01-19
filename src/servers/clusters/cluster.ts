import type { ReferenceHackData } from "$src/ports/portPacket";
import type { ClusterAssigner } from "$src/servers/clusters/assigner/clusterAssigner";
import { ClusterData } from "$src/servers/clusters/data/clusterData";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import type { ClusterRunner } from "$src/servers/clusters/runner/clusterRunner";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { Servers } from "$src/servers/servers";
import type { Target } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { Logger } from "$src/utils/logger";

export const ClusterLogMessage = "Cluster";
export type ClusterLog = {
  target: string;
  threads: number;
  freeCount: number;
  sortedServers: Array<string>;
};

export enum ClusterState {
  New,
  Reserving,
  Assigning,
  Running,
  Stopping,
  Stopped,
}

export type ClusterEvents = {
  started: () => void;
  startGroup: (group: ClusterGroup) => void;
  ended: () => void;
  stopped: () => void;
};

export class Cluster extends EventEmitter<ClusterEvents> {
  public state = ClusterState.New;

  // reserve => assign =true> serverStarted => start =>
  //     (serverReturned) | (stopServers => serverStopped)
  // reserve => assign =false> clear
  public constructor(
    protected readonly ns: NS,
    protected readonly logger: Logger,
    protected readonly servers: Servers,
    public readonly data = new ClusterData(logger),
    public readonly assigner: ClusterAssigner = undefined,
    public readonly runner: ClusterRunner = undefined,
    public readonly target: Target = undefined,
  ) {
    super();
  }

  public reserve(cluster: Cluster): boolean {
    this.state = ClusterState.Reserving;
    return this.assigner.reserveServers(cluster.data);
  }

  public assign() {
    this.state = ClusterState.Assigning;
    this.assigner.assign();
  }

  public clear() {
    this.state = ClusterState.New;
    this.assigner.clear(true);
    // this.logger.log("Clearing", {
    //   target: this.target.resource.server,
    // });
  }

  public async run() {
    this.state = ClusterState.Running;
    this.logger.log("ClusterRunning", {
      target: this.target.resource.server,
      groups: this.data.groups
        .map((group) =>
          group.resources
            .map(
              (resources, index) =>
                `${HackType[this.target.hackJob.operations[index]]}:${resources
                  .map((res) => res.server)
                  .join(",")}`,
            )
            .join("::"),
        )
        .join(" == "),
    });
    return this.runner.runCluster();
  }

  public async runGroup(group: ClusterGroup) {
    // this.logger.log("ClusterGroupRunning", {
    //   target: this.target.resource.server,
    //   rate: this.target.resource.rate,
    // });
    return this.runner.runClusterGroup(group);
  }

  public serverStarted(resource: Resource) {
    if (!this.data.resourceStarted(resource)) return;
    this.logger.log("ClusterStarted", {
      target: this.target.resource.server,
      count: this.target.hackJob.runs,
    });
    this.emit("started");
  }

  public serverReturned(resource: Resource, ref: ReferenceHackData) {
    if (!this.data.resourceReturned(resource, ref)) return;
    // this.logger.log("ClusterGroupReturned", {
    //   target: this.target.resource.server,
    // });
    this.target.resource.fillEphemeral();

    if (this.data.runs !== 1 && this.state !== ClusterState.Stopping) {
      // if not stopping or not at the final run send startGroup
      this.emit("startGroup", this.data.groups[ref.groupIndex]);
    }
    if (!this.data.allReturned()) {
      return;
    }

    this.data.reset();
    if (this.data.runs > 0) this.data.runs--;
    if (this.data.runs === 0) this.emit("ended");
  }

  public async stopServers() {
    this.state = ClusterState.Stopping;
    for (const resource of this.data.sortedResources) {
      await resource.stopScripts();
    }
    this.logger.log("Stopping", {
      target: this.target.resource.server,
    });
  }

  public serverStopped(resource: Resource) {
    if (!this.data.resourceStopped(resource)) return;
    this.logger.info("ClusterStopped", {
      target: this.target.resource.server,
    });

    // merge all split resources that were split to accommodate partial threads
    this.data.mergeSplitResources();
    this.state = ClusterState.Stopped;
    this.emit("stopped");
  }

  public teardown() {
    for (const resource of this.data.sortedResources) {
      resource.release();
    }
    this.data.sortedResources = [];
    this.data.threads = 0;
    this.clearListeners();
    this.target.hackJob.runs = this.data.runs;
  }

  public log() {
    this.logger.info<ClusterLog>(ClusterLogMessage, {
      target: this.target.resource.server,
      threads: this.data.threads,
      freeCount: this.data.freeCount,
      sortedServers: this.data.sortedResources.map((res) => res.server),
    });
  }
}
