<script lang="ts">
  import type { TargetLog } from "$src/runner/portCoordinator";
  import { hackEntriesStore } from "$lib/stores/hackEntries";
  import type { HackRun } from "$server/game/gameState";
  import { goto } from "$app/navigation";
  import TargetActionBar from "$components/target/TargetActionBar.svelte";

  export let targetName: string;

  let target: TargetLog;
  $: target = $hackEntriesStore.targets[targetName];
  let entriesRec: Record<number, Array<HackRun>>;
  $: entriesRec = $hackEntriesStore.entries[targetName];
  let entries: Array<Array<HackRun>> = [];
  $: if (entriesRec) {
    entries = [];
    for (let processIndex in entriesRec) {
      entries.push(entriesRec[processIndex]);
    }
  }
</script>

<button class="btn" on:click={() => goto("/")}>Back</button>

<div class="flex flex-col w-full">
  {#each entries as hackRuns}
    <div class="w-full h-8 relative">
      {#each hackRuns as hackRun}
        <TargetActionBar {target} {hackRun} />
      {/each}
    </div>
  {/each}
</div>
