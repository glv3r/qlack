import { Injectable, inject, signal } from '@angular/core';
import type { PlayerInfo } from '@qlack/engine';
import { Socket } from './socket';

// What we need to rejoin after a refresh: join_room takes code, token and name.
export type Session = { code: string; token: string; name: string };
// sessionStorage, not localStorage: it survives a refresh but is per tab, so two tabs don't share a token.
const SESSION_KEY = 'qlack.session';

// The room you're in, shared by every page. Filled in from the server's messages.
@Injectable({ providedIn: 'root' })
export class Room {
  private readonly socket = inject(Socket);

  readonly code = signal<string | null>(null);
  readonly you = signal<string | null>(null);
  readonly hostId = signal<string | null>(null);
  readonly players = signal<PlayerInfo[]>([]);

  constructor() {
    // A root service lives as long as the app, so these never need unsubscribing.
    this.socket.on('joined').subscribe((m) => {
      this.code.set(m.code);
      this.you.set(m.you);
      this.hostId.set(m.hostId);
      this.players.set(m.players);

      const name = m.players.find((p) => p.id === m.you)?.name ?? '';
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code: m.code, token: m.token, name }));
    });

    this.socket.on('lobby_update').subscribe((m) => {
      this.hostId.set(m.hostId);
      this.players.set(m.players);
    });

    this.socket.on('room_closed').subscribe(() => this.leave());
  }

  // The saved session, if any. Rejoining with it comes in a later step.
  savedSession(): Session | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  leave() {
    this.code.set(null);
    this.you.set(null);
    this.hostId.set(null);
    this.players.set([]);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
