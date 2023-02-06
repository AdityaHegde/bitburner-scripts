import type { NS } from "$src/types/gameTypes";
import { ServerActionType } from "$src/servers/server-actions/serverActionType";
import { ServerActionRunner } from "$src/servers/server-actions/action-runner/serverActionRunner";

export async function main(ns: NS) {
  const runner = ServerActionRunner.fromNS(ns, ServerActionType.SharePower, async () => {
    await ns.share();
    return 0;
  });
  return runner.start();
}
