import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { SocketService } from './core/socket/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('gp-salinas-app');

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.connect();
  }
}
