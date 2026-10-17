import { test, expect } from "bun:test";
import { generateWords } from "../generate";

test("same seed gives the same words", () => {
  const a = generateWords(42, 50);
  const b = generateWords(42, 50);
  expect(a).toEqual(b);
});

test("returns exactly count words", () => {
  expect(generateWords(42, 50)).toHaveLength(50);
});

test("no word repeats its neighbour", () => {
  const words = generateWords(42, 1000);
  for (let i = 1; i < words.length; i++) {
    expect(words[i]).not.toBe(words[i - 1]);
  }
});

test("throws on a list with fewer than 2 words", () => {
  expect(() => generateWords(1, 5, ["solo"])).toThrow();
});


test("asking for more words never changes the earlier ones", () => {
  const short = generateWords(42, 50);
  const long = generateWords(42, 500);
  expect(long.slice(0, 50)).toEqual(short);
});