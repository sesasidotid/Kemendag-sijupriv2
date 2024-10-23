import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-formasi-request',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './formasi-request.component.html',
  styleUrl: './formasi-request.component.scss'
})
export class FormasiRequestComponent {
  @Input() objectTaskId: string;
}
