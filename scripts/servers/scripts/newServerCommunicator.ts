import type { NS } from "$scripts/types/gameTypes";
import { writePacketToPort } from "$scripts/utils/portCommunication";
import { NewServerCommunicationPort } from "$scripts/servers/helpers/newServerHelpers";
import type { NewServerPacket } from "$scripts/servers/helpers/newServerHelpers";

export async function main(ns: NS) {
  const type = Number(ns.args[0]);
  const servers = ns.args.slice(1) as Array<string>;
  const packet: NewServerPacket = [type, ...servers];
  await writePacketToPort(ns, ns.getPortHandle(NewServerCommunicationPort), packet);
}
