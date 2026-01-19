import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  input,
  effect,
  signal,
  computed
} from '@angular/core';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartDataLabels
);


export interface Sensor {
  title: string;      // Texto que se muestra como label/título
  unit: string;    // °C, %, etc.
  tipo: 'temperature' | 'humidity'; // Para estilos, colores o lógica
}

export interface SensorHistoryPoint {
  value: number;
  timestamp: string;
}

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`
})
export class SensorChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  sensor = input<Sensor>();
  history = input<SensorHistoryPoint[]>([]);
  realtimeValue = input<number | null>(null);

  chart!: Chart;

  effectRealtime = effect(() => {
    const value = this.realtimeValue();
    if (value !== null && this.chart) {
      this.addPoint(value);
    }
  });

  ngAfterViewInit() {
    this.initChart();
    this.loadHistory();
  }

  loadHistory() {
    const labels = this.chart.data.labels!;
    const data = this.chart.data.datasets[0].data as number[];

    labels.length = 0;
    data.length = 0;

    this.history().forEach(p => {
      labels.push(new Date(p.timestamp).toLocaleTimeString());
      data.push(p.value);
    });

    this.chart.update();
  }

  addPoint(value: number) {
    const labels = this.chart.data.labels!;
    const data = this.chart.data.datasets[0].data as number[];

    labels.push(new Date().toLocaleTimeString());
    data.push(value);

    if (data.length > 60) {
      labels.shift();
      data.shift();
    }

    this.chart.update();
  }

  initChart() {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: this.sensor()!.title,
          data: [],
          borderColor: this.sensor()!.tipo === 'temperature' ? '#e63946' : '#4ecdc4',
        }]
      }
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
