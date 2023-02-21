import type { NS, SleevePerson, SleeveTask } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export abstract class SleeveRole {
  public constructor(
    protected readonly ns: NS,
    protected readonly logger: Logger,
    protected readonly index: number,
  ) {}

  public abstract init(sleeve: SleevePerson): void;

  public abstract process(sleeve: SleevePerson, task: SleeveTask): void;
}
