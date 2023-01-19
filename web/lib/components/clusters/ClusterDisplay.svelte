<script lang="ts">
  import type { ClusterLog } from "$src/servers/clusters/cluster";
  import { HackType } from "$src/servers/hack/hackTypes.js";

  export let cluster: ClusterLog;
</script>

<div class="w-full">{HackType[cluster.hackType]} ({cluster.freeCount}/{cluster.threads})</div>