import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';


export interface SensorData {
  value: number;
  unit: string;
  timestamp: string;
}

export interface SensorDataPaginated {
  data: SensorData[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}


@Injectable({
  providedIn: 'root'
})
export class SensorService {
  
  private apiUrl = environment.apiUrl;

  temperature = signal<SensorData>({
    value: 22.5, // valor de ejemplo
    unit: 'C',
    timestamp: ""
  });

  humidity = signal<SensorData>({
    value: 65, //valor de ejemplo
    unit: '%',
    timestamp: ""
  });

  historyTemperature = signal<SensorData[]>([]);
  historyHumidity = signal<SensorData[]>([]);

  constructor(private http: HttpClient) {}
  
  getTemperature() {
    return this.temperature;
  }

  getHumidity() {
    return this.humidity;
  }

  getTemperatureHistoryData() {
    return this.historyTemperature;
  }

  getHumidityHistoryData() {
    return this.historyHumidity;
  }

  updateTemperature(data: SensorData): void {
    this.temperature.set(data);
    this.historyTemperature.update(history => [
      {
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp
      },
      ...history
    ]);

  }

  updateHumidity(data: SensorData): void {
    this.humidity.set(data);
    this.historyHumidity.update(history => [
      {
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp
      },
      ...history
    ]);
  }

  // Obtener el historial de los 15 minutos anteriores de temperatura y humedad  desde la API REST

  async getTemperatureHistory(): Promise<SensorData[]> {
    return firstValueFrom(
      this.http.get<SensorData[]>(`${this.apiUrl}/api/temperature/last-15-minutes`)
    );
  }

  async getHumidityHistory(): Promise<SensorData[]> {
    return firstValueFrom(
      this.http.get<SensorData[]>(`${this.apiUrl}/api/humidity/last-15-minutes`)
    );
  }

  //Obtiner el ultimo valor de temperatura y humedad desde la API REST

  // Obtener datos paginados de temperatura y humedad
  async getTemperaturePaginated(limit = 10, page = 1): Promise<SensorDataPaginated> {
    const params = new HttpParams().set('limit', limit).set('page', page);
    return firstValueFrom(this.http.get<SensorDataPaginated>(`${this.apiUrl}/api/temperature`, { params }));
  }

  async getHumidityPaginated(limit = 10, page = 1): Promise<SensorDataPaginated> {
    const params = new HttpParams().set('limit', limit).set('page', page);
    return firstValueFrom(this.http.get<SensorDataPaginated>(`${this.apiUrl}/api/humidity`, { params }));
  }

  // Cargar el último valor de temperatura y humedad y actualizar los signals
  async loadLatestTemperature(): Promise<SensorData> {
    const data = await firstValueFrom(
      this.http.get<SensorData>(`${this.apiUrl}/api/temperature/latest`)
    );
    this.temperature.set(data);
    return data;
  }

  async loadLatestHumidity(): Promise<SensorData> {
    const data = await firstValueFrom(
      this.http.get<SensorData>(`${this.apiUrl}/api/humidity/latest`)
    );
    this.humidity.set(data);
    return data;
  }
}
