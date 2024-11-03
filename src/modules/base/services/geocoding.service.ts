import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import kabupatenData from '../../../assets/regencies.json';  // Ensure these paths are correct
import provinsiData from '../../../assets/provinces.json';

interface Kabupaten {
  id: string;
  province_id: string;
  name: string;
  alt_name: string;
  latitude: number;
  longitude: number;
}

interface Provinsi {
  id: string;
  name: string;
  alt_name: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeoCodingService {
  private kabupatenList: Kabupaten[] = kabupatenData as Kabupaten[];
  private provinsiList: Provinsi[] = provinsiData as Provinsi[];

  getCoordinatesByName(name: string, type: 'provinsi' | 'kabupaten'): Observable<number[] | null> {
    if (type === 'provinsi') {
      const provinsi = this.provinsiList.find(item => item.name.toLowerCase() === name.toLowerCase());
      console.log(provinsi);
      return of(provinsi ? [provinsi.latitude, provinsi.longitude] : null);
    }

    if (type === 'kabupaten') {
      const kabupaten = this.kabupatenList.find(item => item.name.toLowerCase() === name.toLowerCase());
        console.log(kabupaten);
      return of(kabupaten ? [kabupaten.latitude, kabupaten.longitude] : null);
    }

    // Handle invalid type
    return of(null);
  }
}
