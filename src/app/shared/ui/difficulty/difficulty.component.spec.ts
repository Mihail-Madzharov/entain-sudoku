import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';

import { DifficultyDialogComponent } from './difficulty.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioGroup } from '@angular/material/radio';
import { of } from 'rxjs';
import { Difficulty } from '../../models/dificulty.enum';

describe('Difficulty', () => {
  let component: DifficultyDialogComponent;
  let fixture: ComponentFixture<DifficultyDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DifficultyDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj<
      MatDialogRef<DifficultyDialogComponent>
    >('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [DifficultyDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DifficultyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with difficulty', () => {
    component.startGame();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      difficulty: Difficulty.MEDIUM,
    });
  });
});
