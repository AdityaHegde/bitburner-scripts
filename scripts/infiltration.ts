import { infiltrationSolver } from "$src/exploits/infiltration/infiltrationSolver";
import { InfiltrationMocks } from "$src/exploits/infiltration/InfiltrationMocks";
import type { NS } from "$src/types/gameTypes";

export async function main(ns: NS) {
  const count = Number(ns.args[2]);

  for (let i = 0; i < count; i++) {
    await infiltrationSolver(new InfiltrationMocks(), ns.args[0] as string, Number(ns.args[1]));
  }
}
