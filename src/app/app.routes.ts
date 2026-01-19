import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'humidity',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/humidity/pages/humidity/humidity.component').then(m => m.HumidityComponent)
      },
      {
        path: '**',
        redirectTo: '',  // redirige a la ruta base 'humidity'
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'temperature',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/temperature/pages/temperature/temperature.component').then(m => m.TemperatureComponent)
      },
      {
        path: '**',
        redirectTo: '',   // redirige a la ruta base 'temperature'
        pathMatch: 'full'
      }
    ]
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
