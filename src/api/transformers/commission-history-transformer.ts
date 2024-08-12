import type { RecordModel } from 'pocketbase';
import type { CommissionHistory } from '@/types/commission';

export class CommissionHistoryTransformer {
  static transform(record: RecordModel): CommissionHistory {
    const commissionRecords = record.expand!.commissions_via_sale_id as {
      employee_id: string;
      commission: number;
      expand: { employee_id: { name: string; weight: number } };
    }[];

    const commissions: CommissionHistory['commissions'] = [];
    let totalCommission = 0;

    commissionRecords.forEach(({ employee_id, commission, expand }) => {
      commissions.push({
        id: employee_id,
        name: expand.employee_id.name,
        weight: expand.employee_id.weight,
        commission,
      });

      totalCommission += commission;
    });

    return {
      id: record.id as string,
      date: record.date,
      units: record.units as number,
      totalCommission,
      commissions,
    };
  }
}
