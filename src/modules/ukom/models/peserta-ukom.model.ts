import { Serializable } from "../../base/commons/serializable";

export class PesertaUkom extends Serializable {
    nip: string = undefined;
    nik: string = undefined;
    phone: string = undefined;
    name: string = undefined;
    email: string = undefined;
    tempatLahir: string = undefined;
    tanggalLahir: Date = undefined;
    jenisKelaminCode: string = undefined;
    jenisKelaminName: string = undefined;
    ukomId: string = undefined;
    jenisUkom: string = undefined;

    jabatanCode: string = undefined;
    jabatanName: string = undefined;
    nextJabatanCode: string = undefined;
    nextJabatanName: string = undefined;

    jenjangCode: string = undefined;
    jenjangName: string = undefined;
    nextJenjangCode: string = undefined;
    nextJenjangName: string = undefined;

    pangkatCode: string = undefined;
    pangkatName: string = undefined;
    nextPangkatCode: string = undefined;
    nextPangkatName: string = undefined;

    instansiId: string = undefined;
    instansiName: string = undefined;

    unitKerjaId: string = undefined;
    unitKerjaName: string = undefined;

    dokumenPesertaUkom: any[] = [];

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}