import { Component, inject } from '@angular/core';
import { Room } from '../net/room';

// The lobby at /lobby. Bare for now: it only proves the Room service carries state across pages.
@Component({
  selector: 'app-lobby',
  template: `
    <main class="min-h-screen p-page-gutter flex flex-col gap-6">
      <h1 class="font-bold text-[88px] leading-[0.95] tracking-[-0.04em]">Room {{ room.code() }}</h1>
      <ul class="flex flex-col gap-2 text-[19px]">
        @for (p of room.players(); track p.id) {
          <li>
            {{ p.name }}
            @if (p.id === room.hostId()) { · host }
            @if (p.id === room.you()) { · you }
          </li>
        }
      </ul>
    </main>
  `,
})
export class Lobby {
  protected readonly room = inject(Room);
}
