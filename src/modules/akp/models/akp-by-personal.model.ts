import { Serializable } from "../../base/commons/serializable";

type TPertanyaanItem = {
    kategoriInstrumentId: number;
    kategoriInstrumentName: string;
    pertanyaanId: number;
    pertanyaanName: string;
    nilaiYbs: number;
    nilaiRekan: number;
    nilaiAtasan: number;
}

export class AKPByPersonal extends Serializable {
    id: string = undefined;
    nip: string = undefined;
    name: string = undefined;
    email: string = undefined;
    jenisKelaminCode: string = undefined;
    jenisKelaminName: string = undefined;
    unitKerjaId: string = undefined;
    unitKerjaName: string = undefined;
    instansiId: string = undefined;
    instansiName: string = undefined;
    pangkatCode: string = undefined;
    pangkatName: string = undefined;
    jabatanCode: string = undefined;
    jabatanName: string = undefined;
    jenjangCode: string = undefined;
    jenjangName: string = undefined;
    instrumentId: number = undefined;
    instrumentName: string = undefined;
    dataPertanyaanList: TPertanyaanItem[] = [];


    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}