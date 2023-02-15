import { SyncedServerActionRunner } from "$src/servers/server-actions/action-runner/syncedServerActionRunner";
import { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import type { NSMock } from "./NSMock";
import {
  ServerActionTimeMultipliers,
  ServerActionType,
} from "$src/servers/server-actions/serverActionType";
import { findInArray } from "$src/utils/arrayUtils";
import type { Mock } from "vitest";
import { expect, vi } from "vitest";
import { asyncWait } from "$server/utils/asyncUtils";
import { Logger } from "$src/utils/logger/logger";

export const BaseHackTime = 1000;

export class TestBatchRunner {
  public hackTime: number;
  public readonly actions: Array<Array<SyncedServerActionRunner>>;
  public readonly actionCallbacks: Array<Array<Mock>>;
  public readonly serverActionPorts: ServerActionPorts;

  constructor(
    ns: NSMock,
    private readonly actionTypes: Array<ServerActionType>,
    setCount: number,
    countMultis = new Array(actionTypes.length).fill(1),
  ) {
    this.serverActionPorts = new ServerActionPorts(ns, 1, 2, 3);
    this.setHackTime(BaseHackTime);

    this.actions = new Array(setCount);
    this.actionCallbacks = new Array(setCount);
    const [, longestActionMulti] = findInArray(
      actionTypes,
      (a, b) => ServerActionTimeMultipliers[a] > ServerActionTimeMultipliers[b],
    );
    const longestAction = ServerActionTimeMultipliers[longestActionMulti];

    let processIndex = 0;
    for (let setIndex = 0; setIndex < setCount; setIndex++) {
      this.actions[setIndex] = new Array(actionTypes.length);
      this.actionCallbacks[setIndex] = new Array(actionTypes.length);
      for (let actionIndex = 0; actionIndex < actionTypes.length; actionIndex++) {
        const mockedAction = vi.fn(() =>
          asyncWait(this.hackTime * ServerActionTimeMultipliers[actionTypes[actionIndex]]),
        );
        this.actionCallbacks[setIndex][actionIndex] = mockedAction;
        this.actions[setIndex][actionIndex] = new SyncedServerActionRunner(
          ns,
          Logger.ConsoleLogger(ns, "Test"),
          actionTypes[actionIndex],
          mockedAction as any,
          {
            actionIndex,
            actionCount: actionTypes.length,
            setIndex,
            setCount,
            processIndex,
            processCount: setCount * actionTypes.length,
            countMulti: countMultis[actionIndex],
            longestAction,
          },
          1,
          2,
          3,
        );
        processIndex++;
      }
    }
  }

  public setHackTime(hackTime: number) {
    this.hackTime = hackTime;
    const [, , , endTime] = this.serverActionPorts.getTargetInfo();
    this.serverActionPorts.setTargetInfo("n00dles", 0, hackTime, endTime);
  }

  public setCount(count: number) {
    const [starts, ends] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(starts, ends, count, 0);
  }

  public start() {
    for (const actions of this.actions) {
      for (const action of actions) {
        action.start();
      }
    }
  }

  public calledCount(
    checks: Array<
      [setIdx: number, actionIdx: number, setEndIdx: number, actionEndIdx: number, count: number]
    >,
  ) {
    for (const [setIdx, actionIdx, setEndIdx, actionEndIdx, count] of checks) {
      const actual = new Array<[label: string, calls: number]>();
      const expected = new Array<[label: string, calls: number]>();
      for (let si = setIdx; si < setEndIdx; si++) {
        for (let ai = actionIdx; ai < actionEndIdx; ai++) {
          const label = `${ServerActionType[this.actionTypes[ai]]}(${ai}/${si})`;
          actual.push([label, this.actionCallbacks[si][ai].mock.calls.length]);
          expected.push([label, count]);
        }
      }
      expect(actual).toEqual(expected);
    }
  }
}
