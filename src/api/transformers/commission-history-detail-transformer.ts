import type { RecordModel } from 'pocketbase';

import { CommissionBandTransformer } from './commission-band-transformer';
import { ProductTransformer } from './product-transformer';
import type { CommissionHistoryDetail, EmployeeCommissionSelection } from '@/types/commission';

export class CommissionHistoryDetailTransformer {
  static transform(record: RecordModel): CommissionHistoryDetail {
    const commissionRecords = record.expand!.commissions_via_sale_id as {
      id: string;
      employee_id: string;
      commission: number;
      expand: { employee_id: { name: string; weight: number } };
    }[];

    const employeeCommissionMap = new Map<EmployeeCommissionSelection['id'], EmployeeCommissionSelection>();

    (record.employees as EmployeeCommissionSelection[]).forEach((employee) => {
      employeeCommissionMap.set(employee.id, { ...employee, commission: 0 });
    });

    let totalCommission = 0;

    commissionRecords.forEach(({ id, employee_id, commission }) => {
      const employeeCommission = employeeCommissionMap.get(employee_id);

      if (employeeCommission) {
        employeeCommissionMap.set(employee_id, {
          ...employeeCommission,
          commissionId: id,
          commission,
        });
      } else {
        console.warn('New employee record');
      }

      totalCommission += commission;
    });

    const products: CommissionHistoryDetail['products'] = record.products.map(ProductTransformer.transform);
    const rates: CommissionHistoryDetail['rates'] = record.rates.map(CommissionBandTransformer.transform);

    return {
      id: record.id as string,
      date: record.date,
      units: record.units as number,
      totalCommission,
      commissions: Array.from(employeeCommissionMap.values()),
      products,
      rates,
    };
  }
}