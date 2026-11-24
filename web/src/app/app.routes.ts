import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Lobby } from './lobby/lobby';
import { Sheet } from './sheet/sheet';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'lobby', component: Lobby },
  { path: 'sheet', component: Sheet },
];
