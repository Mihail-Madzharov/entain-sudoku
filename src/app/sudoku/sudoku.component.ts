import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SudokuStore } from './data-access/store/sudoku.store';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-sudoku.component',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss',
})
export class SudokuComponent {
  public store = inject(SudokuStore);

  onCellInput(i: number, j: number, value: string) {
    this.store.updateBoard(i, j, parseInt(value));
  }

  checkSolution() {
    this.store.validateBoard();
  }
  
  solveSudoku() {
    this.store.solveBoard();
  }
}
