import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-pangkat-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-pangkat-list.component.html',
  styleUrl: './rw-pangkat-list.component.scss'
})
export class RwPangkatListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_pangkat/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Pangkat", 'pangkat|name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("TMT", 'tmt').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwPangkat: any) => {
          this.router.navigate([LoginContext.getUserLoginRoute() +`/${rwPangkat.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("pangkat|name").withField("Pangkat", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
