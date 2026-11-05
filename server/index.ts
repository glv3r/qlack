import { broadcast, publish, send } from "./messages";
import type { ClientMessage } from "./protocol";
import { rooms, type Player, type Room, type SocketData } from "./lobby/rooms";
import type { ServerWebSocket } from "bun";
import { handlePong, startSync } from "./lobby/sync";
import { DROP_ON, lag } from "./lobby/timing";
import { handleKeys, handleStartRace } from "./race";


const IDLE_MS  = 10 * 60 * 1000 
const SWEEP_MS = 60 * 1000

setInterval(() => {
    rooms.forEach((room, code) => {
        if ((Date.now() - room.lastActivity) > IDLE_MS){
            closeRoom(code, room)   
        }
    })
}, SWEEP_MS)

export const server = Bun.serve<SocketData>({
  port: 3000,
  // Makes it reacheable from other machines on the
  // same network
  hostname: "0.0.0.0",

  // Evey connection starting out as a normal HTTP request
  fetch(req, server) {
    // switch it to a websocket
    if (server.upgrade(req, { data: { playerId: crypto.randomUUID(), lastRelease: { in: 0, out: 0 } } })) {
      return;
    } else {
      return new Response("Not a websocket!");
    }
  },
  websocket: {
    open(ws) {
      console.log("Connected!: ", ws.data.playerId);
    },
    message(ws, raw) {
      lag(ws, "in", () => handleMessage(ws, raw), false)
    },
    close(ws) {
      handleLeaveRoom(ws)
      console.log("Disconnected: ", ws.data.playerId);
    },
  },
});













// Helper functions for server
export function roomTopic(code: string) {
  return "Room: " + code;
}

function playerMapping(r: Room): {id: string, name: string}[] {
    return [...r.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
    }));
}

function generateCode(): string {
  const characters: string = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code: string;

  do {
    code = "";

    // Generating code of length 4
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(Math.random() * characters.length);
      code += characters[r];
    }
  } while (rooms.has(code));

  return code;
}

function handleCreateRoom(ws: ServerWebSocket<SocketData>, msg: Extract<ClientMessage, { type: "create_room" }>) {
  console.log("Create: ", msg.name);

  if (typeof msg.name !== "string") {
    send(ws, { type: "error", message: "invalid name" });
    return;
  }

  const name = msg.name.trim();

  if (name.length > 16 || name === "") {
    send(ws, { type: "error", message: "invalid name" });
    return;
  }

  if (ws.data.roomCode) {
    send(ws, { type: "error", message: "already in a room" });
    return;
  }

  const code = generateCode();
  const room: Room = {
    code: code,
    phase: "lobby",
    hostId: ws.data.playerId,
    players: new Map<string, Player>(),
    lastActivity: Date.now()
  };

  const thisPlayer: Player = {
    id: ws.data.playerId,
    name: name,
    ws: ws,
    pending: new Map(),
    samples: [],
    syncAttempts: 0,
    keystrokes: [],
    lastTime: 0
  }

  room.players.set(ws.data.playerId, thisPlayer);

  rooms.set(code, room);

  ws.data.roomCode = code;
  ws.subscribe(roomTopic(code));

  const players = playerMapping(room)
  
  send(ws, { type: "joined", code: code, you: ws.data.playerId, hostId: ws.data.playerId, players: players });
  startSync(thisPlayer)
}

function handleJoinRoom(ws: ServerWebSocket<SocketData>, msg: Extract<ClientMessage, { type: "join_room" }>){
    if (typeof msg.name !== "string") {
    send(ws, { type: "error", message: "invalid name" });
    return;
  }

  const name = msg.name.trim();


  if (name.length > 16 || name === "") {
    send(ws, { type: "error", message: "invalid name" });
    return;
  }

  if (typeof msg.code !== "string") {
    send(ws, { type: "error", message: "invalid code" });
    return;
  }

  const code = msg.code.trim().toUpperCase()

  if (ws.data.roomCode) { 
    send(ws, { type: "error", message: "already in a room" })
    return; 
  }

  const room = rooms.get(code)

  if (!room){
    send(ws, { type: "error", message: "room not found" })
    return;
  }

  if (room.phase !== 'lobby') {
    send(ws, { type: "error", message: "race in progress" })
    return;
  }
  
  if (room.players.size >= 8) { 
    send(ws, { type: "error", message: "room full" })
    return;
  }

  const thisPlayer: Player = {
    id: ws.data.playerId,
    name: name,
    ws: ws,
    pending: new Map(),
    samples: [],
    syncAttempts: 0,
    keystrokes: [],
    lastTime: 0
  }

  room.players.set(ws.data.playerId, thisPlayer)

  ws.data.roomCode = code
  ws.subscribe(roomTopic(code))

  const players = playerMapping(room)

  send(ws, { type: "joined", code: code, you: ws.data.playerId, hostId: room.hostId, players: players });
  publish(ws, roomTopic(code), { type: "lobby_update", hostId: room.hostId, players: players })
  startSync(thisPlayer)

}

function handleLeaveRoom(ws: ServerWebSocket<SocketData>){
    const code = ws.data.roomCode

    if (!code) return;

    const room = rooms.get(code)

    if (!room) return;

    room.players.delete(ws.data.playerId)

    if (room.players.size === 0) {
        closeRoom(room.code, room)
        return;
    }

    

    if (ws.data.playerId === room.hostId){
        room.hostId = room.players.keys().next().value!
    }

    const players = playerMapping(room)
    broadcast(roomTopic(code), { type: "lobby_update", hostId: room.hostId, players: players })
}


function handleMessage(ws: ServerWebSocket<SocketData>, raw: string | Buffer<ArrayBuffer>){
    const senderCode = ws.data.roomCode

      const room = senderCode ? rooms.get(senderCode) : undefined

      if (room) room.lastActivity = Date.now()
      
      let data: unknown;

      const rawString =
        typeof raw === "string" ? raw
          : new TextDecoder().decode(raw as Buffer<ArrayBuffer>);

      try {
        data = JSON.parse(rawString);
      } catch (error) {
        send(ws, { type: "error", message: "bad json" });
        return;
      }

      if (data === null || typeof data !== "object" || !("type" in data) || typeof data.type !== "string") {
        send(ws, { type: "error", message: "bad message" });
        return;
      }

      const msg = data as ClientMessage;

      switch (msg.type) {
        case "create_room": 
            handleCreateRoom(ws, msg)
            break;

        case "join_room":
            handleJoinRoom(ws, msg)
            break;

        case "start":
            handleStartRace(ws, msg)
            break;

        case "pong":
            if (DROP_ON && Math.random() < 0.1) return;
            handlePong(ws, msg)
            break;

        case "keys":
            handleKeys(ws, msg);
            break;

        default:
            send(ws, { type: "error", message: "unknown type" });
      }
}

function closeRoom(code: string, room: Room){
  clearInterval(room.tick)

    for (const player of room.players.values()){
        send(player.ws, { type: "room_closed" })
        player.ws.data.roomCode = undefined
        player.ws.unsubscribe(roomTopic(code))
    }

    rooms.delete(code)
}