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

    if (player.samples.length === 6) {
        // Sample with the smallet rtt
        const best = player.samples.reduce((min, sample) => 
            sample.rtt < min.rtt ? sample : min)

        const offset = best.offset

        // Find median of rtt's and divide by 2
        const rtts = player.samples.map(i => i.rtt)
        const oneWay = getMedian(rtts) / 2
        const jitter = getStandardDeviation(rtts)

        const window = clamp(oneWay + 3 * jitter, 150, 500)
        player.offset = offset
        player.window = window

        console.log("Final offset: " + offset)
        console.log("Window: " + window)
    }
}




// Make this general later
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