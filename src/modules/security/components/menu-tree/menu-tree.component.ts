import { Component, Input } from '@angular/core';
import { Menu } from '../../models/menu.mode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-tree.component.html',
  styleUrl: './menu-tree.component.scss'
})
export class MenuTreeComponent {
  @Input() menuTree: Menu[];
  @Input() disable?: boolean = true;

  setChecked(menu: Menu, parent: Menu = null) {
    if (!this.disable) {
      console.log("Why am i called")
      console.log(this.disable)
      menu.checked = !menu.checked;
      if (!parent) {
        menu.child.forEach(child => {
          child.checked = menu.checked;
        });
      } else {
        for (const child of parent.child) {
          if (child.checked) {
            parent.checked = true;
            return;
          }
        }
        parent.checked = false;
      }
    } else {
      menu.checked = menu.checked;
    }
  }
}
