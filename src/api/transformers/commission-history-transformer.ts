import { RecordModel } from 'pocketbase';

export class CommissionHistoryTransformer {
  static transform(record: RecordModel) {
    const commissions = record.expand!.commissions_via_sale_id as {
      employee_id: string;
      commission: number;
      expand: { employee_id: { name: string } };
    }[];

    return {
      id: record.id as string,
      date: record.date,
      units: record.units as number,
      commissions: commissions.map(({ employee_id, commission, expand }) => ({
        id: employee_id,
        name: expand.employee_id.name,
        commission,
      })),
    };
  }
}
