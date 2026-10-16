import { test, expect } from "bun:test";
import { makeRng } from "../rng";

test("same seed gives the same sequences", () => {
  let t1 = makeRng(65);
  let t2 = makeRng(65);

  const seqA = Array.from({ length: 5 }, () => t1.next())
  const seqB = Array.from({ length: 5 }, () => t2.next())
  expect(seqA).toEqual(seqB)  
});


test("different seed, different sequence", () => {
  let t1 = makeRng(65);
  let t2 = makeRng(66);

  const seqA = Array.from({ length: 5 }, () => t1.next())
  const seqB = Array.from({ length: 5 }, () => t2.next())
  expect(seqA).not.toEqual(seqB)
})

test("numbers stay in [0, 1)", () => {
    let t1 = makeRng(65)

    const seqA = Array.from({ length: 1000 }, () => t1.next())

    seqA.forEach(element => {
        expect(element).toBeGreaterThanOrEqual(0)
        expect(element).toBeLessThan(1)
    });
})