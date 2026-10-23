import type { ServerWebSocket } from "bun";

export const rooms = new Map<string, Room>()

export type SocketData = {
    playerId: string,
    roomCode?: string
}

export type Sample = { 
    rtt: number, 
    offset: number 
}

export type Player = {
    id: string,
    name: string,
    ws: ServerWebSocket<SocketData>,
    // Remember to remove optional for bottom two
    pending: Map<string, number>,
    samples: Sample[],
    window?: number,
    offset?: number
}

export type Room = {
    code: string
    phase: "lobby",
    hostId: string,
    players: Map<string, Player>,
    lastActivity: number
}

