import type { ServerData } from "$src/servers/serverData";
import { SharePowerDummyServer } from "$src/servers/serverData";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import {
  getEarlyHackWeakenGrowWeaken,
  getExperienceBatch,
  getGrowWeaken,
  getSharePowerBatch,
  getWeaken,
} from "$src/servers/server-actions/serverActionBatchFactories";
import type { NS } from "$src/types/gameTypes";

export class BatchCreator {
  public constructor(private readonly ns: NS) {}

  public createBatch(target: ServerData): ServerActionBatch {
    target.updateEphemeral();
    const batch = this.getBatchForTarget(target);
    batch.score ??= (target.maxMoney * target.growth * target.rate) / target.minSecurity;
    return batch;
  }

  private getBatchForTarget(target: ServerData): ServerActionBatch {
    if (target.name === SharePowerDummyServer) {
      return getSharePowerBatch(target, this.ns.getPlayer().factions.length > 0);
    }

    if (target.security > target.minSecurity) {
      return getWeaken(this.ns, target);
    } else if (target.money < target.maxMoney) {
      return getGrowWeaken(this.ns, target);
    } else {
      if (target.name === "joesguns") {
        // TODO: use math to determine best exp target
        // TODO: at some point exp is not useful. do not add if level is too high
        return getExperienceBatch(target);
      } else {
        return getEarlyHackWeakenGrowWeaken(this.ns, target);
      }
    }
  }
}
