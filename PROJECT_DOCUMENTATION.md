# Tic Tac Toe Arena

## Project Overview

This project is a real-time multiplayer Tic Tac Toe application built with:
- Backend: ASP.NET Core 10 Web API and SignalR
- Frontend: Angular 21 standalone component architecture
- Real-time room-based gameplay using SignalR for updates
- Three play modes: Online multiplayer, AI opponent, and local two-player

The codebase is split into two folders:
- `backend/` — API, SignalR hub, game state logic
- `frontend/` — Angular application, UI components, SignalR client

---

## Architecture

### Backend

The backend hosts the game API and SignalR hub.

Key elements:
- `Program.cs`
  - Configures controllers, SignalR, and CORS.
  - Maps the SignalR hub at `/gamehub`.
- `Controllers/GameController.cs`
  - Defines REST endpoints for creating rooms, joining rooms, making moves, restarting, and leaving.
  - Uses `IHubContext<GameHub>` to broadcast events to connected players.
- `Hubs/GameHub.cs`
  - Manages group membership and emits room events.
  - Supports `JoinRoomGroup`, `CreateRoom`, `JoinRoom`, `MakeMove`, `LeaveRoom`, and `RestartGame`.
- `Services/GameService.cs`
  - Stores rooms in-memory using `ConcurrentDictionary<string, GameRoom>`.
  - Handles room creation, joining, move validation, win/draw detection, restart logic.

### Frontend

The frontend is an Angular application built with standalone components.

Key elements:
- `src/app/app.routes.ts`
  - Defines navigation routes for Home, Dashboard, Multiuser, Singleuser, Computer, About, Privacy, Terms, and Contact.
- `src/app/services/game.service.ts`
  - Manages SignalR connection and REST calls to the backend.
  - Connects to the SignalR hub URL defined in `src/environments/environment.ts`.
- `src/app/models/game-room.ts`
  - Defines the shared `GameRoom` interface used by backend and frontend.
- Components:
  - `multiuser` — online multiplayer with room create/join and real-time board sync
  - `singleuser` — local two-player on the same device
  - `comuser` — single-player mode against the computer AI
  - `game-dashboard` — chooses between game modes
  - `home`, `about`, `privacy-policy`, `terms`, `contact` — informational pages

---

## Backend Details

### Program.cs

Backend configuration includes:
- `builder.Services.AddControllers();`
- `builder.Services.AddSignalR();`
- `builder.Services.AddSingleton<GameService>();`
- CORS policy allowing `http://localhost:4200` and configured allowed origins.
- `app.MapControllers();`
- `app.MapHub<GameHub>("/gamehub");`

### GameController Endpoints

| Route | Method | Purpose |
|---|---|---|
| `api/game/rooms` | POST | Create a new room and broadcast `RoomCreated` |
| `api/game/rooms/{roomId}` | GET | Fetch current room state |
| `api/game/rooms/{roomId}/join` | POST | Join an existing room and broadcast `PlayerJoined` |
| `api/game/rooms/{roomId}/moves` | POST | Submit a move and broadcast `MoveMade` |
| `api/game/rooms/{roomId}/restart` | POST | Restart the match and broadcast `GameRestarted` |
| `api/game/rooms/{roomId}/leave` | POST | Notify all players to return to lobby via `ReturnToLobby` |

### GameHub methods

| Method | Parameters | Behavior |
|---|---|---|
| `JoinRoomGroup(roomId)` | `roomId` | Adds caller to hub group and sends `RoomUpdated` |
| `CreateRoom(playerName)` | `playerName` | Creates room and sends `RoomCreated` |
| `JoinRoom(roomId, playerName)` | `roomId`, `playerName` | Joins player and broadcasts `PlayerJoined` |
| `MakeMove(roomId, index, playerName)` | `roomId`, `index`, `playerName` | Validates move and broadcasts `MoveMade` |
| `LeaveRoom(roomId)` | `roomId` | Broadcasts `ReturnToLobby` and removes caller from group |
| `RestartGame(roomId, playerName)` | `roomId`, `playerName` | Restarts game and broadcasts `GameRestarted` |

