import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Room } from '../net/room';
import { Socket } from '../net/socket';
import { Button } from '../ui/button/button';
import { Input } from '../ui/input/input';

// The landing page at /: pick a name, then create a room or join one by code.
@Component({
  selector: 'app-landing',
  imports: [Button, FormsModule, Input],
  templateUrl: './landing.html',
})
export class Landing {
  private readonly socket = inject(Socket);
  private readonly router = inject(Router);
  // Injected first so Room is listening (and fills in its state) before our own handler runs.
  private readonly room = inject(Room);

  // [(ngModel)] keeps these in step with the fields, both ways.
  protected readonly name = signal('');
  protected readonly code = signal('');

  constructor() {
    this.socket.on('joined').pipe(takeUntilDestroyed()).subscribe(() => this.router.navigate(['/lobby']));
    // Temporary: log errors until the landing has somewhere to show them.
    this.socket.on('error').pipe(takeUntilDestroyed()).subscribe((m) => console.log('error', m));
  }

  protected async create() {
    await this.socket.connect();
    this.socket.send({ type: 'create_room', name: this.name() });
  }

  protected async join() {
    await this.socket.connect();
    this.socket.send({ type: 'join_room', code: this.code(), name: this.name() });
  }
}
