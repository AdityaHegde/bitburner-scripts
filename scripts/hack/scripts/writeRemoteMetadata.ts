import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../types/Metadata";
import { saveMetadata } from "../../types/Metadata";

export async function main(ns: NS) {
  const metadata: Metadata = JSON.parse(ns.args[0] as string);
  saveMetadata(ns, metadata);
}
