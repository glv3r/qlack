import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avatar } from './ui/avatar/avatar';
import { Button } from './ui/button/button';
import { Card } from './ui/card/card';
import { Pill } from './ui/pill/pill';

@Component({
  imports: [RouterOutlet, Avatar, Button, Card, Pill],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('qlack-web');
}
