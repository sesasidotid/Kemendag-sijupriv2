import { Component } from '@angular/core'
import { Role } from '../../../modules/security/models/role.model'
import { RoleService } from '../../../modules/security/services/role.service'
import { MenuService } from '../../../modules/security/services/menu.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Menu } from '../../../modules/security/models/menu.mode'
import { MenuTreeComponent } from '../../../modules/security/components/menu-tree/menu-tree.component'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-role-update',
  standalone: true,
  imports: [MenuTreeComponent, CommonModule, FormsModule],
  templateUrl: './role-update.component.html',
  styleUrl: './role-update.component.scss'
})
export class RoleUpdateComponent {
  roleCode: string
  role: Role
  menuTree: Menu[]

  editable: boolean = false

  constructor (
    private roleService: RoleService,
    private menuService: MenuService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.roleCode = params['code']
    })
  }

  ngOnInit () {
    this.getRole()
    this.getMenuTree()
  }

  getRole () {
    this.roleService.findByCode(this.roleCode).subscribe({
      next: (role: Role) => {
        this.role = role
        this.role.menuCodeList = []
      }
    })
  }

  getMenuTree () {
    this.menuService
      .findTreeByRoleCodeAndApplicationCode(
        this.roleCode,
        LoginContext.getApplicationCode()
      )
      .subscribe({
        next: (menuTree: Menu[]) => {
          this.menuTree = menuTree
          console.log(menuTree)
        }
      })
  }

  backToList () {
    this.router.navigate(['/security/role'])
  }
  submit () {
    this.role.menuCodeList.length = 0
    for (const menu of this.menuTree) {
      if (menu.checked) this.role.menuCodeList.push(menu.code)
      if (menu.child)
        for (const child of menu.child) {
          if (child.checked) this.role.menuCodeList.push(child.code)
        }
    }
    this.role.isCreatable = true
    this.role.isUpdatable = true
    this.role.isDeletable = true
    this.role.applicationCode = 'sijupri-admin'

    this.roleService.update(this.role).subscribe({
      next: () => this.router.navigate(['/security/role'])
    })
  }
}
