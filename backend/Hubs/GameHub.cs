using Microsoft.AspNetCore.SignalR;
using TicTacToe.API.Services;
using TicTacToe.API.Models;

namespace TicTacToe.API.Hubs;

public class GameHub : Hub
{
    private readonly GameService _gameService;

    public GameHub(GameService gameService)
    {
        _gameService = gameService;
    }

    public async Task JoinRoomGroup(string roomId)
    {
        var room = _gameService.GetRoom(roomId);
        if (room is null)
        {
            await Clients.Caller.SendAsync("Error", "Room not found.");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Caller.SendAsync("RoomUpdated", room);
    }

    public async Task CreateRoom(string playerName)
    {
        var room = _gameService.CreateRoom(playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);
        await Clients.Caller.SendAsync("RoomCreated", room);
    }

    public async Task JoinRoom(string roomId, string playerName)
    {
        var room = _gameService.JoinRoom(roomId, playerName);

        if (room is null)
        {
            await Clients.Caller.SendAsync("Error", "Room not found.");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("PlayerJoined", room);
    }

    public async Task MakeMove(string roomId, int index, string playerName)
    {
        if (!_gameService.TryMakeMove(roomId, playerName, index, out var room, out var error))
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }

        await Clients.Group(roomId).SendAsync("MoveMade", room);
    }

    public async Task RestartGame(string roomId, string playerName)
    {
        var room = _gameService.RestartRoom(roomId, playerName);
        if (room is null)
        {
            await Clients.Caller.SendAsync("Error", "Unable to restart this room.");
            return;
        }

        await Clients.Group(roomId).SendAsync("GameRestarted", room);
    }
}
