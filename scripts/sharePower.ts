import type { NS } from "$src/types/gameTypes";
import { ServerActionRunner } from "$src/servers/server-actions/serverActionRunner";
import { ServerActionType } from "$src/servers/server-actions/serverActionType";

export async function main(ns: NS) {
  const runner = ServerActionRunner.fromNS(ns, ServerActionType.SharePower, async () => {
    await ns.share();
    return 0;
  });
  return runner.start();
}
