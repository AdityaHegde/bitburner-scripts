import type { NS } from "../../types/gameTypes";
import {
  BatchActionMode,
  batchScriptAction,
} from "$scripts/hack/helpers/batching/batchScriptAction";

export const RepeatActionMode = "repeat";

export async function wrapAction(ns: NS, callback: (server: string) => Promise<void>) {
  const mode = ns.args[0] as string;

  switch (mode) {
    case RepeatActionMode:
      return repeatAction(ns, callback);
    case BatchActionMode:
      return batchScriptAction(ns, callback);
  }
}

async function repeatAction(ns: NS, callback: (server: string) => Promise<void>) {
  const server = ns.args[1] as string;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await callback(server);
    await ns.sleep(50);
  }
}
