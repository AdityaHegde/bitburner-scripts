import type { CodingContracts } from "$src/coding-contracts/codingContracts";
import { Cluster, ClusterState } from "$src/servers/clusters/cluster";
import { getClusterHeap } from "$src/servers/clusters/clusterHeap";
import type { ClusterGroup } from "$src/servers/clusters/data/clusterGroup";
import { getGenericCluster, getHackCluster } from "$src/servers/clusters/factories";
import type { HackCoordinator } from "$src/servers/hack/hackCoordinator";
import type { PlayerServers } from "$src/servers/playerServers";
import type { Resource } from "$src/servers/resource";
import type { Servers } from "$src/servers/servers";
import type { Target } from "$src/servers/target";
import { TargetState } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import { binaryInsert } from "$src/utils/arrayUtils";
import type { Heap } from "$src/utils/heap";
import type { Logger } from "$src/utils/logger";

export class Runner {
  private readonly freeCluster: Cluster;

  private queue: Heap<Cluster>;
  private running = new Array<Cluster>();
  private stopping: Heap<Cluster>;

  private hacking: Heap<Cluster>;
  private prepping: Heap<Cluster>;

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
    private readonly playerServers: PlayerServers,
    private readonly codingContracts: CodingContracts,
  ) {
    this.freeCluster = new Cluster(ns, logger, this.servers);
    this.queue = getClusterHeap((a, b) => a.target.score - b.target.score);
    this.stopping = getClusterHeap((a, b) => b.target.hackJob.end - a.target.hackJob.end);

    servers.on("newTarget", (target) => {
      this.newTarget(target);
    });
    servers.on("newResource", (resource) => {
      this.newResource(resource);
    });
    servers.on("resourceUpdated", (resource) => {
      this.resourceUpdated(resource);
    });
  }

  public async run() {
    this.servers.run();
    this.playerServers.run();
    await this.hackCoordinator.run();
    this.codingContracts.run();

    const updated =
      // override updated if there are clusters starting but there are also some free resources
      (this.startClusterGroups.length > 0 && this.freeCluster.data.threads > 0) ||
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
      await this.stopCluster(cluster);
    }
    this.stopClusters = [];

    for (const target of this.targets) {
      this.createClusterForTarget(target);
    }
    this.targets = [];

    if (!this.updated && !updated) return;
    this.updated = false;

    this.logger.log("Runner", {
      queue: this.queue
        .getArray()
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score})`)
        .join(","),
      running: this.running
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score})`)
        .join(","),
      stopping: this.stopping
        .getArray()
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score})`)
        .join(","),
      threads: this.freeCluster.data.threads,
      freeServers: this.freeCluster.data.sortedResources.length,
    });

    return this.runClusters();
  }

  protected newTarget(target: Target): void {
    this.targets.push(target);
  }

  protected newResource(resource: Resource): void {
    this.freeCluster.data.add(resource);
    this.updated = true;
  }

  protected resourceUpdated(resource: Resource): void {
    if (this.freeCluster.data.sortedResources.indexOf(resource) >= 0) {
      this.freeCluster.data.remove(resource);
      resource.updateMemory();
      this.freeCluster.data.add(resource);
    } else {
      if (!this.hackCoordinator.portMap.has(resource.commPortWrapper.port)) {
        resource.updateMemory();
        this.freeCluster.data.add(resource);
        return;
      }
      const [, cluster] = this.hackCoordinator.portMap.get(resource.commPortWrapper.port);
      // stop the cluster to force a re-assign
      this.stopClusters.push(cluster);
    }
  }

  private async runClusters() {
    if (this.queue.empty()) return;

    // stop running clusters that have a lower score that the one at the top of queue
    while (
      this.running.length > 0 &&
      this.queue.peek().target.score > this.running[0].target.score
    ) {
      // TODO: take remaining run time into consideration
      await this.stopCluster(this.running[0]);
    }

    if (this.freeCluster.data.threads > 0) {
      // if there are free resources and any of the running clusters can be expanded then stop it and restart.
      for (let i = this.running.length - 1; i >= 0; i--) {
        const hackJob = this.running[i].target.hackJob;
        if (hackJob.ratio > 1 && (hackJob.runs === -1 || hackJob.runs > 2)) {
          await this.stopCluster(this.running[i]);
          break;
        }
      }
    }

    if (!this.stopping.empty()) return;

    while (!this.queue.empty() && this.freeCluster.data.threads > 0) {
      const cluster = this.queue.peek();
      // if there is a stopping cluster and this cannot run once before that, do not start
      // if (
      //   !this.stopping.empty() &&
      //   !cluster.target.hackJob.canRun(this.stopping.peek().target.hackJob.end)
      // ) {
      //   break;
      // }
      if (!cluster.reserve(this.freeCluster)) {
        cluster.clear();
        // TODO: fill in free cluster servers
        break;
      }

      this.queue.pop();
      binaryInsert(this.running, cluster, (mid, ele) => mid.target.score - ele.target.score);
      cluster.assign();
      this.assigned(cluster);
    }
  }

  private assigned(cluster: Cluster) {
    this.hackCoordinator.addCluster(cluster);
    cluster.on("started", () => this.startClusters.push(cluster));
    cluster.on("startGroup", (group) => this.startClusterGroups.push([cluster, group]));
    cluster.on("ended", () => this.stopClusters.push(cluster));
    cluster.on("stopped", () => this.consume(cluster));
  }

  private async stopCluster(cluster: Cluster) {
    if (cluster.state === ClusterState.Stopping || cluster.state === ClusterState.Stopped) return;
    await cluster.stopServers();
    this.running.splice(this.running.indexOf(cluster), 1);
    this.stopping.push(cluster);
  }

  private consume(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.freeCluster.data.add(resource);
      this.hackCoordinator.removeCluster(cluster);
    }
    cluster.teardown();

    this.stopping.delete(cluster);
    this.targets.push(cluster.target);
  }

  private createClusterForTarget(target: Target): Cluster {
    target.fill();
    target.calculateHackTypeSet();

    let cluster: Cluster;

    if (target.state === TargetState.Hacking) {
      cluster = getHackCluster(this.ns, this.logger, this.servers, target);
    } else {
      cluster = getGenericCluster(this.ns, this.logger, this.servers, target);
    }
    this.queue.push(cluster);

    return cluster;
  }
}
