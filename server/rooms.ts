import { idText, type Identifier } from "typescript";
import type { ServerWebSocket } from "bun";

export const rooms = new Map<string, Room>()

export type SocketData = {
    playerId: string,
    roomCode?: string
}

export type Player = {
    id: string,
    name: string,
    ws: ServerWebSocket<SocketData>
}

export type Room = {
    code: string
    phase: "lobby",
    hostId: string,
    players: Map<string, Player>,
    lastActivity: number
}

export type Rooms = Map<string, string>