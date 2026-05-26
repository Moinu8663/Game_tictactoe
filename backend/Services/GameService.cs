using System.Collections.Concurrent;
using TicTacToe.API.Models;

namespace TicTacToe.API.Services;

public class GameService
{
    private readonly ConcurrentDictionary<string, GameRoom> _rooms = new();

    public GameRoom CreateRoom(string playerName)
    {
        var room = new GameRoom
        {
            PlayerX = playerName
        };

        _rooms.TryAdd(room.RoomId, room);
        return room;
    }

    public GameRoom? JoinRoom(string roomId, string playerName)
    {
        if (!_rooms.TryGetValue(roomId, out var room))
            return null;

        lock (room.SyncRoot)
        {
            if (room.PlayerO is null && room.PlayerX != playerName)
            {
                room.PlayerO = playerName;
            }

            return room;
        }
    }

    public GameRoom? GetRoom(string roomId)
    {
        return _rooms.TryGetValue(roomId, out var room)
            ? room
            : null;
    }

    public bool TryMakeMove(string roomId, string playerName, int index, out GameRoom? room, out string error)
    {
        room = GetRoom(roomId);
        error = string.Empty;

        if (room is null)
        {
            error = "Room not found.";
            return false;
        }

        lock (room.SyncRoot)
        {
            if (room.GameOver)
            {
                error = "The game is already over.";
                return false;
            }

            if (index < 0 || index >= room.Board.Length)
            {
                error = "Invalid move index.";
                return false;
            }

            if (room.Board[index] is not null)
            {
                error = "Cell already taken.";
                return false;
            }

            var symbol = GetPlayerSymbol(room, playerName);
            if (symbol is null)
            {
                error = "Player is not part of this room.";
                return false;
            }

            if (room.CurrentTurn != symbol)
            {
                error = "It is not your turn.";
                return false;
            }

            room.Board[index] = symbol;
            room.Winner = CheckWinner(room.Board);

            if (!string.IsNullOrEmpty(room.Winner))
            {
                room.GameOver = true;
                if (room.Winner == "X")
                    room.PlayerXScore++;
                else if (room.Winner == "O")
                    room.PlayerOScore++;
            }
            else if (room.Board.All(cell => cell is not null))
            {
                room.GameOver = true;
                room.Winner = "Draw";
                room.Draws++;
            }
            else
            {
                room.CurrentTurn = symbol == "X" ? "O" : "X";
            }
        }

        return true;
    }

    public GameRoom? RestartRoom(string roomId, string playerName)
    {
        var room = GetRoom(roomId);
        if (room is null)
            return null;

        lock (room.SyncRoot)
        {
            if (room.PlayerX != playerName && room.PlayerO != playerName)
                return null;

            room.Board = new string?[9];
            room.CurrentTurn = "X";
            room.GameOver = false;
            room.Winner = string.Empty;
            return room;
        }
    }

    private static string? GetPlayerSymbol(GameRoom room, string playerName)
    {
        if (room.PlayerX == playerName)
            return "X";

        if (room.PlayerO == playerName)
            return "O";

        return null;
    }

    private static string CheckWinner(string?[] board)
    {
        int[,] winPatterns =
        {
            {0,1,2},
            {3,4,5},
            {6,7,8},
            {0,3,6},
            {1,4,7},
            {2,5,8},
            {0,4,8},
            {2,4,6}
        };

        for (int i = 0; i < winPatterns.GetLength(0); i++)
        {
            var a = winPatterns[i, 0];
            var b = winPatterns[i, 1];
            var c = winPatterns[i, 2];

            if (board[a] is not null && board[a] == board[b] && board[b] == board[c])
            {
                return board[a]!;
            }
        }

        return string.Empty;
    }
}
