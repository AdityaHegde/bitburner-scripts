import type { NS } from "$src/types/gameTypes";

export type FlagSchema = [
  type: "string" | "number" | "boolean",
  key: string,
  description: string,
  defValue: any,
  values?: Array<string>,
];

function printHelp(ns: NS, schema: Array<FlagSchema>) {
  ns.tprintf("Available Flags:\n");
  for (const [type, key, description, defValue, values] of schema) {
    ns.tprintf(
      `  --%s [%s]\n    %s (default %s) ${values ? "(values " + values.join(",") + ")" : ""}\n`,
      key,
      type,
      description,
      defValue,
    );
  }
}

export function validateFlags<Flags>(ns: NS, schema: Array<FlagSchema>): [boolean, Flags] {
  const flags = ns.flags(schema.map(([, key, , defValue]) => [key, defValue]));
  let valid = true;

  if (flags.help) {
    printHelp(ns, schema);
    return [false, undefined];
  }

  for (const [type, key, , , values] of schema) {
    if (type !== "string" || !values) continue;
    if (values.indexOf(flags[key] as string) >= 0) continue;
    ns.tprintf("Invalid %s=%s . Possible Values: %s\n", key, flags[key], values.join(","));
    valid = false;
  }

  return [valid, flags as Flags];
}
