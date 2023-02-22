import type { EquipmentStats, NS } from "$src/types/gameTypes";
import { Minute } from "$src/constants";
import { GangUpgradeType } from "$src/gang/gangConstants";
import type { Logger } from "$src/utils/logger/logger";

export class GangMemberEquipmentsRepo {
  public equipment: Record<
    GangUpgradeType,
    Array<[name: string, stats: EquipmentStats, price: number]>
  > = {
    [GangUpgradeType.Weapon]: [],
    [GangUpgradeType.Armor]: [],
    [GangUpgradeType.Vehicle]: [],
    [GangUpgradeType.Rootkit]: [],
    [GangUpgradeType.Augmentation]: [],
  };
  private equipmentSeen: Record<string, boolean> = {};
  private lastRun = 0;

  public constructor(private readonly ns: NS, private readonly logger: Logger) {}

  public init() {
    this.updateAvailableEquipments();
  }

  public process() {
    if (Date.now() - this.lastRun < Minute) return;
    this.lastRun = Date.now();

    this.updateAvailableEquipments();
  }

  private updateAvailableEquipments() {
    const equipmentNames = this.ns.gang.getEquipmentNames();
    for (const equipmentName of equipmentNames) {
      if (this.equipmentSeen[equipmentName]) continue;
      const equipmentType = this.ns.gang.getEquipmentType(equipmentName) as GangUpgradeType;
      const equipmentStats = this.ns.gang.getEquipmentStats(equipmentName);
      this.equipment[equipmentType].push([
        equipmentName,
        equipmentStats,
        this.ns.gang.getEquipmentCost(equipmentName),
      ]);
      this.equipmentSeen[equipmentName] = true;
    }
  }
}
