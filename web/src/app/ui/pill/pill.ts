import { Component, input } from '@angular/core';
import { PlayerColor, playerFill } from '../player-color';

const classes =
  'inline-flex items-center px-3 py-1 font-mono text-[16px] leading-none ' +
  'bg-surface text-fg border-[2.5px] border-line rounded-pill ' +
  playerFill;

@Component({
  selector: 'app-pill',
  template: '<ng-content />',
  host: {
    '[attr.data-color]': 'color()',
    class: classes,
  },
})
export class Pill {
  readonly color = input<PlayerColor>();
}
