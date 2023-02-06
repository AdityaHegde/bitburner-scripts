import type { PortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";

export type ScriptStoppedPacket = PortPacket<
  PortPacketType.ScriptStopped,
  {
    script: string;
  }
>;

export function newScriptStoppedPacket(script: string): ScriptStoppedPacket {
  return {
    type: PortPacketType.ScriptStopped,
    script,
  };
}
