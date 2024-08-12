import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { history } from '@/api';
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
  totalCommission: number;
  employeeList: (EmployeeCommission & { isSelected: boolean })[];
}

const initialValues: State = {
  isInitialized: false,
  isSubmitting: false,
  date: 0,
  avgUnitPrice: 0,
  totalUnitsProduced: 0,
  totalCommission: 0,
  employeeList: [],
};

export interface CommissionEditContextType extends State {
  onTotalQtyUpdate: (qty: number) => void;
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  submitData: () => void;
}
export const CommissionEditContext = createContext<CommissionEditContextType>({
  ...initialValues,
  onTotalQtyUpdate: () => {},
  onEmployeeSelectionUpdate: () => {},
  submitData: () => {},
});

interface CommissionEditProviderProps {
  children: ReactNode;
  id: string;
}

export const CommissionEditProvider: FC<CommissionEditProviderProps> = (props) => {
  const { children, id } = props;
  const [state, setState] = useState<State>({ ...initialValues, date: Date.now() });
  const [commissionBands, setCommissionBands] = useState<Omit<CommissionBand, 'updated'>[]>([]);
  const [productList, setProductList] = useState<Omit<Product, 'updated'>[]>([]);
  const [triggerCalculationEffect, setTriggerCalculationEffect] = useState(false);

  const query = useQuery({ queryKey: [queryKey.history, id], queryFn: () => history.getCommissionRecordById(id) });

  const positiveCommissionBands = useMemo(() => {
    return commissionBands.filter((band) => band.rate > 0);
  }, [commissionBands]);

  const negativeCommissionBands = useMemo(() => {
    return commissionBands.filter((band) => band.rate < 0).reverse();
  }, [commissionBands]);

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

  const submitData = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      // TODO: Implement update method
      // await history.updateCommissionRecord({
      //   date: new Date(state.date),
      //   products: productList.map((product) => ({
      //     id: product.id,
      //     price: product.price,
      //   })),
      //   employees: state.employeeList
      //     .filter((employee) => employee.isSelected)
      //     .map((employee) => ({ id: employee.id, weight: employee.weight, commission: employee.commission })),
      //   commissionRates: commissionBands,
      //   units: state.totalUnitsProduced,
      // });

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
  }, [state.date, state.employeeList, state.totalUnitsProduced, productList, commissionBands]);

  /**
   * This method will request metadata and update the context state
   */
  useEffect(() => {
    if (query.isSuccess) {
      setProductList(query.data.products);
      setCommissionBands(query.data.rates);

      const avgUnitPrice =
        query.data.products.reduce((prev, curr) => prev + curr.price, 0) / query.data.products.length;

      setState((prev) => ({
        ...prev,
        avgUnitPrice,
        totalUnitsProduced: query.data.units,
        totalCommission: query.data.totalCommission,
        employeeList: query.data.commissions,
        isInitialized: true,
      }));
    }
  }, [query.isPending, query.isSuccess, query.data]);

  useEffect(() => {
    const calculateEmployeeCommission = () => {
      const unitsProduced = state.totalUnitsProduced;
      const average = state.avgUnitPrice;
      const employeeCount = state.employeeList.filter((employee) => employee.isSelected).length;
      let totalCommission = 0;

      if (unitsProduced > 0) {
        if (unitsProduced <= negativeCommissionBands[0].upperLimit) {
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
    <CommissionEditContext.Provider
      value={{
        ...state,
        onTotalQtyUpdate,
        onEmployeeSelectionUpdate,
        submitData,
      }}
    >
      {children}
    </CommissionEditContext.Provider>
  );
};

export const CommissionEditConsumer = CommissionEditContext.Consumer;
