import { NS } from "../types/gameTypes";

export function getBestTargetServer(
  ns: NS, servers: Array<string>, curHackingLevel: number,
) {
  let maxMoney = 0;
  let maxServer = "";

  for (const server of servers) {
    if (ns.getServerRequiredHackingLevel(server) > curHackingLevel) continue;

    const serverMoney = ns.getServerMaxMoney(server);
    if (serverMoney > maxMoney) {
      maxMoney = serverMoney;
      maxServer = server;
    }
  }

  return maxServer;
}
