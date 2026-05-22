export interface GameRoom {
  roomId: string;
  playerX?: string;
  playerO?: string;
  board: Array<string | null>;
  currentTurn: string;
  gameOver: boolean;
  winner: string;
}
