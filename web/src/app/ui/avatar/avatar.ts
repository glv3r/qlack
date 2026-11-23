import { Component, input } from '@angular/core';
import { PlayerColor, playerFill } from '../player-color';

const classes =
  'relative inline-grid place-items-center size-[72px] ' +
  'bg-surface text-fg border-3 border-line rounded-input ' +
  // Keycaps drop straight down rather than down-right.
  'shadow-[0_5px_0_var(--shadow-color)] ' +
  playerFill;

@Component({
  selector: 'app-avatar',
  // The key name sits top-left like a keycap legend; the face goes in the middle.
  template: `
    <span class="absolute top-1 left-1 font-mono text-[12px] leading-none">{{ key() }}</span>
    <ng-content />
  `,
  host: {
    '[attr.data-color]': 'color()',
    class: classes,
  },
})
export class Avatar {
  readonly key = input.required<string>();
  readonly color = input<PlayerColor>();
}
