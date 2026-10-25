import type { KeyVerdict } from "./protocol";
import type { ClockSync, Player } from "./rooms";

const LAG_ON = process.env.QLACK_LAG === "1"

export function checkKey(stamp: number, arrivedAt: number, sync: ClockSync, lastTime: number): KeyVerdict {
    const pressed = stamp - sync.offset
    const transit = arrivedAt - pressed

    // This check tells us that it claims to have been 
    // pressed after it arrived, by more than the sync error allows

    if (transit < -sync.errorBound!) return { ok: false, reason: "from the future" }

    // It claims to be older than a key already accepted
    if (pressed < lastTime) return { ok: false, reason: "went backwards" }

    if (transit < 0) return { ok: true, time: arrivedAt, clamped: true }

    if (transit > sync.window) return { ok: true, time: arrivedAt - sync.window, clamped: true }

    return { ok: true, time: pressed, clamped: false }
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lag(fn: () => void){
    if (!LAG_ON) {
        fn();
        return;
    }

    if (Math.random() < 0.1) return;

    setTimeout(fn, getRandomInt(20, 200))
}