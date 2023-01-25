import { BatchClusterAssigner } from "$src/servers/clusters/assigner/batchClusterAssigner";
import { ClusterAssigner } from "$src/servers/clusters/assigner/clusterAssigner";
import { Cluster } from "$src/servers/clusters/cluster";
import { ClusterData } from "$src/servers/clusters/data/clusterData";
import { ClusterRunner } from "$src/servers/clusters/runner/clusterRunner";
import type { Servers } from "$src/servers/servers";
import type { Target } from "$src/servers/target";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export function getGenericCluster(ns: NS, logger: Logger, servers: Servers, target: Target) {
  const clusterData = new ClusterData(logger);
  return new Cluster(
    ns,
    logger,
    servers,
    clusterData,
    new ClusterAssigner(logger, clusterData, target, target.hackJob),
    new ClusterRunner(logger, clusterData, target, target.hackJob),
    target,
  );
}

export function getBatchCluster(ns: NS, logger: Logger, servers: Servers, target: Target) {
  const clusterData = new ClusterData(logger);
  return new Cluster(
    ns,
    logger,
    servers,
    clusterData,
    new BatchClusterAssigner(logger, clusterData, target, target.hackJob),
    new ClusterRunner(logger, clusterData, target, target.hackJob),
    target,
  );
}
