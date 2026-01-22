import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Menu } from '../../../modules/security/models/menu.mode';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuTree: Menu[] = LoginContext.getMenus();
}
