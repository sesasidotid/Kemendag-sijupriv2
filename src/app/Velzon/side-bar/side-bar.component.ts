import { Component, Inject } from '@angular/core'
import { Menu } from '../../../modules/security/models/menu.mode'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule, DOCUMENT } from '@angular/common'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import {
    X,
    Database,
    UserRoundCog,
    LayoutDashboard,
    LucideAngularModule,
    BookUser,
    ScrollText,
    SquareActivity,
    FileText,
    BookOpenText,
    UserMinus,
} from 'lucide-angular'
import { IsActiveMatchOptions } from '@angular/router'
import { Role } from '@/modules/security/models/role.model'

@Component({
    selector: 'app-side-bar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
    templateUrl: './side-bar.component.html',
    styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
    menuTree: Menu[] = LoginContext.getMenus()
    roles: string[] = LoginContext.getRoleCodes()
    isParticipantUkom: boolean = LoginContext.getUserId().startsWith('PU')
    isScrollV = true

    readonly X = X

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private router: Router,
    ) {}

    ngOnInit() {
        if (
            this.document.documentElement.getAttribute('data-layout') ==
            'horizontal'
        ) {
            this.isScrollV = false
        } else {
            this.isScrollV = true
        }

        if (this.isParticipantUkom) {
            //built tree for resignation
            this.buildResignationMenu()
        }
    }

    closeMobileSidebar() {
        const windowSize = this.document.documentElement.clientWidth
        // For collapse vertical menu
        if (
            this.document.documentElement.getAttribute('data-layout') ===
            'vertical'
        ) {
            this.document.body.classList.remove('vertical-sidebar-enable')
        }
    }

    getIcon(menuCode: string): any {
        const iconMap: { [key: string]: any } = {
            MNU_AKP0001: BookOpenText,
            MNU_AKPJE001: BookOpenText,
            MNU_FOR0001: FileText,
            MNU_FORU0001: FileText,
            MNU_FORJE001: FileText,
            MNU_PAK0001: SquareActivity,
            MNU_UKM0001: ScrollText,
            MNU_UKMJE001: ScrollText,
            MNU_SIP0001: BookUser,
            MNU_SIPU0001: BookUser,
            MNU_SIPI0001: BookUser,
            MNU_SEC0001: UserRoundCog,
            MNU_MNT0001: Database,
            MNU_MNTI0001: Database,
            MNU_RESIGNATION: UserMinus,
        }

        return iconMap[menuCode] || LayoutDashboard // Default to Menu icon if no match
    }

    isActive(menu: any): boolean {
        const matchOptions: IsActiveMatchOptions = {
            paths: 'subset',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored',
        }

        for (let child of menu.child) {
            const fullPath = `/${menu.path}/${child.path}`
            if (this.router.isActive(fullPath, matchOptions)) {
                return true
            }
        }
        return false
    }

    private buildResignationMenu(): void {
        const resignationMenu = new Menu({
            code: 'MNU_RESIGNATION',
            name: 'Pengunduran Diri',
            level: 1,
            type: 'MENU',
            path: 'resignation',
            fullPath: '/resignation',
            active: false,
            icon: 'UserMinus',
            parentMenuCode: null,
            child: [
                new Menu({
                    code: 'MNU_RESIGNATION_SUBMIT',
                    name: 'Pengajuan Pengunduran Diri',
                    level: 2,
                    type: 'MENU',
                    path: '',
                    fullPath: '/resignation',
                    active: false,
                    parentMenuCode: 'MNU_RESIGNATION',
                    child: [],
                }),
                new Menu({
                    code: 'MNU_RESIGNATION_HISTORY',
                    name: 'Riwayat Pengunduran Diri',
                    level: 2,
                    type: 'MENU',
                    path: 'riwayat',
                    fullPath: '/resignation/riwayat',
                    active: false,
                    parentMenuCode: 'MNU_RESIGNATION',
                    child: [],
                }),
            ],
        })

        this.menuTree = [...this.menuTree, resignationMenu]
    }
}
