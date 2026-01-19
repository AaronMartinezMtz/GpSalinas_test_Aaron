import {
  Component,
  OnDestroy,
  input,
  effect,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SensorService, SensorData } from '../../core/services/sensor/sensor.service';
import { SocketService } from '../../core/socket/socket.service';
import { SensorChartComponent } from '../sensor-chart/sensor-chart';

@Component({
  selector: 'app-data-widget',
  standalone: true,
  imports: [CommonModule, SensorChartComponent],
  templateUrl: './data-widget.html',
  styleUrl: './data-widget.scss',
})
export class DataWidget implements OnDestroy {

  title = input<string>("");
  unit = input<string>("");
  endpoint = input<'temperature' | 'humidity'>('temperature');

  isLoading = signal(true);
  currentDate = signal(new Date());
  value = signal(0);

  private subscribedToSocket = false;

  private tempHandler?: (data: SensorData) => void;
  private humHandler?: (data: SensorData) => void;

  constructor(
    private sensorService: SensorService,
    private socketService: SocketService
  ) {
    effect(() => {
      this.endpoint();
      this.title();
      this.unit();

      this.unsubscribeSocket();
      this.loadInitial();
      this.subscribeToUpdates();
    });
  }

  ngOnDestroy() {
    this.unsubscribeSocket();
  }

  /* ---------------- CARGA INICIAL ---------------- */

  async loadInitial() {
    this.isLoading.set(true);

    const latest =
      this.endpoint() === 'temperature'
        ? await this.sensorService.loadLatestTemperature()
        : await this.sensorService.loadLatestHumidity();

    this.value.set(latest.value);
    this.currentDate.set(new Date(latest.timestamp));

    this.isLoading.set(false);
  }

  /* ---------------- SOCKET ---------------- */

  subscribeToUpdates() {
    if (this.subscribedToSocket) return;
    this.subscribedToSocket = true;

    if (this.endpoint() === 'temperature') {
      this.tempHandler = (data: SensorData) => {
        this.value.set(data.value);
        this.currentDate.set(new Date(data.timestamp));
      };

      this.socketService.on('temperature:update', this.tempHandler);
    }

    if (this.endpoint() === 'humidity') {
      this.humHandler = (data: SensorData) => {
        this.value.set(data.value);
        this.currentDate.set(new Date(data.timestamp));
      };

      this.socketService.on('humidity:update', this.humHandler);
    }
  }

  unsubscribeSocket() {
    if (this.tempHandler) {
      this.socketService.off('temperature:update', this.tempHandler);
      this.tempHandler = undefined;
    }

    if (this.humHandler) {
      this.socketService.off('humidity:update', this.humHandler);
      this.humHandler = undefined;
    }

    this.subscribedToSocket = false;
  }

  /* ---------------- FORMAT ---------------- */

  formatDate(fecha: Date) {
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  }

  formatTime(date: Date) {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  }
}
