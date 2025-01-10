import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { BehaviorSubject } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';
import { RekapButtonComponent } from './rekap-button.component';
import { LoginContext } from '../../commons/login-context';
import { color } from '../../../../assets/NiceAdmin/vendor/chart.js/helpers';

interface RekapData {
  dokumenVerifikasi: string | null;
  id: number;
  jenisPengembanganKompetensi: string;
  kategori: string;
  keterangan: string;
  matrixId: number;
  pelatihanTeknisId: string;
  pelatihanTeknisName: string;
  penyebabDiskrepansiUtama: string;
  pertanyaanId: number;
  pertanyaanName: string;
  rankPrioritas: string;
  verified: boolean;
}

@Component({
  selector: 'app-rekap-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular, ModalComponent],
  templateUrl: './rekap-table.component.html',
  styleUrl: './rekap-table.component.scss'
})
export class RekapTableComponent {
  @Input() data: RekapData[] = [];

  isModalOpen$ = new BehaviorSubject<boolean>(false);
  selectedRekapId$ = new BehaviorSubject<number | null>(null);

  selectedRekapData: RekapData;

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 30, 100];

  // Column Definitions: Defines the columns to be displayed.
  // pertanyaan_name, keterangan, 'kategori', 'penyebabDiskrepansiUtama'. 'jenisPengembanganKompetensi', 'rankPrioritas', 'dokumenVerifikasiUrl (preview), 'verified (true sama false ini klo dah di verifikasi kasih centang atau status gitu aja keknya)
  colDefs: ColDef[] = [
    { field: "pertanyaanName", headerName: 'Pertanyaan', filter: true, floatingFilter: true, filterParams: { filterOptions: ["contains"] }, initialWidth: 600 },
    { field: "keterangan", headerName: 'Keterangan', filter: true, floatingFilter: true },
    { field: "kategori", headerName: 'Kategori', filter: true, floatingFilter: true },
    { field: "penyebabDiskrepansiUtama", headerName: 'Penyebab Diskrepansi Utama', filter: true, floatingFilter: true },
    { field: "rankPrioritas", headerName: 'Rank Prioritas', filter: true, floatingFilter: true },
    // { field: "dokumenVerifikasi", headerName: 'Dokumen Verifikasi', filter: true, floatingFilter: true },
    { field: "verified", headerName: 'Verified', filter: true, floatingFilter: true },
    { field: "jenisPengembanganKompetensi", headerName: 'Jenis Pengembangan Kompetensi', filter: true, floatingFilter: true, initialWidth: 400 },
    { field: "pelatihanTeknisName", headerName: 'Pelatihan Teknis', filter: true, floatingFilter: true }
  ];

  constructor() {
    if (LoginContext.getRoleCodes().includes('USER_EXTERNAL')) {
      this.colDefs.push({
        headerName: 'Dokuemn Verifikasi',
        cellRenderer: RekapButtonComponent,
        cellRendererParams: {
          onClickButtonOne: this.toggleModal.bind(this),
          // onClikButtonTwo: this.toggleModal.bind(this),
          showFirstButton: (data: RekapData) => {
            return data.jenisPengembanganKompetensi === 'Seminar/Bimtek/Belajar Mandiri' || data.jenisPengembanganKompetensi === 'Magang';
          },
          showSecondButton: (data: RekapData) => {
            return false
          },
          disabledFirstButton: (data: RekapData) => {
            return false
          },
          titleFirst: 'Upload Verifikasi',
          iconFirst: 'upload',
          colorFirst: 'primary',
        },
      });
    }
    if (LoginContext.getRoleCodes().includes('ADMIN')) {
      this.colDefs.push({
        headerName: 'Dokumen Verifikasi',
        cellRenderer: RekapButtonComponent,
        cellRendererParams: {
          onClickButtonOne: this.openLink.bind(this),
          showFirstButton: (data: RekapData) => {
            return data.dokumenVerifikasi !== null
          },
          disabledFirstButton: (data: RekapData) => {
            return false
          },
          titleFirst: 'Preview',
          iconFirst: 'eye-outline',
          colorFirst: 'primary',

          onClikButtonTwo: this.toggleModal.bind(this),
          showSecondButton: (data: RekapData) => {
            return data.verified === false && data.jenisPengembanganKompetensi !== 'Pelatihan Teknis'
          },
          disabledSecondButton: (data: RekapData) => {
            return false
          },
          titleSecond: 'Verifikasi',
          iconSecond: 'shield-check',
          colorSecond: 'success',
        },
      });
    }
  }

  openLink(data?: RekapData): void {
    window.open(data.dokumenVerifikasi, '_blank');
  }

  toggleModal(data?: RekapData) {
    if (data) {
      this.selectedRekapId$.next(Number(data.id));
      this.selectedRekapData = data;
      console.log(this.selectedRekapData);
    }
    this.isModalOpen$.next(!this.isModalOpen$.value);
  }

  ngOnInit() {
    console.log(this.data);
  }
}
