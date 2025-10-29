import { Routes } from '@angular/router';
import { SudokuComponent } from './sudoku.component';
import { SudokuStore } from './data-access/store/sudoku.store';

export const sudokuRoutes: Routes = [
  {
    path: ':difficulty',
    component: SudokuComponent,
  },
];
