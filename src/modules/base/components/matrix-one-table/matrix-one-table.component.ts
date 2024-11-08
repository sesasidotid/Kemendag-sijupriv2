import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface

interface MatrixData {
  id: number;
  nilaiYbs: number;
  nilaiAtasan: number;
  nilaiRekan: number;
  score: number;
  keterangan: string;
  pertanyaanId: number;
  pertanyaanName: string;
  matrixId: number;
}

@Component({
  selector: 'app-matrix-one-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './matrix-one-table.component.html',
  styleUrl: './matrix-one-table.component.scss'
})
export class MatrixOneTableComponent {
  @Input() data: MatrixData[] = [];

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 30, 100];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "pertanyaanName", headerName: 'Pertanyaan', filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] }, minWidth: 400 },
    { field: "nilaiYbs", filter: true, floatingFilter: true},
    { field: "nilaiAtasan", filter: true, floatingFilter: true },
    { field: "nilaiRekan", filter: true, floatingFilter: true },
    { field: "score", filter: true, floatingFilter: true },
    { field: "keterangan", filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] } }
  ];

  ngOnInit() {
    console.log(this.data);
  }
}  
