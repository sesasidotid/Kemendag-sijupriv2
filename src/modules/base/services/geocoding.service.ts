import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import kabupatenData from '../../../assets/regencies.json' // Ensure these paths are correct
import provinsiData from '../../../assets/provinces.json'
import { ApiService } from './api.service'
interface Kabupaten {
  id: string
  province_id: string
  name: string
  alt_name: string
  latitude: number
  longitude: number
}

interface Provinsi {
  id: string
  name: string
  alt_name: string
  latitude: number
  longitude: number
}

@Injectable({
  providedIn: 'root'
})
export class GeoCodingService {
  private kabupatenList: Kabupaten[] = kabupatenData as Kabupaten[]
  private provinsiList: Provinsi[] = provinsiData as Provinsi[]

  //   private kabupatenList: Kabupaten[] = []
  //   private provinsiList: Provinsi[] = []

  constructor (private apiService: ApiService) {
    // this.getProvinsiList()
    // this.getKabKotaList()
  }

  getProvinsiList () {
    this.apiService.getData('/api/v1/provinsi/search?limit=10000').subscribe({
      next: (provinsiList: any) => {
        this.provinsiList = provinsiList.data
      }
    })
  }

  getKabKotaList () {
    this.apiService.getData('/api/v1/kab_kota/search?limit=10000').subscribe({
      next: (kabKotaList: any) => {
        this.kabupatenList = kabKotaList.data
        console.log(this.kabupatenList)
      }
    })
  }
  getCoordinatesByName (
    name: string,
    type: 'provinsi' | 'kabupaten' | 'indonesia'
  ): Observable<number[] | null> {
    if (type === 'indonesia') {
      return of([-2.5489, 118.0149]) // Koordinat pusat Indonesia
    }

    if (type === 'provinsi') {
      const provinsi = this.provinsiList.find(
        item => item.name.toLowerCase() === name.toLowerCase()
      )
      console.log(provinsi)
      return of(
        provinsi ? [provinsi.latitude, provinsi.longitude] : [-2.5489, 118.0149]
      )
    }

    if (type === 'kabupaten') {
      const kabupaten = this.kabupatenList.find(
        item => item.name.toLowerCase() === name.toLowerCase()
      )
      console.log(kabupaten)
      return of(
        kabupaten
          ? [kabupaten.latitude, kabupaten.longitude]
          : [-2.5489, 118.0149]
      )
    }

    // Handle invalid type
    return of(null)
  }
}
