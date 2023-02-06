<script lang="ts">
  import type { TargetLog } from "$src/runner/portCoordinator";
  import type { HackRun } from "$server/game/gameState";
  import { HackEntriesScale } from "$lib/stores/hackEntries";

  export let target: TargetLog;
  export let hackRun: HackRun;

  let width = 0;
  let right = 0;
  $: if (hackRun) {
    width = (hackRun.actualEndTime - hackRun.actualStartTime) / HackEntriesScale;
    right = (Date.now() - hackRun.startTime) / HackEntriesScale;
  }
</script>

<div class="absolute rounded m-1" style="width: {width}px; right: {right}px;">{target.server}</div>
