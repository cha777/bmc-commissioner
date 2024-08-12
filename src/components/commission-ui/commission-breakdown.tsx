import type { FC } from 'react';
import numeral from 'numeral';

import { Card, CardContent } from '@/components/ui/card';
import type { EmployeeCommission } from '@/types/commission';

interface CommissionBreakdownProps {
  employeeList: EmployeeCommission[];
}

export const CommissionBreakdown: FC<CommissionBreakdownProps> = ({ employeeList }) => {
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
                <span>{numeral(employee.commission).format('0,0.00')}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
