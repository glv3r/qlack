import { broadcast, send } from "./messages";
import { type SocketData, rooms } from "./lobby/rooms";
import type { ServerWebSocket } from "bun";
import type { ClientMessage, RaceMode } from "./protocol";
import { checkKey } from "./lobby/timing";
import { applyKey, generateWords, initialState, stats, type Keystroke } from "@qlack/engine";
import { roomTopic } from ".";


export function handleStartRace(ws: ServerWebSocket<SocketData>, msg: Extract<ClientMessage, { type: "start" }>){
    const code = ws.data.roomCode
    if (!code) { 
        send(ws, { type: "error", message: "You're not in a room" });
        return;
    }

    const room = rooms.get(code)
    if (!room) {
        send(ws, { type: "error", message: "Not in a room" });
        return
    };

    if (ws.data.playerId !== room.hostId) {
        send(ws, { type: "error", message: "Only hosts are allowed to start the game." });
        return;
    }

    if (room.phase !== "lobby"){
        send(ws, { type: "error", message: "Race already started!" });
        return;
    }

    if(!isValidMode(msg.mode)) {
        send(ws, { type: "error", message: "Invalid race mode received" })
        return;
     }

    if (!Array.from(room.players.values()).every(p => p.sync)) {
        send(ws, { type: "error", message: "Waiting for everyone to sync before game starts" })
        return;
    }

    const mode = msg.mode
    const seed = Math.floor(Math.random() * Math.pow(2, 32))
    const startAt = performance.now() + 3000
    const phase = "countdown"

    room.seed = seed; room.startAt = startAt; room.mode = msg.mode; room.phase = phase;
    const count = mode.kind === "passage" ? mode.words : 200
    room.words = generateWords(seed, count) 

    room.players.forEach(p => {
        send(p.ws, { 
            type: "countdown", 
            seed: seed, 
            mode: mode, 
            // The gate above that checks if every player is synced
            // guarantees that we'll definitely have a value here
            startAt: startAt + p.sync!.offset}) 
        p.keystrokes = []
        p.lastTime = startAt
        // words is definitely generated so we can have the null bypass here
        p.state = initialState(room.words!) 
    });



    setTimeout(() => {
        if (rooms.get(code) !== room || room.phase !== "countdown") return;
        console.log("Counting down...")
        room.phase = "racing"

        let ticks = 0

        room.tick = setInterval(() => {
            const cts: { id: string, wordIndex: number, charIndex: number }[] = []
            room.players.forEach(p => {
                if (!p.state) return;
                cts.push({ id: p.id, wordIndex: p.state.wordIndex, charIndex: p.state.words[p.state.wordIndex]?.typed.length ?? 0})
            })

            broadcast(roomTopic(code), { type: "carets", carets: cts })
            ticks++;
            if (ticks % 10 !== 0) return;

            const elapsed = performance.now() - startAt
            const ranked = []

            for (const p of room.players.values()){
                if (!p.state) continue;
                ranked.push({ id: p.id, wpm: stats(p.state, elapsed).netWPM })
            }

            ranked.sort((a, b) => b.wpm - a.wpm)
            const wpms = ranked.map((p) => p.wpm )

            for (const p of room.players.values()){
                const you = room.players.size >= 3 ? ranked.findIndex(r => r.id === p.id) : undefined;
                you === -1 ? undefined : you
                send(p.ws, { type: "standings", wpms, you })
            }
        }, 100)
    }, 3000)
}

export function handleKeys(ws: ServerWebSocket<SocketData>, msg: Extract<ClientMessage, { type: "keys" }>){
    const code = (ws.data.roomCode)
    if (!code) { 
        send(ws, { type: "error", message: "You're not in a room" });
        return;
    }

    const room = rooms.get(code)
    if (!room) {
        send(ws, { type: "error", message: "Room doesn't exist" });
        return
    };

    const player = room.players.get(ws.data.playerId)

    if (room.phase !== "racing") return;

    if (!player?.sync) return;

    if (!player.state) return;

    if (!Array.isArray(msg.keys) || msg.keys.length > 50) return;

    const arrivedAt = performance.now()

    const startAt = room.startAt
    if (startAt === undefined) return;

    for (const raw of msg.keys){
        if (typeof raw.key !== "string" || typeof raw.t !== "number") continue;
        const stroke = toKeystroke(raw.key)

        if (stroke === null) continue;

        const verdict = checkKey(raw.t, arrivedAt, player.sync, player.lastTime)

        if (verdict.ok) {
            const key = { ...stroke, t: verdict.time - startAt }
            player.keystrokes.push(key)
            player.state = applyKey(player.state, key)
            console.log(player.state.wordIndex, player.state.words[player.state.wordIndex]?.typed)
            player.lastTime = verdict.time
            console.log("ok", stroke.kind, Math.round(verdict.time - startAt), verdict.clamped ? "clamped" : "");
        } else {
            console.log(verdict.reason) // Deliberately left blank for now
        }
    }

}

function isValidMode(m: unknown): m is RaceMode {
  if (typeof m !== "object" || m === null) return false;

  const mode = m as { kind?: unknown; duration?: unknown; words?: unknown };

  return (
    (mode.kind === "timer" && [15, 30, 60].includes(mode.duration as number)) ||
    (mode.kind === "passage" && [25, 50].includes(mode.words as number))
  );
}

function toKeystroke(key: string): { kind: "char", char: string} | { kind: "space" } | { kind: "backspace" } | null {
    if (key === " "){
        return { kind: "space" }
    } else if (key === "backspace"){
        return { kind: "backspace" }
    } else if (key.length === 1){
        return { kind: "char", char: key }
    } else {
        return null;
    }
}