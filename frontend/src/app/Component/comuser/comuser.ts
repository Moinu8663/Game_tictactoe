import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Mark = 'X' | 'O';
type Cell = Mark | null;

@Component({
  selector: 'comuser',
  imports: [CommonModule, RouterLink],
  templateUrl: './comuser.html',
  styleUrl: './comuser.css',
})
export class Comuser implements OnDestroy {
  board: Cell[] = Array(9).fill(null);
  currentTurn: Mark = 'X';
  winner = '';
  gameOver = false;
  playerScore = 0;
  computerScore = 0;
  draws = 0;
  private computerTimer: number | null = null;

  readonly playerMark: Mark = 'X';
  readonly computerMark: Mark = 'O';
  readonly winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.clearComputerTimer();
  }

  get statusMessage(): string {
    if (this.winner === 'Draw') {
      return 'Game draw';
    }

    if (this.winner) {
      return this.winner === this.playerMark ? 'You win' : 'Computer wins';
    }

    return this.currentTurn === this.playerMark ? 'Your move' : 'Computer thinking';
  }

  get emptyCells(): number[] {
    return this.board
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1);
  }

  move(index: number): void {
    if (this.gameOver || this.currentTurn !== this.playerMark || this.board[index]) {
      return;
    }

    this.board = this.board.map((cell, cellIndex) => cellIndex === index ? this.playerMark : cell);
    this.finishTurn();

    if (!this.gameOver) {
      this.clearComputerTimer();
      this.computerTimer = window.setTimeout(() => {
        this.ngZone.run(() => {
          this.computerMove();
          this.cdr.markForCheck();
        });
      }, 250);
    }
  }

  restartGame(): void {
    this.clearComputerTimer();
    this.board = Array(9).fill(null);
    this.currentTurn = this.playerMark;
    this.winner = '';
    this.gameOver = false;
    this.cdr.markForCheck();
  }

  resetScore(): void {
    this.playerScore = 0;
    this.computerScore = 0;
    this.draws = 0;
    this.restartGame();
  }

  trackCell(index: number): number {
    return index;
  }

  private computerMove(): void {
    if (this.gameOver || this.currentTurn !== this.computerMark) {
      return;
    }

    const index = this.findBestMove();

    if (index !== -1) {
      this.board = this.board.map((cell, cellIndex) => cellIndex === index ? this.computerMark : cell);
      this.finishTurn();
    }
  }

  private clearComputerTimer(): void {
    if (this.computerTimer) {
      window.clearTimeout(this.computerTimer);
      this.computerTimer = null;
    }
  }

  private finishTurn(): void {
    const winner = this.calculateWinner(this.board);

    if (winner) {
      this.winner = winner;
      this.gameOver = true;
      this.updateScore(winner);
      return;
    }

    if (this.emptyCells.length === 0) {
      this.winner = 'Draw';
      this.gameOver = true;
      this.draws++;
      return;
    }

    this.currentTurn = this.currentTurn === this.playerMark ? this.computerMark : this.playerMark;
  }

  private findBestMove(): number {
    return this.findWinningMove(this.computerMark)
      ?? this.findWinningMove(this.playerMark)
      ?? this.pickFirstAvailable([4])
      ?? this.pickFirstAvailable([0, 2, 6, 8])
      ?? this.pickFirstAvailable([1, 3, 5, 7])
      ?? -1;
  }

  private findWinningMove(mark: Mark): number | null {
    for (const index of this.emptyCells) {
      const nextBoard = [...this.board];
      nextBoard[index] = mark;

      if (this.calculateWinner(nextBoard) === mark) {
        return index;
      }
    }

    return null;
  }

  private pickFirstAvailable(indexes: number[]): number | null {
    return indexes.find(index => this.board[index] === null) ?? null;
  }

  private calculateWinner(board: Cell[]): Mark | null {
    for (const [a, b, c] of this.winningLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  private updateScore(winner: string): void {
    if (winner === this.playerMark) {
      this.playerScore++;
    } else if (winner === this.computerMark) {
      this.computerScore++;
    }
  }

}
