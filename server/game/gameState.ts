import type { JsonLog } from "$src/utils/logger/logFormatter";
import type { Patch } from "immer";
import { enablePatches, produce } from "immer";
import type { ActionLogBase } from "$src/servers/server-actions/action-runner/syncedServerActionRunner";
import {
  ActionBatchEndedLabel,
  ActionLeaderInitLabel,
  ActionRunEndLabel,
  ActionRunSkipLabel,
  ActionRunStartLabel,
  ActionRunWaitLabel,
  ActionWaitForEndLabel,
  ActionWaitForStartLabel,
} from "$src/servers/server-actions/action-runner/syncedServerActionRunner";
import { deepCopy } from "$server/utils/deepCopy";
import type { WritableDraft } from "immer/dist/types/types-external";
import { HackEntriesWindow } from "$lib/stores/hackEntries";
import type { TargetLog } from "$src/runner/portCoordinator";

enablePatches();

export type HackEntriesState = {
  min: number;
  max: number;
  entries: Record<string, Record<number, Array<HackRun>>>;
  batches: Record<string, HackBatch>;
  targets: Record<string, TargetLog>;
};
export type HackRun = ActionLogBase & {
  skipped: boolean;
  startTime: number;
  calcStartTime: number;
  startDiff: number;
  actualStartTime: number;
  actualEndTime: number;
  endTime: number;
};
export type HackBatch = {
  target: string;
  starts: number;
  ends: number;
  count: number;
  hackTime: number;
  endTime: number;
};

export type GameState = {
  targets: Record<string, TargetLog>;
};

export class GameStateCollector {
  public state: GameState = {
    targets: {},
  };
  public hackEntries: HackEntriesState = {
    min: 0,
    max: 0,
    entries: {},
    batches: {},
    targets: {},
  };

  public addLogs(logs: Array<JsonLog>) {
    let patches: Array<Patch>;
    const restOfLogs = new Array<JsonLog>();

    this.hackEntries = produce(
      this.hackEntries,
      (draft) => {
        for (const log of logs) {
          if (!log.label || !log.fields) continue;
          if (log.label.startsWith("Action-")) {
            this.processRunnerLog(draft, log);
            continue;
          }
          if (log.label === "GameData") {
            this.processGameDataLog(draft, log);
            continue;
          }

          restOfLogs.push(log);
        }
      },
      (p) => (patches = p),
    );

    return patches;
  }

  private processRunnerLog(draft: WritableDraft<HackEntriesState>, log: JsonLog) {
    let run: HackRun;
    switch (log.message) {
      case ActionBatchEndedLabel:
        delete draft.entries[log.fields.target];
        delete draft.batches[log.fields.target];
        break;

      case ActionWaitForStartLabel:
        if (!draft.batches[log.fields.target])
          draft.batches[log.fields.target] = {
            target: log.fields.target,
          } as any;
        draft.batches[log.fields.target].starts = log.fields.starts;
        draft.batches[log.fields.target].count = log.fields.count;
        break;

      case ActionWaitForEndLabel:
        if (!draft.batches[log.fields.target])
          draft.batches[log.fields.target] = {
            target: log.fields.target,
          } as any;
        draft.batches[log.fields.target].ends = log.fields.ends;
        draft.batches[log.fields.target].count = log.fields.count;
        break;

      case ActionLeaderInitLabel:
        if (!draft.batches[log.fields.target])
          draft.batches[log.fields.target] = {
            target: log.fields.target,
          } as any;
        draft.batches[log.fields.target].hackTime = log.fields.hackTime;
        draft.batches[log.fields.target].endTime = log.fields.endTime;
        break;

      case ActionRunSkipLabel:
      case ActionRunWaitLabel:
      case ActionRunStartLabel:
      case ActionRunEndLabel:
        if (!draft.entries[log.fields.target]) draft.entries[log.fields.target] = {};
        if (!draft.entries[log.fields.target][log.fields.processIndex]?.length)
          draft.entries[log.fields.target][log.fields.processIndex] = [{} as any];
        run =
          draft.entries[log.fields.target][log.fields.processIndex][
            draft.entries[log.fields.target][log.fields.processIndex].length - 1
          ];
        deepCopy(log.fields, run);
        if (!run.calcStartTime) run.calcStartTime = log.timestamp;
        draft.entries[log.fields.target][log.fields.processIndex] = draft.entries[
          log.fields.target
        ][log.fields.processIndex].filter((run) => Date.now() - run.startTime < HackEntriesWindow);
        break;

      default:
        break;
    }
  }

  private processGameDataLog(draft: WritableDraft<HackEntriesState>, log: JsonLog) {
    if (draft.targets[log.fields.server]) {
      deepCopy(log.fields, draft.targets[log.fields.server]);
    } else {
      draft.targets[log.fields.server] = log.fields as any;
    }
  }
}
