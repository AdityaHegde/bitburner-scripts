<script lang="ts">
  import type { HackRun } from "$server/game/gameState";
  import { HackEntriesScale } from "$lib/stores/hackEntries";
  import { ServerActionType } from "$src/servers/server-actions/serverActionType";

  export let hackRun: HackRun;

  let width = 0;
  let right = 0;
  let label = "";
  let color = "";
  $: if (hackRun) {
    width = (hackRun.actualEndTime - hackRun.actualStartTime) / HackEntriesScale;
    right = (Date.now() - (hackRun.actualStartTime ?? hackRun.startTime)) / HackEntriesScale;
    label = ServerActionType[hackRun.action]?.[0] ?? "?";
    color = hackRun.skipped ? "bg-error" : hackRun.actualEndTime ? "bg-success" : "bg-warning";
  }
</script>

<div
  class="absolute rounded p-0.5 {color} text-gray-800"
  style="width: {width}px; right: {right}px;"
>
  {label}
</div>
