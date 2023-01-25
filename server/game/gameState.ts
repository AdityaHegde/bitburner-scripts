import { HackEntriesWindow } from "$lib/stores/hackEntries";
import { copyArrayToObject } from "$server/utils/deepCopy";
import type { ClusterLog } from "$src/servers/clusters/cluster";
import { ClusterLogMessage } from "$src/servers/clusters/cluster";
import type { HackType } from "$src/servers/hack/hackTypes";
import type { HackEntryLog } from "$src/servers/hack/wrapAction";
import type { ResourceLog } from "$src/servers/resource";
import { ResourceLogMessage } from "$src/servers/resource";
import type { TargetLog } from "$src/servers/target";
import { TargetLogMessage } from "$src/servers/target";
import { binarySearch } from "$src/utils/arrayUtils";
import type { JsonLog } from "$src/utils/logger/logFormatter";
import type { Patch } from "immer";
import { enablePatches, produce } from "immer";

enablePatches();

export type HackEntriesState = {
  min: number;
  max: number;
  entries: Record<string, Array<HackRun>>;
};
export type HackRun = {
  start: number;
  end: number;
  target: string;
  servers: Array<string>;
  hackType: HackType;
  index: number;
  count: number;
};

export type GameState = {
  resources: Record<string, ResourceLog>;
  targets: Record<string, TargetLog>;
  clusters: Array<ClusterLog>;
};

export class GameStateCollector {
  public state: GameState = {
    resources: {},
    targets: {},
    clusters: [],
  };
  public hackEntries: HackEntriesState = {
    min: 0,
    max: 0,
    entries: {},
  };

  public sortLogs(logs: Array<JsonLog>): [Array<Patch>, Array<JsonLog>] {
    const resources = Array<ResourceLog>();
    const targets = new Array<TargetLog>();
    const clusters = new Array<ClusterLog>();
    const restOfLogs = new Array<JsonLog>();

    for (const log of logs) {
      switch (log.message) {
        case ResourceLogMessage:
          resources.push(log.fields as ResourceLog);
          break;

        case TargetLogMessage:
          targets.push(log.fields as TargetLog);
          break;

        case ClusterLogMessage:
          clusters.push(log.fields as ClusterLog);
          break;

        default:
          restOfLogs.push(log);
          break;
      }
    }

    return [this.update(resources, targets), restOfLogs];
  }

  public updateHackEntries(hackEntries: Array<HackEntryLog>): Array<Patch> {
    if (hackEntries.length === 0) return;
    let patches: Array<Patch>;
    this.hackEntries = produce(
      this.hackEntries,
      (draft) => {
        const newEntriesMap = new Map<number, HackRun>();
        const max = this.fillNewEntriesMap(hackEntries, newEntriesMap);

        for (const hackRun of newEntriesMap.values()) {
          draft.entries[hackRun.target] ??= [];
          draft.entries[hackRun.target].push(hackRun);
        }

        for (const target in draft.entries) {
          const cutoffIdx = binarySearch(
            draft.entries[target],
            (mid) => mid.start - (max - HackEntriesWindow),
          );
          if (cutoffIdx >= 0) {
            draft.entries[target] = draft.entries[target].slice(cutoffIdx);
          }
        }
        draft.max = max;
      },
      (p) => (patches = p),
    );

    return patches;
  }

  private update(resources: Array<ResourceLog>, targets: Array<TargetLog>): Array<Patch> {
    let patches: Array<Patch>;
    this.state = produce(
      this.state,
      (draft) => {
        copyArrayToObject<ResourceLog>(resources, draft.resources, (e) => e.server);
        copyArrayToObject<TargetLog>(targets, draft.targets, (e) => e.server);
      },
      (p) => (patches = p),
    );
    return patches;
  }

  private fillNewEntriesMap(
    hackEntries: Array<HackEntryLog>,
    newEntriesMap: Map<number, HackRun>,
  ): number {
    let newMax = 0;

    for (const hackEntry of hackEntries) {
      let hackRun: HackRun;
      if (!newEntriesMap.has(hackEntry.port)) {
        hackRun = {
          start: Number.MAX_SAFE_INTEGER,
          end: 0,
          target: hackEntry.target,
          servers: [],
          hackType: hackEntry.hackType,
          index: 0,
          count: hackEntry.count,
        };
        newEntriesMap.set(hackEntry.port, hackRun);
      } else {
        hackRun = newEntriesMap.get(hackEntry.port);
      }

      if (hackEntry.start) {
        hackRun.start = Math.min(hackRun.start, hackEntry.time);
        hackRun.servers.push(hackEntry.server);
      } else {
        hackRun.end = Math.max(hackRun.end, hackEntry.time);
        if (hackRun.end > newMax) {
          newMax = hackRun.end;
        }
      }
    }

    return newMax;
  }
}
