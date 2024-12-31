import { useMemo } from 'react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ActivityOverlay } from '@/components/activity-overlay';

import { useCommission } from '@/hooks/use-commission';

import { DatePicker } from './date-picker';
import { CommissionBreakdown } from './commission-breakdown';
import { ProductUnits } from './product-units';
import { EmployeeSelection } from './employee-selection';
import { NegativeCommissionToggle } from './negative-commission-toggle';
import { AdditionalPayment } from './additional-payment';

export const CommissionUI: FC = () => {
  const {
    avgUnitPrice,
    date,
    disabledDates,
    employeeList,
    totalCommission,
    totalUnitsProduced,
    isNegativeCommissionsAllowed,
    additionalPayment,
    notes,
    isSubmitting,
    onDateUpdate,
    onEmployeeSelectionUpdate,
    onNegativeCommissionAllowUpdate,
    onTotalQtyUpdate,
    onAdditionalPaymentUpdate,
    onNotesUpdate,
    submitData,
  } = useCommission();

  const disabledCalendarDates = useMemo(() => disabledDates.map((_date) => new Date(_date)), [disabledDates]);

  const isSaleAlreadySubmitted = useMemo(() => {
    const currentDateString = new Date(date).toDateString();

    return disabledCalendarDates.some((date) => date.toDateString() === currentDateString);
  }, [date, disabledCalendarDates]);

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker
        date={new Date(date)}
        disabledDates={disabledCalendarDates}
        onDateUpdate={onDateUpdate}
      />

      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-3'>
            <ProductUnits
              avgUnitPrice={avgUnitPrice}
              totalCommission={totalCommission}
              onTotalQtyUpdate={onTotalQtyUpdate}
            />
            <Separator />
            <EmployeeSelection
              employeeList={employeeList}
              onEmployeeSelectionUpdate={onEmployeeSelectionUpdate}
            />
            <Separator />
            <NegativeCommissionToggle
              isChecked={isNegativeCommissionsAllowed}
              onCheckedChange={onNegativeCommissionAllowUpdate}
            />
            <Separator />
            <AdditionalPayment
              value={additionalPayment}
              onChange={onAdditionalPaymentUpdate}
            />
          </div>
        </CardContent>
      </Card>

      <CommissionBreakdown
        employeeList={employeeList}
        shouldShowTotal
      />

      <Textarea
        value={notes}
        onChange={(e) => onNotesUpdate(e.target.value)}
        placeholder='Type your notes here.'
      />

      <div className='flex items-center justify-center'>
        <Button
          size='sm'
          variant='default'
          disabled={
            employeeList.filter((employee) => employee.isSelected).length === 0 ||
            totalUnitsProduced === 0 ||
            isSaleAlreadySubmitted
          }
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
