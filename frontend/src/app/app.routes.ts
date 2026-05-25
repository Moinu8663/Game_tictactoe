import { Routes } from '@angular/router';
import { Comuser } from './Component/comuser/comuser';
import { Multiuser } from './Component/multiuser/multiuser';
import { Singleuser } from './Component/singleuser/singleuser';
import { Home } from './Component/home/home';
import { GameDashboard } from './Component/game-dashboard/game-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'game-dashboard', component: GameDashboard },
  { path: 'singleuser', component: Singleuser },
  { path: 'multiuser', component: Multiuser },
  { path: 'comuser', component: Comuser },
  { path: '**', redirectTo: 'home' }
];
