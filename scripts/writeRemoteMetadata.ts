import type { NS } from "../src/types/gameTypes";

export async function main(ns: NS) {
  const file = ns.args[0] as string;
  ns.write(file, ns.args[1] as string, "w");
}
