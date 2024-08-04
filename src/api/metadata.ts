import pb from '@/lib/pocketbase';
import type { CommissionBand } from '@/types/commission-band';
import type { Employee } from '@/types/employee';
import type { MetalType } from '@/types/metal-type';

const getMetadata = async () => {
  const [employeeList, metalTypesList, commissionBands] = await Promise.all([
    _getEmployeeList(),
    _getMetalTypesList(),
    _getCommissionBands(),
  ]);

  return {
    employeeList,
    metalTypesList,
    commissionBands,
  };
};
const _getEmployeeList = async (): Promise<Employee[]> => {
  const employeeList: Employee[] = (await pb.collection('employees').getFullList()).map((record) => ({
    id: record.id,
    name: record.name,
    isPermanent: record.is_permanent,
    weight: record.weight,
  }));

  return employeeList;
};

const _getMetalTypesList = async (): Promise<MetalType[]> => {
  const metalTypesList: MetalType[] = await pb.collection('metal_types').getFullList();
  return metalTypesList;
};

const _getCommissionBands = async (): Promise<CommissionBand[]> => {
  const commissionBands: CommissionBand[] = (await pb.collection('commission_bands').getFullList()).map((record) => ({
    id: record.id,
    lowerLimit: record.lower_limit === 0 && record.rate < 0 ? -Infinity : record.lower_limit,
    upperLimit: record.upper_limit === 0 && record.rate > 0 ? Infinity : record.upper_limit,
    rate: record.rate,
  }));

  commissionBands.sort((a, b) => a.lowerLimit - b.lowerLimit);

  return commissionBands;
};

export default {
  getMetadata,
};
