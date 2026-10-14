import { test, expect } from "bun:test";
import { applyKey, initialState } from "./engine";
import type { Keystroke } from "./types";

test("types a clean word", () => {
  const state = initialState(["the"]);
  const k = keys("the")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(1)
});

test("mistakes are left behind", () => {
  const state = initialState(["the", "cat"]);
  const k = keys("teh cat")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("teh");
  expect(final.words[1]?.typed).toBe("cat");
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(4/7)
});

test("an erased mistake still counts", () => {
  const state = initialState(["the"]);
  const k = keys("tx<he")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(3/4)
});

test("can't backspace into a correct word", () => {
  const state = initialState(["the", "cat"])
  const k = keys("the <")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.wordIndex).toBe(1)
})


test("can backspace into a word with a mistake", () => {
  const state = initialState(["the", "cat"])
  const k = keys("teh <")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("teh");
  expect(final.wordIndex).toBe(0)
})

test("old state never changes", () => {
  const state = initialState(["the"])
  applyKey(state, { kind: "char",  char: "t", t: 0 })
  expect(state.words[0]?.typed).toBe("");
  expect(state.keystrokesCounted).toBe(0)
})

test("leading spaces are ignored", () => {
  const state = initialState(["the"])
  const k = keys(" the")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.wordIndex).toBe(0)
})

test("extra chars stay and count as misses", () => {
  const state = initialState(["the", "cat"])
  const k = keys("thee ")
  const final = k.reduce(applyKey, state);
  expect(final.words[0]?.typed).toBe("the");
  expect(final.wordIndex).toBe(1)
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(3/5)

})

test("keys past the last word are ignored", () => {
  const state = initialState(["the"])
  const k = keys("the x")
  const final = k.reduce(applyKey, state);
  expect(final.keystrokesCounted).toBe(4)
})


// Helper functions

export function keys(s: string): Keystroke[] {
    const keystroke: Keystroke[] = []
    const splitted = s.split("")

    splitted.forEach((ch, index) => {
        switch(ch){
            case " ":
                keystroke.push({ kind: "space", t: index * 100 })
                break;

            case "<":
                keystroke.push({ kind: "backspace", t: index * 100 })
                break;

            default:
                keystroke.push({ kind: "char", char: ch, t: index * 100 })
                break;
        }
    })

    return keystroke
}