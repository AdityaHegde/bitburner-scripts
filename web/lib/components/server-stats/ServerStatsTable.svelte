<script lang="ts">
  import { useListOfServerStats } from "$lib/svelte-query/queries";
  import type { ServerStats } from "$scripts/hack/helpers/hacksMetadata";
  import ServerStatsRow from "$components/server-stats/ServerStatsRow.svelte";

  export let ids: Array<number>;

  $: listOfServerStatsQuery = useListOfServerStats(ids);
  let listOfServerStats: Array<ServerStats>;
  $: listOfServerStats = $listOfServerStatsQuery?.data ?? [];
</script>

<table>
  <thead>
  <tr>
    <th>Server Name</th>
    <th class="w-40 text-center">Security</th>
    <th class="w-40 text-center">Money</th>
    <th class="w-40 text-center">Rates</th>
    <th class="w-80 text-center">Times</th>
    <th class="w-40 text-center">Securities</th>
  </tr>
  </thead>
  <tbody>
  {#each listOfServerStats as serverStats}
    {#if serverStats.maxMoney > 0}
      <ServerStatsRow {serverStats} />
    {/if}
  {/each}
  </tbody>
</table>