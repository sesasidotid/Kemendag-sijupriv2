import { LoginContext } from './login-context'
import { Menu } from '../../security/models/menu.mode'

type ChilSpecification = {
  [key: string]: { components: () => Promise<any>; routes?: any[] }
}
type Specification = { [key: string]: ChilSpecification }

export class RouteLoader {
  public static loadRouter (specification: Specification): any[] {
    const routes: any[] = []
    LoginContext.getMenus().forEach(menu => {
      if (specification.hasOwnProperty(menu.name)) {
        const chilSpecification = specification[menu.name]
        routes.push({
          path: menu.path,
          data: {
            title: menu.name,
            isCreatable: menu.isCreatable,
            isUpdatable: menu.isUpdatable,
            isDeletable: menu.isDeletable
          },
          children: this.loadChildRouter(chilSpecification, menu.child)
        })
      }
    })

    return routes
  }

  private static loadChildRouter (
    childSpecification: ChilSpecification,
    childMenu: Menu[]
  ): any[] {
    const routes: any[] = []
    childMenu.forEach(child => {
      if (childSpecification.hasOwnProperty(child.name)) {
        const componentSpecification = childSpecification[child.name]
        const data: any = {
          title: child.name,
          isCreatable: child.isCreatable,
          isUpdatable: child.isUpdatable,
          isDeletable: child.isDeletable
        }
        const children = [
          {
            path: '',
            data: data,
            loadComponent: () => componentSpecification.components()
          }
        ]
        ;(componentSpecification.routes ?? []).forEach(route => {
          route.data = data
          children.push(route)
        })

        routes.push({
          path: child.path,
          children: children
        })
      }
    })

    return routes
  }
}
