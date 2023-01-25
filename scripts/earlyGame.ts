import { getEarlyGameRunner } from "$src/runner/runnerFactories";
import type { NS } from "$src/types/gameTypes";

export async function main(ns: NS) {
  const runner = getEarlyGameRunner(ns);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await runner.run();
    await ns.sleep(50);
  }
}
