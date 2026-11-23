export type PlayerColor = 'lime' | 'pink' | 'sky' | 'lilac' | 'orange';

// Fill for anything carrying a player's colour, keyed on [data-color].
// A player colour is identity, not register: same fill everywhere, text always ink.
// Each class is written out in full so Tailwind can find it.
export const playerFill =
  'data-[color]:text-q-ink ' +
  'data-[color=lime]:bg-q-lime data-[color=pink]:bg-q-pink data-[color=sky]:bg-q-sky ' +
  'data-[color=lilac]:bg-q-lilac data-[color=orange]:bg-q-orange';
