import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCommission } from '@/hooks/use-commission';
import { DatePicker } from './date-picker';
import { CommissionBreakdown } from './commission-breakdown';
import { MetalUnits } from './metal-units';
import { EmployeeSelection } from './employee-selection';

export const CommissionUI: FC = () => {
  const { employeeList, totalUnitsProduced, submitData } = useCommission();

  return (
    <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker />

      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-3'>
            <MetalUnits />
            <Separator />
            <EmployeeSelection />
          </div>
        </CardContent>
      </Card>

      <CommissionBreakdown />

      <div className='flex items-center justify-center'>
        <Button
          size='sm'
          variant='default'
          disabled={employeeList.filter((employee) => employee.isSelected).length === 0 || totalUnitsProduced === 0}
          onClick={submitData}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
