import type { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";
import { EventEmitter } from "$src/utils/eventEmitter";

export type OrchestratorModuleEvents = {
  schedule: (scriptSchedule: ScriptSchedule) => void;
};

export abstract class OrchestratorModule extends EventEmitter<OrchestratorModuleEvents> {
  public isAsync = false;

  public abstract process(): Promise<void>;

  public abstract init(): void;
}
