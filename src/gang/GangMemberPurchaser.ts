import type { GangMemberInfo, NS } from "$src/types/gameTypes";
import type { PrimarySingleStats } from "$src/gang/gangConstants";
import {
  ArmourUpgradeMoneyBuffer,
  GangUpgradeMoneyBuffer,
  GangUpgradesByType,
  GangUpgradeType,
  NonAugUpgradeMoneyBuffer,
  UpgradeStatMultiThreshold,
} from "$src/gang/gangConstants";
import type { GangMemberEquipmentsRepo } from "$src/gang/GangMemberEquipmentsRepo";
import { Second } from "$src/constants";
import type { Logger } from "$src/utils/logger/logger";

export class GangMemberPurchaser {
  private equipment: Array<number>;
  private boughtEquipment = new Set<string>();
  private lastRun = 0;
  private minStatMulti = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly name: string,
    private readonly primaryStat: PrimarySingleStats,
    private readonly repo: GangMemberEquipmentsRepo,
  ) {}

  public init(gangMember: GangMemberInfo) {
    this.equipment = new Array(GangUpgradesByType[this.primaryStat].length).fill(0);
    for (const aug of gangMember.augmentations) {
      this.boughtEquipment.add(aug);
    }
    for (const upg of gangMember.upgrades) {
      this.boughtEquipment.add(upg);
    }
  }

  public process() {
    if (Date.now() - this.lastRun < 5 * Second) return;
    this.lastRun = Date.now();

    let money = this.ns.getPlayer().money;

    for (let i = 0; i < GangUpgradesByType[this.primaryStat].length; i++) {
      const type = GangUpgradesByType[this.primaryStat][i];

      // add an artificial price multiplier for non aug items before stats multi is above a threshold
      const priceMulti =
        type !== GangUpgradeType.Augmentation && this.minStatMulti < UpgradeStatMultiThreshold
          ? // initially do not buy armor
            type === GangUpgradeType.Armor
            ? ArmourUpgradeMoneyBuffer
            : NonAugUpgradeMoneyBuffer
          : GangUpgradeMoneyBuffer;

      for (; this.equipment[i] < this.repo.equipment[type].length; this.equipment[i]++) {
        const [equipmentName, stats, price] = this.repo.equipment[type][this.equipment[i]];
        // TODO: check for hack should be based on the gang type
        if (this.boughtEquipment.has(equipmentName) || stats.hack) continue;
        if (money < price * priceMulti || !this.ns.gang.purchaseEquipment(this.name, equipmentName))
          break;
        money -= price;
      }
    }
  }

  public ascended(minStatMulti: number) {
    this.minStatMulti = minStatMulti;
    this.boughtEquipment.clear();
    for (let i = 0; i < this.equipment.length; i++) {
      this.equipment[i] = 0;
    }

    const gangMember = this.ns.gang.getMemberInformation(this.name);
    // augs are persisted on ascension
    for (const aug of gangMember.augmentations) {
      this.boughtEquipment.add(aug);
    }
  }
}
