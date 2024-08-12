import type { RecordModel } from 'pocketbase';
import type { CommissionBand } from '@/types/commission-band';

export class CommissionBandTransformer {
  static transform(apiCommissionBand: RecordModel): CommissionBand {
    const lowerLimit =
      (apiCommissionBand.lower_limit === 0 || apiCommissionBand.lower_limit === null) && apiCommissionBand.rate < 0
        ? -Infinity
        : apiCommissionBand.lower_limit;
    const upperLimit =
      (apiCommissionBand.upper_limit === 0 || apiCommissionBand.upper_limit === null) && apiCommissionBand.rate > 0
        ? Infinity
        : apiCommissionBand.upper_limit;

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
