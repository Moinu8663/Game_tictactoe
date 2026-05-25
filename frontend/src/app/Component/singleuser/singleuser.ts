import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Mark = 'X' | 'O';
type Cell = Mark | null;

@Component({
  selector: 'singleuser',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './singleuser.html',
  styleUrl: './singleuser.css',
})
export class Singleuser {
  playerXName = '';
  playerOName = '';
  started = false;
  board: Cell[] = Array(9).fill(null);
  currentTurn: Mark = 'X';
  winner = '';
  gameOver = false;
  playerXScore = 0;
  playerOScore = 0;
  draws = 0;

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

  get statusMessage(): string {
    if (this.winner === 'Draw') {
      return 'Game draw';
    }

    if (this.winner) {
      return `${this.getPlayerName(this.winner as Mark)} wins`;
    }

    return `${this.getPlayerName(this.currentTurn)} turn`;
  }

  get canStartGame(): boolean {
    return this.playerXName.trim().length > 0 && this.playerOName.trim().length > 0;
  }

  startGame(): void {
    if (!this.canStartGame) {
      return;
    }

    this.started = true;
    this.resetScore();
  }

  editPlayers(): void {
    this.started = false;
    this.restartGame();
  }

  move(index: number): void {
    if (this.gameOver || this.board[index]) {
      return;
    }

    this.board = this.board.map((cell, cellIndex) => cellIndex === index ? this.currentTurn : cell);
    this.finishTurn();
  }

  restartGame(): void {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.winner = '';
    this.gameOver = false;
  }

  resetScore(): void {
    this.playerXScore = 0;
    this.playerOScore = 0;
    this.draws = 0;
    this.restartGame();
  }

  trackCell(index: number): number {
    return index;
  }

  getPlayerName(mark: Mark): string {
    const name = mark === 'X' ? this.playerXName : this.playerOName;
    return name.trim() || `Player ${mark}`;
  }

  private finishTurn(): void {
    const winner = this.calculateWinner();

    if (winner) {
      this.winner = winner;
      this.gameOver = true;
      this.updateScore(winner);
      return;
    }

    if (this.board.every(Boolean)) {
      this.winner = 'Draw';
      this.gameOver = true;
      this.draws++;
      return;
    }

    this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
  }

  private calculateWinner(): Mark | null {
    for (const [a, b, c] of this.winningLines) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }

    return null;
  }

  private updateScore(winner: Mark): void {
    if (winner === 'X') {
      this.playerXScore++;
    } else {
      this.playerOScore++;
    }
  }

}
