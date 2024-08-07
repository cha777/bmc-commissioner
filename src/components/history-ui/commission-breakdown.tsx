import type { FC } from 'react';
import numeral from 'numeral';
import { Card, CardContent } from '@/components/ui/card';
import { useCommissionHistory } from '@/hooks/use-commission-history';

export const CommissionBreakdown: FC = () => {
  const { employeeList } = useCommissionHistory();

  return (
    <Card>
      <CardContent className='p-6 text-sm'>
        <div className='grid gap-3'>
          <div className='font-semibold'>Commissions</div>

          {employeeList.length ? (
            <ul className='grid gap-3'>
              {employeeList.map((employee) => (
                <li
                  key={employee.id}
                  className='flex items-center justify-between'
                >
                  <span className='text-muted-foreground'>{employee.name}</span>
                  <span>{numeral(employee.commission).format('0,0.00')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className='text-center text-muted-foreground'>No data available</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
