import { Serializable } from '@/modules/base/commons/serializable'

export abstract class BaseExamScheduleRequest extends Serializable {
    roomUkomId: string = undefined

    constructor() {
        super()
    }
}

export class CatExamScheduleRequest extends BaseExamScheduleRequest {
    startTime: string = undefined
    endTime: string = undefined
    duration: string = undefined
    secretKey: string = undefined
    participantIdList: string[] = []

    constructor(object: { [key: string]: any }) {
        super()
        this.fromObject(object)
    }
}

export class WawancaraExamScheduleRequest extends BaseExamScheduleRequest {
    startTime: string = undefined
    endTime: string = undefined
    duration: string = undefined
    participantIdList: string[] = []

    constructor(object: { [key: string]: any }) {
        super()
        this.fromObject(object)
    }
}

export class SeminarMakalahExamScheduleRequest extends BaseExamScheduleRequest {
    makalahStartTime: string = undefined
    makalahEndTime: string = undefined
    seminarStartTime: string = undefined
    seminarEndTime: string = undefined
    duration: string = undefined
    participantIdList: string[] = []
    examinerAmount: number = undefined

    constructor(object: { [key: string]: any }) {
        super()
        this.fromObject(object)
    }
}

export class PraktikExamScheduleRequest extends BaseExamScheduleRequest {
    startTime: string = undefined
    endTime: string = undefined
    duration: string = undefined
    participantIdList: string[] = []

    constructor(object: { [key: string]: any }) {
        super()
        this.fromObject(object)
    }
}

export class OtherExamScheduleRequest extends BaseExamScheduleRequest {
    startTime: string = undefined
    endTime: string = undefined
    secretKey: string = undefined
    participantIdList: string[] = []

    constructor(object: { [key: string]: any }) {
        super()
        this.fromObject(object)
    }
}
