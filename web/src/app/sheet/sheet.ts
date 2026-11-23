import { Component } from '@angular/core';
import { Avatar } from '../ui/avatar/avatar';
import { Button } from '../ui/button/button';
import { Card } from '../ui/card/card';
import { Pill } from '../ui/pill/pill';
import { PlayerColor } from '../ui/player-color';

// Every primitive, rendered once per register.
@Component({
  selector: 'app-sheet',
  imports: [Avatar, Button, Card, Pill],
  templateUrl: './sheet.html',
})
export class Sheet {
  protected readonly registers = ['loud', 'quiet'];
  protected readonly players: { name: string; key: string; color: PlayerColor }[] = [
    { name: 'sam', key: 'enter', color: 'lime' },
    { name: 'priya', key: 'bksp', color: 'pink' },
    { name: 'nadia', key: 'tab', color: 'sky' },
    { name: 'theo', key: 'shift', color: 'lilac' },
    { name: 'jo', key: 'caps', color: 'orange' },
    { name: 'kofi', key: 'space', color: 'mint' },
    { name: 'mei', key: 'ctrl', color: 'sun' },
    { name: 'rae', key: 'alt', color: 'magenta' },
  ];
}
