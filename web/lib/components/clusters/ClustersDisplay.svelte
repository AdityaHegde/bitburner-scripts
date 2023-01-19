<script lang="ts">
  import Cluster from "$components/clusters/ClusterDisplay.svelte";
  import { gameStore } from "$lib/stores/gameStore.js";
</script>

<div class="flex flex-row w-full">
  {#each $gameStore.clusters as cluster (cluster.hackType)}
    <div class="basis-1/3">
      <Cluster {cluster} />
    </div>
  {/each}
</div>