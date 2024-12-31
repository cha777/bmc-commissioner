import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { commission, history } from '@/api';
import { useRouter } from '@/hooks/use-router';
import { queryKey } from '@/utils';
import type { Employee } from '@/types/employee';
import type { CommissionBand } from '@/types/commission-band';
import type { EmployeeCommissionRecord } from '@/types/commission';

interface State {
  isInitialized: boolean;
  isSubmitting: boolean;
  date: number;
  avgUnitPrice: number;
  totalUnitsProduced: number;
  totalCommission: number;
  employeeList: EmployeeCommissionRecord[];
  isNegativeCommissionsAllowed: boolean;
  additionalPayment: number;
}

const initialValues: State = {
  isInitialized: false,
  isSubmitting: false,
  date: 0,
  avgUnitPrice: 0,
  totalUnitsProduced: 0,
  totalCommission: 0,
  employeeList: [],
  isNegativeCommissionsAllowed: true,
  additionalPayment: 0,
};

export interface CommissionEditContextType extends State {
  onTotalQtyUpdate: (qty: number) => void;
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  onNegativeCommissionAllowUpdate: (isAllowed: boolean) => void;
  onAdditionalPaymentUpdate: (value: number) => void;
  submitData: () => void;
}

export const CommissionEditContext = createContext<CommissionEditContextType>({
  ...initialValues,
  onTotalQtyUpdate: () => {},
  onEmployeeSelectionUpdate: () => {},
  onNegativeCommissionAllowUpdate: () => {},
  onAdditionalPaymentUpdate: () => {},
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
  const [triggerCalculationEffect, setTriggerCalculationEffect] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [queryKey.history, id],
    queryFn: () => history.getCommissionRecordById(id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 1,
  });

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

  const onNegativeCommissionAllowUpdate = useCallback((isAllowed: boolean) => {
    setState((prev) => ({
      ...prev,
      isNegativeCommissionsAllowed: isAllowed,
    }));

    setTriggerCalculationEffect(true);
  }, []);

  const onAdditionalPaymentUpdate = useCallback((value: number) => {
    setState((prev) => ({
      ...prev,
      additionalPayment: value,
    }));

    setTriggerCalculationEffect(true);
  }, []);

  const submitData = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      await commission.updateCommissionTransaction({
        id,
        units: state.totalUnitsProduced,
        employeeList: state.employeeList,
        isNegativeCommissionsAllowed: state.isNegativeCommissionsAllowed,
        additionalPayment: state.additionalPayment,
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
    } finally {
      queryClient.invalidateQueries({ queryKey: [queryKey.history] });
      router.back();
    }
  }, [id, state.totalUnitsProduced, state.employeeList, state.isNegativeCommissionsAllowed, queryClient, router]);

  /**
   * This method will request metadata and update the context state
   */
  useEffect(() => {
    if (query.isSuccess) {
      setCommissionBands(query.data.rates);

      const avgUnitPrice =
        query.data.products.reduce((prev, curr) => prev + curr.price, 0) / query.data.products.length;

      setState((prev) => ({
        ...prev,
        date: new Date(query.data.date).getTime(),
        avgUnitPrice,
        totalUnitsProduced: query.data.units,
        totalCommission: query.data.totalCommission,
        employeeList: query.data.commissions,
        isNegativeCommissionsAllowed: query.data.isNegativeCommissionsAllowed,
        additionalPayment: query.data.additionalPayment,
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

      setState((prev) => {
        const employeeCommissions = prev.employeeList.map((employee) => ({
          ...employee,
          commission: employee.isSelected
            ? Math.round((100 * (totalCommission * employee.weight)) / employeeCount) / 100 +
              state.additionalPayment * employee.weight
            : 0,
        }));

        const actualTotalCommission = employeeCommissions.reduce((prev, curr) => prev + curr.commission, 0);

        return {
          ...prev,
          totalCommission: (employeeCount * Math.round((100 * actualTotalCommission) / employeeCount)) / 100,
          employeeList: employeeCommissions,
        };
      });
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
        onNegativeCommissionAllowUpdate,
        onAdditionalPaymentUpdate,
        submitData,
      }}
    >
      {children}
    </CommissionEditContext.Provider>
  );
};

export const CommissionEditConsumer = CommissionEditContext.Consumer;
