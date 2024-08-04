import type { FC } from 'react';
import numeral from 'numeral';
import { Card, CardContent } from '@/components/ui/card';
import { useCommission } from '@/hooks/use-commission';

export const CommissionBreakdown: FC = () => {
  const { employeeList } = useCommission();
  return (
    <Card>
      <CardContent className='p-6 text-sm'>
        <div className='grid gap-3'>
          <div className='font-semibold'>Commission Breakdown</div>

          <ul className='grid gap-3'>
            {employeeList
              .filter((employee) => employee.isSelected)
              .map((employee) => (
                <li
                  key={employee.id}
                  className='flex items-center justify-between'
                >
                  <span className='text-muted-foreground'>
                    {(() => {
                      if (employee.weight > 1) {
                        return (
                          <>
                            {employee.name} ( x <span>2.5</span>)
                          </>
                        );
                      }

                      return employee.name;
                    })()}
                  </span>
                  <span>{numeral(employee.commission).format('0,0.00')}</span>
                </li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
