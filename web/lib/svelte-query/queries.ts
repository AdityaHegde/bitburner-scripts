import { useQuery } from "@sveltestack/svelte-query";
import { fetchWrapper } from "../utils/fetchWrapper";
import type { ServerStats } from "$scripts/metadata/serverStats";

export function useListOfHackMetadata(count = 50) {
  return useQuery<Array<unknown>, unknown, Array<unknown>>(["hackMetadata", count], {
    refetchInterval: 500,
    queryFn: () => fetchWrapper("/hack-metadata?count=" + count, "GET"),
  });
}

export function useListOfServerStats(ids: Array<number>) {
  return useQuery<Array<ServerStats>, unknown, Array<ServerStats>>(["serverStats", ids], {
    refetchInterval: 500,
    queryFn: () => fetchWrapper("/server-stats?ids=" + (ids?.length ? ids.join(",") : ""), "GET"),
  });
}

export function useListOfHackTargetServers(ids: Array<number>) {
  return useQuery<Array<unknown>, unknown, Array<unknown>>(["hackTargetServers", ids], {
    refetchInterval: 500,
    queryFn: () =>
      fetchWrapper("/hack-target-servers?ids=" + (ids?.length ? ids.join(",") : ""), "GET"),
  });
}
