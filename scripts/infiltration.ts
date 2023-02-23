import { infiltrationSolver } from "$src/exploits/infiltration/infiltrationSolver";
import { InfiltrationMocks } from "$src/exploits/infiltration/InfiltrationMocks";
import type { NS } from "$src/types/gameTypes";
import { validateFlags } from "$src/utils/validateFlags";

export type InfiltrationArgs = {
  loc: string;
  money: number;
  count: number;
};

export async function main(ns: NS) {
  const [ok, flags] = validateFlags<InfiltrationArgs>(ns, [
    ["string", "loc", "Location <label><num>.", ""],
    ["number", "money", "Target Money", 0],
    ["number", "count", "Count", 0],
  ]);
  if (!ok) return;

  const loc = flags.loc.charAt(0);
  const num = parseInt(flags.loc.slice(1));
  let count = flags.count;

  ns.tprintf("loc=%s-%d targetMoney=%d count=%d", loc, num, flags.money, count);
  await ns.sleep(250);

  let player = ns.getPlayer();
  while ((flags.money !== 0 && player.money < flags.money) || (flags.count !== 0 && count > 0)) {
    await infiltrationSolver(new InfiltrationMocks(), loc, num);
    player = ns.getPlayer();
    count--;
  }
}
