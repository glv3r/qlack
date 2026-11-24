import type { ServerWebSocket } from "bun";
import type { AvatarKey, Keystroke, RaceState, RaceMode } from "@qlack/engine";

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
    state?: RaceState,
    finishedAt?: number
    token: string
    disconnected?: boolean,
    dnf?: boolean
    graceTimer?: Timer,
    avatar?: AvatarKey
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
    tick?: Timer
    endTimer?: Timer
}

