import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DifficultyDialogComponent } from '../shared/ui/difficulty/difficulty.component';
import { MatButtonModule } from '@angular/material/button';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  imports: [
    MatDialogModule,
    FormsModule,
    MatRadioModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {
  dialog = inject(MatDialog);
  router = inject(Router);

  async openDifficultyDialog() {
    const result = await lastValueFrom(
      this.dialog.open(DifficultyDialogComponent).afterClosed()
    );

    if (result) {
      this.router.navigate(['/sudoku', result.difficulty]);
    }
  }
}
