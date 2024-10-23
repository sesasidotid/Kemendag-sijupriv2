import { Component, Inject } from '@angular/core';
import { Menu } from '../../../modules/security/models/menu.mode';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  menuTree: Menu[] = LoginContext.getMenus();
  isScrollV = true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.document.documentElement.getAttribute('data-layout') == 'horizontal') {
      this.isScrollV = false;
    } else {
      this.isScrollV = true;
    }
  }

  isActive(menu: any): boolean {
    for (let child of menu.child) {
      const fullPath = `${menu.path}/${child.path}`;
      if (this.router.isActive(fullPath, true)) {
        return true;
      }
    }
    return false;
  }
}
