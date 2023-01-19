import { PlayerServerPrefix } from "../constants";

export function isPlayerServer(server: string) {
  return server.startsWith(PlayerServerPrefix) || server === "home";
}
