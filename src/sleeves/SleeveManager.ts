import type { NS, SleevePerson, SleeveTask } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import type { SleeveRole } from "$src/sleeves/roles/SleeveRole";

export const SleeveLowerShock = 50;
export const SleeveLowerSync = 95;
export const SleeveUpperSync = 100;

export class SleeveManager {
  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    public readonly index: number,
    public role: SleeveRole,
  ) {}

  public init() {
    const sleeve = this.ns.sleeve.getSleeve(this.index);
    this.role.init(sleeve);
  }

  public process() {
    const sleeve = this.ns.sleeve.getSleeve(this.index);
    const task = this.ns.sleeve.getTask(this.index);

    if (!this.checkSync(sleeve, task) || !this.checkShock(sleeve, task)) return;

    this.role.process(sleeve, task);
  }

  private checkSync(sleeve: SleevePerson, task: SleeveTask): boolean {
    if (sleeve.sync === SleeveUpperSync) return true;
    if (sleeve.sync > SleeveLowerSync) {
      return task.type !== "SYNCHRO";
    }

    if (task.type !== "SYNCHRO") {
      this.logger.log("SleeveSynchronizing", {
        index: this.index,
      });
      this.ns.sleeve.setToSynchronize(this.index);
    }
    return false;
  }

  private checkShock(sleeve: SleevePerson, task: SleeveTask): boolean {
    if (sleeve.shock <= SleeveLowerShock) return true;
    if (task.type !== "RECOVERY") {
      this.logger.log("SleeveRecovering", {
        index: this.index,
      });
      this.ns.sleeve.setToShockRecovery(this.index);
    }
    return false;
  }
}
