import pb from '@/lib/pocketbase';
import type { CommissionBand } from '@/types/commission-band';
import type { Employee } from '@/types/employee';
import type { MetalType } from '@/types/metal-type';

const getMetadata = async () => {
  const [employeeList, metalTypesList, commissionBands] = await Promise.all([
    getEmployeeList(),
    getMetalTypesList(),
    getCommissionBands(),
  ]);

  return {
    employeeList,
    metalTypesList,
    commissionBands,
  };
};
const getEmployeeList = async (): Promise<Employee[]> => {
  const employeeList: Employee[] = (await pb.collection('employees').getFullList()).map((record) => ({
    id: record.id,
    name: record.name,
    isPermanent: record.is_permanent,
    isActive: record.is_active,
    weight: record.weight,
    updated: new Date(record.updated),
  }));

  return employeeList;
};

const getMetalTypesList = async (): Promise<MetalType[]> => {
  const metalTypesList: MetalType[] = await pb.collection('products').getFullList();
  return metalTypesList;
};

const getCommissionBands = async (): Promise<CommissionBand[]> => {
  const commissionBands: CommissionBand[] = (await pb.collection('rates').getFullList()).map((record) => {
    const lowerLimit = record.lower_limit === 0 && record.rate < 0 ? -Infinity : record.lower_limit;
    const upperLimit = record.upper_limit === 0 && record.rate > 0 ? Infinity : record.upper_limit;

    let desc: string;

    if (lowerLimit === -Infinity) {
      desc = `< ${upperLimit}`;
    } else if (upperLimit === Infinity) {
      desc = `> ${lowerLimit}`;
    } else {
      desc = `${lowerLimit} - ${upperLimit}`;
    }

    return {
      id: record.id,
      lowerLimit,
      upperLimit,
      rate: record.rate,
      desc,
      updated: new Date(record.updated),
    };
  });

  commissionBands.sort((a, b) => a.lowerLimit - b.lowerLimit);

  return commissionBands;
};

const updateEmployee = async (employee: Employee): Promise<void> => {
  await pb.collection('employees').update(employee.id, {
    is_permanent: employee.isPermanent,
    is_active: employee.isActive,
    weight: employee.weight,
  });
};

const deleteEmployee = async (id: Employee['id']): Promise<void> => {
  await pb.collection('employees').delete(id);
};

const updateMetalType = async (metalType: MetalType): Promise<void> => {
  await pb.collection('products').update(metalType.id, metalType);
};

const deleteMetalType = async (id: MetalType['id']): Promise<void> => {
  await pb.collection('products').delete(id);
};

const updateCommissionBand = async (band: CommissionBand): Promise<void> => {
  await pb.collection('rates').update(band.id, band);
};

const deleteCommissionBand = async (id: CommissionBand['id']): Promise<void> => {
  await pb.collection('rates').delete(id);
};

export default {
  getMetadata,
  getEmployeeList,
  getMetalTypesList,
  getCommissionBands,
  updateEmployee,
  deleteEmployee,
  updateMetalType,
  deleteMetalType,
  updateCommissionBand,
  deleteCommissionBand,
};
