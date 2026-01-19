import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './paginator.html',
  styleUrls: ['./paginator.scss'],
})
export class Paginator implements OnChanges {
  // Inputs tipo signal
  currentPage = input(1);       // solo lectura
  totalPages = input(1);        // solo lectura
  pages = input<number[] | undefined>(undefined); // opcional

  // Output cuando se cambia la página
  pageChange = output<number>();

  // Signal interno que podemos modificar
  private _currentPage = signal(this.currentPage());

  // Computar array de páginas a mostrar
  displayedPages = computed(() => {
    if (this.pages()) return this.pages()!;
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnChanges() {
    // Sincronizar signal interno con el input
    this._currentPage.set(this.currentPage());
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this._currentPage.set(page); // actualiza signal interno
    this.pageChange.emit(page);  // notifica al componente padre
  }

  // Getter para usar en la plantilla
  current() {
    return this._currentPage();
  }
}
