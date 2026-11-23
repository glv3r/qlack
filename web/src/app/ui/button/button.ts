import { Component, input } from '@angular/core';

const classes =
  'px-7 py-3 font-bold text-[20px] leading-none tracking-[-0.01em] cursor-pointer ' +
  'bg-surface text-fg border-3 border-line rounded-button ' +
  // Shadow colours come from variables so the variant only swaps colours.
  // Secondary: a hard shadow (the ring has no spread, so it hides under it).
  '[--btn-shadow:var(--shadow-color)] [--btn-ring:0px] ' +
  // Primary, the CTA: ink fill, lime offset ringed in ink. Once per screen.
  // Its edge is --line-on-fg, so the light face still has an outline on quiet.
  'data-[variant=primary]:bg-fg data-[variant=primary]:text-page data-[variant=primary]:border-line-on-fg ' +
  'data-[variant=primary]:[--btn-shadow:var(--accent)] data-[variant=primary]:[--btn-ring:var(--border-base)] ' +
  'shadow-[var(--offset)_var(--offset)_0_var(--btn-shadow),var(--offset)_var(--offset)_0_var(--btn-ring)_var(--line)] ' +
  // Hover lifts 2px; the bigger offset keeps the shadow where it was.
  '[--offset:6px] hover:[--offset:8px] hover:-translate-[2px] ' +
  // Press into the shadow.
  'active:translate-[6px] active:shadow-none ' +
  'transition-[translate,box-shadow] duration-80 motion-reduce:transition-none ' +
  'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-line';

@Component({
  selector: 'button[appButton]',
  template: '<ng-content />',
  host: {
    '[attr.data-variant]': 'variant()',
    class: classes,
  },
})
export class Button {
  readonly variant = input<'primary' | 'secondary'>('secondary');
}
