import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameRoom } from '../models/game-room';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  hubConnection!: signalR.HubConnection;
  private connectingPromise: Promise<void> | null = null;
  private readonly apiUrl = `${environment.apiBaseUrl}/game`;

  constructor(private http: HttpClient) {}

  connect(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl)
      .withAutomaticReconnect()
      .build();

    this.connectingPromise = this.hubConnection.start().finally(() => {
      this.connectingPromise = null;
    });

    return this.connectingPromise;
  }

  disconnect(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.resolve();
    }

    return this.hubConnection.stop();
  }

  async createRoom(playerName: string): Promise<GameRoom> {
    await this.ensureConnected();
    const room = await firstValueFrom(
      this.http.post<GameRoom>(`${this.apiUrl}/rooms`, {
        playerName,
        connectionId: this.hubConnection.connectionId
      })
    );

    await this.joinRoomGroup(room.roomId);
    return room;
  }

  async joinRoom(roomId: string, playerName: string): Promise<GameRoom> {
    await this.ensureConnected();
    const room = await firstValueFrom(
      this.http.post<GameRoom>(`${this.apiUrl}/rooms/${roomId}/join`, {
        playerName,
        connectionId: this.hubConnection.connectionId
      })
    );

    await this.joinRoomGroup(room.roomId);
    return room;
  }

  makeMove(roomId: string, index: number, playerName: string): Promise<GameRoom> {
    return firstValueFrom(
      this.http.post<GameRoom>(`${this.apiUrl}/rooms/${roomId}/moves`, { playerName, index })
    );
  }

  restartGame(roomId: string, playerName: string): Promise<GameRoom> {
    return firstValueFrom(
      this.http.post<GameRoom>(`${this.apiUrl}/rooms/${roomId}/restart`, { playerName })
    );
  }

  private async ensureConnected(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    return this.connect();
  }

  private async joinRoomGroup(roomId: string): Promise<void> {
    await this.ensureConnected();
    await this.hubConnection.invoke('JoinRoomGroup', roomId);
  }
}
