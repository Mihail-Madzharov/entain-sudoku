import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { SudokuComponent } from './sudoku.component';
import { SudokuStore } from './data-access/store/sudoku.store';
import { Difficulty } from '../shared/models/dificulty.enum';
import { Status } from './data-access/models/status.enum';
import { Cell } from './data-access/models/cell';

describe('SudokuComponent', () => {
  let component: SudokuComponent;
  let fixture: ComponentFixture<SudokuComponent>;

  let storeMock: {
    loadBoard: jasmine.Spy;
    updateBoard: jasmine.Spy;
    validateBoard: jasmine.Spy;
    solveBoard: jasmine.Spy;
    lives: () => number;
    solved: () => Status | null;
    difficulty: () => Difficulty;
    loading: () => boolean;
    board: () => Cell[][];
    solvedBoard: () => Cell[][];
    gameOver: () => boolean;
    error: () => string | null;
  };

  let dialogOpenSpy: jasmine.Spy;
  let routerNavigateSpy: jasmine.Spy;

  beforeEach(async () => {
    storeMock = {
      loadBoard: jasmine.createSpy('loadBoard'),
      updateBoard: jasmine.createSpy('updateBoard'),
      validateBoard: jasmine.createSpy('validateBoard'),
      solveBoard: jasmine.createSpy('solveBoard'),
      lives: () => 3,
      solved: () => null,
      difficulty: () => Difficulty.MEDIUM,
      loading: () => false,
      board: () => [],
      solvedBoard: () => [],
      gameOver: () => false,
      error: () => null,

    };

    const activatedRouteMock = {
      snapshot: { params: { difficulty: Difficulty.MEDIUM } },
    } as unknown as ActivatedRoute;

    const dialogMock = {
      open: () => ({ afterClosed: () => of(null) }),
    } as unknown as MatDialog;

    const routerMock = {
      navigate: () => Promise.resolve(true),
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [SudokuComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SudokuStore, useValue: storeMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      .overrideComponent(SudokuComponent, {
        remove: {
          providers: [
            { provide: ActivatedRoute, useValue: activatedRouteMock },
            { provide: MatDialog, useValue: dialogMock },
            { provide: Router, useValue: routerMock },
            { provide: SudokuStore, useValue: storeMock },
          ],
        },
        add: {
          providers: [
            { provide: ActivatedRoute, useValue: activatedRouteMock },
            { provide: MatDialog, useValue: dialogMock },
            { provide: Router, useValue: routerMock },
            { provide: SudokuStore, useValue: storeMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SudokuComponent);
    component = fixture.componentInstance;

    dialogOpenSpy = spyOn(TestBed.inject(MatDialog), 'open').and.callThrough();
    routerNavigateSpy = spyOn(
      TestBed.inject(Router),
      'navigate'
    ).and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load board on init using route difficulty', () => {
    expect(storeMock.loadBoard).toHaveBeenCalledWith(
      Difficulty.MEDIUM as unknown as Difficulty
    );
  });

  it('onCellInput should update board with numeric value', () => {
    component.onCellInput(1, 2, '7');
    expect(storeMock.updateBoard).toHaveBeenCalledWith(1, 2, 7);
  });

  it('onCellInput should set 0 when value is empty', () => {
    component.onCellInput(0, 0, '');
    expect(storeMock.updateBoard).toHaveBeenCalledWith(0, 0, 0);
  });

  it('checkSolution should trigger validateBoard', () => {
    component.checkSolution();
    expect(storeMock.validateBoard).toHaveBeenCalled();
  });

  it('solveSudoku should trigger solveBoard', () => {
    component.solveSudoku();
    expect(storeMock.solveBoard).toHaveBeenCalled();
  });

  it('goBack should open confirm dialog', () => {
    component.goBack();
    expect(dialogOpenSpy).toHaveBeenCalled();
  });

  it('confirmBack should navigate to root', async () => {
    await component.confirmBack();
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('newGame should open difficulty dialog, load board, and navigate', async () => {
    dialogOpenSpy.and.returnValue({
      afterClosed: () => of({ difficulty: Difficulty.HARD }),
    } as any);

    await component.newGame();

    expect(storeMock.loadBoard).toHaveBeenCalledWith(Difficulty.HARD);
    expect(routerNavigateSpy).toHaveBeenCalledWith([
      '/sudoku',
      Difficulty.HARD,
    ]);
  });
});
