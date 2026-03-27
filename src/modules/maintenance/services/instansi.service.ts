import { Injectable } from '@angular/core'
import { Instansi } from '../models/instansi.model'
import { catchError, map, Observable } from 'rxjs'
import { ApiService } from '../../base/services/api.service'

@Injectable({
    providedIn: 'root',
})
export class InstansiService {
    readonly BASE_PATH = '/api/v1/instansi'

    constructor(private apiService: ApiService) {}

    findAll(): Observable<Instansi[]> {
        return this.apiService.getData(this.BASE_PATH).pipe(
            map((response: any) => {
                return response.map(
                    (instansi: { [key: string]: any }) =>
                        new Instansi(instansi),
                )
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    findById(instansiId: string): Observable<Instansi> {
        return this.apiService.getData(`${this.BASE_PATH}/${instansiId}`).pipe(
            map((response: any) => {
                return new Instansi(response)
            }),
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    findByInstansiTypeCode(instansiTypeCode: string): Observable<Instansi[]> {
        return this.apiService
            .getData(`${this.BASE_PATH}/type/${instansiTypeCode}`)
            .pipe(
                map((response: any) => {
                    return response.map(
                        (instansi: { [key: string]: any }) =>
                            new Instansi(instansi),
                    )
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }

    findByProvinsiId(provinsiId: number): Observable<Instansi[]> {
        return this.apiService
            .getData(`${this.BASE_PATH}/provinsi/${provinsiId}`)
            .pipe(
                map((response: any) => {
                    return response.map(
                        (instansi: { [key: string]: any }) =>
                            new Instansi(instansi),
                    )
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }

    findByKabupatenKotaiId(kabupatenKotaId: number): Observable<Instansi[]> {
        return this.apiService
            .getData(`${this.BASE_PATH}/kab_kota/${kabupatenKotaId}`)
            .pipe(
                map((response: any) => {
                    return response.map(
                        (instansi: { [key: string]: any }) =>
                            new Instansi(instansi),
                    )
                }),
                catchError((error) => {
                    console.error('Error fetching data', error)
                    throw error
                }),
            )
    }

    save(instansi: Instansi): void {
        this.apiService.postData(this.BASE_PATH, instansi).pipe(
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    update(instansi: Instansi): void {
        this.apiService.putData(this.BASE_PATH, instansi).pipe(
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }

    delete(id: string): void {
        this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
            catchError((error) => {
                console.error('Error fetching data', error)
                throw error
            }),
        )
    }
}
