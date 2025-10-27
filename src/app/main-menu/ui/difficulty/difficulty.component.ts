import { Component, inject, model, signal } from '@angular/core';

import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Difficulty } from '../../data-access/enums/dificulty.enum';

@Component({
  selector: 'app-difficulty',
  imports: [MatDialogModule, MatRadioModule, MatButtonModule],
  templateUrl: './difficulty.component.html',
  styleUrl: './difficulty.component.scss',
})
export class DifficultyDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DifficultyDialogComponent>);

  readonly difficulty = signal<Difficulty>(Difficulty.MEDIUM);
  public readonly difficulties = Difficulty;

  startGame() {
    this.dialogRef.close({ difficulty: this.difficulty() });
  }
}
