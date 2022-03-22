import { NS } from "../../types/gameTypes";
import { Metadata, saveMetadata } from "../../types/Metadata";

export async function main(ns: NS) {
  const metadata: Metadata = JSON.parse(ns.args[0] as string);
  await saveMetadata(ns, metadata);
}
