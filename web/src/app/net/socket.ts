import { Injectable } from '@angular/core';
import type { ClientMessage, ServerMessage } from '@qlack/engine';
import { filter, Observable, Subject } from 'rxjs';

// Same host as the page, so it also works from another device on the LAN.
const SERVER_URL = `ws://${location.hostname}:3000`;

// The one connection to the game server, shared by every page.
@Injectable({ providedIn: 'root' })
export class Socket {
  private ws?: WebSocket;
  private opening?: Promise<void>;
  private readonly incoming = new Subject<ServerMessage>();

  // Opens the connection once; later calls reuse it.
  connect(): Promise<void> {
    if (this.opening) return this.opening;

    this.opening = new Promise((resolve, reject) => {
      const ws = new WebSocket(SERVER_URL);
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error('Could not reach the server'));
      ws.onclose = () => (this.opening = undefined);
      ws.onmessage = (e) => this.receive(JSON.parse(e.data));
      this.ws = ws;
    });
    return this.opening;
  }

  send(msg: ClientMessage) {
    this.ws?.send(JSON.stringify(msg));
  }

  // Messages of one type, typed to match: on('joined') gives joined messages.
  on<T extends ServerMessage['type']>(type: T): Observable<Extract<ServerMessage, { type: T }>> {
    return this.incoming.pipe(
      filter((m): m is Extract<ServerMessage, { type: T }> => m.type === type),
    );
  }

  private receive(msg: ServerMessage) {
    // Clock sync: answer every ping straight away, before anyone else sees it.
    if (msg.type === 'ping') {
      this.send({ type: 'pong', id: msg.id, clientTime: Date.now() });
      return;
    }
    this.incoming.next(msg);
  }
}
