import { Serializable } from "../../base/commons/serializable";

type TKategoriInstrumentItem = {
    id: number;
    name: string;
    instrumentId: number;
    pertanyaanList: TPertanyaanItem[];
}

type TPertanyaanItem = {
    id: number;
    name: string;
    kategoriInstrumentId: number;
}

export class AKPByReviewer extends Serializable {
    status?: string = undefined;
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
    kategoriInstrumentList: TKategoriInstrumentItem[] = [];


    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}