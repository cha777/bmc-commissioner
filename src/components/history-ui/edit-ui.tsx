import type { FC } from 'react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components//ui/card';
import { Button } from '@/components//ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { ActivityOverlay } from '@/components/activity-overlay';
import { DatePicker } from '@/components/commission-ui/date-picker';
import { CommissionBreakdown } from '@/components/commission-ui/commission-breakdown';
import { EmployeeSelection } from '@/components/commission-ui/employee-selection';
import { NegativeCommissionToggle } from '@/components/commission-ui/negative-commission-toggle';
import { ProductUnits } from '@/components/commission-ui/product-units';
import { AdditionalPayment } from '../commission-ui/additional-payment';

import { useCommissionEdit } from '@/hooks/use-commission-history-edit';

export const CommissionEditUi: FC = () => {
  const {
    avgUnitPrice,
    date,
    employeeList,
    totalCommission,
    totalUnitsProduced,
    isNegativeCommissionsAllowed,
    additionalPayment,
    notes,
    created,
    updated,
    isSubmitting,
    onEmployeeSelectionUpdate,
    onTotalQtyUpdate,
    onNegativeCommissionAllowUpdate,
    onAdditionalPaymentUpdate,
    onNotesUpdate,
    submitData,
  } = useCommissionEdit();

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker
        date={new Date(date)}
        disabled={true}
      />

      <Card>
        <CardContent className='py-2 px-6 text-sm'>
          <ul>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Created on: </span>
              <span>{created ? format(created, 'Pp') : '--'}</span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Updated on: </span>
              <span>{updated ? format(updated, 'Pp') : '--'}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
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

      <CommissionBreakdown employeeList={employeeList} />

      <Textarea
        value={notes}
        onChange={(e) => onNotesUpdate(e.target.value)}
        placeholder='Type your notes here.'
      />

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
