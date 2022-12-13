import type { NS } from "../types/gameTypes";

export async function wrapAction(ns: NS, callback: (server: string) => Promise<void>) {
  const server = ns.args[0] as string;
  const times = Number(ns.args[1] ?? -1);

  let count = 0;

  while (times === -1 || count < times) {
    count++;
    await callback(server);
    await ns.sleep(500);
  }
}
