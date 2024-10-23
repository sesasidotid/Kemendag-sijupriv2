import { Serializable } from "../../base/commons/serializable";

export class RWPendidikan extends Serializable {
    id: string = undefined;
    institusiPendidikan: string = undefined;
    jurusan: string = undefined;
    tanggalIjazah: Date = undefined;
    ijazah: string = undefined;
    ijazahUrl: string = undefined;
    fileIjazah: string = undefined;
    pendidikanCode: string = undefined;
    pendidikanName: string = undefined;
    nip: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}