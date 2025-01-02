import { CommissionBand } from './commission-band';
import { Employee } from './employee';
import { Product } from './product';

export interface EmployeeCommission extends Pick<Employee, 'id' | 'name' | 'weight'> {
  commission: number;
}

export type EmployeeCommissionRecord = EmployeeCommission & { commissionId?: string; isSelected: boolean };

export interface CommissionHistory {
  id: string;
  date: string;
  units: number;
  totalCommission: number;
  commissions: EmployeeCommission[];
}

export interface CommissionHistoryDetail {
  id: string;
  date: string;
  units: number;
  totalCommission: number;
  isNegativeCommissionsAllowed: boolean;
  additionalPayment: number;
  notes: string;
  commissions: EmployeeCommissionRecord[];
  products: Pick<Product, 'id' | 'name' | 'price'>[];
  rates: Pick<CommissionBand, 'id' | 'lowerLimit' | 'upperLimit' | 'rate' | 'desc'>[];
  created: string;
  updated: string;
}
