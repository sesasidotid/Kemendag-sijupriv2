import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-riwayat',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './riwayat.component.html',
  styleUrl: './riwayat.component.scss'
})
export class RiwayatComponent {

  currentPath: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getCurrentPath();
  }

  getCurrentPath(): void {
    this.currentPath = this.router.url.replace("pending", "").replace("add", "");
  }
}
