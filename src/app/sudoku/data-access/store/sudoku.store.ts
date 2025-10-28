import {
  signalStore,
  type,
  withState,
  withHooks,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { Difficulty } from '../../../main-menu/data-access/enums/dificulty.enum';
import { eventGroup, injectDispatch } from '@ngrx/signals/events';
import { on, withReducer, withEffects, Events } from '@ngrx/signals/events';
import { SudokuService } from '../services/sudoku.service';
import { inject } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { mapResponse } from '@ngrx/operators';
import { map } from 'rxjs/operators';

export const sudokuEvents = eventGroup({
  source: 'Books API',
  events: {
    loadBoard: type<Difficulty>(),
    boardLoadedSuccess: type<Cell[][]>(),
    boardLoadedFailure: type<string>(),
    validateBoard: type<Cell[][]>(),
    boardValidatedSuccess: type<{ valid: boolean }>(),
    boardValidatedFailure: type<string>(),
    updateBoard: type<Cell[][]>(),
    solveBoardSuccess: type<number[][]>(),
    solveBoardFailure: type<string>(),
  },
});

export interface Cell {
  value: number;
  editable: boolean;
  valid: boolean;
}

export const SudokuStore = signalStore(
  withState<{
    difficulty: Difficulty;
    board: Cell[][];
    loading: boolean;
    solvedBoard: number[][];
  }>({
    difficulty: Difficulty.MEDIUM,
    board: [],
    loading: false,
    solvedBoard: [],
  }),
  withReducer(
    on(sudokuEvents.loadBoard, (state) => {
      return {
        ...state,
        loading: true,
      };
    }),
    on(sudokuEvents.boardLoadedSuccess, (event, state) => {
      return {
        ...state,
        board: event.payload,
        loading: false,
      };
    }),
    on(sudokuEvents.boardLoadedFailure, (event, state) => {
      return {
        ...state,
        loading: false,
        error: event.payload,
      };
    }),
    on(sudokuEvents.updateBoard, (event, state) => {
      return {
        ...state,
        board: event.payload,
      };
    }),
    on(sudokuEvents.solveBoardSuccess, (event, state) => {
      return {
        ...state,
        solvedBoard: event.payload,
        loading: false,
      };
    })
  ),
  withEffects(
    (_, events = inject(Events), sudokuService = inject(SudokuService)) => ({
      loadBoard$: events.on(sudokuEvents.loadBoard).pipe(
        switchMap((event) =>
          sudokuService.getSudokuBoard(event.payload).pipe(
            map(({ board }) =>
              board.map((row) =>
                row.map((cell) => ({
                  value: cell,
                  editable: cell === 0,
                  valid: true,
                }))
              )
            ),
            mapResponse({
              next: (board) => {
                return sudokuEvents.boardLoadedSuccess(board);
              },
              error: (error: { message: string }) =>
                sudokuEvents.boardLoadedFailure(error.message),
            })
          )
        )
      ),
      validateBoard$: events.on(sudokuEvents.validateBoard).pipe(
        switchMap((event) =>
          sudokuService
            .validateSudokuBoard(
              event.payload.map((row) => row.map((cell) => cell.value))
            )
            .pipe(
              mapResponse({
                next: (asyncResponse) => {
                  return sudokuEvents.boardValidatedSuccess({
                    valid: asyncResponse.valid,
                  });
                },
                error: (error: { message: string }) => {
                  return sudokuEvents.boardValidatedFailure(error.message);
                },
              })
            )
        )
      ),
      solveBoard$: events.on(sudokuEvents.boardLoadedSuccess).pipe(
        switchMap((event) =>
          sudokuService
            .solveSudokuBoard(
              event.payload.map((row) => row.map((cell) => cell.value))
            )
            .pipe(
              mapResponse({
                next: ({ solution }) => {
                  return sudokuEvents.solveBoardSuccess(solution);
                },
                error: (error: { message: string }) =>
                  sudokuEvents.solveBoardFailure(error.message),
              })
            )
        )
      ),
    })
  ),
  withMethods((state, dispatch = injectDispatch(sudokuEvents)) => ({
    loadBoard: (difficulty: Difficulty) => {
      dispatch.loadBoard(difficulty);
    },
    updateBoard: (i: number, j: number, value: number) => {
      dispatch.updateBoard(
        state.board().map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (rowIdx === i && colIdx === j) {
              return {
                ...cell,
                value,
                valid: value === 0 ? true : state.solvedBoard()[i][j] === value,
              };
            } else {
              return { ...cell };
            }
          })
        )
      );
    },
    validateBoard: () => {
      dispatch.validateBoard(state.board());
    },
    solveBoard: () => {
      dispatch.updateBoard(
        state.solvedBoard().map((row, i) =>
          row.map((value) => ({
            value,
            editable: false,
            valid: true,
          }))
        )
      );
    },
  }))
);
