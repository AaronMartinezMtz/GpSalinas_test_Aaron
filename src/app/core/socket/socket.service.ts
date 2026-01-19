import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SensorService } from '../services/sensor/sensor.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private listenersSetup = false;

  constructor(private sensorService: SensorService) {}

  connect(url: string = environment.apiUrl): void {
    if (!this.socket) {
      this.socket = io(url);
      this.setupListeners();
    }
  }

  private setupListeners(): void {
    if (this.listenersSetup) {
      return;
    }
    this.listenersSetup = true;

    this.on('temperature:update', (data: {value: number, unit: string, timestamp: string}) => {
      this.sensorService.updateTemperature(data);            
    });

    this.on('humidity:update', (data: {value: number, unit: string, timestamp: string}) => {
      this.sensorService.updateHumidity(data);
    });
  }


  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listenersSetup = false;
    }
  }
  

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  

   off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket!.off(event, callback);
    } else {
      this.socket!.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

