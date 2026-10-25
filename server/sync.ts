// We calculate each player's offset and window for error here,
// and initially we were just syncing with 6 samples strictly, but
// some decisions were made later on because we should only need about 3
// samples to make a good calculation of a player's offset and window and the likes
// and because of connection issues a player can have, they might not get to the
// 6 samples and they'll drop off. So instead we add a deadline instead of a count, 
// so a player can try up to 3 times to sync and get 3+ samples for us to make the window
// calculations. That way, anyone who can't make 3/6 in 3 tries is just dropped off



import { send } from "./messages";
import type { ClientMessage, ServerMessage } from "./protocol";
import { rooms, type Player, type SocketData } from "./rooms";
import type { ServerWebSocket } from "bun";

export function startSync(player: Player){
    player.pending.clear()
    player.samples = []

    if (player.ws.data.roomCode){
        for (let i = 0; i <= 5; i++){
            setTimeout(() => {
                // if socket is no longer open, stop pinging
                if (player.ws.readyState !== 1) return; 
                const id = crypto.randomUUID()
                player.pending.set(id, performance.now())
                send(player.ws, { type: "ping", id: id })
            }, i * 100)
        }

        setTimeout(() => finishSync(player), 1500)
    }
}

export function handlePong(ws: ServerWebSocket<SocketData>, msg: Extract<ClientMessage, { type: "pong" }>){
    const code = ws.data.roomCode

    if (!code) return;
    const player = rooms.get(code)?.players.get(ws.data.playerId)

    if(!player) return;

    if (typeof msg.clientTime !== "number") return;

    const sentAt = player.pending.get(msg.id)

    // Silent returns all round cause it's a background task
    // we don't need to show anything to the user
    if (sentAt === undefined) return;

    // Each ping counts once, to avoid client sending multiple pongs
    // with the same id and make two copies of one sample
    player.pending.delete(msg.id)

    const now = performance.now()
    const rtt = now - sentAt
    const offset = msg.clientTime - (sentAt + rtt / 2)
    player.samples.push({ rtt, offset })
}

export function finishSync(player: Player){
    if (player.ws.readyState !== 1) return;

    player.pending = new Map()

    if (player.samples.length < 3){
        if (player.syncAttempts < 3){
            player.syncAttempts++
            startSync(player)
            return;
        } else {
            console.log("Sync failed.")
            return;
        }
    }

    // Sample with the smallet rtt
    const best = player.samples.reduce((min, sample) => 
        sample.rtt < min.rtt ? sample : min)

    const offsetBest = best.offset

    // Find median of rtt's and divide by 2
    const rtts = player.samples.map(i => i.rtt)
    const oneWay = getMedian(rtts) / 2
    const jitter = getStandardDeviation(rtts)
    const window = clamp(oneWay + 3 * jitter, 150, 500)
    
    player.sync = { offset: offsetBest, window: window, errorBound: best.rtt / 2 }
    player.syncAttempts = 0;
    console.log("Final offset: " + offsetBest)
    console.log("Window: " + window)
}




function getMedian(arr: number[]): number{
    // ascending order (sorting a copy, not the original)
    const sorted = [...arr].sort((a, b) => a - b)
    
    const n = sorted.length
    const mid = Math.floor(n / 2)

    if (n % 2 !== 0) {
        return sorted[mid]!
    } else {
        return (sorted[mid - 1]! + sorted[mid]!) / 2 
    }
}

function getStandardDeviation(arr: number[]) {
  const n = arr.length
  const mean = arr.reduce((a, b) => a + b) / n
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function clamp(value: number, min: number, max: number){
    return Math.min(Math.max(value, min), max)
}