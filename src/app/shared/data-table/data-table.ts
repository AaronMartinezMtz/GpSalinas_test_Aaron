import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService } from '../../core/services/sensor/sensor.service';
// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
export interface SensorData {
  value: number;
  unit: string;
  timestamp: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {

  title = input<string>('');
  columns = input<string[]>([]);
  endpoint = input<'temperature' | 'humidity'>('temperature');

  data = signal<SensorData[]>([]);
  loading = signal<boolean>(true);

  constructor(private sensorService: SensorService, private router: Router) {

    /**
     * 1. Cargar historial REST (15 minutos)
     */
    effect(() => {
      const type = this.endpoint();
      this.loading.set(true);

      (async () => {
        try {
          const history =
            type === 'temperature'
              ? await this.sensorService.getTemperatureHistory()
              : await this.sensorService.getHumidityHistory();

          // guardamos solo los 10 más recientes
          this.data.set(history.slice(0, 3));

        } catch (err) {
          console.error('Error cargando tabla:', err);
          this.data.set([]);
        } finally {
          this.loading.set(false);
        }
      })();
    });

    /**
     * 2. Actualizar automáticamente cuando el socket modifique history del service
     */
    effect(() => {
      const type = this.endpoint();

      const liveHistory =
        type === 'temperature'
          ? this.sensorService.historyTemperature()
          : this.sensorService.historyHumidity();

      if (!liveHistory.length) return;

      this.data.set(liveHistory.slice(0, 3));
    });

  }

  goToDetails() { 
    const type = this.endpoint();
    this.router.navigate([`/${type}`]);  
  }

}
