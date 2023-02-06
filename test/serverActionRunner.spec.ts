import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { TestBatchRunner } from "./mocks/TestBatchRunner";
import { NSMock } from "./mocks/NSMock";
import { ServerActionType } from "$src/servers/server-actions/serverActionType";

describe("ServerActionRunner", () => {
  beforeAll(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      advanceTimeDelta: 100,
    });
  });

  it("Weaken", async () => {
    const ns = new NSMock();
    const runner = new TestBatchRunner(ns, [ServerActionType.Weaken], 1);
    runner.setCount(3);
    runner.start();
    await vi.advanceTimersByTimeAsync(500);
    runner.calledCount([[0, 0, 1, 1, 1]]);
    await vi.advanceTimersByTimeAsync(4500);
    runner.calledCount([[0, 0, 1, 1, 2]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, 2]);
    await vi.advanceTimersByTimeAsync(4200);
    runner.calledCount([[0, 0, 1, 1, 3]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, 1]);
  });

  it("GrowWeaken", async () => {
    const ns = new NSMock();
    const runner = new TestBatchRunner(ns, [ServerActionType.Grow, ServerActionType.Weaken], 1);
    runner.setCount(3);
    runner.start();
    await vi.advanceTimersByTimeAsync(2000);
    runner.calledCount([[0, 0, 1, 2, 1]]);
    await vi.advanceTimersByTimeAsync(4500);
    runner.calledCount([[0, 0, 1, 2, 2]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, 2]);
    await vi.advanceTimersByTimeAsync(4500);
    runner.calledCount([[0, 0, 1, 2, 3]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, 1]);
  });

  it("HackWeakenGrowWeaken", async () => {
    const ns = new NSMock();
    const runner = new TestBatchRunner(
      ns,
      [
        ServerActionType.Hack,
        ServerActionType.Weaken,
        ServerActionType.Grow,
        ServerActionType.Weaken,
      ],
      2,
    );
    runner.setCount(-1);
    runner.start();
    await vi.advanceTimersByTimeAsync(4000);
    runner.calledCount([[0, 0, 2, 4, 1]]);
    await vi.advanceTimersByTimeAsync(4500);
    runner.calledCount([[0, 0, 2, 4, 2]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, -1]);
    await vi.advanceTimersByTimeAsync(5000);
    runner.calledCount([[0, 0, 2, 4, 3]]);
    expect(runner.serverActionPorts.getActionInfo()).toEqual([0, 0, -1]);
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
