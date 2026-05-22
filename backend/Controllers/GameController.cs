using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TicTacToe.API.Hubs;
using TicTacToe.API.Models;
using TicTacToe.API.Services;

namespace TicTacToe.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly GameService _gameService;
    private readonly IHubContext<GameHub> _hubContext;

    public GameController(GameService gameService, IHubContext<GameHub> hubContext)
    {
        _gameService = gameService;
        _hubContext = hubContext;
    }

    [HttpPost("rooms")]
    public async Task<ActionResult<GameRoom>> CreateRoom(CreateRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
            return BadRequest("Player name is required.");

        var room = _gameService.CreateRoom(request.PlayerName);
        await AddConnectionToRoomGroup(request.ConnectionId, room.RoomId);
        await _hubContext.Clients.Group(room.RoomId).SendAsync("RoomCreated", room);

        return CreatedAtAction(nameof(GetRoom), new { roomId = room.RoomId }, room);
    }

    [HttpGet("rooms/{roomId}")]
    public ActionResult<GameRoom> GetRoom(string roomId)
    {
        var room = _gameService.GetRoom(roomId);
        return room is null ? NotFound("Room not found.") : Ok(room);
    }

    [HttpPost("rooms/{roomId}/join")]
    public async Task<ActionResult<GameRoom>> JoinRoom(string roomId, JoinRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
            return BadRequest("Player name is required.");

        var room = _gameService.JoinRoom(roomId, request.PlayerName);
        if (room is null)
            return NotFound("Room not found.");

        await AddConnectionToRoomGroup(request.ConnectionId, room.RoomId);
        await _hubContext.Clients.Group(room.RoomId).SendAsync("PlayerJoined", room);

        return Ok(room);
    }

    [HttpPost("rooms/{roomId}/moves")]
    public async Task<ActionResult<GameRoom>> MakeMove(string roomId, MakeMoveRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
            return BadRequest("Player name is required.");

        if (!_gameService.TryMakeMove(roomId, request.PlayerName, request.Index, out var room, out var error))
            return BadRequest(error);

        await _hubContext.Clients.Group(roomId).SendAsync("MoveMade", room);

        return Ok(room);
    }

    [HttpPost("rooms/{roomId}/restart")]
    public async Task<ActionResult<GameRoom>> RestartRoom(string roomId, RestartRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
            return BadRequest("Player name is required.");

        var room = _gameService.RestartRoom(roomId, request.PlayerName);
        if (room is null)
            return BadRequest("Unable to restart this room.");

        await _hubContext.Clients.Group(roomId).SendAsync("GameRestarted", room);

        return Ok(room);
    }

    private async Task AddConnectionToRoomGroup(string? connectionId, string roomId)
    {
        if (!string.IsNullOrWhiteSpace(connectionId))
            await _hubContext.Groups.AddToGroupAsync(connectionId, roomId);
    }
}

public sealed record CreateRoomRequest(string PlayerName, string? ConnectionId);

public sealed record JoinRoomRequest(string PlayerName, string? ConnectionId);

public sealed record MakeMoveRequest(string PlayerName, int Index);

public sealed record RestartRoomRequest(string PlayerName);
