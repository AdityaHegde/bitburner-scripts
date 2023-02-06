<script lang="ts">
  import TargetDetails from "$components/target/TargetDetails.svelte";

  export let data: { name: string };
</script>

<TargetDetails targetName={data?.name} />
