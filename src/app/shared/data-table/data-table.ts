import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService } from '../../core/services/sensor/sensor.service';

export interface SensorData {
  value: number;
  unit: string;
  timestamp: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {

  title = input<string>('');
  columns = input<string[]>([]);
  endpoint = input<'temperature' | 'humidity'>('temperature');

  data = signal<SensorData[]>([]);

  constructor(private sensorService: SensorService) {

    effect(() => {
      const type = this.endpoint();

      if (type === 'temperature') {
        this.sensorService.getTemperaturePaginated().subscribe(res => {
          this.data.set(res.data);
        });
      }

      if (type === 'humidity') {
        this.sensorService.getHumidityPaginated().subscribe(res => {
          this.data.set(res.data);
        });
      }
    });

  }
}
