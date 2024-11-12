import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface

interface MatrixData {
  id: number;
  nilaiWaktu: number;
  nilaiKesulitan: number;
  nilaiKualitas: number;
  nilaiPengaruh: number;
  nilaiMetode: number;
  kategori: string;
  rankPrioritas: string;
  pertanyaanId: number;
  pertanyaanName: string;
  matrixId: number;
}

@Component({
  selector: 'app-matrix-three-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './matrix-three-table.component.html',
  styleUrl: './matrix-three-table.component.scss'
})
export class MatrixThreeTableComponent {
  @Input() data: MatrixData[] = [];

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 30, 100];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "pertanyaanName", headerName:'Pertanyaan', filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] }, initialWidth: 600 },
    { field: "nilaiWaktu", filter: true, floatingFilter: true },
    { field: "nilaiKesulitan", filter: true, floatingFilter: true },
    { field: "nilaiKualitas", filter: true, floatingFilter: true },
    { field: "nilaiPengaruh", filter: true, floatingFilter: true },
    { field: "nilaiMetode", filter: true, floatingFilter: true },
    { field: "kategori", filter: true, floatingFilter: true, minWidth: 300 },
    { field: "rankPrioritas", filter: true, floatingFilter: true,},
  ];

  ngOnInit() {
    console.log(this.data);
  }
}
