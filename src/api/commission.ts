import pb from '@/lib/pocketbase';
import type { CommissionBand } from '@/types/commission-band';
import type { Employee } from '@/types/employee';
import type { MetalType } from '@/types/metal-type';

interface SubmitCommissionData {
  date: Date;
  products: { id: MetalType['id']; price: MetalType['price'] }[];
  employees: { id: Employee['id']; weight: Employee['weight']; commission: number }[];
  commissionRates: CommissionBand[];
  units: number;
}

const submitCommissionTransaction = async (data: SubmitCommissionData) => {
  let salesId: string = '';
  let commissionIds: string[] = [];

  try {
    salesId = await _createSaleRecord(data);
    commissionIds = await _createCommissionRecords(salesId, data.employees);

    if (commissionIds.length !== data.employees.length) {
      throw new Error('Failed to create all records in daily_commissions collection');
    }
  } catch (e) {
    await _rollbackTransaction(salesId);
    console.error('Transaction failed and rolled back:', e);
    throw e;
  }
};

const _createCommissionRecords = async (
  saleId: string,
  employees: SubmitCommissionData['employees']
): Promise<string[]> => {
  const recordIds: string[] = [];

  try {
    for (const employee of employees) {
      const record = await pb.collection('commissions').create({
        sale_id: saleId,
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

const _createSaleRecord = async (data: SubmitCommissionData) => {
  const record = await pb.collection('sales').create({
    date: data.date,
    units: data.units,
    products: data.products,
    rates: data.commissionRates,
  });

  return record.id;
};

const _rollbackTransaction = async (saleId?: string) => {
  // Since we have cascading deletion, deleting saleId will remove commission records in db
  if (saleId) {
    try {
      await pb.collection('sales').delete(saleId);
    } catch (e) {
      console.error('Failed to delete sale record id', e);
    }
  }
};

export default {
  submitCommissionTransaction,
};
