import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service';
import { BehaviorSubject } from 'rxjs';
import { AKPTaskDetail } from '../../../modules/akp/models/akp-task-detail.modal';
import { CommonModule } from '@angular/common';
import { MatrixOneTableComponent } from '../../../modules/base/components/matrix-one-table/matrix-one-table.component';
import { MatrixTwoTableComponent } from '../../../modules/base/components/matrix-two-table/matrix-two-table.component';
import { MatrixThreeTableComponent } from '../../../modules/base/components/matrix-three-table/matrix-three-table.component';

@Component({
  selector: 'app-akp-task-detail',
  standalone: true,
  imports: [CommonModule, MatrixOneTableComponent, MatrixTwoTableComponent, MatrixThreeTableComponent],
  templateUrl: './akp-task-detail.component.html',
  styleUrl: './akp-task-detail.component.scss'
})
export class AkpTaskDetailComponent {
  // exampleData1: any[] = [
  //   {
  //     "id": 145,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 3,
  //     "nilaiRekan": 1,
  //     "score": 7,
  //     "keterangan": "NON_DKK",
  //     "pertanyaanId": 45,
  //     "pertanyaanName": "Mampu menganalisis dan memverifikasi data dan informasi perdagangan yang menjadi kewenangannya dan memberikan masukan dalam rangka perbaikan.",
  //     "matrixId": 1
  //   },
  //   {
  //     "id": 146,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 46,
  //     "pertanyaanName": "Mampu menyusun database bidang perdagangan yang menjadi kewenangannya.",
  //     "matrixId": 2
  //   },
  //   {
  //     "id": 147,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 47,
  //     "pertanyaanName": "Mampu menentukan format/tampilan penyajian data dan informasi yang akan ditampilkan di website.",
  //     "matrixId": 3
  //   },
  //   {
  //     "id": 148,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 3,
  //     "nilaiRekan": 3,
  //     "score": 8,
  //     "keterangan": "DKK",
  //     "pertanyaanId": 48,
  //     "pertanyaanName": "Mampu memberikan informasi yang relevan kepada masyarakat dan stakeholder tentang data dan informasi perdagangan yang menjadi kewenangannya.",
  //     "matrixId": 4
  //   },
  //   {
  //     "id": 149,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 6,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 49,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan kebenaran legalitas informasi.",
  //     "matrixId": 5
  //   },
  //   {
  //     "id": 150,
  //     "nilaiYbs": 1,
  //     "nilaiAtasan": 1,
  //     "nilaiRekan": 1,
  //     "score": 3,
  //     "keterangan": "DKK",
  //     "pertanyaanId": 50,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian perizinan dengan aktivitas kegiatan.",
  //     "matrixId": 6
  //   },
  //   {
  //     "id": 151,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 1,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 51,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian SNI, persyaratan teknis, atau kualifikasi yang diberlakukan secara wajib.",
  //     "matrixId": 7
  //   },
  //   {
  //     "id": 152,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 3,
  //     "nilaiRekan": 1,
  //     "score": 6,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 52,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap asal barang dan data lain yang diperlukan.",
  //     "matrixId": 8
  //   },
  //   {
  //     "id": 153,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 53,
  //     "pertanyaanName": "Mampu menganalisis dan memverifikasi data dan informasi terkait jaringan distribusi, sarana distribusi perdagangan dan logistik meliputi proposal pembangunan sarana distribusi perdagangan, meliputi usulan lokasi, tipe dan pembiayaan sarana distribusi perdagangan.",
  //     "matrixId": 9
  //   },
  //   {
  //     "id": 154,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 6,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 54,
  //     "pertanyaanName": "Mampu melakukan verifikasi bahan dan laporan hasil pemantauan dan kegiatan pengelolaan sarana distribusi perdagangan di daerah sesuai dengan prosedur.",
  //     "matrixId": 10
  //   },
  //   {
  //     "id": 155,
  //     "nilaiYbs": 1,
  //     "nilaiAtasan": 3,
  //     "nilaiRekan": 3,
  //     "score": 7,
  //     "keterangan": "NON_DKK",
  //     "pertanyaanId": 55,
  //     "pertanyaanName": "Mampu menjelaskan konsep dasar terkait jaringan distribusi, sarana distribusi perdagangan dan logistik.",
  //     "matrixId": 11
  //   },
  //   {
  //     "id": 156,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 56,
  //     "pertanyaanName": "Mampu melakukan analisis terhadap data dan informasi yang didapat dari pengamatan kasat mata/pemeriksaan legalitas.",
  //     "matrixId": 12
  //   },
  //   {
  //     "id": 157,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 1,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 57,
  //     "pertanyaanName": "Mampu menganalisis hasil pengambilan sampel untuk melihat kelayakan barang atau jasa.",
  //     "matrixId": 13
  //   },
  //   {
  //     "id": 158,
  //     "nilaiYbs": 3,
  //     "nilaiAtasan": 3,
  //     "nilaiRekan": 1,
  //     "score": 7,
  //     "keterangan": "NON_DKK",
  //     "pertanyaanId": 58,
  //     "pertanyaanName": "Mampu menyajikan hasil analisis dan menjelaskan secara lengkap, rinci, dan jelas terhadap hasil analisis kelayakan pelaku usaha, barang, jasa, dan kegiatan perdagangan.",
  //     "matrixId": 14
  //   },
  //   {
  //     "id": 159,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 59,
  //     "pertanyaanName": "Mampu menyusun laporan hasil pelaku usaha, barang, jasa, dan kegiatan perdagangan.",
  //     "matrixId": 15
  //   },
  //   {
  //     "id": 160,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 1,
  //     "nilaiRekan": 1,
  //     "score": 4,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 60,
  //     "pertanyaanName": "Mampu memahami konsep dasar dan metode/teknik melakukan identifikasi dan pengumpulan data dan informasi.",
  //     "matrixId": 16
  //   },
  //   {
  //     "id": 161,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 2,
  //     "nilaiRekan": 1,
  //     "score": 5,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 61,
  //     "pertanyaanName": "Mampu memahami dan mampu menjelaskan proses dalam deteksi dan identifikasi data dan informasi dalam rangka pulbaket.",
  //     "matrixId": 17
  //   },
  //   {
  //     "id": 162,
  //     "nilaiYbs": 2,
  //     "nilaiAtasan": 1,
  //     "nilaiRekan": 1,
  //     "score": 4,
  //     "keterangan": "DKK_NON_TRAINING",
  //     "pertanyaanId": 62,
  //     "pertanyaanName": "Mampu menyiapkan konsep surat-surat dan dokumen pendukung kegiatan pengumpulan bahan keterangan.",
  //     "matrixId": 18
  //   }
  // ]
  // exampleData2: any[] = [
  //   {
  //     "id": 15,
  //     "nilaiPenugasan": 0,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 0,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 46,
  //     "pertanyaanName": "Mampu menyusun database bidang perdagangan yang menjadi kewenangannya.",
  //     "matrixId": 2
  //   },
  //   {
  //     "id": 16,
  //     "nilaiPenugasan": 0,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Informasi",
  //     "jenisPengembanganKompetensi": "Seminar/Bimtek/Belajar Mandiri",
  //     "pertanyaanId": 47,
  //     "pertanyaanName": "Mampu menentukan format/tampilan penyajian data dan informasi yang akan ditampilkan di website.",
  //     "matrixId": 3
  //   },
  //   {
  //     "id": 17,
  //     "nilaiPenugasan": 0,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 0,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": null,
  //     "jenisPengembanganKompetensi": null,
  //     "pertanyaanId": 49,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan kebenaran legalitas informasi.",
  //     "matrixId": 5
  //   },
  //   {
  //     "id": 18,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 50,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian perizinan dengan aktivitas kegiatan.",
  //     "matrixId": 6
  //   },
  //   {
  //     "id": 19,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penunjang Kegiatan",
  //     "jenisPengembanganKompetensi": "Magang",
  //     "pertanyaanId": 51,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian SNI, persyaratan teknis, atau kualifikasi yang diberlakukan secara wajib.",
  //     "matrixId": 7
  //   },
  //   {
  //     "id": 20,
  //     "nilaiPenugasan": 0,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Informasi",
  //     "jenisPengembanganKompetensi": "Seminar/Bimtek/Belajar Mandiri",
  //     "pertanyaanId": 52,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap asal barang dan data lain yang diperlukan.",
  //     "matrixId": 8
  //   },
  //   {
  //     "id": 21,
  //     "nilaiPenugasan": 0,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 53,
  //     "pertanyaanName": "Mampu menganalisis dan memverifikasi data dan informasi terkait jaringan distribusi, sarana distribusi perdagangan dan logistik meliputi proposal pembangunan sarana distribusi perdagangan, meliputi usulan lokasi, tipe dan pembiayaan sarana distribusi perdagangan.",
  //     "matrixId": 9
  //   },
  //   {
  //     "id": 22,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penunjang Kegiatan",
  //     "jenisPengembanganKompetensi": "Magang",
  //     "pertanyaanId": 54,
  //     "pertanyaanName": "Mampu melakukan verifikasi bahan dan laporan hasil pemantauan dan kegiatan pengelolaan sarana distribusi perdagangan di daerah sesuai dengan prosedur.",
  //     "matrixId": 10
  //   },
  //   {
  //     "id": 23,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 56,
  //     "pertanyaanName": "Mampu melakukan analisis terhadap data dan informasi yang didapat dari pengamatan kasat mata/pemeriksaan legalitas.",
  //     "matrixId": 12
  //   },
  //   {
  //     "id": 24,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 57,
  //     "pertanyaanName": "Mampu menganalisis hasil pengambilan sampel untuk melihat kelayakan barang atau jasa.",
  //     "matrixId": 13
  //   },
  //   {
  //     "id": 25,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 59,
  //     "pertanyaanName": "Mampu menyusun laporan hasil pelaku usaha, barang, jasa, dan kegiatan perdagangan.",
  //     "matrixId": 15
  //   },
  //   {
  //     "id": 26,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 0,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penunjang Kegiatan",
  //     "jenisPengembanganKompetensi": "Magang",
  //     "pertanyaanId": 60,
  //     "pertanyaanName": "Mampu memahami konsep dasar dan metode/teknik melakukan identifikasi dan pengumpulan data dan informasi.",
  //     "matrixId": 16
  //   },
  //   {
  //     "id": 27,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 0,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 61,
  //     "pertanyaanName": "Mampu memahami dan mampu menjelaskan proses dalam deteksi dan identifikasi data dan informasi dalam rangka pulbaket.",
  //     "matrixId": 17
  //   },
  //   {
  //     "id": 28,
  //     "nilaiPenugasan": 1,
  //     "nilaiMateri": 1,
  //     "nilaiInformasi": 1,
  //     "nilaiStandar": 0,
  //     "nilaiMetode": 0,
  //     "alasanMateri": null,
  //     "alasanInformasi": null,
  //     "penyebabDiskrepansiUtama": "Penguasaan Materi",
  //     "jenisPengembanganKompetensi": "Pelatihan Teknis",
  //     "pertanyaanId": 62,
  //     "pertanyaanName": "Mampu menyiapkan konsep surat-surat dan dokumen pendukung kegiatan pengumpulan bahan keterangan.",
  //     "matrixId": 18
  //   }
  // ]

