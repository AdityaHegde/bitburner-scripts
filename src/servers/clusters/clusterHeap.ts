import type { Cluster } from "$src/servers/clusters/cluster";
import { Heap } from "$src/utils/heap";

export function getClusterHeap(compareFunction: (a: Cluster, b: Cluster) => number): Heap<Cluster> {
  return new Heap<Cluster>(compareFunction, (a) => a.target.resource.server);
}
