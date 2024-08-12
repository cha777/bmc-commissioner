import { FC } from 'react';
import { Card, CardContent } from '@/components//ui/card';
import { Button } from '@/components//ui/button';
import { Separator } from '@/components/ui/separator';

import { ActivityOverlay } from '@/components/activity-overlay';
import { DatePicker } from '@/components//commission-ui/date-picker';
import { CommissionBreakdown } from '@/components/commission-ui/commission-breakdown';
import { EmployeeSelection } from '@/components/commission-ui/employee-selection';
import { ProductUnits } from '@/components/commission-ui/product-units';
import { useCommissionEdit } from '@/hooks/use-commission-history-edit';

export const CommissionEditUi: FC = () => {
  const {
    avgUnitPrice,
    date,
    employeeList,
    totalCommission,
    totalUnitsProduced,
    isSubmitting,
    onEmployeeSelectionUpdate,
    onTotalQtyUpdate,
    submitData,
  } = useCommissionEdit();

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker
        date={new Date(date)}
        disabled={true}
      />

      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-3'>
            <ProductUnits
              avgUnitPrice={avgUnitPrice}
              totalCommission={totalCommission}
              units={totalUnitsProduced}
              onTotalQtyUpdate={onTotalQtyUpdate}
            />
            <Separator />
            <EmployeeSelection
              employeeList={employeeList}
              onEmployeeSelectionUpdate={onEmployeeSelectionUpdate}
            />
          </div>
        </CardContent>
      </Card>

      <CommissionBreakdown employeeList={employeeList} />

      <div className='flex items-center justify-center'>
        <Button
          size='sm'
          variant='default'
          disabled={employeeList.filter((employee) => employee.isSelected).length === 0 || totalUnitsProduced === 0}
          onClick={submitData}
        >
          Update
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
