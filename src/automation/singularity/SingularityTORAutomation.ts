import { TORAutomation } from "$src/automation/TORAutomation";
import type { NS } from "$src/types/gameTypes";

export class SingularityTORAutomation extends TORAutomation {
  public constructor(private readonly ns: NS) {
    super();
  }

  public async buyTorServer(): Promise<void> {
    this.ns.singularity.purchaseTor();
  }

  public async buyCrack(name: string): Promise<void> {
    this.ns.singularity.purchaseProgram(name);
  }
}
