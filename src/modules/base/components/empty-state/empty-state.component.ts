import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginContext } from '../../commons/login-context';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() title: string = 'Tidak ada data';
  @Input() description: string = 'Kamu bisa menambahkan data dengan menekan tombol dibawah ini.';
  @Input() buttonText: string;
  @Input() buttonAction: () => void = () => {};
  @Input() buttonIcon: string;
  @Input() icon: string = 'mdi-folder-open-outline';
  @Input() iconColor: string = 'primary';

  constructor(private router: Router) {}

  handleButtonClick() {
    console.log(this.buttonAction)
    if (this.buttonAction) {
      this.buttonAction();
    }
  }
}