import { test, expect } from "bun:test";
import { applyKey, initialState } from "./engine";
import type { Keystroke } from "./types";

test("types a clean word", () => {
  const state = initialState(["the"]);
  const keys: Keystroke[] = [
    { kind: "char", char: "t", t: 0 },
    { kind: "char", char: "h", t: 0 },
    { kind: "char", char: "e", t: 0 },
  ]; 
  const final = keys.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(1)
});
