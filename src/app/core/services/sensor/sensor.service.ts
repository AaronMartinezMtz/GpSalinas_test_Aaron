import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


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

export interface SensorHistoryPoint {
  value: number;
  timestamp: string;
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

  constructor(private http: HttpClient) {}
  
  getTemperature() {
    return this.temperature;
  }

  getHumidity() {
    return this.humidity;
  }

  updateTemperature(data: SensorData): void {
    this.temperature.set(data);
  }

  updateHumidity(data: SensorData): void {
    this.humidity.set(data);
  }

  // Obtener el historial de los 15 minutos anteriores de temperatura y humedad  desde la API REST

  getTemperatureHistory(): Observable<SensorHistoryPoint[]> {
    return this.http.get<SensorHistoryPoint[]>(`${this.apiUrl}/api/temperature/last-15-minutes`);
  }

  getHumidityHistory(): Observable<SensorHistoryPoint[]> {
    return this.http.get<SensorHistoryPoint[]>(`${this.apiUrl}/api/humidity/last-15-minutes`);
  }

  //Obtiner el ultimo valor de temperatura y humedad desde la API REST

  getLatestTemperature(): Observable<SensorData> {
    return this.http.get<SensorData>(`${this.apiUrl}/api/temperature/latest`);
  }

  getLatestHumidity(): Observable<SensorData> {
    return this.http.get<SensorData>(`${this.apiUrl}/api/humidity/latest`);
  }

  // Obtener datos paginados de temperatura y humedad

  getTemperaturePaginated(
    limit: number = 10,
    page: number = 1
  ): Observable<SensorDataPaginated> {

    const params = new HttpParams()
      .set('limit', limit)
      .set('page', page);

    return this.http.get<SensorDataPaginated>(
      `${this.apiUrl}/api/temperature`,
      { params }
    );
  }

  getHumidityPaginated(
    limit: number = 10,
    page: number = 1
  ): Observable<SensorDataPaginated> {

    const params = new HttpParams()
      .set('limit', limit)
      .set('page', page);

    return this.http.get<SensorDataPaginated>(
      `${this.apiUrl}/api/humidity`,
      { params }
    );
  }


  // Cargar el último valor de temperatura y humedad y actualizar los signals

  loadLatestTemperature(): Observable<SensorData> {
    return new Observable(observer => {
      this.getLatestTemperature().subscribe({
        next: (data: SensorData) => {
          this.updateTemperature(data);
          observer.next(data);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  loadLatestHumidity(): Observable<SensorData> {
    return new Observable(observer => {
      this.getLatestHumidity().subscribe({
        next: (data: SensorData) => {
          this.updateHumidity(data);
          observer.next(data);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
