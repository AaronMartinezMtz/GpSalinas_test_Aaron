import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'humidity',
    loadComponent: () => import('./features/humidity/pages/humidity/humidity.component').then(m => m.HumidityComponent)
  },
  {
    path: 'temperature',
    loadComponent: () => import('./features/temperature/pages/temperature/temperature.component').then(m => m.TemperatureComponent)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',       
    redirectTo: '/home'  
  }
];
