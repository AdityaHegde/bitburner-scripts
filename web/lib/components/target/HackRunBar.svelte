<script lang="ts">
  import { HackEntriesScale, hackEntriesStore } from "$lib/stores/hackEntries";
  import type { HackRun } from "$server/game/gameState";
  import { HackType } from "$src/servers/hack/hackTypes";

  export let hackRun: HackRun;

  let width = 0;
  let left = 0;
  let bgColor: string;
  let label: string;
  $: if (hackRun) {
    width = (hackRun.end - hackRun.start) / HackEntriesScale;
    left = ($hackEntriesStore.max - hackRun.start) / HackEntriesScale;
    switch (hackRun.hackType) {
      case HackType.Grow:
        bgColor = "bg-sky-600";
        label = "G";
        break;
      case HackType.Weaken:
        bgColor = "bg-rose-600";
        label = "W";
        break;
      case HackType.Hack:
        bgColor = "bg-green-600";
        label = "H";
        break;
    }
  }
</script>

<div class="absolute rounded m-1 {bgColor} text-center"
     style="width: {width}px; left: {left}px;">{hackRun.servers.length}{label}</div>
