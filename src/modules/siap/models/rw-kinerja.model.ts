import { Serializable } from "../../base/commons/serializable";

export class RWKinerja extends Serializable {
    id: string = undefined;
    type: string = undefined;
    dateStart: Date = undefined;
    dateEnd: Date = undefined;
    angkaKredit: string = undefined;
    
    docEvaluasi: string = undefined;
    docEvaluasiUrl: string = undefined;
    fileDocEvaluasi: string = undefined;

    docPredikat: string = undefined;
    docPredikatUrl: string = undefined;
    fileDocPredikat: string = undefined;

    docAkumulasiAk: string = undefined;
    docAkumulasiAkUrl: string = undefined;
    fileDocAkumulasiAk: string = undefined;

    docPenetapanAk: string = undefined;
    docPenetapanAkUrl: string = undefined;
    fileDocPenetapanAk: string = undefined;

    ratingHasilId: string = undefined;
    ratingHasilName: string = undefined;
    ratingHasilValue: number = undefined;

    ratingKinerjaId: string = undefined;
    ratingKinerjaName: string = undefined;
    ratingKinerjaValue: number = undefined;

    predikatKinerjaId: string = undefined;
    predikatKinerjaName: string = undefined;
    predikatKinerjaValue: number = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}