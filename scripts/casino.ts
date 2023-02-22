import type { NS } from "$src/types/gameTypes";
import { roulette } from "$src/exploits/casino/roulette";

export async function main(ns: NS) {
  await roulette(ns);
}
