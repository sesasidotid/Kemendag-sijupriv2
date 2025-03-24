import { Serializable } from "../../base/commons/serializable";

export class RWSertifikasi extends Serializable {
    id: string = undefined;
    noSk: string = undefined;
    tglSk: Date | string = undefined;
    wilayahKerja: string = undefined;
    dateStart: Date | string = undefined;
    dateEnd: Date | string = undefined;
    uuKawalan: string = undefined;
    skPengangkatan: string = undefined;
    skPengangkatanUrl: string = undefined;
    fileSkPengangkatan: string = undefined;
    ktpPpns: string = undefined;
    ktpPpnsUrl: string = undefined;
    fileKtpPpns: string = undefined;
    kategoriSertifikasiId: string = undefined;
    kategoriSertifikasiName: string = undefined;
    kategoriSertifikasiValue: number = undefined;
    nip: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}