import { SimpleBatchReserve } from "$src/servers/server-actions/batch-reserve/SimpleBatchReserve";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import type { ResourceList } from "$src/servers/resourceList";
import { ServerActionSet } from "$src/servers/server-actions/serverActionSet";
import {
  ServerActionType,
  ServerActionTypeToMemMap,
} from "$src/servers/server-actions/serverActionType";
import { BatchOperationBuffer } from "$src/constants";

export class MultipleBatchReserve extends SimpleBatchReserve {
  public reserve(batch: ServerActionBatch, resourceList: ResourceList) {
    let size = 0;

    batch.actionSets = [];

    while (size < (batch.target.times[ServerActionType.Hack] * 2) / 3) {
      const actionSet = new ServerActionSet(batch.actionTypes, batch.threads);
      if (!this.reserveForSet(actionSet, batch.target.name, resourceList, 0)) {
        actionSet.unReserve(resourceList);
        break;
      }

      batch.actionSets.push(actionSet);
      size = (batch.actionSets.length * batch.actionTypes.length + 5) * BatchOperationBuffer;
    }

    return batch.actionSets.length > 0;
  }

  protected reserveForSet(
    set: ServerActionSet,
    target: string,
    resourceList: ResourceList,
    index = 0,
  ): boolean {
    let firstIndex = -1;
    for (let actionIdx = 0; actionIdx < set.actionTypes.length; actionIdx++) {
      if (set.actionTypes[actionIdx] === ServerActionType.Weaken) continue;

      [set.threads[actionIdx], set.reservations[actionIdx], index] = resourceList.reserveForAction(
        target,
        ServerActionTypeToMemMap[set.actionTypes[actionIdx]],
        set.threads[actionIdx],
        index,
        1,
        true,
      );

      if (set.threads[actionIdx] !== 0) return false;
      if (firstIndex === -1) firstIndex = index;
    }

    index = firstIndex;
    for (let actionIdx = 0; actionIdx < set.actionTypes.length; actionIdx++) {
      if (set.actionTypes[actionIdx] !== ServerActionType.Weaken) continue;

      [set.threads[actionIdx], set.reservations[actionIdx], index] = resourceList.reserveForAction(
        target,
        ServerActionTypeToMemMap[set.actionTypes[actionIdx]],
        set.threads[actionIdx],
        index,
        1,
        true,
      );
    }

    return set.threads.every((thread) => thread <= 0);
  }
}
