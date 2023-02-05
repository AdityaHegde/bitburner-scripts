import { gameStore } from "$lib/stores/gameStore";
import { hackEntriesStore } from "$lib/stores/hackEntries";

try {
  const ws = new WebSocket("ws://localhost:3002");
  setupSocket(ws);
} catch (err) {
  // no-op
}

function setupSocket(ws: WebSocket) {
  ws.addEventListener("open", () => {
    console.log("Connected to server");
    ws.send("UI");
  });
  ws.addEventListener("message", (event) => {
    try {
      const json = JSON.parse(event.data);
      switch (json.type) {
        case "initData":
          gameStore.init(json.data);
          break;
        case "gameDataPatches":
          gameStore.update(json.data);
          break;

        case "initHackEntries":
          hackEntriesStore.init(json.data);
          break;
        case "hackEntriesPatches":
          hackEntriesStore.update(json.data);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  });
}
