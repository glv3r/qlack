import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: '<ng-content />',
  host: {
    class: 'block p-10 bg-surface text-fg border-3 border-line rounded-card shadow-hard',
  },
})
export class Card {}
