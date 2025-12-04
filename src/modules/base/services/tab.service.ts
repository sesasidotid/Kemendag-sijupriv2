// import { Injectable } from '@angular/core'
// import { BehaviorSubject } from 'rxjs'

// export interface Tab {
//     label: string
//     isActive?: boolean
//     icon?: string
//     onClick: () => void
// }

// @Injectable({
//     providedIn: 'root',
// })
// export class TabService {
//     private tabsSubject = new BehaviorSubject<Tab[]>([])
//     tabs$ = this.tabsSubject.asObservable()

//     private activeTabSubject = new BehaviorSubject<number>(0)
//     activeTab$ = this.activeTabSubject.asObservable()

//     addTab(tab: Tab): TabService {
//         const currentTabs = this.tabsSubject.getValue()
//         this.tabsSubject.next([...currentTabs, tab])
//         return this
//     }

//     clearTabs(): void {
//         this.tabsSubject.next([])
//         this.activeTabSubject.next(0)
//     }

//     getTabsLength(): number {
//         return this.tabsSubject.getValue().length
//     }

//     changeTabActive(tabIndex: number) {
//         const currentTabs = this.tabsSubject.value
//         const updatedTabs = currentTabs.map((item, index) => ({
//             ...item,
//             isActive: index === tabIndex,
//         }))
//         this.tabsSubject.next(updatedTabs)
//         this.activeTabSubject.next(tabIndex)
//     }
// }

import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Router } from '@angular/router'

export interface Tab {
    label: string
    isActive?: boolean
    icon?: string
    onClick: () => void
}

@Injectable({
    providedIn: 'root',
})
export class TabService {
    private tabsSubject = new BehaviorSubject<Tab[]>([])
    tabs$ = this.tabsSubject.asObservable()

    private activeTabSubject = new BehaviorSubject<number>(0)
    activeTab$ = this.activeTabSubject.asObservable()

    constructor(private router: Router) {}

    addTab(tab: Tab): TabService {
        const currentTabs = this.tabsSubject.getValue()
        this.tabsSubject.next([...currentTabs, tab])
        return this
    }

    clearTabs(): void {
        this.tabsSubject.next([])
        this.activeTabSubject.next(0)
    }

    getTabsLength(): number {
        return this.tabsSubject.getValue().length
    }

    changeTabActive(tabIndex: number) {
        const currentTabs = this.tabsSubject.value
        const updatedTabs = currentTabs.map((item, index) => ({
            ...item,
            isActive: index === tabIndex,
        }))

        this.tabsSubject.next(updatedTabs)
        this.activeTabSubject.next(tabIndex)

        // 🔥 Remove query params when tab changes
        this.router.navigate([], {
            queryParams: {},
            queryParamsHandling: '', // clear all
            replaceUrl: true, // optional: avoid pushing history
        })
    }
}
