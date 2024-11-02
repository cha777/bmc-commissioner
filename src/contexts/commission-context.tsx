import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { commission, metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Product } from '@/types/product';
import type { Employee } from '@/types/employee';
import type { CommissionBand } from '@/types/commission-band';
import type { EmployeeCommission } from '@/types/commission';

interface State {
  isInitialized: boolean;
  isSubmitting: boolean;
  date: number;
  avgUnitPrice: number;
  totalUnitsProduced: number;
  isNegativeCommissionsAllowed: boolean;
  totalCommission: number;
  employeeList: (EmployeeCommission & { isSelected: boolean })[];
}

const initialValues: State = {
  isInitialized: false,
  isSubmitting: false,
  date: 0,
  avgUnitPrice: 0,
  totalUnitsProduced: 0,
  isNegativeCommissionsAllowed: true,
  totalCommission: 0,
  employeeList: [],
};

export interface CommissionContextType extends State {
  onDateUpdate: (date: Date) => void;
  onTotalQtyUpdate: (qty: number) => void;
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  onNegativeCommissionAllowUpdate: (isAllowed: boolean) => void;
  submitData: () => void;
}
export const CommissionContext = createContext<CommissionContextType>({
  ...initialValues,
  onDateUpdate: () => {},
  onTotalQtyUpdate: () => {},
  onEmployeeSelectionUpdate: () => {},
  onNegativeCommissionAllowUpdate: () => {},
  submitData: () => {},
});

interface CommissionProviderProps {
  children: ReactNode;
}

export const CommissionProvider: FC<CommissionProviderProps> = (props) => {
  const { children } = props;
  const [state, setState] = useState<State>({ ...initialValues, date: Date.now() });
  const [commissionBands, setCommissionBands] = useState<CommissionBand[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [triggerCalculationEffect, setTriggerCalculationEffect] = useState(false);

  const metadataQueries = useQueries({
    queries: [
      { queryKey: [queryKey.employees], queryFn: metadata.getEmployeeList },
      { queryKey: [queryKey.products], queryFn: metadata.getProductList },
      { queryKey: [queryKey.commissionBands], queryFn: metadata.getCommissionBands },
    ],
  });

  const isMetadataReady = metadataQueries.every((query) => query.isSuccess);

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

  const onNegativeCommissionAllowUpdate = useCallback((isAllowed: boolean) => {
    setState((prev) => ({
      ...prev,
      isNegativeCommissionsAllowed: isAllowed,
    }));

    setTriggerCalculationEffect(true);
  }, []);

  const submitData = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      await commission.submitCommissionTransaction({
        date: new Date(state.date),
        productList,
        employeeList: state.employeeList,
        rates: commissionBands,
        units: state.totalUnitsProduced,
        isNegativeCommissionsAllowed: state.isNegativeCommissionsAllowed,
      });

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    } catch (e) {
      console.error('Error while submitting commission record', e);

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [
    state.date,
    state.employeeList,
    state.totalUnitsProduced,
    state.isNegativeCommissionsAllowed,
    productList,
    commissionBands,
  ]);

  /**
   * This method will request metadata and update the context state
   */
  useEffect(() => {
    if (isMetadataReady) {
      const [employeesQuery, productsQuery, commissionBandsQuery] = metadataQueries;
      const avgUnitPrice = productsQuery.data
        ? productsQuery.data.reduce((prev, curr) => prev + curr.price, 0) / productsQuery.data.length
        : 0;

      setState((prev) => ({
        ...prev,
        avgUnitPrice,
        employeeList:
          employeesQuery.data
            ?.filter((employee) => employee.isActive)
            .map((employee) => ({
              ...employee,
              isSelected: employee.isPermanent,
              commission: 0,
            })) ?? [],
        isInitialized: true,
      }));

      setProductList(productsQuery.data ?? []);
      setCommissionBands(commissionBandsQuery.data ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMetadataReady]);

  useEffect(() => {
    const calculateEmployeeCommission = () => {
      const unitsProduced = state.totalUnitsProduced;
      const average = state.avgUnitPrice;
      const employeeCount = state.employeeList.filter((employee) => employee.isSelected).length;
      let totalCommission = 0;

      if (unitsProduced > 0) {
        if (unitsProduced <= negativeCommissionBands[0].upperLimit && state.isNegativeCommissionsAllowed) {
          for (const band of negativeCommissionBands) {
            if (unitsProduced <= band.upperLimit) {
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
        totalCommission: (employeeCount * Math.round((100 * totalCommission) / employeeCount)) / 100,
        employeeList: prev.employeeList.map((employee) => ({
          ...employee,
          commission: employee.isSelected
            ? Math.round((100 * (totalCommission * employee.weight)) / employeeCount) / 100
            : 0,
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
        onNegativeCommissionAllowUpdate,
        submitData,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const CommissionConsumer = CommissionContext.Consumer;
