import type { Player } from "./lobby/rooms";

export type ClientMessage = 
    | { type: "create_room", name: string }
    | { type: "join_room", code: string, name: string }
    | { type: "start", mode: RaceMode }
    | { type: "pong", id: string, clientTime: number }
    | { type: "keys", keys: { key: string, t: number }[] }


export type ServerMessage = 
    | { type: "joined", code: string, you: string, hostId: string, players: {id: string, name: string}[] }
    | { type: "countdown", seed: number, mode: RaceMode, startAt: number }
    | { type: "lobby_update", hostId: string, players: {id: string, name: string}[] }
    | { type: "error", message: string }
    | { type: "room_closed" }
    | { type: "ping", id: string }
    | { type: "carets", carets: { id: string, wordIndex: number, charIndex: number }[] }
    | { type: "standings", wpms: number[], you?: number }

export type KeyVerdict =
    | { ok: true,  time: number, clamped: boolean }
    | { ok: false, reason: string }

export type RaceMode =
  | { kind: "timer",   duration: 15 | 30 | 60 }
  | { kind: "passage", words: 25 | 50 }