  // exampleData3: any[] = [
  //   {
  //     "id": 15,
  //     "nilaiWaktu": 3,
  //     "nilaiKesulitan": 5,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 46,
  //     "pertanyaanName": "Mampu menyusun database bidang perdagangan yang menjadi kewenangannya.",
  //     "matrixId": 2
  //   },
  //   {
  //     "id": 16,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 3,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_TINGGI",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 47,
  //     "pertanyaanName": "Mampu menentukan format/tampilan penyajian data dan informasi yang akan ditampilkan di website.",
  //     "matrixId": 3
  //   },
  //   {
  //     "id": 17,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_TINGGI",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 49,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan kebenaran legalitas informasi.",
  //     "matrixId": 5
  //   },
  //   {
  //     "id": 18,
  //     "nilaiWaktu": 3,
  //     "nilaiKesulitan": 3,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 50,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian perizinan dengan aktivitas kegiatan.",
  //     "matrixId": 6
  //   },
  //   {
  //     "id": 19,
  //     "nilaiWaktu": 5,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 51,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap kesesuaian SNI, persyaratan teknis, atau kualifikasi yang diberlakukan secara wajib.",
  //     "matrixId": 7
  //   },
  //   {
  //     "id": 20,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 3,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 3,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 52,
  //     "pertanyaanName": "Mampu melakukan pemeriksaan terhadap asal barang dan data lain yang diperlukan.",
  //     "matrixId": 8
  //   },
  //   {
  //     "id": 21,
  //     "nilaiWaktu": 5,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 1,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 53,
  //     "pertanyaanName": "Mampu menganalisis dan memverifikasi data dan informasi terkait jaringan distribusi, sarana distribusi perdagangan dan logistik meliputi proposal pembangunan sarana distribusi perdagangan, meliputi usulan lokasi, tipe dan pembiayaan sarana distribusi perdagangan.",
  //     "matrixId": 9
  //   },
  //   {
  //     "id": 22,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 1,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_TINGGI",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 54,
  //     "pertanyaanName": "Mampu melakukan verifikasi bahan dan laporan hasil pemantauan dan kegiatan pengelolaan sarana distribusi perdagangan di daerah sesuai dengan prosedur.",
  //     "matrixId": 10
  //   },
  //   {
  //     "id": 23,
  //     "nilaiWaktu": 3,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 1,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_TINGGI",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 56,
  //     "pertanyaanName": "Mampu melakukan analisis terhadap data dan informasi yang didapat dari pengamatan kasat mata/pemeriksaan legalitas.",
  //     "matrixId": 12
  //   },
  //   {
  //     "id": 24,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 5,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_TINGGI",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 57,
  //     "pertanyaanName": "Mampu menganalisis hasil pengambilan sampel untuk melihat kelayakan barang atau jasa.",
  //     "matrixId": 13
  //   },
  //   {
  //     "id": 25,
  //     "nilaiWaktu": 5,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 5,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 59,
  //     "pertanyaanName": "Mampu menyusun laporan hasil pelaku usaha, barang, jasa, dan kegiatan perdagangan.",
  //     "matrixId": 15
  //   },
  //   {
  //     "id": 26,
  //     "nilaiWaktu": 1,
  //     "nilaiKesulitan": 5,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 5,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 60,
  //     "pertanyaanName": "Mampu memahami konsep dasar dan metode/teknik melakukan identifikasi dan pengumpulan data dan informasi.",
  //     "matrixId": 16
  //   },
  //   {
  //     "id": 27,
  //     "nilaiWaktu": 5,
  //     "nilaiKesulitan": 5,
  //     "nilaiKualitas": 3,
  //     "nilaiPengaruh": 1,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 61,
  //     "pertanyaanName": "Mampu memahami dan mampu menjelaskan proses dalam deteksi dan identifikasi data dan informasi dalam rangka pulbaket.",
  //     "matrixId": 17
  //   },
  //   {
  //     "id": 28,
  //     "nilaiWaktu": 5,
  //     "nilaiKesulitan": 1,
  //     "nilaiKualitas": 1,
  //     "nilaiPengaruh": 5,
  //     "nilaiMetode": null,
  //     "kategori": "DISKREPANSI_SENDANG",
  //     "rankPrioritas": "0",
  //     "pertanyaanId": 62,
  //     "pertanyaanName": "Mampu menyiapkan konsep surat-surat dan dokumen pendukung kegiatan pengumpulan bahan keterangan.",
  //     "matrixId": 18
  //   }
  // ]

  akpId: string
  AKPDetail = new AKPTaskDetail()
  AKPDetailLoading$ = new BehaviorSubject<boolean>(false);
  currentTab$ = new BehaviorSubject<number>(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private akpTaskService: AkpTaskService,
    private router: Router,
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.akpId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getAKPDetail();
  }

  tabChange(tab: number) {
    this.currentTab$.next(tab);
  }

  backToList() {
    this.router.navigate(['/akp/akp-task-list']);
  }

  getAKPDetail() {
    this.AKPDetailLoading$.next(true)
    this.akpTaskService.getAKPTaskDetailById(this.akpId).subscribe({
      next: (response) => {
        this.AKPDetail = response;
        console.log(this.AKPDetail)
      },
      complete: () => {
        this.AKPDetailLoading$.next(false)
      }
    })
  }

}
