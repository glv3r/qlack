import type { ServerWebSocket } from "bun";
import type { SocketData } from "./rooms";
import type { ServerMessage } from "./protocol";
import { server } from ".";


export function send(ws: ServerWebSocket<SocketData>, msg: ServerMessage) {
  // simplifying the send function for ws by explicitly typing msg
  // to our own ServerMessage type so we don't have to
  //  write the full thing
  ws.send(JSON.stringify(msg));
}

export function publish(ws: ServerWebSocket<SocketData>, topic: string, msg: ServerMessage) {
  // same concept as send
  ws.publish(topic, JSON.stringify(msg));
}

export function broadcast(ws: ServerWebSocket<SocketData>, topic: string, msg: ServerMessage) {
  // same concept as send & publish
  server.publish(topic, JSON.stringify(msg));
}
