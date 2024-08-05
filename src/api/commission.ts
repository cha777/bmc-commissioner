import pb from '@/lib/pocketbase';
import type { CommissionBand } from '@/types/commission-band';
import type { Employee } from '@/types/employee';
import type { MetalType } from '@/types/metal-type';

interface SubmitCommissionData {
  date: Date;
  products: { id: MetalType['id']; price: MetalType['price']; qty: number }[];
  employees: { id: Employee['id']; weight: Employee['weight']; commission: number }[];
  commissionRates: CommissionBand[];
}

const submitCommissionTransaction = async (data: SubmitCommissionData) => {
  let employeeRecordIds: string[] = [];

  try {
    employeeRecordIds = await _createEmployeeCommissionRecords(data.date, data.employees);

    if (employeeRecordIds.length !== data.employees.length) {
      throw new Error('Failed to create all records in daily_commissions collection');
    }

    await _createDailyProductionRecord(data, employeeRecordIds);
  } catch (e) {
    await _rollbackEmployeeCommissionRecords(employeeRecordIds);
    console.error('Transaction failed and rolled back:', e);
    throw e;
  }
};

const _createEmployeeCommissionRecords = async (
  date: Date,
  employees: SubmitCommissionData['employees']
): Promise<string[]> => {
  const recordIds: string[] = [];

  try {
    for (const employee of employees) {
      const record = await pb.collection('daily_commissions').create({
        date: date,
        employee_id: employee.id,
        commission: employee.commission,
      });

      recordIds.push(record.id);
    }
    return recordIds;
  } catch (e) {
    console.error('Error while creating employee commission records', e);
    return recordIds;
  }
};

const _createDailyProductionRecord = async (data: SubmitCommissionData, employeeRecordIds: string[]) => {
  await pb.collection('production_records').create({
    date: data.date,
    products: data.products,
    commission_rates: data.commissionRates,
    employees: data.employees,
    employee_commissions: employeeRecordIds,
  });
};

const _rollbackEmployeeCommissionRecords = async (recordIds: string[]) => {
  for (const id of recordIds) {
    try {
      await pb.collection('daily_commissions').delete(id);
    } catch (e) {
      console.error('Failed to delete record in rollback:', e);
    }
  }
};
export default {
  submitCommissionTransaction,
};
