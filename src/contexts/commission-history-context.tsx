import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { history } from '@/api';
import { adjustToDateEnd, adjustToDateStart } from '@/lib/utils';
import type { Employee } from '@/types/employee';

interface State {
  from: Date;
  to: Date;
  isLoading: boolean;
  dailyProduction: { date: string; units: number }[];
  employeeList: (Pick<Employee, 'name' | 'id'> & { commission: number })[];
}

const initialValues: State = {
  from: new Date(),
  to: new Date(),
  isLoading: false,
  dailyProduction: [],
  employeeList: [],
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
}

export const CommissionHistoryProvider: FC<CommissionHistoryProviderProps> = (props) => {
  const { children } = props;

  const initialPeriod = useMemo(() => {
    const currentDate = new Date();
    const from = new Date();
    const to = new Date();

    if (currentDate.getDate() < 15) {
      from.setMonth(currentDate.getMonth() - 1, 1);
      to.setMonth(currentDate.getMonth(), 0);
    } else {
      from.setMonth(currentDate.getMonth(), 1);
      to.setMonth(currentDate.getMonth() + 1, 0);
    }

    adjustToDateStart(from);
    adjustToDateEnd(to);

    return { from, to };
  }, []);

  const [state, setState] = useState<State>({ ...initialValues, ...initialPeriod });
  const [triggerRequestEffect, setTriggerRequestEffect] = useState(false);

  const onDateRangeUpdate = useCallback((from: Date, to: Date) => {
    adjustToDateStart(from);
    adjustToDateEnd(to);

    setState((prev) => ({
      ...prev,
      from,
      to,
    }));

    setTriggerRequestEffect(true);
  }, []);

  useEffect(() => {
    const populateCommissionData = async () => {
      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          dailyProduction: [],
          employeeList: [],
        }));

        const results = await history.getCommissionHistory(state.from, state.to);
        const dailyProduction: State['dailyProduction'] = [];
        const employeeMap: Map<Employee['name'], { id: Employee['id']; name: Employee['name']; commission: number }> =
          new Map();

        results.forEach((sale) => {
          dailyProduction.push({
            date: sale.date,
            units: sale.units,
          });

          sale.commissions.forEach(({ id, name, commission }) => {
            if (!employeeMap.has(name)) {
              employeeMap.set(name, { id, name, commission });
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
          dailyProduction,
          employeeList: Array.from(employeeMap.values()),
        }));
      } catch (e) {
        console.error('Error while fetching commission result', e);

        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      } finally {
        setTriggerRequestEffect(false);
      }
    };

    if (triggerRequestEffect) {
      populateCommissionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRequestEffect]);

  useEffect(() => {
    setTriggerRequestEffect(true);
  }, []);

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
