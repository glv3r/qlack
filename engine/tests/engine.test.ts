import { test, expect } from "bun:test";
import { applyKey, initialState, passageRuleset, replay, stats, timerRuleset } from "../engine";
import type { Keystroke } from "../types";
import { isStatement } from "typescript";

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
  expect(final.words[0]?.typed).toBe("thee");
  expect(final.wordIndex).toBe(1)
  expect(final.correctKeystrokes / final.keystrokesCounted).toBe(3/5)

})

test("keys past the last word are ignored", () => {
  const state = initialState(["the"])
  const k = keys("the x")
  const final = k.reduce(applyKey, state);
  expect(final.keystrokesCounted).toBe(4)
})

test("WPM calculation (locked with space)", () => {
  const state = initialState(["the", "cat"])
  const k = keys("the cat ")
  const final = k.reduce(applyKey, state)
  const s = stats(final, 6000)
  expect(s.netWPM).toBe(16)
})

test("WPM calculation (clean finish)", () => {
  const state = initialState(["the", "cat"])
  const k = keys("the cat")
  const final = k.reduce(applyKey, state)
  const s = stats(final, 6000)
  expect(s.netWPM).toBeCloseTo(14)
})

test("timer stops at the duration", () => {
  const state = initialState(["the", "cat"]);
  expect(timerRuleset(1000).shouldStop(state, 999)).toBe(false);
  expect(timerRuleset(1000).shouldStop(state, 1000)).toBe(true);
})

test("passage ends on a correct last word or a locking space", () => {
    const state = initialState(["the", "cat"])
    const k1 = keys("the ca");
    const k2 = keys("the cat");
    const k3 = keys("the cax");
    const k4 = keys("the cax ");

    const final1 = k1.reduce(applyKey, state)
    const final2 = k2.reduce(applyKey, state)
    const final3 = k3.reduce(applyKey, state)
    const final4 = k4.reduce(applyKey, state)

    expect(passageRuleset.shouldStop(final1, 6000)).toBe(false)
    expect(passageRuleset.shouldStop(final2, 6000)).toBe(true)
    expect(passageRuleset.shouldStop(final3, 6000)).toBe(false)
    expect(passageRuleset.shouldStop(final4, 6000)).toBe(true)
})


test("Replay with passage ruleset", () => {
  const k = keys("the cat x")
  const final = replay(["the", "cat"], k, passageRuleset)
  expect(final.stopped).toBe(true)
  expect(final.words[1]?.typed).toBe("cat")
  expect(final.wordIndex).toBe(1)  
})

test("Replay with timer ruleset", () => {
  const k = keys("the cat x")
  const final = replay(["the", "cat"], k, timerRuleset(300))

  expect(final.stopped).toBe(true)
  expect(final.words[0]?.typed).toBe("the")
  expect(final.wordIndex).toBe(0)  
})






// Helper function
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