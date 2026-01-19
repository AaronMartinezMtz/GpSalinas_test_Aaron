import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  // {
  //   path: 'humidity',
  //   loadChildren: () => import('./features/humidity/humidity-routing-module').then(m => m.HumidityRoutingModule)
  // },
  // {
  //   path: 'temperature',
  //   loadChildren: () => import('./features/temperature/temperature-routing-module').then(m => m.TemperatureRoutingModule)
  // },
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
