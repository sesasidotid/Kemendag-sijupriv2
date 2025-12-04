import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { ApiService } from '@/modules/base/services/api.service'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { RoomUkomDetail } from '../models/room-ukom-detail'
import { UkomQuestion } from '../models/ukom-question'
@Injectable({
    providedIn: 'root',
})
export class UkomRoomService {
    readonly API_BASE_URL = '/api/v1/room_ukom'
    apiService = inject(ApiService)

    constructor() {}

    getRoomDetailByRoomId(roomId: string): Observable<RoomUkomDetail> {
        return this.apiService.getData(`${this.API_BASE_URL}/${roomId}`)
    }

    searchQuestionOfRoomUkomByExamTypeCode(
        examTypeCode: string,
        roomId: string,
        limit?: number,
        page?: number,
    ): Observable<PaginationWrapper<UkomQuestion>> {
        const params: string[] = []

        if (limit !== undefined) params.push(`limit=${limit}`)
        if (page !== undefined) params.push(`page=${page}`)

        const queryParams = params.length > 0 ? `?${params.join('&')}` : ''

        return this.apiService.postData(
            `${this.API_BASE_URL}/search/${examTypeCode}/${roomId}${queryParams}`,
            {},
        )
    }
}
