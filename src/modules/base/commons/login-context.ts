import { AuthResponse } from "../../auth/models/auth-response.model";
import { Menu } from "../../security/models/menu.mode";

export class LoginContext {

    static storeContextLocalStorage(authResponse: AuthResponse) {
        localStorage.setItem('instansiId', authResponse.instansiId);
        localStorage.setItem('unitKerjaId', authResponse.unitKerjaId);

        localStorage.setItem('accessToken', authResponse.accessToken);
        localStorage.setItem('refreshToken', authResponse.refreshToken);
        localStorage.setItem('userId', authResponse.userId);
        localStorage.setItem('applicationCode', authResponse.applicationCode);
        localStorage.setItem('name', authResponse.name);
        localStorage.setItem('menus', JSON.stringify(authResponse.menus));
        localStorage.setItem('roleCodes', JSON.stringify(authResponse.roleCodes));
        localStorage.setItem('menuCodes', JSON.stringify(authResponse.menuCodes));
    }

    public static isLogin(): boolean {
        return this.getAccessToken() ? true : false;
    }

    public static release() {
        localStorage.removeItem('instansiId');
        localStorage.removeItem('unitKerjaId');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('applicationCode');
        localStorage.removeItem('name');
        localStorage.removeItem('menus');
        localStorage.removeItem('roleCodes');
        localStorage.removeItem('menuCodes');
    }

    public static getInstansiId(): string {
        return localStorage.getItem('instansiId') || '';
    }

    public static getUnitKerjaId(): string {
        return localStorage.getItem('unitKerjaId') || '';
    }

    public static getAccessToken(): string {
        return localStorage.getItem('accessToken') || '';
    }

    public static getApplicationCode(): string {
        return localStorage.getItem('applicationCode') || '';
    }

    public static getRefreshToken(): string {
        return localStorage.getItem('refreshToken') || '';
    }

    public static getUserId(): string {
        return localStorage.getItem('userId') || '';
    }

    public static getName(): string {
        return localStorage.getItem('name') || '';
    }

    public static getMenus(): Menu[] {
        return JSON.parse(localStorage.getItem('menus') || '[]');
    }

    public static getRoleCodes(): string[] {
        return JSON.parse(localStorage.getItem('roleCodes') || '[]');
    }

    public static getMenuCodes(): string {
        return JSON.parse(localStorage.getItem('menuCodes') || '[]');
    }

    public static getUserLoginRoute(): string {
        switch (this.getApplicationCode()) {
            case 'sijupri-admin':
                return 'admin';
            case 'sijupri-instansi':
                return 'instansi';
            case 'sijupri-unit-kerja':
                return 'unit-kerja';
            case 'sijupri-external':
                return 'jf-external';
            case 'sijupri-internal':
                return 'jf-internal';
            default:
                return 'login';
        }
    }
}