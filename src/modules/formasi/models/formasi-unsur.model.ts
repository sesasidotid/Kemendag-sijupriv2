import { Serializable } from "../../../modules/base/commons/serializable";

export class FormasiUnsur extends Serializable {
    id: string = undefined;
    unsur: string = undefined;
    standartWaktu: string = undefined;
    satuanWaktu: string = undefined;
    satuanHasil: string = undefined;
    standartHasil: number = undefined;
    luas: number = undefined;
    angkaKredit: number = undefined;
    konstanta: number = undefined;
    lvl: number = undefined;
    jenjangCode: number = undefined;
    jenjangName: number = undefined;
    jabatanCode: number = undefined;
    parentId: number = undefined;
    volume: number = undefined;
    child: FormasiUnsur[] = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}