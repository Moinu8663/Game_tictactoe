namespace TicTacToe.API.Models;

public class GameRoom
{
    internal object SyncRoot { get; } = new();

    public string RoomId { get; set; } = Guid.NewGuid().ToString();
    public string? PlayerX { get; set; }
    public string? PlayerO { get; set; }
    public string?[] Board { get; set; } = new string?[9];
    public string CurrentTurn { get; set; } = "X";
    public bool GameOver { get; set; }
    public string Winner { get; set; } = string.Empty;
    public int PlayerXScore { get; set; }
    public int PlayerOScore { get; set; }
    public int Draws { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
