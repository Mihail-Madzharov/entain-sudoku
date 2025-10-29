import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DifficultyDialogComponent } from '../shared/ui/difficulty/difficulty.component';
import { Difficulty } from '../shared/models/dificulty.enum';

import { MainMenu } from './main-menu';

describe('MainMenu', () => {
  let component: MainMenu;
  let fixture: ComponentFixture<MainMenu>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MainMenu],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MatDialog,
          useValue: {
            open: () => ({
              afterClosed: () => of({ difficulty: Difficulty.EASY }),
            }),
          },
        },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(MainMenu, {
        remove: {
          providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        },
        add: {
          providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MainMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openDifficultyDialog should open dialog and navigate with selected difficulty', async () => {
    const dialogResult = { difficulty: 'easy' } as const;
    const dialogRefMock = { afterClosed: () => of(dialogResult) } as any;
    matDialogSpy.open.and.returnValue(dialogRefMock);

    await component.openDifficultyDialog();

    expect(matDialogSpy.open).toHaveBeenCalledWith(DifficultyDialogComponent);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sudoku', 'easy']);
  });

  it('openDifficultyDialog should not navigate when dialog is dismissed', async () => {
    const dialogRefMock = { afterClosed: () => of(undefined) } as any;
    matDialogSpy.open.and.returnValue(dialogRefMock);

    await component.openDifficultyDialog();

    expect(matDialogSpy.open).toHaveBeenCalledWith(DifficultyDialogComponent);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
