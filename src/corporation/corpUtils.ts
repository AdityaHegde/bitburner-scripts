import { waitUntil } from "$server/utils/asyncUtils";
import type { NS } from "$src/types/gameTypes";
import type { DivisionManager } from "$src/corporation/DivisionManager";

export const WilsonAnalytics = "Wilson Analytics";

export async function nextCorpTick(ns: NS) {
  await waitUntil(() => ns.corporation.getCorporation().state !== "START", -1, 10);
  await waitUntil(() => ns.corporation.getCorporation().state === "START", -1, 10);
}

export async function waitForFunds(ns: NS, division: DivisionManager, funds: number) {
  while (ns.corporation.getCorporation().funds < funds) {
    await nextCorpTick(ns);
    division.process();
  }
}
