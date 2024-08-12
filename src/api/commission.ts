import pb from '@/lib/pocketbase';
import type { EmployeeCommission } from '@/types/commission';
import type { CommissionBand } from '@/types/commission-band';
import type { Product } from '@/types/product';

interface SubmitCommissionData {
  date: Date;
  productList: Product[];
  employeeList: (EmployeeCommission & { isSelected: boolean })[];
  rates: CommissionBand[];
  units: number;
}

const submitCommissionTransaction = async (data: SubmitCommissionData) => {
  let salesId: string = '';
  let commissionIds: string[] = [];
  const selectedEmployees = data.employeeList.filter((record) => record.isSelected);

  try {
    salesId = await _createSaleRecord(data);
    commissionIds = await _createCommissionRecords(salesId, selectedEmployees);

    if (commissionIds.length !== selectedEmployees.length) {
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
  employeeList: SubmitCommissionData['employeeList']
): Promise<string[]> => {
  const recordIds: string[] = [];

  try {
    for (const employee of employeeList) {
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
    products: data.productList.map((record) => ({ id: record.id, name: record.name, price: record.price })),
    rates: data.rates.map((record) => ({
      id: record.id,
      lower_limit: record.lowerLimit,
      upper_limit: record.upperLimit,
      rate: record.rate,
    })),
    employees: data.employeeList.map((record) => ({
      id: record.id,
      name: record.name,
      weight: record.weight,
      isSelected: record.isSelected,
    })),
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
