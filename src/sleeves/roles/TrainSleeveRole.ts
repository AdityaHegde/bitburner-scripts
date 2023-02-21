import { SleeveRole } from "$src/sleeves/roles/SleeveRole";
import type { SleevePerson, SleeveTask } from "$src/types/gameTypes";

export class TrainSleeveRole extends SleeveRole {
  public init(sleeve: SleevePerson) {}

  public process(sleeve: SleevePerson, task: SleeveTask) {}
}
