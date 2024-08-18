import type { FC } from 'react';
import { useMemo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '../ui/separator';
import type { EmployeeCommission } from '@/types/commission';

interface CommissionBreakdownProps {
  employeeList: EmployeeCommission[];
  shouldShowTotal?: boolean;
}

export const CommissionBreakdown: FC<CommissionBreakdownProps> = ({ employeeList, shouldShowTotal = false }) => {
  const totalCommission = useMemo(() => {
    return employeeList.reduce((prev, curr) => {
      return curr.commission + prev;
    }, 0);
  }, [employeeList]);

  return (
    <Card>
      <CardContent className='p-6 text-sm'>
        <div className='grid gap-3'>
          <div className='font-semibold'>Commission Breakdown</div>

          <ul className='grid gap-3'>
            {employeeList.map((employee) => (
              <li
                key={employee.id}
                className='flex items-center justify-between'
              >
                {
                  <span className='text-muted-foreground'>
                    {(() => {
                      if (employee.weight > 1) {
                        return (
                          <>
                            {employee.name} ( x <span>{employee.weight}</span>)
                          </>
                        );
                      }

                      return employee.name;
                    })()}
                  </span>
                }
                <span>
                  {Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                    employee.commission
                  )}
                </span>
              </li>
            ))}
          </ul>
          {shouldShowTotal && (
            <>
              <Separator />
              <li className='flex items-center justify-between'>
                <span className='text-muted-foreground flex-1'>Total Commission</span>
                <span>
                  {Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                    totalCommission
                  )}
                </span>
              </li>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
