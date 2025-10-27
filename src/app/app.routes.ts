import { Routes } from '@angular/router';
import { MainMenu } from './main-menu/main-menu';

export const routes: Routes = [
  {
    path: '',
    component: MainMenu,
  },
  {
    path: 'sudoku',
    loadChildren: () =>
      import('./sudoku/sudoku.routing').then((m) => m.sudokuRoutes),
  },
];
