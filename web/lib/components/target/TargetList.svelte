<script lang="ts">
  import { hackEntriesStore } from "$lib/stores/hackEntries";
  import Target from "$components/target/Target.svelte";

  let targets = new Array<string>();
  $: if ($hackEntriesStore.targets) {
    targets = [];
    for (const target in $hackEntriesStore.targets) {
      targets.push(target);
    }
    targets.sort((a, b) => $hackEntriesStore.targets[b].score - $hackEntriesStore.targets[a].score);
  }
</script>

<div class="flex flex-col">
  {#each targets as targetName (targetName)}
    <Target {targetName} />
  {/each}
</div>
