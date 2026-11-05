import type { ServerWebSocket } from "bun";
import type { RaceMode } from "../protocol";
import type { Keystroke, RaceState } from "@qlack/engine";

export const rooms = new Map<string, Room>()

export type SocketData = {
    playerId: string,
    roomCode?: string,
    lastRelease: { in: number, out: number }
}

export type Sample = { 
    rtt: number, 
    offset: number 
}

export type ClockSync = {
    offset: number,
    window: number, 
    errorBound: number,
}

export type Player = {
    id: string,
    name: string,
    ws: ServerWebSocket<SocketData>,
    // Remember to remove optional for bottom two
    pending: Map<string, number>,
    samples: Sample[],
    sync?: ClockSync,
    keystrokes: Keystroke[],
    lastTime: number,
    syncAttempts: number,
    state?: RaceState
}

export type Room = {
    code: string
    phase: "lobby" | "countdown" | "racing" | "results",
    mode?: RaceMode,
    seed?: number,
    startAt?: number,
    hostId: string,
    players: Map<string, Player>,
    lastActivity: number,
    words?: string[],
    tick?: ReturnType<typeof setInterval>
}

