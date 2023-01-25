import type { NS } from "$src/types/gameTypes";
import Home from "../web/lib/Home";

export async function main(ns: NS) {
  const ui = document.createElement("div");
  document.body.append(ui);
  new Home({
    target: ui,
    props: {},
  });

  ns.atExit(() => {
    ui.remove();
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await ns.asleep(100);
  }
}
