import type { GangGenInfo, GangOtherInfo, NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { EventEmitter } from "$src/utils/eventEmitter";
import {
  DefenceThreshold,
  MaxMembers,
  MemberPrefix,
  TerritoryTick,
  WinChanceThreshold,
} from "$src/gang/gangConstants";
import { Second } from "$src/constants";

export type GangWarfareEvents = {
  startWar: () => void;
  endWar: () => void;
  died: (memberNames: Array<string>) => void;
};

export class GangWarfare extends EventEmitter<GangWarfareEvents> {
  private otherGangInfo: GangOtherInfo;
  private justBeforeTick = Date.now() + TerritoryTick;
  private enabled = false;

  public constructor(private readonly ns: NS, private readonly logger: Logger) {
    super();
    // holdover from previously killed script
    this.ns.gang.setTerritoryWarfare(false);
  }

  public init() {
    this.otherGangInfo = this.ns.gang.getOtherGangInformation();
    this.enabled = true;
  }

  public process(gang: GangGenInfo) {
    if (!this.enabled) return;
    if (gang.territory === 1) {
      if (gang.territoryWarfareEngaged) {
        this.ns.gang.setTerritoryWarfare(false);
        this.enabled = false;
      }
      return;
    }
    if (this.ns.gang.getBonusTime() > 0) return;

    if (this.isNewTick()) {
      this.justBeforeTick = Date.now() + TerritoryTick - 2 * Second;
      if (gang.territoryWarfareEngaged) {
        this.ns.gang.setTerritoryWarfare(false);
        this.emit("endWar");
        this.checkForDeaths();
      }
      return;
    }

    if (Date.now() < this.justBeforeTick) return;
    this.justBeforeTick = Date.now() + TerritoryTick;
    if (this.membersCanFight() && this.canWinClash(gang)) {
      this.ns.gang.setTerritoryWarfare(true);
      this.emit("startWar");
    }
  }

  private isNewTick() {
    const otherGangInfo = this.ns.gang.getOtherGangInformation();
    for (const otherGangName in otherGangInfo) {
      const newOtherGang = otherGangInfo[otherGangName];
      const oldOtherGang = this.otherGangInfo[otherGangName];
      if (
        newOtherGang.power !== oldOtherGang.power ||
        newOtherGang.territory !== oldOtherGang.territory
      ) {
        this.otherGangInfo = otherGangInfo;
        return true;
      }
    }
    return false;
  }

  private membersCanFight() {
    for (const memberName of this.ns.gang.getMemberNames()) {
      const member = this.ns.gang.getMemberInformation(memberName);
      if (member.def < DefenceThreshold) return false;
    }
    return true;
  }

  private canWinClash(gang: GangGenInfo) {
    for (const otherGangName in this.otherGangInfo) {
      if (otherGangName === gang.faction) continue;
      if (this.ns.gang.getChanceToWinClash(otherGangName) < WinChanceThreshold) return false;
    }
    return true;
  }

  private checkForDeaths() {
    const previousMembers = new Set<string>();
    for (let i = 0; i < MaxMembers; i++) {
      previousMembers.add(`${MemberPrefix}${i}`);
    }

    for (const memberName of this.ns.gang.getMemberNames()) {
      previousMembers.delete(memberName);
    }

    if (previousMembers.size > 0) {
      this.enabled = false;
      this.emit("died", [...previousMembers]);
    }
  }
}
