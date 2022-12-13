import { useQuery } from "@sveltestack/svelte-query";
import type {
  HackMetadata,
  HackTargetServer,
  ServerStats,
} from "$scripts/hack/helpers/hacksMetadata";
import { fetchWrapper } from "../utils/fetchWrapper";

export function useListOfHackMetadata(count = 50) {
  return useQuery<Array<HackMetadata>, unknown, Array<HackMetadata>>(["hackMetadata", count], {
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
  return useQuery<Array<HackTargetServer>, unknown, Array<HackTargetServer>>(
    ["hackTargetServers", ids],
    {
      refetchInterval: 500,
      queryFn: () =>
        fetchWrapper("/hack-target-servers?ids=" + (ids?.length ? ids.join(",") : ""), "GET"),
    },
  );
}
