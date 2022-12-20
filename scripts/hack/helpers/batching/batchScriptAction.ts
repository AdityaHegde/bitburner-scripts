import type { NS } from "$scripts/types/gameTypes";
import { readBatchPacket } from "$scripts/hack/helpers/batching/batchCommunications";
import { writePacketToPort } from "$scripts/utils/portCommunication";

export const BatchActionMode = "batch";

export async function batchScriptAction(ns: NS, callback: (server: string) => Promise<void>) {
  const readPortHandle = ns.getPortHandle(Number(ns.args[1]));
  const writePortHandle = ns.getPortHandle(Number(ns.args[2]));
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [server, start] = await readBatchPacket(ns, readPortHandle);
    await ns.sleep(start - Date.now());
    await callback(server);
    await writePacketToPort(ns, writePortHandle, [server, start, Date.now()]);
  }
}
