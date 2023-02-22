import { infiltrationSolver } from "$src/exploits/infiltration/infiltrationSolver";
import { InfiltrationMocks } from "$src/exploits/infiltration/InfiltrationMocks";
import type { NS } from "$src/types/gameTypes";

export async function main(ns: NS) {
  const targetMoney = Number(ns.args[2]);

  let player = ns.getPlayer();
  while (player.money < targetMoney) {
    await infiltrationSolver(new InfiltrationMocks(), ns.args[0] as string, Number(ns.args[1]));
    player = ns.getPlayer();
  }
}
