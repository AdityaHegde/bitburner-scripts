<script>
  import TargetsDisplay from "$components/target/TargetsDisplay.svelte";
  import Resources from "$components/resource/Resources.svelte";

  let showResource = false;
</script>

<button on:click={() => showResource = !showResource}>Show Resources</button>

{#if showResource}
  <Resources />
{/if}
<TargetsDisplay />
