import { AuthResponse } from '../../auth/models/auth-response.model'
import { Menu } from '../../security/models/menu.mode'

export class LoginContext {
  private static instansiId: string = btoa('instansiId')
  private static unitKerjaId: string = btoa('unitKerjaId')
  private static accessToken: string = btoa('accessToken')
  private static refreshToken: string = btoa('refreshToken')
  private static userId: string = btoa('userId')
  private static applicationCode: string = btoa('applicationCode')
  private static userName: string = btoa('name')
  private static menus: string = btoa('menus')
  private static roleCodes: string = btoa('roleCodes')
  private static menuCodes: string = btoa('menuCodes')

  static storeContextLocalStorage (authResponse: AuthResponse) {
    localStorage.setItem(this.instansiId, btoa(authResponse.instansiId))
    localStorage.setItem(this.unitKerjaId, btoa(authResponse.unitKerjaId))

    localStorage.setItem(this.accessToken, btoa(authResponse.accessToken))
    localStorage.setItem(this.refreshToken, btoa(authResponse.refreshToken))
    localStorage.setItem(this.userId, btoa(authResponse.userId))
    localStorage.setItem(
      this.applicationCode,
      btoa(authResponse.applicationCode)
    )
    localStorage.setItem(this.userName, btoa(authResponse.name))
    localStorage.setItem(this.menus, btoa(JSON.stringify(authResponse.menus)))
    localStorage.setItem(
      this.roleCodes,
      btoa(JSON.stringify(authResponse.roleCodes))
    )
    localStorage.setItem(
      this.menuCodes,
      btoa(JSON.stringify(authResponse.menuCodes))
    )
  }

  public static isLogin (): boolean {
    return this.getAccessToken() ? true : false
  }

  public static release () {
    localStorage.removeItem(this.instansiId)
    localStorage.removeItem(this.unitKerjaId)
    localStorage.removeItem(this.accessToken)
    localStorage.removeItem(this.refreshToken)
    localStorage.removeItem(this.userId)
    localStorage.removeItem(this.applicationCode)
    localStorage.removeItem(this.userName)
    localStorage.removeItem(this.menus)
    localStorage.removeItem(this.roleCodes)
    localStorage.removeItem(this.menuCodes)
  }

  public static getInstansiId (): string {
    return atob(localStorage.getItem(this.instansiId) || '')
  }

  public static getUnitKerjaId (): string {
    return atob(localStorage.getItem(this.unitKerjaId) || '')
  }

  public static getAccessToken (): string {
    return atob(localStorage.getItem(this.accessToken) || '')
  }

  public static getApplicationCode (): string {
    return atob(localStorage.getItem(this.applicationCode) || '')
  }

  public static getRefreshToken (): string {
    return atob(localStorage.getItem(this.refreshToken) || '')
  }

  public static getUserId (): string {
    return atob(localStorage.getItem(this.userId) || '')
  }

  public static getName (): string {
    return atob(localStorage.getItem(this.userName) || '')
  }

  public static getMenus (): Menu[] {
    return JSON.parse(atob(localStorage.getItem(this.menus) || '[]'))
  }

  public static getRoleCodes (): string[] {
    return JSON.parse(atob(localStorage.getItem(this.roleCodes) || '[]'))
  }

  public static getMenuCodes (): string {
    return atob(localStorage.getItem(this.menuCodes) || '')
  }

  // public static getUserLoginRoute(): string {
  //     switch (this.getApplicationCode()) {
  //         case 'sijupri-admin':
  //             return 'admin';
  //         case 'sijupri-instansi':
  //             return 'instansi';
  //         case 'sijupri-unit-kerja':
  //             return 'unit-kerja';
  //         case 'sijupri-external':
  //             return 'jf-external';
  //         case 'sijupri-internal':
  //             return 'jf-internal';
  //         default:
  //             return 'login';
  //     }
  // }
}
