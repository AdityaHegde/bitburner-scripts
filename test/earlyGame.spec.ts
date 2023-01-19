import { asyncWait } from "$server/utils/asyncUtils";
import { describe, it } from "vitest";
import { getEarlyGameRunner } from "../scripts/earlyGame";
import { getNSMock } from "./mocks/mockFactory";

describe("earlyGame", () => {
  it("happy path", async () => {
    const ns = getNSMock();
    const runner = getEarlyGameRunner(ns);
    for (let i = 0; i < 1000; i++) {
      await runner.run();
      await asyncWait(1);
    }
  });
});
