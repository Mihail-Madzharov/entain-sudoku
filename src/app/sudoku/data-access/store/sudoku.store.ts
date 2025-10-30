import {
  signalStore,
  type,
  withState,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { Difficulty } from '../../../shared/models/dificulty.enum';
import { eventGroup, injectDispatch } from '@ngrx/signals/events';
import { on, withReducer, withEffects, Events } from '@ngrx/signals/events';
import { SudokuService } from '../services/sudoku.service';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { mapResponse } from '@ngrx/operators';
import { filter, map } from 'rxjs/operators';
import { Status } from '../models/status.enum';
import { Cell } from '../models/cell';

export const sudokuEvents = eventGroup({
  source: 'Books API',
  events: {
    loadBoard: type<Difficulty>(),
    boardLoadedSuccess: type<Cell[][]>(),
    boardLoadedFailure: type<string>(),
    validateBoard: type<Cell[][]>(),
    updateStatus: type<{ status: Status }>(),
    boardValidatedFailure: type<string>(),
    updateBoard: type<{ row: number; col: number; value: number }>(),
    solveBoardSuccess: type<number[][]>(),
    solveBoardFailure: type<string>(),
    decrementLives: type<void>(),
  },
});

export const SudokuStore = signalStore(
  withState<{
    difficulty: Difficulty;
    board: Cell[][];
    loading: boolean;
    solvedBoard: number[][];
    lives: number;
    solved: Status;
  }>({
    difficulty: Difficulty.MEDIUM,
    board: [],
    loading: false,
    solvedBoard: [],
    lives: 3,
    solved: Status.idle,
  }),
  withReducer(
    on(sudokuEvents.loadBoard, (event,state) => {
      return {
        ...state,
        difficulty: event.payload,
        loading: true,
      };
    }),
    on(sudokuEvents.boardLoadedSuccess, (event, state) => {
      return {
        ...state,
        board: event.payload,
        loading: false,
        solved: Status.idle,
        lives: 3,
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
      const { row, col, value } = event.payload;
      const solvedBoardValue = state.solvedBoard[row][col];
      const isCorrect = value === 0 || solvedBoardValue === value;

      const newCell = {
        ...state.board[row][col],
        value,
        valid: isCorrect,
      };

      return {
        ...state,
        board: state.board.map((bRow, rowIdx) =>
          bRow.map((bCell, colIdx) => {
            if (rowIdx !== row || colIdx !== col) {
              return { ...bCell };
            }
            return newCell;
          })
        ),
      };
    }),
    on(sudokuEvents.solveBoardSuccess, (event, state) => {
      return {
        ...state,
        solvedBoard: event.payload,
        loading: false,
      };
    }),
    on(sudokuEvents.decrementLives, (_, state) => {
      return {
        ...state,
        lives: state.lives - 1,
      };
    }),
    on(sudokuEvents.updateStatus, (event, state) => {
      return {
        ...state,
        solved: event.payload.status,
      };
    })
  ),
  withEffects(
    (
      state,
      events = inject(Events),
      sudokuService = inject(SudokuService)
    ) => ({
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
                  return sudokuEvents.updateStatus({
                    status: asyncResponse.status,
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
      updateBoard$: events.on(sudokuEvents.updateBoard).pipe(
        filter((event) => {
          const { row, col, value } = event.payload;
          const solvedBoardValue = state.solvedBoard()[row][col];
          return value !== 0 && solvedBoardValue !== value;
        }),
        map(() => {
          return sudokuEvents.decrementLives();
        })
      ),
      checkLives$: events.on(sudokuEvents.decrementLives).pipe(
        filter(() => {
          return state.lives() === 0;
        }),
        map(() => {
          return sudokuEvents.updateStatus({ status: Status.gameOver });
        })
      ),
    })
  ),

  withMethods((state, dispatch = injectDispatch(sudokuEvents)) => ({
    loadBoard: (difficulty: Difficulty) => {
      dispatch.loadBoard(difficulty);
    },
    updateBoard: (row: number, col: number, value: number) => {
      dispatch.updateBoard({ row, col, value });
    },
    validateBoard: () => {
      dispatch.validateBoard(state.board());
    },
    solveBoard: () => {
      patchState(state, {
        board: state.solvedBoard().map((row, i) =>
          row.map((value) => ({
            value,
            editable: false,
            valid: true,
          }))
        ),
        solved: Status.solved,
      });
    },
  }))
);
