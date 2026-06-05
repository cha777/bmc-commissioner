import { Metal, CommissionRate, Employee, DailyRecord, ProductionDetail, RecordEmployee } from './types';

/**
 * Calculates the Average Price (AP) based on all metals in the system.
 */
export const calculateAveragePrice = (metals: Metal[]): number => {
  if (metals.length === 0) return 0;
  const total = metals.reduce((acc, m) => acc + m.price, 0);
  return total / metals.length;
};

/**
 * Calculates the total global commission pool for the day using tiered bands.
 */
export const calculateTotalCommissionPool = (
  unitsProduced: number,
  avgUnitPrice: number,
  rates: CommissionRate[],
  isNegativeCommissionsAllowed: boolean,
): number => {
  let totalCommission = 0;
  if (unitsProduced <= 0) return 0;

  // Split bands: negative rate is a penalty band, positive is a reward band.
  const negativeCommissionBands = rates.filter((r) => r.rate < 0).sort((a, b) => a.min_units - b.min_units);
  const positiveCommissionBands = rates.filter((r) => r.rate >= 0).sort((a, b) => a.min_units - b.min_units);

  // If we fall into a negative tier (units produced is less than or equal to the upper limit of the lowest negative band)
  if (
    negativeCommissionBands.length > 0 &&
    unitsProduced <= negativeCommissionBands[0].max_units &&
    isNegativeCommissionsAllowed
  ) {
    for (const band of negativeCommissionBands) {
      if (unitsProduced <= band.max_units) {
        const unitsInBand = band.max_units - Math.max(unitsProduced, band.min_units);
        if (unitsInBand > 0) {
          totalCommission += avgUnitPrice * unitsInBand * (band.rate / 100);
        }
      }
    }
  }
  // If we fall into a positive tier
  else if (positiveCommissionBands.length > 0 && unitsProduced > positiveCommissionBands[0].min_units) {
    for (const band of positiveCommissionBands) {
      if (unitsProduced > band.min_units) {
        const unitsInBand = Math.min(unitsProduced, band.max_units) - band.min_units;
        if (unitsInBand > 0) {
          totalCommission += avgUnitPrice * unitsInBand * (band.rate / 100);
        }
      }
    }
  }

  return totalCommission;
};

/**
 * Creates a DailyRecord by snapshotting current global states.
 */
export const createDailyRecordSnapshot = (
  date: string,
  productionEntries: { metal_id: string; units: number }[],
  activeEmployeeIds: string[],
  allMetals: Metal[],
  allEmployees: Employee[],
  allRates: CommissionRate[],
  note?: string,
  disable_negative_commissions?: boolean,
  additional_bonus_per_weight?: number,
  idle_employee_count?: number,
  override_avg_price?: number,
): DailyRecord => {
  const total_units = productionEntries.reduce((acc, p) => acc + p.units, 0);
  const snapshot_avg_price = override_avg_price ?? calculateAveragePrice(allMetals);
  const employeeCount = activeEmployeeIds.length + (idle_employee_count || 0);

  const totalCommissionPool = calculateTotalCommissionPool(
    total_units,
    snapshot_avg_price,
    allRates,
    !disable_negative_commissions,
  );

  const production_details: ProductionDetail[] = productionEntries.map((p) => {
    const metal = allMetals.find((m) => m.id === p.metal_id);
    return {
      metal_id: p.metal_id,
      units: p.units,
      snapshot_price: metal?.price || 0,
    };
  });

  const employees: RecordEmployee[] = activeEmployeeIds.map((id) => {
    const emp = allEmployees.find((e) => e.id === id);
    const weight = emp?.weight || 0;

    // (totalCommission * weight) / employeeCount
    let base_commission = 0;
    if (employeeCount > 0) {
      base_commission = (totalCommissionPool * weight) / employeeCount;
    }

    // Failsafe zero-out if negative commissions are completely disabled system-wide for safety
    if (disable_negative_commissions && base_commission < 0) {
      base_commission = 0;
    }

    const bonus_amount = weight * (additional_bonus_per_weight || 0);
    const commission_earned = base_commission + bonus_amount;

    return {
      employee_id: id,
      snapshot_weight: weight,
      commission_earned,
      base_commission,
      bonus_amount,
    };
  });

  return {
    id: crypto.randomUUID(),
    date,
    total_units,
    snapshot_avg_price,
    snapshot_rates_json: allRates,
    production_details,
    employees,
    note,
    disable_negative_commissions,
    additional_bonus_per_weight,
    idle_employee_count,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
