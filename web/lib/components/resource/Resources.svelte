<script lang="ts">
  import { gameStore } from "$lib/stores/gameStore.js";
  import type { ResourceLog } from "$src/servers/resource";

  let resources: Array<ResourceLog> = [];
  $: if ($gameStore.resources) {
    resources = [];
    for (const resource in $gameStore.resources) {
      resources.push($gameStore.resources[resource]);
    }
  }
</script>

<div class="flex flex-wrap">
  {#each resources as resource}
    <div class="p-5">
      <div class="h-5 overflow-clip">{resource.server}</div>
      <div class="h-5 overflow-clip">A: {resource.assigned}</div>
      <div class="h-5 overflow-clip">R: {resource.running}</div>
      <div class="h-5 overflow-clip">W: {resource.waiting}</div>
    </div>
  {/each}
</div>
