import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameRoom } from '../../models/game-room';


@Component({
  selector: 'multiuser',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './multiuser.html',
  styleUrl: './multiuser.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Multiuser implements OnInit, OnDestroy {
  roomId = '';
  playerName = '';
  symbol = '';
  board: Array<string | null> = Array(9).fill(null);
  currentTurn = 'X';
  winner = '';
  playerX = '';
  playerO = '';
  playerXScore = 0;
  playerOScore = 0;
  draws = 0;
  gameOver = false;
  statusMessage = '';
  connected = false;
  started = false;
  showWinnerPopup = false;
  showInvitePopup = false;
  roomInviteCode = '';
  roomInviteMessage = '';
  lastEvent = '';
  lastEventTurn = '';

  constructor(
    private gameService: GameService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gameService.connect()
      .then(() => {
        this.connected = true;
        this.statusMessage = 'Connected to the game server.';
        this.cdr.markForCheck();

        this.gameService.hubConnection.on('RoomCreated', (room: GameRoom) => {
          this.runServerUpdate(() => {
            this.lastEvent = 'RoomCreated';
            this.lastEventTurn = room.currentTurn;
            this.updateRoom(room);
            this.statusMessage = `Room created. Share code ${room.roomId} with your opponent.`;
          });
        });

        this.gameService.hubConnection.on('PlayerJoined', (room: GameRoom) => {
          this.runServerUpdate(() => {
            this.lastEvent = 'PlayerJoined';
            this.lastEventTurn = room.currentTurn;
            this.updateRoom(room);
            this.statusMessage = `Player joined the room. ${room.currentTurn} starts. ${this.symbol === room.currentTurn ? 'Your move.' : 'Waiting for the opponent.'}`;
            if (this.showInvitePopup && room.roomId === this.roomId) {
              this.showInvitePopup = false;
              this.roomInviteMessage = '';
              this.roomInviteCode = '';
            }
          });
        });

        this.gameService.hubConnection.on('MoveMade', (room: GameRoom) => {
          this.runServerUpdate(() => {
            this.lastEvent = 'MoveMade';
            this.lastEventTurn = room.currentTurn;
            this.updateRoom(room);
            this.statusMessage = `${room.currentTurn === this.symbol ? 'Your turn.' : 'Opponent turn.'}`;
          });
        });

        this.gameService.hubConnection.on('GameRestarted', (room: GameRoom) => {
          this.runServerUpdate(() => {
            this.lastEvent = 'GameRestarted';
            this.lastEventTurn = room.currentTurn;
            this.updateRoom(room);
            this.statusMessage = `${this.symbol === 'X' ? 'You are X.' : 'You are O.'} Game restarted.`;
          });
        });

        this.gameService.hubConnection.on('RoomUpdated', (room: GameRoom) => {
          this.runServerUpdate(() => {
            this.lastEvent = 'RoomUpdated';
            this.lastEventTurn = room.currentTurn;
            this.updateRoom(room);
            this.statusMessage = `${room.currentTurn === this.symbol ? 'Your turn.' : 'Opponent turn.'}`;
          });
        });

        this.gameService.hubConnection.on('ReturnToLobby', () => {
          this.runServerUpdate(() => {
            this.statusMessage = 'A player left the room. Returning to lobby.';
            this.resetLobby();
          });
        });

        this.gameService.hubConnection.on('Error', (error: string) => {
          this.runServerUpdate(() => {
            this.statusMessage = `Error: ${error}`;
          });
        });
      })
      .catch(() => {
        this.statusMessage = 'Unable to connect to the server. Make sure the API is running.';
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    void this.gameService.disconnect();
  }

  createRoom(): void {
    if (!this.playerName) {
      this.statusMessage = 'Enter your name before creating a room.';
      return;
    }

    this.gameService.createRoom(this.playerName)
      .then(room => {
        this.lastEvent = 'RoomCreated';
        this.lastEventTurn = room.currentTurn;
        this.updateRoom(room);
        this.roomInviteCode = room.roomId;
        this.roomInviteMessage = 'Waiting for opponent to join...';
        this.showInvitePopup = true;
        this.statusMessage = `Room created. Share code ${room.roomId} with your opponent.`;
        this.cdr.markForCheck();
      })
      .catch(err => {
        console.error(err);
        this.statusMessage = 'Create room failed.';
        this.cdr.markForCheck();
      });
  }

  joinRoom(): void {
    if (!this.playerName || !this.roomId) {
      this.statusMessage = 'Enter your name and room code to join.';
      return;
    }

    this.gameService.joinRoom(this.roomId, this.playerName)
      .then(room => {
        this.lastEvent = 'PlayerJoined';
        this.lastEventTurn = room.currentTurn;
        this.updateRoom(room);
        this.statusMessage = `Player joined the room. ${room.currentTurn} starts. ${this.symbol === room.currentTurn ? 'Your move.' : 'Waiting for the opponent.'}`;
        this.cdr.markForCheck();
      })
      .catch(err => {
        console.error(err);
        this.statusMessage = 'Join room failed.';
        this.cdr.markForCheck();
      });
  }

  move(index: number): void {
    if (this.gameOver || this.board[index]) {
      return;
    }

    if (!this.roomId || !this.playerName) {
      this.statusMessage = 'Join or create a room first.';
      return;
    }

    this.gameService.makeMove(this.roomId, index, this.playerName)
      .then(room => {
        this.lastEvent = 'MoveMade';
        this.lastEventTurn = room.currentTurn;
        this.updateRoom(room);
        this.statusMessage = `${room.currentTurn === this.symbol ? 'Your turn.' : 'Opponent turn.'}`;
        this.cdr.markForCheck();
      })
      .catch(err => {
        console.error(err);
        this.statusMessage = 'Move failed.';
        this.cdr.markForCheck();
      });
  }

  restartGame(): void {
    if (!this.roomId || !this.playerName) {
      this.statusMessage = 'Join or create a room first.';
      return;
    }

    this.gameService.restartGame(this.roomId, this.playerName)
      .then(room => {
        this.lastEvent = 'GameRestarted';
        this.lastEventTurn = room.currentTurn;
        this.updateRoom(room);
        this.showWinnerPopup = false;
        this.statusMessage = `${this.symbol === 'X' ? 'You are X.' : 'You are O.'} Game restarted.`;
        this.cdr.markForCheck();
      })
      .catch(err => {
        console.error(err);
        this.statusMessage = 'Restart failed.';
        this.cdr.markForCheck();
      });
  }

  startGame(): void {
    this.started = true;
  }

  leaveRoom(): void {
    if (!this.roomId) {
      this.resetLobby();
      return;
    }

    this.gameService.leaveRoom(this.roomId)
      .catch(err => {
        console.error(err);
        this.resetLobby();
      });
  }

  closeWinnerPopup(): void {
    this.showWinnerPopup = false;
  }

  trackBoardCell(index: number): number {
    return index;
  }

  get inGame(): boolean {
    return !!this.roomId && !!this.symbol;
  }

  get gameStateLabel(): string {
    if (this.gameOver) {
      return this.winner === 'Draw' ? 'Draw' : `${this.winnerName} wins`;
    }

    if (!this.roomId) {
      return 'Waiting for room';
    }

    if (!this.playerO) {
      return 'Waiting for player O';
    }

    return `${this.currentTurn} to move`;
  }

  get winnerName(): string {
    if (this.winner === 'X') {
      return this.playerX || 'Player X';
    }

    if (this.winner === 'O') {
      return this.playerO || 'Player O';
    }

    return '';
  }

  private runServerUpdate(update: () => void): void {
    this.ngZone.run(() => {
      update();
      this.cdr.markForCheck();
    });
  }

  private updateRoom(room: GameRoom): void {
    this.roomId = room.roomId;
    this.board = [...room.board];
    this.currentTurn = room.currentTurn;
    this.gameOver = room.gameOver;
    this.winner = room.winner;
    this.playerX = room.playerX ?? '';
    this.playerO = room.playerO ?? '';
    this.playerXScore = room.playerXScore ?? 0;
    this.playerOScore = room.playerOScore ?? 0;
    this.draws = room.draws ?? 0;

    const normalizedPlayerName = this.playerName.trim().toLowerCase();
    const playerX = room.playerX?.trim().toLowerCase() ?? '';
    const playerO = room.playerO?.trim().toLowerCase() ?? '';

    if (normalizedPlayerName && normalizedPlayerName === playerX) {
      this.symbol = 'X';
    } else if (normalizedPlayerName && normalizedPlayerName === playerO) {
      this.symbol = 'O';
    } else {
      this.symbol = '';
    }

    this.showWinnerPopup = room.gameOver && !!room.winner;
  }

  private resetLobby(): void {
    this.roomId = '';
    this.symbol = '';
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.winner = '';
    this.playerX = '';
    this.playerO = '';
    this.playerXScore = 0;
    this.playerOScore = 0;
    this.draws = 0;
    this.showInvitePopup = false;
    this.roomInviteCode = '';
    this.roomInviteMessage = '';
    this.gameOver = false;
  }

}
