import { PlayerServerPrefix } from "$scripts/constants";

export function isPlayerServer(server: string) {
  return server.startsWith(PlayerServerPrefix) || server === "home";
}
