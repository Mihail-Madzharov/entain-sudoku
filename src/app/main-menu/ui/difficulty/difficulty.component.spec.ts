import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifficultyDialogComponent } from './difficulty.component';

describe('Difficulty', () => {
  let component: DifficultyDialogComponent;
  let fixture: ComponentFixture<DifficultyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DifficultyDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DifficultyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
