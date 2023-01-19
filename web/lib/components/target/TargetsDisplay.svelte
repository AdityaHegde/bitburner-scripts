<script lang="ts">
  import TargetDesc from "$components/target/TargetDesc.svelte";
  import TargetTimeLine from "$components/target/TargetTimeLine.svelte";
  import { gameStore } from "$lib/stores/gameStore.js";
  import { HackEntriesScale, hackEntriesStore, HackEntriesWindow } from "$lib/stores/hackEntries";
  import type { HackRun } from "$server/game/gameState";
  import type { TargetLog } from "$src/servers/target";
  import { binaryInsert } from "$src/utils/arrayUtils";

  // target -> index -> []HackRun
  let groupedRuns: Record<string, Array<Array<HackRun>>> = {};

  function groupHackRuns(runs: Record<string, Array<HackRun>>) {
    groupedRuns = {};
    for (const targetServer in runs) {
      groupedRuns[targetServer] = [];

      for (const run of runs[targetServer]) {
        while (run.index >= groupedRuns[targetServer].length) {
          groupedRuns[targetServer].push([]);
        }

        binaryInsert(groupedRuns[targetServer][run.index], run, (mid, ele) => mid.start - ele.start);
      }
    }
  }

  $: groupHackRuns($hackEntriesStore.entries);

  let targets: Array<TargetLog>;
  let selected: string;
  $: {
    targets = [];
    for (const targetServer in $gameStore.targets) {
      targets.push($gameStore.targets[targetServer]);
    }
    targets.sort((a, b) => b.score - a.score);
  }

  const width = HackEntriesWindow / HackEntriesScale;
</script>

<div class="flex flex-wrap overflow-y-scroll" style="max-height: 50%;">
  {#each targets as target (target.server)}
    <TargetDesc {target} on:click={() => selected = target.server} />
  {/each}
</div>
<div class="flex flex-row">
  <div style="width: 20%;">
    <div class="flex flex-row">
      <div class="w-full p-2 flex flex-col">
        {#each targets as target (target.server)}
          {#if groupedRuns[target.server]}
            <div class="w-full h-8 relative">
              {target.server}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
  <div style="width: 80%;">
    <div class="overflow-x-scroll" style="width: {width}px;">
      <div class="w-full flex flex-col">
        {#each targets as target (target.server)}
          {#if groupedRuns[target.server]}
            <TargetTimeLine runsByIndex={groupedRuns[target.server] ?? []} />
          {/if}
        {/each}
      </div>
    </div>
  </div>
</div>
