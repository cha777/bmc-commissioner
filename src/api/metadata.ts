import pb from '@/lib/pocketbase';
import { EmployeeTransformer } from '@/api/transformers/employee-transformer';
import { ProductTransformer } from '@/api/transformers/product-transformer';
import { CommissionBandTransformer } from '@/api/transformers/commission-band-transformer';
import type { CommissionBand } from '@/types/commission-band';
import type { Employee } from '@/types/employee';
import type { Product } from '@/types/product';

const getMetadata = async () => {
  const [employeeList, productList, commissionBands] = await Promise.all([
    getEmployeeList(),
    getProductList(),
    getCommissionBands(),
  ]);

  return {
    employeeList,
    productList,
    commissionBands,
  };
};

const getEmployeeList = async (): Promise<Employee[]> => {
  const employeeList = (await pb.collection('employees').getFullList()).map(EmployeeTransformer.transform);
  return employeeList;
};

const getProductList = async (): Promise<Product[]> => {
  const productList = (await pb.collection('products').getFullList()).map(ProductTransformer.transform);
  return productList;
};

const getCommissionBands = async (): Promise<CommissionBand[]> => {
  const commissionBands: CommissionBand[] = (await pb.collection('rates').getFullList())
    .map(CommissionBandTransformer.transform)
    .sort((a, b) => a.lowerLimit - b.lowerLimit);

  return commissionBands;
};

const updateEmployee = async (employee: Employee): Promise<Employee> => {
  return EmployeeTransformer.transform(
    await pb.collection('employees').update(employee.id, {
      is_permanent: employee.isPermanent,
      is_active: employee.isActive,
      weight: employee.weight,
    })
  );
};

const deleteEmployee = async (id: Employee['id']): Promise<boolean> => {
  return await pb.collection('employees').delete(id);
};

const updateProduct = async (product: Product): Promise<Product> => {
  return ProductTransformer.transform(await pb.collection('products').update(product.id, product));
};

const deleteProduct = async (id: Product['id']): Promise<boolean> => {
  return await pb.collection('products').delete(id);
};

const updateCommissionBand = async (band: CommissionBand): Promise<CommissionBand> => {
  return CommissionBandTransformer.transform(await pb.collection('rates').update(band.id, band));
};

const deleteCommissionBand = async (id: CommissionBand['id']): Promise<boolean> => {
  return await pb.collection('rates').delete(id);
};

export default {
  getMetadata,
  getEmployeeList,
  getProductList,
  getCommissionBands,
  updateEmployee,
  deleteEmployee,
  updateProduct,
  deleteProduct,
  updateCommissionBand,
  deleteCommissionBand,
};
