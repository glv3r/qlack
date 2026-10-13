// Methods/functions for game functionality

import type { Keystroke, RaceState, Word } from "./types";

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