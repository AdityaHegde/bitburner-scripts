import { WebSocketServer } from "ws";
import { gameClient } from "./game-client";

const wss = new WebSocketServer({
  port: 3001,
});

wss.on("listening", () => console.log("Web socket started on 3001"));
wss.on("connection", (ws) => {
  gameClient.setSocket(ws);
  ws.once("close", () => {
    gameClient.setSocket(undefined);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  wss.close();
});
