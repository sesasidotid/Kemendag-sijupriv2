import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pagable } from '../../commons/pagable/pagable';

@Component({
  selector: 'app-pagable',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pagable.component.html',
  styleUrls: ['./pagable.component.scss'],
})
export class PagableComponent implements OnChanges {
  @Input() pagable!: Pagable;

  page: number = 1;
  limit: number = 10;
  sortOrder: { [key: string]: 'asc' | 'desc' | '' } = {};
  paginator: any;
  onLoad: boolean = false;

  constructor(private apiService: ApiService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pagable']) {
      this.pagable.primaryColumnList.forEach(column => {
        this.sortOrder[column.property] = '';
      });
      this.fetchData();
    }
  }

  isSearchExist() {
    for (const filter of this.pagable.filterLIst) {
      if (filter.label) {
        return true;
      }
    }
    return false;
  }

  getPages(): (number | string)[] {
    const totalPages = this.paginator.lastPage;
    const currentPage = this.page;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('...');
      }
      for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  }

  fetchData(): void {
    this.onLoad = true;
    let query = `?page=${this.page}&limit=${this.limit}`;

    for (const property in this.sortOrder) {
      if (this.sortOrder[property] !== '') {
        query += `&${this.sortOrder[property]}_${property}=true`;
      }
    }

    if (this.pagable.filterLIst) {
      this.pagable.filterLIst.forEach(filter => {
        if (filter.value) {
          query += `&${filter.key}=${filter.value}`;
        }
      });
    }

    this.apiService.getData(`${this.pagable.endpoint}${query}`).subscribe({
      next: (response: any) => {
        this.paginator = response;
        this.onLoad = false;
      },
      error: (e) => {
        console.error('Error fetching data', e);
        // Optional: Add user-friendly error handling here
      }
    });
  }

  getPropertyValue(object: any, property: string): any {
    return property.split('|').reduce((o, i) => o ? o[i] : null, object);
  }

  getPropertyUrlValue(object: any, urlDefinition: { path: string, property?: string }): string {
    console.log(`${urlDefinition.path}/${object[urlDefinition.property]}`)
    if (urlDefinition.property) {
      return `${urlDefinition.path}/${object[urlDefinition.property]}`
    }
    return `${urlDefinition.path}`;
  }

  next(): void {
    this.page += 1;
    this.fetchData();
  }

  select(page: number | string): void {
    this.page = Number(page);
    this.fetchData();
  }

  prev(): void {
    this.page -= 1;
    this.fetchData();
  }

  toggleSort(columnProperty: string): void {
    switch (this.sortOrder[columnProperty]) {
      case '':
        this.sortOrder[columnProperty] = 'asc';
        break;
      case 'asc':
        this.sortOrder[columnProperty] = 'desc';
        break;
      case 'desc':
        this.sortOrder[columnProperty] = '';
        break;
    }
    this.fetchData();
  }

  getSortIcon(columnProperty: string): string {
    return this.sortOrder[columnProperty]
  }
}
