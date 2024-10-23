import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-pak-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PagableComponent, RouterOutlet],
  templateUrl: './pak-detail.component.html',
  styleUrl: './pak-detail.component.scss'
})
export class PakDetailComponent {
  rwKinerja: RWKinerja = new RWKinerja();
  pagable: Pagable;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_kinerja/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Tahunan/Bulanan", 'type').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Angka Kredit", 'angkaKredit').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwKinerja: any) => {
          this.router.navigate([`/${rwKinerja.nip}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("user|email").withField("Email", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("user|email").withField("Email", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }

  submit() {

  }
}
