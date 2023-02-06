<script lang="ts">
  import { hackEntriesStore } from "$lib/stores/hackEntries";
  import type { TargetLog } from "$src/runner/portCoordinator";
  import { ShorthandNotationSchema } from "$src/utils/shorthand-notation.js";
  import type { HackBatch } from "$server/game/gameState";
  import type { Tweened } from "svelte/motion";
  import { tweened } from "svelte/motion";
  import { goto } from "$app/navigation";

  export let targetName: string;

  let target: TargetLog;
  $: target = $hackEntriesStore.targets[targetName];
  let hackBatch: HackBatch;
  $: hackBatch = $hackEntriesStore.batches[targetName];

  let endTimer: Tweened<number>;
  let interval: number;
  $: {
    if (hackBatch && Date.now() < hackBatch.endTime) {
      endTimer = tweened(hackBatch.endTime - Date.now());
      if (!interval) {
        interval = setInterval(() => {
          $endTimer = hackBatch.endTime - Date.now();
        }, 1000);
      }
    } else {
      endTimer = undefined;
      if (interval) {
        clearInterval(interval);
        interval = 0;
      }
    }
  }
</script>

<div class="flex flex-row w-full">
  <div class="w-1/3">
    <div class="stats shadow" on:click={() => goto(`/target/${targetName}`)}>
      <div class="stat">
        <div class="stat-title">{target.server}</div>
        <div class="stat-value">
          {ShorthandNotationSchema.diskSpace.convert(target.mem * 1024 * 1024 * 1024)}
        </div>
        <div class="stat-desc">{target.sets} Sets. {target.threads.join(",")} Threads</div>
      </div>
    </div>
  </div>
  <div class="w-1/3">
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Stats</div>
        <div class="stat-value">
          {ShorthandNotationSchema.usd.convert(target.money)}
          /{ShorthandNotationSchema.usd.convert(target.maxMoney)}
        </div>
        <div class="stat-desc">{target.security.toFixed(2)}/{target.minSecurity}</div>
      </div>
    </div>
  </div>
  <div class="w-1/3">
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Batch</div>
        {#if endTimer}
          <div class="stat-value">{ShorthandNotationSchema.time.convert($endTimer)}</div>
        {/if}
      </div>
    </div>
  </div>
</div>
