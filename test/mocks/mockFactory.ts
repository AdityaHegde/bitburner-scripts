import type { Metadata } from "$src/metadata/metadata";
import { MockedServer } from "./MockedServer";
import { NSMock } from "./NSMock";

export function getNSMock() {
  const ns = new NSMock();
  ns.addServer(new MockedServer("home", 0, 1, 0, 1, 0, 8, 0, 0));
  ns.addServer(new MockedServer("n00dles", 0, 1, 1000, 1, 50, 8, 25, 0.02));
  ns.addServer(new MockedServer("foodnstuff", 0, 3, 2000, 1, 20, 16, 35, 0.025));
  ns.addServer(new MockedServer("joesguns", 0, 5, 5000, 10, 10, 8, 45, 0.05));
  ns.addServer(new MockedServer("sigma-cosmetics", 0, 5, 6000, 10, 30, 16, 40, 0.015));
  return ns;
}

export function getMockedMetadata(): Metadata {
  return {
    runnerServer: "foodnstuff",
    newServers: ["n00dles", "foodnstuff", "joesguns", "sigma-cosmetics"],
  };
}
