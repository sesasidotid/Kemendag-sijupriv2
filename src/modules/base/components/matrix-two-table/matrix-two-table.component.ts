import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface

interface MatrixData {
  id: number;
  nilaiPenugasan: number;
  nilaiMateri: number;
  nilaiInformasi: number;
  nilaiStandar: number;
  nilaiMetode: number;
  alasanMateri: string;
  alasanInformasi: string;
  penyebabDiskrepansiUtama: string;
  jenisPengembanganKompetensi: string;
  pertanyaanId: number;
  pertanyaanName: string;
  matrixId: number;
}

@Component({
  selector: 'app-matrix-two-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './matrix-two-table.component.html',
  styleUrl: './matrix-two-table.component.scss'
})
export class MatrixTwoTableComponent {
  @Input() data: MatrixData[] = [];

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 30, 100];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "pertanyaanName", headerName:'Pertanyaan', filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] }, initialWidth: 600 },
    { field: "nilaiPenugasan", filter: true, floatingFilter: true },
    { field: "nilaiMateri", filter: true, floatingFilter: true },
    { field: "nilaiInformasi", filter: true, floatingFilter: true },
    { field: "nilaiStandar", filter: true, floatingFilter: true },
    { field: "nilaiMetode", filter: true, floatingFilter: true },
    // { field: "alasanMateri", filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] } },
    // { field: "alasanInformasi", filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] } },
    // { field: "penyebabDiskrepansiUtama", filter: true, floatingFilter: true, minWidth: 300 },
    // { field: "jenisPengembanganKompetensi", filter: true, floatingFilter: true, minWidth: 300 },
  ];

  ngOnInit() {
    console.log(this.data);
  }
}
