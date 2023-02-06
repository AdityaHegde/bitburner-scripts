import type { NS } from "$src/types/gameTypes";
import { SyncedServerActionRunner } from "$src/servers/server-actions/action-runner/syncedServerActionRunner";
import { ServerActionType } from "$src/servers/server-actions/serverActionType";

export async function main(ns: NS) {
  const runner = SyncedServerActionRunner.fromNS(
    ns,
    ServerActionType.Grow,
    async (server: string) => {
      return ns.grow(server);
    },
  );
  return runner.start();
}