### Game Service Behavior

- `CreateRoom(playerName)` creates a room and assigns `PlayerX`.
- `JoinRoom(roomId, playerName)` assigns `PlayerO` if empty.
- `TryMakeMove(roomId, playerName, index, out room, out error)` validates:
  - room existence
  - whether game is over
  - valid cell index
  - cell availability
  - player membership and correct turn
- The game checks win conditions and draws after each move.
- Scores are tracked per room:
  - `PlayerXScore`
  - `PlayerOScore`
  - `Draws`
- `RestartRoom(roomId, playerName)` resets board state but preserves room players and scores.

### GameRoom Model

The backend model includes:
- `RoomId`
- `PlayerX`, `PlayerO`
- `Board` array of 9 cells
- `CurrentTurn`
- `GameOver`
- `Winner`
- `PlayerXScore`, `PlayerOScore`, `Draws`
- `CreatedAt`

---

## Frontend Details

### Environment Configuration

The frontend uses `src/environments/environment.ts`.
Default production and development URLs are configured there for API and SignalR hub.

### SignalR Client Setup

`GameService` handles:
- Establishing connection to backend SignalR hub
- Automatic reconnect behavior
- API requests for room operations
- Joining hub groups with `JoinRoomGroup`

### Major Components

#### Multiuser

- Creates and joins online rooms
- Shows room state, board, player names, and scores
- Displays room invite popup on creation
- Listens for hub events: `RoomCreated`, `PlayerJoined`, `MoveMade`, `GameRestarted`, `RoomUpdated`, `ReturnToLobby`.

#### GameDashboard

- Landing page for selecting game mode
- Uses card-style navigation for Online, AI, and Local play

#### Singleuser & Comuser

- Local game modes for same-device or computer play
- Tracks game state, turn order, winner, and score

#### Legal Pages

- `About`, `Privacy Policy`, `Terms`, and `Contact`
- Shared styling via `legal-page.css`

---

## Run Instructions

### Backend

```powershell
cd backend
dotnet run
```

The backend listens for API calls and SignalR connections.

### Frontend

```powershell
cd frontend
npm install
npm start
```

The Angular app should open on the configured local port.

---

## Deployment Notes

- Backend can be deployed to Azure App Service with web sockets enabled.
- Update allowed origins for CORS and the frontend SignalR hub URL after deployment.
- The README includes Azure deployment scripts for resource creation and zip deployment.

---

## File Map

### Backend
- `backend/Program.cs` — app bootstrap and routing
- `backend/Controllers/GameController.cs` — REST API endpoints
- `backend/Hubs/GameHub.cs` — SignalR hub methods
- `backend/Services/GameService.cs` — game room logic and state
- `backend/Models/GameRoom.cs` — shared room state model

### Frontend
- `frontend/src/app/app.routes.ts` — Angular routes
- `frontend/src/app/services/game.service.ts` — API/SignalR client service
- `frontend/src/app/models/game-room.ts` — shared frontend room interface
- `frontend/src/app/Component/game-dashboard` — mode selection UI
- `frontend/src/app/Component/multiuser` — online multiplayer UI
- `frontend/src/app/Component/singleuser` — local two-player UI
- `frontend/src/app/Component/comuser` — computer opponent UI
- `frontend/src/app/Component/about` — about page
- `frontend/src/app/Component/privacy-policy` — privacy page
- `frontend/src/app/Component/terms` — terms page
- `frontend/src/app/Component/contact` — contact page

---

## Features

- Real-time room-based Tic Tac Toe
- Player name-based room join logic
- Turn-based move validation
- Win/draw detection and score tracking
- Auto lobby return when a player leaves
- Responsive dashboard and gameplay UI
- Static legal pages for privacy and terms

---

## Notes

- The backend uses in-memory storage and is not persistent across restarts.
- Room IDs are generated with GUIDs and shared between players.
- The frontend relies on the selected environment URLs for API and SignalR connections.
