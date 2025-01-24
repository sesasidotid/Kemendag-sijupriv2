import { LoginContext } from './../../../modules/base/commons/login-context'
import { CommonModule, DOCUMENT } from '@angular/common'
import { Component, ElementRef, Inject } from '@angular/core'
import { Router } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { NotificationMessage } from '../../../modules/notification/models/notification-message.model'
import { BehaviorSubject } from 'rxjs'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  id: string
  name: string
  role: string[]
  isOpen: boolean = false

  selectedTab: string = ''
  isExpanded: boolean = false
  profileImageSrc: SafeUrl = 'assets/avatar.jpg'

  notificationsDeleteId$ = new BehaviorSubject<string[]>([])

  notificationMessagePersonalList: NotificationMessage[] = []
  notificationMessageGroupList: NotificationMessage[] = []

  constructor (
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private apiService: ApiService,
    private el: ElementRef,
    private sanitizer: DomSanitizer
  ) {
    this.id = LoginContext.getUserId()
    this.name = LoginContext.getName()
    this.role = LoginContext.getRoleCodes()
    this.getNotificationPersonal()
  }

  ngOnInit () {
    this.fetchPhotoProfile()
  }

  fetchPhotoProfile () {
    this.apiService.getPhotoProfile(this.id).subscribe({
      next: blob => {
        const objectUrl = URL.createObjectURL(blob)
        this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
      error: err => {
        console.error('Error fetching profile image', err)
        this.profileImageSrc = 'assets/avatar.jpg'
      }
    })
  }

  ngAfterViewInit () {
    const tabElement = this.el.nativeElement.querySelector(
      '#notificationItemsTab'
    )
    const dropdownButton = this.el.nativeElement.querySelector(
      '#page-header-notifications-dropdown'
    )

    dropdownButton.addEventListener('shown.bs.dropdown', () => {
      this.getNotificationPersonal()
    })

    tabElement.addEventListener('shown.bs.tab', (event: any) => {
      this.selectedTab = event.target.getAttribute('href') // Get href of the activated tab
      if (this.selectedTab == '#all-noti-tab') {
        this.getNotificationPersonal()
      } else if (this.selectedTab == '#messages-tab') {
        this.getNotificationGroup()
      }
    })
  }

  getNotificationPersonal () {
    this.apiService.getData(`/api/v1/notification_message/personal`).subscribe({
      next: (response: any) => {
        this.notificationMessagePersonalList = response.map(
          (notificationMessage: { [key: string]: any }) => {
            const notificationMessagePersonal = new NotificationMessage(
              notificationMessage
            )
            notificationMessagePersonal.age = this.calculateAge(
              notificationMessagePersonal.dateCreated
            )
            return notificationMessagePersonal
          }
        )
      }
    })
  }

  getNotificationGroup () {
    this.apiService.getData(`/api/v1/notification_message/group`).subscribe({
      next: (response: any) => {
        this.notificationMessageGroupList = response.map(
          (notificationMessage: { [key: string]: any }) => {
            const notificationMessageGroup = new NotificationMessage(
              notificationMessage
            )
            notificationMessageGroup.age = this.calculateAge(
              notificationMessageGroup.dateCreated
            )
            return notificationMessageGroup
          }
        )
      }
    })
  }

  toggelSidebar () {
    const windowSize = this.document.documentElement.clientWidth

    if (windowSize > 767) {
      this.document.querySelector('.hamburger-icon')?.classList.toggle('open')
    }

    // For collapse horizontal menu
    if (
      this.document.documentElement.getAttribute('data-layout') === 'horizontal'
    ) {
      this.document.body.classList.toggle('menu')
    }

    // For collapse vertical menu
    if (
      this.document.documentElement.getAttribute('data-layout') === 'vertical'
    ) {
      if (windowSize <= 1025 && windowSize > 767) {
        this.document.body.classList.remove('vertical-sidebar-enable')
        this.document.documentElement.getAttribute('data-sidebar-size') === 'sm'
          ? this.document.documentElement.setAttribute('data-sidebar-size', '')
          : this.document.documentElement.setAttribute(
              'data-sidebar-size',
              'sm'
            )
      } else if (windowSize > 1025) {
        this.document.body.classList.remove('vertical-sidebar-enable')
        this.document.documentElement.getAttribute('data-sidebar-size') === 'lg'
          ? this.document.documentElement.setAttribute(
              'data-sidebar-size',
              'sm'
            )
          : this.document.documentElement.setAttribute(
              'data-sidebar-size',
              'lg'
            )
      } else if (windowSize <= 767) {
        this.document.body.classList.add('vertical-sidebar-enable')
        this.document.documentElement.setAttribute('data-sidebar-size', 'lg')
      }
    }

    // Semibox menu
    if (
      this.document.documentElement.getAttribute('data-layout') === 'semibox'
    ) {
      if (windowSize > 767) {
        if (
          this.document.documentElement.getAttribute(
            'data-sidebar-visibility'
          ) === 'show'
        ) {
          this.document.documentElement.getAttribute('data-sidebar-size') ===
          'lg'
            ? this.document.documentElement.setAttribute(
                'data-sidebar-size',
                'sm'
              )
            : this.document.documentElement.setAttribute(
                'data-sidebar-size',
                'lg'
              )
        } else {
          ;(
            this.document.getElementById(
              'sidebar-visibility-show'
            ) as HTMLElement
          )?.click()
          this.document.documentElement.setAttribute(
            'data-sidebar-size',
            this.document.documentElement.getAttribute('data-sidebar-size') ||
              ''
          )
        }
      } else if (windowSize <= 767) {
        this.document.body.classList.add('vertical-sidebar-enable')
        this.document.documentElement.setAttribute('data-sidebar-size', 'lg')
      }
    }

    // Two column menu
    if (
      this.document.documentElement.getAttribute('data-layout') === 'twocolumn'
    ) {
      this.document.body.classList.toggle('twocolumn-panel')
    }
  }

  logOut () {
    LoginContext.release()
    this.router.navigate(['/login'])
  }

  private calculateAge (dateCreated: string): string {
    const now = new Date()
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(dateCreated).getTime()) / 1000
    )

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 2629746) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 31556952) {
      const months = Math.floor(diffInSeconds / 2629746)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffInSeconds / 31556952)
      return `${years} year${years > 1 ? 's' : ''} ago`
    }
  }

  checkNotificationsDeleteId (notificationId: string) {
    return this.notificationsDeleteId$.value.includes(notificationId)
  }

  handleCheckClicked (notificationId: string) {
    if (!this.checkNotificationsDeleteId(notificationId)) {
      this.notificationsDeleteId$.next([
        ...this.notificationsDeleteId$.value,
        notificationId
      ])
    } else {
      this.notificationsDeleteId$.next(
        this.notificationsDeleteId$.value.filter(id => id !== notificationId)
      )
    }
    // console.log(this.notificationsDeleteId$.value.length);
  }

  handleCheckAllClicked () {
    if (
      this.notificationsDeleteId$.value.length ===
      this.notificationMessagePersonalList.length
    ) {
      this.notificationsDeleteId$.next([])
    } else {
      this.notificationsDeleteId$.next(
        this.notificationMessagePersonalList.map(
          notification => notification.id
        )
      )
    }
  }

  handleDeleteClicked () {
    if (this.notificationsDeleteId$.value.length === 1) {
      this.apiService
        .deleteData(
          `/api/v1/notification_message/${this.notificationsDeleteId$.value[0]}`
        )
        .subscribe({
          next: (response: any) => {
            this.notificationsDeleteId$.next([])
            this.getNotificationPersonal()
          }
        })
    } else {
      this.apiService
        .postData('/api/v1/notification_message/delete', {
          idList: this.notificationsDeleteId$.value
        })
        .subscribe({
          next: (response: any) => {
            this.notificationsDeleteId$.next([])
            this.getNotificationPersonal()
          }
        })
    }
  }
}
