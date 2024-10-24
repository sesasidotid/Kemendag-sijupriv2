import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Tab {
  label: string;
  isActive?: boolean;
  icon?: string;
  onClick: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private tabsSubject = new BehaviorSubject<Tab[]>([]);
  tabs$ = this.tabsSubject.asObservable();

  addTab(tab: Tab): TabService {
    const currentTabs = this.tabsSubject.getValue();
    this.tabsSubject.next([...currentTabs, tab]);
    return this
  }

  clearTabs(): void {
    this.tabsSubject.next([]);
  }
}

