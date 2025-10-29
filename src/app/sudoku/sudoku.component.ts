import {
  Component,
  inject,
  viewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SudokuStore } from './data-access/store/sudoku.store';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DifficultyDialogComponent } from '../shared/ui/difficulty/difficulty.component';
import { filter, lastValueFrom, map, pipe, switchMap, tap } from 'rxjs';
import { Difficulty } from '../shared/models/dificulty.enum';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Status } from './data-access/models/status.enum';

@Component({
  selector: 'app-sudoku.component',
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss',
  providers: [SudokuStore],
})
export class SudokuComponent {
  public store = inject(SudokuStore);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  router = inject(Router);

  solvedDialog = viewChild<TemplateRef<any>>('solvedSudokuDialog');
  endGameDialog = viewChild<TemplateRef<any>>('endGameDialog');
  unsolvedSudokuDialog = viewChild<TemplateRef<any>>('unsolvedSudokuDialog');
  confirmBackDialog = viewChild<TemplateRef<any>>('confirmBackDialog');

  userLivesHandler = rxMethod<number>(
    pipe(
      filter((lives) => lives === 0),
      switchMap(() => this.dialog.open(this.endGameDialog()!).afterClosed())
    )
  );

  solvedHandler = rxMethod<Status | null>(
    pipe(
      filter((solved) => solved === Status.solved),
      switchMap(() => this.dialog.open(this.solvedDialog()!).afterClosed())
    )
  );

  unsolvedHandler = rxMethod<Status | null>(
    pipe(
      filter((solved) => solved === Status.unsolved),
      switchMap(() =>
        this.dialog.open(this.unsolvedSudokuDialog()!).afterClosed()
      )
    )
  );

  userLivesOverListener = this.userLivesHandler(this.store.lives);
  solvedListener = this.solvedHandler(this.store.solved);
  unsolvedListener = this.unsolvedHandler(this.store.solved);

  onCellInput(rowIndex: number, cellIndex: number, value: string) {
    this.store.updateBoard(rowIndex, cellIndex, value ? +value : 0);
  }

  constructor() {
    this.store.loadBoard(
      this.route.snapshot.params['difficulty'] as Difficulty
    );
  }

  checkSolution() {
    this.store.validateBoard();
  }

  solveSudoku() {
    this.store.solveBoard();
  }

  async newGame() {
    const result = await lastValueFrom(
      this.dialog.open(DifficultyDialogComponent).afterClosed()
    );
    this.store.loadBoard(result?.difficulty);
    this.router.navigate(['/sudoku', result?.difficulty]);
  }

  goBack() {
    this.dialog.open(this.confirmBackDialog()!);
  }

  confirmBack() {
    this.router.navigate(['/']);
  }
}
