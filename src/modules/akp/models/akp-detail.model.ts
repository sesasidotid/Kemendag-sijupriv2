import { Serializable } from "../../base/commons/serializable";

export class AKPDetail extends Serializable {
    id: string;
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
    instrumentId: number;
    instrumentName: string;
    namaAtasan: string;
    emailAtasan: string;
    action: string;
    rekomendasi: string;
    rekomendasiUrl: string;
    rekomendasiFile: string;
    matrix1DtoList: any[];
    matrix2DtoList: any[];
    matrix3DtoList: any[];
    isAtasanGraded: boolean;
    isRekanGraded: boolean;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}