<script lang="ts">
  import { useListOfHackMetadata } from "../svelte-query/queries";
  import type { HackMetadata } from "$scripts/hack/helpers/hacksMetadata";
  import ServerStatsList from "$components/server-stats/ServerStatsTable.svelte";

  const hackMetadataQuery = useListOfHackMetadata(1);
  let hackMetadata: Array<HackMetadata>;
  $: hackMetadata = $hackMetadataQuery.data;
  $: ids = hackMetadata?.map((meta: any) => meta.id) ?? [];
</script>

<ServerStatsList {ids} />
