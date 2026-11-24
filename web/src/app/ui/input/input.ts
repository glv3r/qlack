import { Directive, input } from '@angular/core';

const classes =
  // No width here: the parent layout decides it, so a template's width isn't fought.
  'px-4 py-3 text-[19px] leading-none ' +
  'bg-surface text-fg border-3 border-line rounded-input outline-none ' +
  'placeholder:text-fg-muted ' +
  // Code variant: the room-code style, mono and widely spaced.
  'data-[variant=code]:font-mono data-[variant=code]:text-[22px] ' +
  'data-[variant=code]:tracking-[0.22em] data-[variant=code]:uppercase ' +
  // Focus: the small hard shadow (shadow-xs), in the register's shadow colour.
  'focus-visible:shadow-[4px_4px_0_var(--shadow-color)] ' +
  'transition-shadow duration-80 motion-reduce:transition-none';

// A directive, not a component: it styles the <input> it sits on and renders nothing itself.
@Directive({
  selector: 'input[appInput]',
  host: {
    '[attr.data-variant]': 'variant()',
    class: classes,
  },
})
export class Input {
  readonly variant = input<'text' | 'code'>('text');
}
