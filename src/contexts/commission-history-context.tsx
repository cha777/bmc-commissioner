import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';

import { history } from '@/api';
import { adjustToDateEnd, adjustToDateStart } from '@/lib/utils';
import { queryKey } from '@/utils';
import type { Employee } from '@/types/employee';
import type { CommissionHistory, EmployeeCommission } from '@/types/commission';

interface State {
  from: Date;
  to: Date;
  isLoading: boolean;
  commissionHistory: CommissionHistory[];
  employeeCommissions: EmployeeCommission[];
}

const initialValues: State = {
  from: new Date(),
  to: new Date(),
  isLoading: false,
  commissionHistory: [],
  employeeCommissions: [],
};

export interface CommissionHistoryContextType extends State {
  onDateRangeUpdate: (from: Date, to: Date) => void;
}
export const CommissionHistoryContext = createContext<CommissionHistoryContextType>({
  ...initialValues,
  onDateRangeUpdate: () => {},
});

interface CommissionHistoryProviderProps {
  children: ReactNode;
  from: string;
  to: string;
  onDateChange?: (from: string, to: string) => void;
}

export const CommissionHistoryProvider: FC<CommissionHistoryProviderProps> = (props) => {
  const { children, from, to, onDateChange } = props;

  const initialPeriod = useMemo(() => {
    const fromDate = parseISO(from);
    const toDate = parseISO(to);

    adjustToDateStart(fromDate);
    adjustToDateEnd(toDate);

    return { from: fromDate, to: toDate };
  }, [from, to]);

  const [state, setState] = useState<State>({ ...initialValues, ...initialPeriod });

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [queryKey.history],
    queryFn: () => history.getCommissionHistory({ from: state.from, to: state.to }),
  });

  const mutation = useMutation({
    mutationFn: history.getCommissionHistory,
    onSuccess: (data) => {
      queryClient.setQueryData([queryKey.history], data);
    },
    onError: (e) => {
      console.error('Error while fetching commission result', e);

      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    },
  });

  const onDateRangeUpdate = useCallback(
    (from: Date, to: Date) => {
      adjustToDateStart(from);
      adjustToDateEnd(to);

      setState((prev) => ({
        ...prev,
        from,
        to,
      }));

      const fromDate = format(from, 'yyyy-MM-dd');
      const toDate = format(to, 'yyyy-MM-dd');

      onDateChange?.(fromDate, toDate);

      mutation.mutate({ from, to });
    },
    [mutation, onDateChange]
  );

  useEffect(() => {
    if (query.isPending) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
      }));
    } else if (query.isSuccess) {
      const employeeMap: Map<Employee['name'], EmployeeCommission> = new Map();

      query.data.forEach((sale) => {
        sale.commissions.forEach(({ id, name, commission, weight }) => {
          if (!employeeMap.has(name)) {
            employeeMap.set(name, { id, name, commission, weight });
          } else {
            employeeMap.set(name, {
              ...employeeMap.get(name)!,
              commission: employeeMap.get(name)!.commission + commission,
            });
          }
        });
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        commissionHistory: query.data,
        employeeCommissions: Array.from(employeeMap.values()),
      }));
    }
  }, [query.isSuccess, query.isPending, query.data]);

  return (
    <CommissionHistoryContext.Provider
      value={{
        ...state,
        onDateRangeUpdate,
      }}
    >
      {children}
    </CommissionHistoryContext.Provider>
  );
};

export const CommissionHistoryConsumer = CommissionHistoryContext.Consumer;
