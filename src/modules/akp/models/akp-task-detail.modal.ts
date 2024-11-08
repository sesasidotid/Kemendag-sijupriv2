import { Serializable } from "../../base/commons/serializable";

export class AKPTaskDetail extends Serializable {
    id: string;
    objectId: string;
    objectName: string;
    objectGroup: string;
    comment: string;
    taskType: string;
    taskAction: string;
    taskStatus: string;
    workflowName: string;
    workflowTemplate: string;
    flowName: string;
    flowId: string;
    remark: string;
    instanceId: string;
    workflowId: string;
    objectTaskId: string;
    pendingTaskHistory: any[];
    nip: string;
    name: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelaminCode: string;
    jenisKelaminName: string;
    unitKerjaId: string;
    unitKerjaName: string;
    instansiId: string;
    instansiName: string;
    pangkatCode: string;
    pangkatName: string;
    jabatanCode: string;
    jabatanName: string;
    jenjangCode: string;
    jenjangName: string;
    akpId: string;
    instrumentId: number;
    instrumentName: string;
    namaAtasan: string;
    emailAtasan: string;
    action: string;
    rekomendasi: string;
    rekomendasiUrl: string;
    rekomendasiFile: any;
    matrix1DtoList: any[];
    matrix2DtoList: any[];
    matrix3DtoList: any[];
    

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}