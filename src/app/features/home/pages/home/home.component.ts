import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataWidget } from '../../../../shared/data-widget/data-widget';
import { DataTable } from '../../../../shared/data-table/data-table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DataWidget, DataTable],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
