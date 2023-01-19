import { HackType } from "$src/servers/hack/hackTypes";
import { wrapAction } from "$src/servers/hack/wrapAction";
import type { NS } from "$src/types/gameTypes";

export async function main(ns: NS) {
  await wrapAction(ns, HackType.Hack, async (server: string) => {
    await ns.hack(server);
  });
}
