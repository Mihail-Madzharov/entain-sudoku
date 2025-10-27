import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { SudokuComponent } from './sudoku.component';
import { SudokuStore } from './data-access/store/sudoku.store';

import { Difficulty } from '../main-menu/data-access/enums/dificulty.enum';
import { inject } from '@angular/core';

export const sudokuRoutes: Routes = [
  {
    path: ':difficulty',
    component: SudokuComponent,
    providers: [SudokuStore],
    resolve: {
      difficulty: (routerSnapshot: ActivatedRouteSnapshot) => {
        const store = inject(SudokuStore);
        store.loadBoard(routerSnapshot.params['difficulty'] as Difficulty);
      },
    },
  },
];
