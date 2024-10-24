import { Component, Inject } from '@angular/core';
import { Menu } from '../../../modules/security/models/menu.mode';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { X, Database, UserRoundCog, LayoutDashboard, LucideAngularModule, BookUser, ScrollText, SquareActivity, FileText, BookOpenText } from 'lucide-angular';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  menuTree: Menu[] = LoginContext.getMenus();
  isScrollV = true;

  readonly X = X;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.menuTree);
    if (this.document.documentElement.getAttribute('data-layout') == 'horizontal') {
      this.isScrollV = false;
    } else {
      this.isScrollV = true;
    }
  }

  closeMobileSidebar() {
    const windowSize = this.document.documentElement.clientWidth;
    // For collapse vertical menu
    if (this.document.documentElement.getAttribute('data-layout') === 'vertical') {
        this.document.body.classList.remove('vertical-sidebar-enable');
    }
  }

  getIcon(menuCode: string): any {
    const iconMap: { [key: string]: any } = {
      "MNU_AKP0001": BookOpenText,
      "MNU_FOR0001": FileText,
      "MNU_PAK0001": SquareActivity,
      "MNU_UKM0001": ScrollText,
      "MNU_SIP0001": BookUser,
      "MNU_SEC0001": UserRoundCog,
      "MNU_MNT0001": Database,
    };

    return iconMap[menuCode] || LayoutDashboard; // Default to Menu icon if no match
  }

  isActive(menu: any): boolean {
    for (let child of menu.child) {
      const fullPath = LoginContext.getUserLoginRoute() +`/${menu.path}/${child.path}`;
      if (this.router.isActive(fullPath, true)) {
        return true;
      }
    }
    return false;
  }
}
