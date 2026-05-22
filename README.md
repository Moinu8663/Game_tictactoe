# Tic Tac Toe SignalR + Angular 21

This workspace contains a real-time multiplayer Tic Tac Toe application.

## Backend
Location: `backend`

- ASP.NET Core 10 Web API
- SignalR hub at `/gamehub`
- In-memory game rooms with create/join/move/restart support
- Health endpoint at `/health`

Run backend:

```powershell
cd backend
dotnet run
```

### Publish backend to Azure App Service

Prerequisites:

- Azure CLI installed and logged in with `az login`
- An Azure subscription selected with `az account set --subscription "<subscription-id-or-name>"`

Create the Azure resources:

```powershell
$resourceGroup = "rg-tictactoe"
$location = "centralindia"
$plan = "asp-tictactoe"
$app = "tictactoe-api-<unique-name>"

az group create --name $resourceGroup --location $location
az appservice plan create --name $plan --resource-group $resourceGroup --sku B1 --is-linux
az webapp create --name $app --resource-group $resourceGroup --plan $plan --runtime "DOTNETCORE:10.0"
```

Configure SignalR-friendly App Service settings:

```powershell
az webapp config set --resource-group $resourceGroup --name $app --web-sockets-enabled true

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $app `
  --settings AllowedOrigins="http://localhost:4200;https://<your-frontend-domain>"
```

Publish and deploy:

```powershell
cd backend
dotnet publish -c Release -o publish
Compress-Archive -Path .\publish\* -DestinationPath .\backend.zip -Force

az webapp deploy `
  --resource-group $resourceGroup `
  --name $app `
  --src-path .\backend.zip `
  --type zip
```

Verify:

```powershell
curl https://$app.azurewebsites.net/health
```

After deployment, update the Angular production SignalR URL to:

```ts
signalRHubUrl: 'https://<your-app-name>.azurewebsites.net/gamehub'
```

## Frontend
Location: `frontend`

- Angular 21 standalone component
- SignalR client using `@microsoft/signalr`

Install and run frontend:

```powershell
cd frontend
npm install
npm start
```

If PowerShell blocks script execution for `npm`, use Command Prompt or set the execution policy temporarily.

## Notes
- The Angular app connects to the URL in `frontend/src/environments/environment*.ts`.
- Create a room with one player, then join the same room code from another browser or device.
- Moves are broadcast to all participants in the room.
