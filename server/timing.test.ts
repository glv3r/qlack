import { test, expect } from "bun:test";
import { checkKey } from "./timing";
import type { ClockSync } from "./rooms";

const sync: ClockSync = { offset: 5000, window: 150, errorBound: 40 };

test("accepts a key that arrived inside the window", () => {
  // pressed at 2000, 40 ms of transit
  expect(checkKey(7000, 2040, sync, 0)).toEqual({
    ok: true,
    time: 2000,
    clamped: false,
  });
});

test("clamps a key that took longer than the window to arrive", () => {
  // pressed at 1780, 280 ms of transit: pulled back to arrived - window
  expect(checkKey(6780, 2060, sync, 0)).toEqual({
    ok: true,
    time: 1910,
    clamped: true,
  });
});

test("rejects a key from further in the future than the error bound", () => {
  // claims to be pressed 60 ms after it arrived, past the 40 tolerance
  expect(checkKey(7100, 2040, sync, 0)).toEqual({
    ok: false,
    reason: "from the future",
  });
});

test("clamps a slightly-future key to its arrival time", () => {
  // 20 ms "future": within tolerance, so accepted at arrived
  expect(checkKey(7060, 2040, sync, 0)).toEqual({
    ok: true,
    time: 2040,
    clamped: true,
  });
});

test("rejects a key older than one already accepted", () => {
  // pressed at 1990, behind the key already accepted at 2000
  expect(checkKey(6990, 2045, sync, 2000)).toEqual({
    ok: false,
    reason: "went backwards",
  });
});
