import { makeRng } from "./rng";
import { WORDS } from "./words";


export function generateWords(seed: number, count: number, list: readonly string[] = WORDS): string[]{
    const pick = () => list[Math.floor(rng.next() * list.length)]!
    const result: string[] = []

    if (list.length < 2) throw new Error("word list needs at least 2 words")

    const rng = makeRng(seed)

    for (let i = 0; i < count; i++){
        let word = pick()
        
        while (word === result.at(-1)){   
            word = pick()
        }

        result.push(word)
    }

    return result
}