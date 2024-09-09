import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-white">
      currentPlayer: {{ currentPlayer() }} | moves: {{ moveCounter() }}
      <br />
      <table
        class="m-auto mt-24 border-2 border-yellow-400 w-[400px] h-[400px]"
      >
        <thead></thead>
        <tbody>
          <tr *ngFor="let row of data(); let i = index">
            <td
              *ngFor="let cell of row; let j = index"
              class="border-2 border-yellow-400 cursor-pointer"
              (click)="handleClick(i, j)"
            >
              <img
                [src]="getCellImage(cell)"
                alt="Cell"
                class="m-auto w-full h-full p-6"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="gameOver()" class="mt-8 text-3xl w-full text-center">
        GAME OVER, player {{ winner() }} won!
      </div>
      <div *ngIf="tie()" class="mt-8 text-3xl w-full text-center">
        It's a tie!
      </div>
    </div>
  `,
})
export class AppComponent {
  currentPlayer = signal<'player1' | 'player2'>('player1');
  gameOver = signal<boolean>(false);
  tie = signal<boolean>(false);
  moveCounter = signal<number>(0);
  data = signal<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);
  winner = signal<'player1' | 'player2' | null>(null);

  handleClick(i: number, j: number) {
    if (this.gameOver() || this.tie() || this.data()[i][j]) return;

    const updatedData = this.data().map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        i === rowIndex && j === colIndex
          ? this.currentPlayer() === 'player1'
            ? 'X'
            : 'O'
          : cell
      )
    );

    this.data.set(updatedData);

    this.moveCounter.update((count) => count + 1);

    if (this.checkWinner()) {
      this.gameOver.set(true);
      this.winner.set(this.currentPlayer());
      return;
    }

    if (this.moveCounter() === 9) {
      this.tie.set(true);
      return;
    }

    this.togglePlayer();
  }

  togglePlayer() {
    this.currentPlayer.set(
      this.currentPlayer() === 'player1' ? 'player2' : 'player1'
    );
  }

  checkWinner(): boolean {
    const data = this.data();
    const lines = [
      ...data,
      ...this.transpose(data),
      this.getDiagonal(data),
      this.getAntiDiagonal(data),
    ];

    return lines.some(
      (line) => line.join() === 'X,X,X' || line.join() === 'O,O,O'
    );
  }

  transpose(matrix: string[][]): string[][] {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]));
  }

  getDiagonal(matrix: string[][]): string[] {
    return matrix.map((_, i) => matrix[i][i]);
  }

  getAntiDiagonal(matrix: string[][]): string[] {
    return matrix.map((_, i) => matrix[i][matrix.length - 1 - i]);
  }

  getCellImage(cell: string): string {
    switch (cell) {
      case 'X':
        return 'cross.svg';
      case 'O':
        return 'circle.svg';
      default:
        return 'empty.svg';
    }
  }
}
