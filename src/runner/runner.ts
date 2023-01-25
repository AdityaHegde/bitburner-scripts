import type { HackJobSelector } from "$src/runner/hackJobSelector/hackJobSelector";
import type { Scheduler } from "$src/runner/scheduler/scheduler";
import type { Cluster } from "$src/servers/clusters/cluster";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import type { HackCoordinator } from "$src/servers/hack/hackCoordinator";
import type { Resource } from "$src/servers/resource";
import type { Servers } from "$src/servers/servers";
import type { Target } from "$src/servers/target";
import { TargetState } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export interface RunnerModule {
  run(): Promise<void>;
}

export class Runner {
  private targets = new Array<Target>();
  private startClusters = new Array<Cluster>();
  private startClusterGroups = new Array<[Cluster, ClusterGroup]>();
  private stopClusters = new Array<Cluster>();
  private updated = false;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly servers: Servers,
    private readonly hackCoordinator: HackCoordinator,
    private readonly hackJobSelector: HackJobSelector,
    private readonly scheduler: Scheduler,
    private readonly modules: Array<RunnerModule>,
  ) {
    servers.on("newTarget", (target) => {
      this.newTarget(target);
    });
    servers.on("newResource", (resource) => {
      this.newResource(resource);
    });
    servers.on("resourceUpdated", (resource) => {
      this.resourceUpdated(resource);
    });

    scheduler.on("clusterAssigned", (cluster) => {
      this.assigned(cluster);
    });
  }

  public async run() {
    this.servers.run();
    for (const module of this.modules) {
      await module.run();
    }
    await this.hackCoordinator.run();

    const updated =
      // override updated if there are clusters starting but there are also some free resources
      (this.startClusterGroups.length > 0 && this.scheduler.freeCluster.data.threads > 0) ||
      // or if new targets were added
      this.targets.length > 0;

    for (const cluster of this.startClusters) {
      await cluster.run();
    }
    this.startClusters = [];

    for (const [cluster, group] of this.startClusterGroups) {
      await cluster.runGroup(group);
    }
    this.startClusterGroups = [];

    for (const cluster of this.stopClusters) {
      await this.scheduler.stopCluster(cluster);
    }
    this.stopClusters = [];

    for (const target of this.targets) {
      this.createClusterForTarget(target);
    }
    this.targets = [];

    if (!this.updated && !updated) return;
    this.updated = false;

    await this.scheduler.runClusters();
    this.scheduler.log();
  }

  protected newTarget(target: Target): void {
    this.targets.push(target);
  }

  protected newResource(resource: Resource): void {
    if (resource.maxMem === 0) return;
    this.scheduler.freeCluster.data.add(resource);
    this.updated = true;
  }

  protected resourceUpdated(resource: Resource): void {
    if (this.scheduler.freeCluster.data.sortedResources.indexOf(resource) >= 0) {
      // if the resource is in free cluster then remove, update and add
      this.scheduler.freeCluster.data.remove(resource);
      resource.updateMemory();
      this.scheduler.freeCluster.data.add(resource);
    } else {
      resource.updateMemory();
      if (!this.hackCoordinator.portMap.has(resource.commPortWrapper.port)) {
        return;
      }
      const [, cluster] = this.hackCoordinator.portMap.get(resource.commPortWrapper.port);
      // stop the cluster to force a re-assign
      this.stopClusters.push(cluster);
    }
  }

  private assigned(cluster: Cluster) {
    this.hackCoordinator.addCluster(cluster);
    cluster.on("started", () => this.startClusters.push(cluster));
    cluster.on("startGroup", (group) => this.startClusterGroups.push([cluster, group]));
    cluster.on("ended", () => this.stopClusters.push(cluster));
    cluster.on("stopped", () => this.consume(cluster));
  }

  private consume(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.scheduler.freeCluster.data.add(resource);
      this.hackCoordinator.removeCluster(cluster);
      resource.release();
    }
    cluster.teardown();

    this.scheduler.stopping.delete(cluster);
    this.targets.push(cluster.target);
  }

  private createClusterForTarget(target: Target): Cluster {
    target.fill();

    const cluster = this.hackJobSelector.createClusterForTarget(target, this.scheduler.freeCluster);
    if (target.state === TargetState.Hacking) {
      this.scheduler.hackQueue.push(cluster);
    } else {
      this.scheduler.prepQueue.push(cluster);
    }

    return cluster;
  }
}
