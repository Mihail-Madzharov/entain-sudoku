import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { SudokuStore } from './sudoku.store';
import { SudokuService } from '../services/sudoku.service';
import { Difficulty } from '../../../shared/models/dificulty.enum';
import { Status } from '../models/status.enum';
import { Cell } from '../models/cell';

describe('SudokuStore', () => {
  let store: any;
  let serviceSpy: jasmine.SpyObj<SudokuService>;

  const apiBoard = [
    [0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const solution = [
    [3, 1, 2, 4],
    [4, 2, 1, 3],
    [1, 3, 4, 2],
    [2, 4, 3, 1],
  ];

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj<SudokuService>('SudokuService', [
      'getSudokuBoard',
      'validateSudokuBoard',
      'solveSudokuBoard',
    ]);

    serviceSpy.getSudokuBoard.and.returnValue(of({ board: apiBoard }));
    serviceSpy.solveSudokuBoard.and.returnValue(
      of({ difficulty: 'easy', solution, status: 'solved' })
    );
    serviceSpy.validateSudokuBoard.and.returnValue(
      of({ status: Status.solved })
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SudokuStore,
        { provide: SudokuService, useValue: serviceSpy },
      ],
    });

    store = TestBed.inject(SudokuStore);
  });

  it('should load board and solution on loadBoard', () => {
    store.loadBoard(Difficulty.MEDIUM);

    expect(serviceSpy.getSudokuBoard).toHaveBeenCalled();
    expect(serviceSpy.solveSudokuBoard).toHaveBeenCalled();

    const board = store.board();
    const solved = store.solvedBoard();

    expect(board.length).toBe(4);
    expect(board[0][0].editable).toBeTrue();
    expect(board[0][1].editable).toBeFalse();
    expect(store.loading()).toBeFalse();
    expect(store.gameOver()).toBeFalse();
    expect(store.lives()).toBe(3);
    expect(solved).toEqual(solution);
  });

  it('updateBoard with correct value should mark cell valid and keep lives', () => {
    store.loadBoard(Difficulty.MEDIUM);

    store.updateBoard(0, 0, 3);

    const cell = store.board()[0][0];
    expect(cell.value).toBe(3);
    expect(cell.valid).toBeTrue();
    expect(store.lives()).toBe(3);
  });

  it('wrong non-zero input should decrement lives and mark cell invalid', () => {
    store.loadBoard(Difficulty.MEDIUM);

    store.updateBoard(0, 0, 9);

    const cell = store.board()[0][0];
    expect(cell.value).toBe(9);
    expect(cell.valid).toBeFalse();
    expect(store.lives()).toBe(2);
  });

  it('reaching 0 lives should set gameOver', () => {
    store.loadBoard(Difficulty.MEDIUM);

    store.updateBoard(0, 0, 9);
    store.updateBoard(0, 0, 8);
    store.updateBoard(0, 0, 7);

    expect(store.lives()).toBe(0);
    expect(store.gameOver()).toBeTrue();
  });

  it('validateBoard should set solved status from service response', () => {
    store.loadBoard(Difficulty.MEDIUM);

    store.validateBoard();

    expect(serviceSpy.validateSudokuBoard).toHaveBeenCalled();
    expect(store.solved()).toBe(Status.solved);
  });

  it('solveBoard should fill in solved values and set solved status', () => {
    store.loadBoard(Difficulty.MEDIUM);

    store.solveBoard();

    const board = store.board() as Cell[][];
    expect(board.map((r: Cell[]) => r.map((c: Cell) => c.value))).toEqual(
      solution
    );
    expect(
      board.every((r: Cell[]) => r.every((c: Cell) => !c.editable))
    ).toBeTrue();
    expect(store.solved()).toBe(Status.solved);
  });
});
