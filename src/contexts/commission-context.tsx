import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { commission, metadata } from '@/api';
import type { MetalType } from '@/types/metal-type';
import type { Employee } from '@/types/employee';
import type { CommissionBand } from '@/types/commission-band';

interface State {
  isInitialized: boolean;
  date: number;
  avgUnitPrice: number;
  totalUnitsProduced: number;
  employeeList: (Employee & { isSelected: boolean; commission: number })[];
}

const initialValues: State = {
  isInitialized: false,
  date: 0,
  avgUnitPrice: 0,
  totalUnitsProduced: 0,
  employeeList: [],
};

export interface CommissionContextType extends State {
  onDateUpdate: (date: Date) => void;
  onTotalQtyUpdate: (qty: number) => void;
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  submitData: () => void;
}
export const CommissionContext = createContext<CommissionContextType>({
  ...initialValues,
  onDateUpdate: () => {},
  onTotalQtyUpdate: () => {},
  onEmployeeSelectionUpdate: () => {},
  submitData: () => {},
});

interface CommissionProviderProps {
  children: ReactNode;
}

export const CommissionProvider: FC<CommissionProviderProps> = (props) => {
  const { children } = props;
  const [state, setState] = useState<State>({ ...initialValues, date: Date.now() });
  const [commissionBands, setCommissionBands] = useState<CommissionBand[]>([]);
  const [metalTypesList, setMetalTypesList] = useState<MetalType[]>([]);
  const [triggerCalculationEffect, setTriggerCalculationEffect] = useState(false);

  const positiveCommissionBands = useMemo(() => {
    return commissionBands.filter((band) => band.rate > 0);
  }, [commissionBands]);

  const negativeCommissionBands = useMemo(() => {
    return commissionBands.filter((band) => band.rate < 0).reverse();
  }, [commissionBands]);

  const onDateUpdate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      date: date.getTime(),
    }));
  }, []);

  const onTotalQtyUpdate = useCallback((qty: number) => {
    setState((prev) => ({
      ...prev,
      totalUnitsProduced: qty,
    }));

    setTriggerCalculationEffect(true);
  }, []);

  const onEmployeeSelectionUpdate = useCallback((id: Employee['id'], isSelected: boolean) => {
    setState((prev) => ({
      ...prev,
      employeeList: prev.employeeList.map((employee) => ({
        ...employee,
        isSelected: employee.id === id ? isSelected : employee.isSelected,
      })),
    }));

    setTriggerCalculationEffect(true);
  }, []);

  const submitData = useCallback(() => {
    commission.submitCommissionTransaction({
      date: new Date(state.date),
      products: metalTypesList.map((metalType) => ({
        id: metalType.id,
        price: metalType.price,
      })),
      employees: state.employeeList
        .filter((employee) => employee.isSelected)
        .map((employee) => ({ id: employee.id, weight: employee.weight, commission: employee.commission })),
      commissionRates: commissionBands,
    });
  }, [state.date, metalTypesList, state.employeeList, commissionBands]);

  useEffect(() => {
    const getMetadata = async () => {
      const { employeeList, metalTypesList, commissionBands } = await metadata.getMetadata();
      const avgUnitPrice = metalTypesList.reduce((prev, curr) => prev + curr.price, 0) / metalTypesList.length;

      setState((prev) => ({
        ...prev,
        avgUnitPrice,
        employeeList: employeeList.map((employee) => ({
          ...employee,
          isSelected: employee.isPermanent,
          commission: 0,
        })),
        isInitialized: true,
      }));

      setMetalTypesList(metalTypesList);
      setCommissionBands(commissionBands);
    };

    getMetadata();
  }, []);

  useEffect(() => {
    const calculateEmployeeCommission = () => {
      const unitsProduced = state.totalUnitsProduced;
      const average = state.avgUnitPrice;
      const employeeCount = state.employeeList.filter((employee) => employee.isSelected).length;
      let totalCommission = 0;

      if (unitsProduced > 0) {
        if (unitsProduced < negativeCommissionBands[0].upperLimit) {
          for (const band of negativeCommissionBands) {
            if (unitsProduced < band.upperLimit) {
              const unitsInBand = band.upperLimit - Math.max(unitsProduced, band.lowerLimit);
              totalCommission += average * unitsInBand * band.rate;
            }
          }
        } else if (unitsProduced > positiveCommissionBands[0].lowerLimit) {
          for (const band of positiveCommissionBands) {
            if (unitsProduced > band.lowerLimit) {
              const unitsInBand = Math.min(unitsProduced, band.upperLimit) - band.lowerLimit;
              totalCommission += average * unitsInBand * band.rate;
            }
          }
        }
      }

      setState((prev) => ({
        ...prev,
        employeeList: prev.employeeList.map((employee) => ({
          ...employee,
          commission: (totalCommission * employee.weight) / employeeCount,
        })),
      }));
    };

    if (triggerCalculationEffect) {
      calculateEmployeeCommission();
      setTriggerCalculationEffect(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCalculationEffect]);

  return (
    <CommissionContext.Provider
      value={{
        ...state,
        onDateUpdate,
        onTotalQtyUpdate,
        onEmployeeSelectionUpdate,
        submitData,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const CommissionConsumer = CommissionContext.Consumer;
