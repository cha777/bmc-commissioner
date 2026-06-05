export interface Metal {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  weight: number;
  is_permanent?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionRate {
  id: string;
  min_units: number;
  max_units: number;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionDetail {
  metal_id: string;
  units: number;
  snapshot_price: number;
}

export interface RecordEmployee {
  employee_id: string;
  snapshot_weight: number;
  commission_earned: number;
  base_commission?: number;
  bonus_amount?: number;
}

export interface DailyRecord {
  id: string;
  date: string;
  total_units: number;
  snapshot_avg_price: number;
  snapshot_rates_json: CommissionRate[];
  production_details: ProductionDetail[];
  employees: RecordEmployee[];
  note?: string;
  disable_negative_commissions?: boolean;
  additional_bonus_per_weight?: number;
  idle_employee_count?: number;
  created_at: string;
  updated_at: string;
}
