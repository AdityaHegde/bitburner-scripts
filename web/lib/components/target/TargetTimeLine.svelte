<script lang="ts">
  import HackRunBar from "$components/target/HackRunBar.svelte";
  import type { HackRun } from "$server/game/gameState";

  export let runsByIndex: Array<Array<HackRun>>;
</script>

{#if runsByIndex}
  {#each runsByIndex as runByIndex}
    <div class="w-full h-8 relative">
      {#each runByIndex as hackRun}
        <HackRunBar {hackRun} />
      {/each}
    </div>
  {/each}
{/if}
