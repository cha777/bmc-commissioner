import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCommission } from '@/hooks/use-commission';
import { DatePicker } from './date-picker';
import { CommissionBreakdown } from './commission-breakdown';
import { MetalUnitsTable } from './metal-units-table';
import { EmployeeSelection } from './employee-selection';
import { MetaProductionTotal } from './metal-production-total';

export const CommissionUI: FC = () => {
  const { employeeList } = useCommission();

  return (
    <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker />

      <Card>
        <CardContent>
          <div className='grid gap-3'>
            <MetalUnitsTable />
            <Separator className='my-2' />
            <MetaProductionTotal />
            <Separator className='my-2' />
            <EmployeeSelection />
          </div>
        </CardContent>
      </Card>

      <CommissionBreakdown />

      <div className='flex items-center justify-center p-4'>
        <Button
          size='sm'
          variant='default'
          disabled={employeeList.filter((employee) => employee.isSelected).length === 0}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
