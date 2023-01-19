<script lang="ts">
  import TargetHackJobDesc from "$components/target/TargetHackJobDesc.svelte";
  import { gameStore } from "$lib/stores/gameStore";
  import type { ResourceLog } from "$src/servers/resource";
  import type { TargetLog } from "$src/servers/target";
  import { ShorthandNotationSchema } from "$src/utils/shorthand-notation.js";

  export let target: TargetLog;

  let resource: ResourceLog;
  $: resource = $gameStore.resources[target.server];
</script>

<div on:click>
  <div class="flex flex-col p-2 w-80">
    <div class="h-5 rounded">{target.server} - {target.score.toFixed(2)}</div>
    <div class="h-5 rounded">
      {ShorthandNotationSchema.usd.convert(resource.money)}/{ShorthandNotationSchema.usd.convert(resource.maxMoney)}
      - {resource?.security?.toFixed(2)}({resource?.minSecurity?.toFixed(2)})
    </div>
    <div class="h-5 rounded">{target.ratios.join(",")} - {resource?.rate?.toFixed(4)}</div>
    <TargetHackJobDesc {target} />
  </div>
</div>