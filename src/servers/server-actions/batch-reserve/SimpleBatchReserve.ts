import type { ResourceList } from "$src/servers/resourceList";
import type { ServerActionSet } from "$src/servers/server-actions/serverActionSet";
import { ServerActionTypeToMemMap } from "$src/servers/server-actions/serverActionType";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";

export class SimpleBatchReserve {
  public reserve(batch: ServerActionBatch, resourceList: ResourceList) {
    return this.reserveForSet(batch.actionSets[0], batch.target.name, resourceList, 0);
  }

  protected reserveForSet(
    set: ServerActionSet,
    target: string,
    resourceList: ResourceList,
    index = 0,
  ): boolean {
    let hasReservations = false;
    for (let actionIdx = 0; actionIdx < set.actionTypes.length; actionIdx++) {
      [set.threads[actionIdx], set.reservations[actionIdx], index] = resourceList.reserveForAction(
        target,
        ServerActionTypeToMemMap[set.actionTypes[actionIdx]],
        set.threads[actionIdx],
        index,
      );
      if (set.reservations[actionIdx].length > 0) hasReservations = true;
    }
    return set.threads.every((thread) => thread <= 0) && hasReservations;
  }
}
