import type { NS } from "../../types/gameTypes";
import { wrapAction } from "../../utils/wrapAction";

export async function main(ns: NS) {
  await wrapAction(ns, async (server: string) => {
    await ns.weaken(server);
  });
}
