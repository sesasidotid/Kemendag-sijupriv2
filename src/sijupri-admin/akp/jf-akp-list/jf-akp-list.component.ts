import { ApiService } from '../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { JF } from '../../../modules/siap/models/jf.model'
import { JfService } from '../../../modules/siap/services/jf.service'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
@Component({
  selector: 'app-jf-akp-list',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './jf-akp-list.component.html',
  styleUrl: './jf-akp-list.component.scss'
})
export class JfAkpListComponent {
  pagable$ = new BehaviorSubject<Pagable | null>(null)
  jf: JF = new JF()
  jfNip: string
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  jfLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private jfService: JfService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService,
    private sanitizer: DomSanitizer,
    private filePreviewService: FilePreviewService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.jfNip = params.get('id')
    })

    this.pagable$.next(
      new PagableBuilder('/api/v1/akp/search')
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Nama Atasan', 'namaAtasan').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Email Atasan', 'emailAtasan')
            // .withSortable(false)
            .build()
        )
        // .addPrimaryColumn(
        //   new PrimaryColumnBuilder('Diajukan Pada', 'dateCreated')
        //     // .withSortable(false)
        //     .build()
        // )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Selesai Pada', 'lastUpdated')
            // .withSortable(false)
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((akp: any) => {
              this.router.navigate([`/akp/akp-list/detail/${akp.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction(
              (akp: any) =>
                this.confirmationService.open(false).subscribe({
                  next: (result: any) => {
                    if (result) {
                      if (!result.confirmed) return

                      this.apiService
                        .deleteData(`/api/v1/akp/${akp.id}`)
                        .subscribe({
                          next: (response: any) => {
                            this.handlerService.handleAlert(
                              'Success',
                              'Data berhasil dihapus'
                            )

                            this.refreshPagableData()
                          },
                          error: (err: any) => {
                            this.handlerService.handleAlert('Error', err.error)
                          }
                        })
                    }
                  }
                }),
              'danger'
            )
            .withIcon('danger')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('equal')
            .setProperty('nip')
            .withDefaultValue(this.jfNip)
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('namaAtasan')
            .withField('Nama Atasan', 'text')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('emailAtasan')
            .withField('Email Atasan', 'text')
            .build()
        )
        .build()
    )

    this.getJF()
  }

  refreshPagableData () {
    const currentPagable = this.pagable$.value

    const updatedPagable = {
      ...currentPagable,
      limit: 10
    }
    this.pagable$.next(updatedPagable)
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }

  fetchPhotoProfile () {
    this.apiService.getPhotoProfile(this.jf.nip).subscribe({
      next: blob => {
        if (blob.size === 0) {
          this.profileImageSrc = 'assets/no-profile.jpg'
          return
        }
        const objectUrl = URL.createObjectURL(blob)
        this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
      error: err => {
        console.error('Error fetching profile image', err)
        this.profileImageSrc = 'assets/no-profile.jpg'
      }
    })
  }

  getJF () {
    this.jfLoading$.next(true)
    this.jfService.findByNip(this.jfNip).subscribe({
      next: (jf: JF) => {
        this.jf = jf
        this.jfLoading$.next(false)
        this.fetchPhotoProfile()
      }
    })
  }

  backToList () {
    this.router.navigate(['/akp/akp-list'])
  }
}
