// Methods/functions for game functionality

import type { Keystroke, RaceState, Ruleset, Word } from "./types";

export function initialState(targetWords: string[]): RaceState {
    const s: RaceState = {
        words: [],
        wordIndex: 0,
        keystrokesCounted: 0,
        correctKeystrokes: 0,
        stopped: false
    }
    
    
    targetWords.forEach((w) => {
        let word = { target: w, typed: "" }
        s.words.push(word)
    })

    return s
}

export function applyKey(state: RaceState, keystroke: Keystroke): RaceState {
    if (!state.words[state.wordIndex]) return state;

    
    const s: RaceState = { ...state }
    const words = [...state.words]
    const word = { ...state.words[state.wordIndex]! }
    words[state.wordIndex] = word
    s.words = words

    const slot = word.typed.length
    const expected = word.target[slot]


    switch (keystroke.kind){
        // In the case of a character we just increment our keystrokes
        // and if it's also correct, increment our correct ones, then
        // we append that character to the word's typed

        case "char":
            s.keystrokesCounted++;

            if (keystroke.char === expected) {
                s.correctKeystrokes++;
            }

            word.typed += keystroke.char

            break;

        // In the case of a space, if there's no word we're typing, nothing
        // happens, but if we input a space at the right place (between two words), 
        // we increment keystrokes and our correct counter as well, and then
        // we move to the next word
        
        case "space":
            if (word.typed === "") return s

            s.keystrokesCounted++;
            
            if (word.typed === word.target) {
                s.correctKeystrokes++;
            }

            s.wordIndex++
            break;
        
        // In the case of a backspace, we first of all check for the
        // previous word, and whether the word we're on has been typed to a point.
        // if it's the case that it has we just remove the last character, else
        // if the prev. word we typed isn't the same as what it's supposed to be,
        // we move back to that word so we can type there

        case "backspace": {
            const previous = s.words[s.wordIndex - 1]

            if (word.typed.length > 0) {
                word.typed = word.typed.slice(0, -1)
            } else if (previous?.typed !== previous?.target) {
                s.wordIndex--
            }

            break;
        }

    }

    return s
}

export function stats(state: RaceState, elapsedMs: number): { netWPM: number, accuracy: number } {
    // calculate accuracy so far
    let accuracy;
    accuracy = state.keystrokesCounted === 0 ?  0 : state.correctKeystrokes / state.keystrokesCounted;

    // Calculate WPM
    let chars = 0;
    
    for (const word of state.words.slice(0, state.wordIndex)){
        if (word.typed === word.target) chars += word.target.length + 1
    }

    const last = state.words[state.wordIndex]

    if (last && state.wordIndex === state.words.length - 1 && last.typed === last.target){
        chars += last.target.length
    }

    const minutes = elapsedMs / 60000
    const netWPM = (chars / 5) / minutes

    return { netWPM, accuracy }
}

// Rulesets for how a game ends
// Timer ruleset: shouldStop becomes true once the time is up
export function timerRuleset(durationMs: number): Ruleset {
    return {
        shouldStop: (state, t) => (t >= durationMs)
    }
}

// passage ruleset: shouldStop becomes true when we're either:
// - past the last word, or
// - we're on the last word and it's typed correctly
export const passageRuleset: Ruleset = {
    shouldStop: (state, t) => 
        ((state.wordIndex >= state.words.length) || 
            (state.wordIndex === state.words.length - 1 
                && state.words[state.wordIndex]?.typed === state.words[state.wordIndex]?.target))
}


// final piece of the engine: replay. Pieces everything together
export function replay(words: string[], keystrokes: Keystroke[], ruleset: Ruleset): RaceState {
    let state = initialState(words);

    for (const k of keystrokes){
        if (ruleset.shouldStop(state, k.t)){
            state = {...state, stopped: true}
            break;
        }
        
        state = applyKey(state, k)
    }

    return state
}
