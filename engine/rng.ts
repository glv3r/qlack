export function makeRng(seed: number){
    let state = seed

    return {
        next: () => {
            state = (Math.imul(1664525, state) + 1013904223) >>> 0
            return state / Math.pow(2, 32)
        }
    }
}