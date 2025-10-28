import { Serializable } from '@/modules/base/commons/serializable'
import { DokumenUkom } from './document.model'

export enum UkomFlowId {
    UkomFlowId1 = 'ukom_flow_1',
    UkomFlowId2 = 'ukom_flow_2',
    UkomFlowId3 = 'ukom_flow_3',
    UkomFlowId4 = 'ukom_flow_4',
}

export enum ParticipantStatus {
    JF = 'jf',
    NonJF = 'non_jf',
}
export class PendingTask extends Serializable {
    id: string = undefined
    objectId: string = undefined
    objectName: string = undefined
    objectGroup: string = undefined
    comment: string | null = undefined
    taskType: string = undefined
    taskAction: string | null = undefined
    taskStatus: string = undefined
    workflowName: string = undefined
    workflowTemplate: string = undefined
    flowName: string = undefined
    flowId: UkomFlowId = undefined
    remark: string | null = undefined
    instanceId: string = undefined
    workflowId: string = undefined
    objectTaskId: string = undefined
    updatedBy: string | null = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string | null = undefined
    dateCreated: string = undefined
    idx: number = undefined

    objectTask: ObjectTask = undefined

    constructor(object?: any) {
        super()
        if (object) {
            this.fromObject(object)
            if (object.objectTask)
                this.objectTask = new ObjectTask(object.objectTask)
        }
    }
}

export class ObjectTask extends Serializable {
    id: string = undefined
    property: string | null = undefined
    object: ParticipantObject = undefined
    prevObject: ParticipantObject = undefined
    oldObject: any = undefined
    updatedBy: string | null = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string | null = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: any) {
        super()
        if (object) {
            this.fromObject(object)
            if (object.object)
                this.object = new ParticipantObject(object.object)
        }
    }
}

export class ParticipantObject extends Serializable {
    id: string = undefined
    name: string = undefined
    email: string = undefined
    phone: string = undefined
    userDetails: any = undefined
    status: string | null = undefined
    roleCodeList: string[] = []
    password: string | null = undefined
    applicationCode: string = undefined
    channelCodeList: string[] = []
    nip: string = undefined
    age: number | null = undefined
    tempatLahir: string = undefined
    tanggalLahir: string = undefined
    participantStatus: ParticipantStatus = undefined
    jenisInstansi: string = undefined
    provinsiId: string | null = undefined
    provinsiName: string | null = undefined
    kabupatenKotaId: string | null = undefined
    kabupatenKotaName: string | null = undefined
    noSuratUsulan: string = undefined
    tglSuratUsulan: string = undefined
    pendidikanTerakhirCode: string | null = undefined
    pendidikanTerakhirName: string | null = undefined
    jurusan: string = undefined
    predikatKinerja1Id: string = undefined
    predikatKinerja1Name: string | null = undefined
    predikatKinerja2Id: string = undefined
    predikatKinerja2Name: string | null = undefined
    isMengulang: boolean = undefined
    jenisUkom: string = undefined
    rekomendasi: string | null = undefined
    rekomendasiUrl: string | null = undefined
    fileRekomendasi: string | null = undefined
    pangkatCode: string = undefined
    pangkatName: string = undefined
    tmtPangkat: string = undefined
    jabatanName: string = undefined
    tmtJabatan: string = undefined
    jenjangName: string = undefined
    nextJabatanCode: string = undefined
    nextJabatanName: string = undefined
    nextJenjangCode: string = undefined
    nextJenjangName: string = undefined
    bidangJabatanCode: string = undefined
    bidangJabatanName: string | null = undefined
    unitKerjaId: string | null = undefined
    unitKerjaName: string = undefined
    userId: string = undefined
    dokumenUkomList: DokumenUkom[] = []
    ukomBanDto: any = undefined
    roomUkomDto: any = undefined

    constructor(object?: any) {
        super()
        if (object) {
            this.fromObject(object)
            if (object.dokumenUkomList) {
                this.dokumenUkomList = object.dokumenUkomList.map(
                    (doc: any) => new DokumenUkom(doc),
                )
            }
        }
    }
}
