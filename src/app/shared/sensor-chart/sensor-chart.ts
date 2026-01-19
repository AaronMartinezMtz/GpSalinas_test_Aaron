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

import { CommonModule } from '@angular/common';
import { SensorData, SensorService } from '../../core/services/sensor/sensor.service';
import { SocketService } from '../../core/socket/socket.service';


Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartDataLabels
);

export interface Sensor {
  name: string;
  units: string;
  type: 'temperature' | 'humidity';
}

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-chart.html',
  styleUrl: './sensor-chart.scss'
})
export class SensorChartComponent implements AfterViewInit {

  sensor = input<Sensor>();
  chart!: Chart;
  currentDate = signal(new Date());
  value = signal(0);
  maxPoints = 60;
  private subscribedToSocket = false;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  constructor(private sensorService: SensorService, private socketService: SocketService) {}

  ngAfterViewInit(): void {
    this.initializeGraphics();
    // this.loadInitialValue();
    this.loadInitialData();
    this.subscribeToUpdates();
  }
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    // Desuscribirse de actualizaciones
    this.socketService.off('temperature:update');
    this.socketService.off('humidity:update');
    this.subscribedToSocket = false;
  }

  initializeGraphics() {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: this.sensor()?.name,
            data: [],
            borderColor: this.sensor()?.type === 'temperature' ? '#e63946' : '#4ecdc4',
            backgroundColor: this.sensor()?.type === 'temperature' ? '#e63946' : '#4ecdc4',
            tension: 0.3,
            pointRadius: 1.3,
            pointHoverRadius: 8,
            pointBackgroundColor: this.sensor()?.type === 'temperature' ? '#e63946' : '#4ecdc4',
            pointBorderColor: this.sensor()?.type === 'temperature' ? '#e63946' : '#4ecdc4',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.sensor()?.type === 'temperature' ? '#e63946' : '#4ecdc4'
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                // Solo mostrar la hora
                return context[0].label;
              },
              label: (context: any) => {
                // Mostrar el valor con la unidad
                const valor = context.parsed.y;
                const unidad = context.dataset.label ? ` ${this.sensor()?.units}` : '';
                return `Valor: ${valor}${unidad}`;
              }
            }
          },
          datalabels: {
            display: (context: any) => {
              // Solo mostrar la etiqueta si el punto está activo (hover)
              return context.active ? true : false;
            },
            align: 'top',
            color: '#e63946', // Color destacado para temperatura
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#e63946',
            font: {
              weight: 'bold',
              size: 12
            },
            padding: {
              top: 18,
              bottom: 18,
              left: 18,
              right: 18
            },
            formatter: (value: any, context: any) => {
              // Mostrar la hora y el valor con 2 decimales
              const labelIndex = context.dataIndex;
              const labels = context.chart.data.labels;
              const hora = labels && labels[labelIndex] ? labels[labelIndex] : '';
              const valor = typeof value === 'number' ? value.toFixed(2) : value;
              // Detectar si es temperatura o humedad
              const unidad = this.sensor()?.type === 'temperature' ? '°C' : '%';
              return `${hora}\n${valor} ${unidad}`;
            }
          }
        },
        scales: {
          x: {
            ticks: {
              display: false
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: false,
            min: this.sensor()?.type === 'temperature' ? 10 : 30,
            max: this.sensor()?.type === 'temperature' ? 25 : 70
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  subscribeToUpdates(): void {
    // Si ya estamos suscritos, no volver a suscribirse
    if (this.subscribedToSocket) {
      return;
    }
    this.subscribedToSocket = true;

    // Suscribirse al evento correspondiente
    if (this.sensor()?.type === 'temperature') {
      this.socketService.on('temperature:update', (data: {value: number, unit: string, timestamp: string}) => {
        this.addData(data.value, new Date(data.timestamp));
      });
    } else {
      this.socketService.on('humidity:update', (data: {value: number, unit: string, timestamp: string}) => {
        this.addData(data.value, new Date(data.timestamp));
      });
    }
  }

  addData(value: number, date: Date) {
    const labels = this.chart.data.labels!;
    const data = this.chart.data.datasets[0].data as number[];

    labels.push(this.formatearHora(date));
    data.push(value);
    
    // Actualizar value y currentDate con el nuevo dato
    this.value.set(value);
    this.currentDate.set(date);
    if (data.length > this.maxPoints) {
      labels.shift();
      data.shift();
    }

    this.chart.update();
  }

  async loadInitialData(): Promise<void> {
    try {
      // Obtener el historial según el tipo de sensor
      const data: SensorData[] = this.sensor()?.type === 'temperature'
        ? await this.sensorService.getTemperatureHistory()
        : await this.sensorService.getHumidityHistory();

      const labels = this.chart.data.labels!;
      const chartData = this.chart.data.datasets[0].data as number[];

      // Limpiar datos anteriores
      labels.length = 0;
      chartData.length = 0;

      if (data.length > 0) {
        // Cargar nuevos datos (invertir orden: último al primero)
        data.reverse().forEach(punto => {
          labels.push(this.formatearHora(new Date(punto.timestamp)));
          chartData.push(punto.value);
        });

        // Actualizar currentDate con la fecha del último dato cargado
        this.currentDate.set(new Date(data[data.length - 1].timestamp));
      } else {
        // Si no hay datos, agregar un valor inicial desde el signal
        const valorInicial = this.value();
        const ahora = new Date();
        labels.push(this.formatearHora(ahora));
        chartData.push(valorInicial);
        this.currentDate.set(ahora);
      }

      this.chart.update();
    } catch (err) {
      console.error('Error cargando histórico:', err);

      // Manejar error agregando valor inicial
      const valorInicial = this.value();
      const ahora = new Date();
      const labels = this.chart.data.labels!;
      const chartData = this.chart.data.datasets[0].data as number[];
      labels.push(this.formatearHora(ahora));
      chartData.push(valorInicial);
      this.currentDate.set(ahora);
      this.chart.update();
    }
  }


formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  }

  
}