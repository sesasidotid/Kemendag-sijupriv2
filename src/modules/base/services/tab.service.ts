import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

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

    // changeTabActive(tab: number) {
    //     const currentTabs = this.tabsSubject.value
    //     const updatedTabs = currentTabs.map((item, index) => {
    //         if (index === tab) {
    //             return { ...item, isActive: true }
    //         }
    //         return { ...item, isActive: false }
    //     })

    //     this.tabsSubject.next(updatedTabs)
    // }
    changeTabActive(tabIndex: number) {
        const currentTabs = this.tabsSubject.value
        const updatedTabs = currentTabs.map((item, index) => ({
            ...item,
            isActive: index === tabIndex,
        }))
        this.tabsSubject.next(updatedTabs)
        this.activeTabSubject.next(tabIndex)
    }
}
