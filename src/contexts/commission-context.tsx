import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { commission, metadata } from '@/api';
import type { MetalType } from '@/types/metal-type';
import type { Employee } from '@/types/employee';
import type { CommissionBand } from '@/types/commission-band';

interface State {
  isInitialized: boolean;
  date: number;
  employeeList: (Employee & { isSelected: boolean; commission: number })[];
  metalTypesList: (MetalType & { qty: number })[];
  totalValue: number;
}

const initialValues: State = {
  isInitialized: false,
  date: 0,
  employeeList: [],
  metalTypesList: [],
  totalValue: 0,
};

export interface CommissionContextType extends State {
  onDateUpdate: (date: Date) => void;
  onMetalQtyUpdate: (type: MetalType['id'], qty: number) => void;
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  submitData: () => void;
}
export const CommissionContext = createContext<CommissionContextType>({
  ...initialValues,
  onDateUpdate: () => {},
  onMetalQtyUpdate: () => {},
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

  const onMetalQtyUpdate = useCallback(
    (id: MetalType['id'], qty: number) => {
      let totalValue = 0;
      const updatedMetalTypesList = state.metalTypesList.map((metalType) => {
        const updatedMetalType = {
          ...metalType,
          qty: metalType.id === id ? qty : metalType.qty,
        };

        totalValue += updatedMetalType.price * updatedMetalType.qty;
        return updatedMetalType;
      });

      setState((prev) => ({
        ...prev,
        metalTypesList: updatedMetalTypesList,
        totalValue,
      }));

      setTriggerCalculationEffect(true);
    },
    [state.metalTypesList]
  );

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
      products: state.metalTypesList.map((metalType) => ({
        id: metalType.id,
        price: metalType.price,
        qty: metalType.qty,
      })),
      employees: state.employeeList
        .filter((employee) => employee.isSelected)
        .map((employee) => ({ id: employee.id, weight: employee.weight, commission: employee.commission })),
      commissionRates: commissionBands,
    });
  }, [state.date, state.metalTypesList, state.employeeList, commissionBands]);

  useEffect(() => {
    const getMetadata = async () => {
      const { employeeList, metalTypesList, commissionBands } = await metadata.getMetadata();

      setState((prev) => ({
        ...prev,
        employeeList: employeeList.map((employee) => ({
          ...employee,
          isSelected: employee.isPermanent,
          commission: 0,
        })),
        metalTypesList: metalTypesList.map((metalType) => ({
          ...metalType,
          qty: 0,
        })),
        isInitialized: true,
      }));

      setCommissionBands(commissionBands);
    };

    getMetadata();
  }, []);

  useEffect(() => {
    const calculateEmployeeCommission = () => {
      const unitsProduced = state.metalTypesList.reduce((prev, curr) => prev + curr.qty, 0);
      const average = state.totalValue / unitsProduced;
      const employeeCount = state.employeeList.filter((employee) => employee.isSelected).length;
      let totalCommission = 0;

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
        onMetalQtyUpdate,
        onEmployeeSelectionUpdate,
        submitData,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const CommissionConsumer = CommissionContext.Consumer;
