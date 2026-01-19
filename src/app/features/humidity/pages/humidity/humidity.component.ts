import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SensorData, SensorDataPaginated, SensorService } from '../../../../core/services/sensor/sensor.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Paginator } from '../../../../shared/paginator/paginator';

@Component({
  selector: 'app-humidity',
  standalone: true,
  imports: [CommonModule, MatIcon, Paginator],
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.scss']
})
export class HumidityComponent implements OnInit {

  columns = ['HORA', 'VALOR'];

  // Signals para manejar los datos y la paginación
  data = signal<SensorData[]>([]);
  page = signal(1);
  limit = signal(10);
  totalPages = signal(1);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sensorService: SensorService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en query params para paginación
    this.route.queryParams.subscribe((params: Params) => {
      const page = parseInt(params['page'], 10) || 1;
      const limit = parseInt(params['limit'], 10) || 10;
      this.page.set(page);
      this.limit.set(limit);
      this.loadData(page, limit);
    });
  }

  async loadData(page: number, limit: number) {
    try {
      const response: SensorDataPaginated = await this.sensorService.getHumidityPaginated(limit, page);
      this.data.set(response.data);
      this.totalPages.set(response.pagination.totalPages);
    } catch (error) {
      console.error('Error al cargar datos de humedad', error);
      this.data.set([]);
    }
  }

  // Navegar hacia otra página
  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, limit: this.limit() },
      queryParamsHandling: 'merge',
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

