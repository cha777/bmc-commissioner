import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ActivityOverlay } from '@/components/activity-overlay';
import { useCommission } from '@/hooks/use-commission';
import { DatePicker } from './date-picker';
import { CommissionBreakdown } from './commission-breakdown';
import { ProductUnits } from './product-units';
import { EmployeeSelection } from './employee-selection';

export const CommissionUI: FC = () => {
  const { employeeList, totalUnitsProduced, isSubmitting, submitData } = useCommission();

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker />

      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-3'>
            <ProductUnits />
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

      {isSubmitting && (
        <ActivityOverlay className='absolute flex justify-center items-center'>
          <div className='flex flex-col items-center gap-0 text-muted-foreground'>
            <span>Submitting data</span>
            <span>Please wait ...</span>
          </div>
        </ActivityOverlay>
      )}
    </div>
  );
};
