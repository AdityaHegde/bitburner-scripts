import { readFile, writeFile } from "node:fs/promises";
import { compile } from "svelte/compiler";

(async () => {
  const { js } = compile((await readFile("web/lib/Home.svelte")).toString(), {
    name: "Home",
  });
  await writeFile("web/lib/Home.ts", js.code);
})();
