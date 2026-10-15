
type shouldStop = (state: RaceState, t: number) => boolean

export type Keystroke =
  | { kind: "char"; char: string; t: number }
  | { kind: "space"; t: number }
  | { kind: "backspace"; t: number };

export type Word = {
    target: string,
    typed: string // can run longer than the target
}

export type RaceState = {
    words: Word[],
    wordIndex: number,
    keystrokesCounted: number,
    correctKeystrokes: number,
    stopped: boolean
}

export type Ruleset = {
    shouldStop: shouldStop
}