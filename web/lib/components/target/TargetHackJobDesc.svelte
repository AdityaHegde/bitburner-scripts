<script lang="ts">
  import { gameStore } from "$lib/stores/gameStore.js";
  import type { HackAssignment } from "$src/servers/hack/hackAssignment";
  import { HackType } from "$src/servers/hack/hackTypes.js";
  import type { ResourceLog } from "$src/servers/resource";
  import type { TargetLog } from "$src/servers/target";

  export let target: TargetLog;

  let assignmentsByIndex: Array<Array<HackAssignment>>;
  $: if (target) {
    assignmentsByIndex = new Array<Array<HackAssignment>>(target.hackJob.operations.length).fill([]);
    let index = 0;
    for (const assignment of target.hackJob.assignments) {
      if (target.hackJob.operations[index] !== assignment.type) {
        index++;
      }
      assignmentsByIndex[index].push(assignment);
    }
  }

  function getAssignmentLabel(assignment: HackAssignment, resource: ResourceLog) {
    let status = "U";
    if (resource.running === assignment.target) {
      status = "R";
    } else if (resource.waiting === assignment.target) {
      status = "W";
    } else if (resource.assigned === assignment.target) {
      status = "A";
    }
    return `${assignment.server}(${status})`;
  }
</script>

{#each assignmentsByIndex as assignments, i}
  <div class="rounded">{HackType[target.hackJob.operations[i]]}
    : {assignments.map(ass => getAssignmentLabel(ass, $gameStore.resources[ass.server])).join(" ")}</div>
{/each}
