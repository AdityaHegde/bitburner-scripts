import { Cluster, ClusterState } from "$src/servers/clusters/cluster";
import { getClusterHeap } from "$src/servers/clusters/clusterHeap";
import type { Servers } from "$src/servers/servers";
import type { NS } from "$src/types/gameTypes";
import { binaryInsert } from "$src/utils/arrayUtils";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { Heap } from "$src/utils/heap";
import type { Logger } from "$src/utils/logger/logger";

export type SchedulerEvents = {
  clusterAssigned: (cluster: Cluster) => void;
};

export class Scheduler extends EventEmitter<SchedulerEvents> {
  public readonly freeCluster: Cluster;

  public readonly prepQueue: Heap<Cluster>;
  public readonly hackQueue: Heap<Cluster>;

  public readonly running = new Array<Cluster>();
  public readonly stopping: Heap<Cluster>;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly servers: Servers,
  ) {
    super();
    this.freeCluster = new Cluster(ns, logger, this.servers);
    this.prepQueue = getClusterHeap((a, b) => a.target.score - b.target.score);
    this.hackQueue = getClusterHeap((a, b) => a.target.score - b.target.score);
    this.stopping = getClusterHeap((a, b) => a.target.score - b.target.score);
  }

  public async runClusters() {
    if (this.hackQueue.empty() && this.prepQueue.empty()) return;

    // stop running clusters that have a lower score that the one at the top of the hack queue
    if (!this.hackQueue.empty()) {
      while (
        this.running.length > 0 &&
        this.hackQueue.peek().target.score > this.running[0].target.score &&
        this.hackQueue.peek().target.hackJob.totalThreads > this.freeCluster.data.threads
      ) {
        // TODO: take remaining run time into consideration
        await this.stopCluster(this.running[0]);
      }
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

    this.unwindQueue(this.hackQueue);
    this.unwindQueue(this.prepQueue);
  }

  public async stopCluster(cluster: Cluster) {
    if (cluster.state === ClusterState.Stopping || cluster.state === ClusterState.Stopped) return;
    await cluster.stopServers();
    this.running.splice(this.running.indexOf(cluster), 1);
    this.stopping.push(cluster);
  }

  public log() {
    this.logger.log("RunnerQueue", {
      prepQueue: this.prepQueue
        .getArray()
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score.toFixed(2)})`)
        .join(","),
      hackQueue: this.hackQueue
        .getArray()
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score.toFixed(2)})`)
        .join(","),
      threads: this.freeCluster.data.threads,
      freeServers: this.freeCluster.data.sortedResources.length,
    });
    this.logger.log("RunnerRunning", {
      running: this.running
        .map(
          (cluster) =>
            `${cluster.target.resource.server}(${cluster.target.score.toFixed(2)})-${
              cluster.data.startedCount
            }/${cluster.data.returnedCount}/${cluster.data.stoppedCount}/${
              cluster.data.sortedResources.length
            }`,
        )
        .join(" , "),
    });
    this.logger.log("RunnerStopping", {
      stopping: this.stopping
        .getArray()
        .map((cluster) => `${cluster.target.resource.server}(${cluster.target.score.toFixed(2)})`)
        .join(","),
    });
  }

  protected unwindQueue(queue: Heap<Cluster>) {
    while (!queue.empty() && this.freeCluster.data.threads > 0) {
      const cluster = queue.peek();
      // if there is a stopping cluster and this cannot run once before that, do not start
      if (
        !this.stopping.empty() &&
        !cluster.target.hackJob.canRun(this.stopping.peek().target.hackJob.end) &&
        cluster.target.hackJob.totalThreads > this.freeCluster.data.threads
      ) {
        break;
      }
      if (!this.assign(cluster)) {
        break;
      }
    }
  }

  protected assign(cluster: Cluster): boolean {
    if (!cluster.reserve(this.freeCluster)) {
      cluster.clear();
      // TODO: fill in free cluster servers
      return false;
    }

    this.hackQueue.delete(cluster);
    this.prepQueue.delete(cluster);
    binaryInsert(this.running, cluster, (mid, ele) => mid.target.score - ele.target.score);
    cluster.assign();
    this.emit("clusterAssigned", cluster);
    return true;
  }
}
