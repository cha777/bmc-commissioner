import { CommissionBand } from '@/types/commission-band';
import { RecordModel } from 'pocketbase';

export class CommissionBandTransformer {
  static transform(apiCommissionBand: RecordModel): CommissionBand {
    const lowerLimit =
      apiCommissionBand.lower_limit === 0 && apiCommissionBand.rate < 0 ? -Infinity : apiCommissionBand.lower_limit;
    const upperLimit =
      apiCommissionBand.upper_limit === 0 && apiCommissionBand.rate > 0 ? Infinity : apiCommissionBand.upper_limit;

    let desc: string;

    if (lowerLimit === -Infinity) {
      desc = `< ${upperLimit}`;
    } else if (upperLimit === Infinity) {
      desc = `> ${lowerLimit}`;
    } else {
      desc = `${lowerLimit} - ${upperLimit}`;
    }

    return {
      id: apiCommissionBand.id,
      lowerLimit,
      upperLimit,
      rate: apiCommissionBand.rate,
      desc,
      updated: new Date(apiCommissionBand.updated),
    };
  }
}
