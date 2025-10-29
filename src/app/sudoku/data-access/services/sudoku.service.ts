import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Difficulty } from '../../../shared/models/dificulty.enum';
import { HttpClient } from '@angular/common/http';
import { encodeParams } from '../utils/funtions';
import { Status } from '../models/status.enum';

@Injectable({
  providedIn: 'root',
})
export class SudokuService {
  #http = inject(HttpClient);
  /**
   * Returns a mocked sudoku board as a 9x9 number array.
   * 0 represents empty cells.
   */
  getSudokuBoard(difficulty: Difficulty): Observable<{ board: number[][] }> {
    // Mocked board can be randomized or static. Here is a static example for now.

    return this.#http.get<{ board: number[][] }>(
      `https://sugoku.onrender.com/board?difficulty=${difficulty}`
    );
  }

  validateSudokuBoard(board: number[][]): Observable<{ status: Status }> {
    return this.#http.post<{ status: Status }>(
      `https://sugoku.onrender.com/validate`,
      encodeParams({ board }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  }

  solveSudokuBoard(
    board: number[][]
  ): Observable<{ difficulty: string; solution: number[][]; status: string }> {
    return this.#http.post<{
      difficulty: string;
      solution: number[][];
      status: string;
    }>(`https://sugoku.onrender.com/solve`, encodeParams({ board }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
