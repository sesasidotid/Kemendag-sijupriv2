// import { CATScore } from './cat-score'
// import { MakalahScore } from './makalah-score'
import {
    CATScore,
    MakalahScore,
    PortofolioScore,
    PraktikScore,
    StudiKasusScore,
} from '@/modules/ukom/models/exam/exam-score.model'

export type ScoreValue =
    | CATScore
    | MakalahScore
    | StudiKasusScore
    | PraktikScore
    | PortofolioScore
