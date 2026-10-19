import type { Player } from "./rooms";

export type ClientMessage = 
    | { type: "create_room", name: string }
    | { type: "join_room", code: string, name: string }
    | { type: "start" };


export type ServerMessage = 
    | { type: "joined", code: string, you: string, hostId: string, players: {id: string, name: string}[] }
    | { type: "lobby_update", hostId: string, players: {id: string, name: string}[] }
    | { type: "error", message: string }
    | { type: "room_closed" }